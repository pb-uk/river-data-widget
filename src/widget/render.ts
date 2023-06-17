import { RiverDataWidgetError } from '../error';
import { round3 } from '../helpers/format';
import {
  parseMeasureId,
  translateMeasureProperties,
} from '../flood-monitoring-api/measure';
import { Chart } from './chart';
import { getMeasureReadings as getFloodMeasureReadings } from '../flood-monitoring-api';
import { startOfDay } from '../helpers/time';

import type { ChartSeries } from './chart';
import type { Reading } from '../flood-monitoring-api/reading';

export const drawMeasureWidget = async (
  parentEl: HTMLElement,
  measureId: string,
  options: Record<string, unknown> = {}
) => {
  // Get readings for the last 7 days in local time.
  const since = startOfDay(null, -7, true);
  let data: Reading[] = [];

  // Get the right API.
  const parts = measureId.split('/');
  const id = parts.pop() ?? '';
  const api = parts.length === 0 ? 'flood' : parts[0];
  switch (api) {
    case 'flood':
      data = await getFloodMeasureReadings(id, { since });
  }

  // Clear the GUI deck.
  parentEl.replaceChildren();

  const measure = parseMeasureId(measureId);
  const { unit } = translateMeasureProperties(measure);

  const series1: ChartSeries = { data, unit, formatter: round3 };
  // Set max/min options for plot from widget options.
  if (options.riverDataWidgetMaxValue != null) {
    series1.max = parseFloat(<string>options.riverDataWidgetMaxValue);
  }
  if (options.riverDataWidgetMinValue != null) {
    series1.min = parseFloat(<string>options.riverDataWidgetMinValue);
  }

  // Deal with no data.
  if (data.length === 0) {
    const minTime = since.valueOf() / 1000;
    const maxTime = minTime + 86400 * 7;
    const chartOptions = { minTime, maxTime };

    const chart = new Chart(parentEl, [series1], chartOptions);
    chart.render();
    return;
  }

  const minTime = startOfDay(new Date(data[0][0] * 1000)).valueOf() / 1000;
  const maxTime =
    startOfDay(new Date(data[data.length - 1][0] * 1000), 1).valueOf() / 1000;
  const chartOptions = {
    minTime,
    maxTime,
    // attribution: `www.riverdata.co.uk/station/${measure.stationId}`,
  };

  const chart = new Chart(parentEl, [series1], chartOptions);
  chart.render();
};

/**
 * Load a widget specified by a DOM element.
 */
export const loadWidget = (el: HTMLElement | string) => {
  // Get the target element from a query selector if necessary and check it
  // exists.
  const targetEl =
    typeof el === 'string' ? <HTMLElement>document.querySelector(el) : el;
  if (targetEl === null) {
    throw new Error('Target element not found');
  }

  // Parse element for widget type and options.
  const widgetIdParts = targetEl.dataset.riverDataWidget?.split(':') ?? [];
  const type = widgetIdParts.shift();
  const id = widgetIdParts.join(':');
  const options = targetEl.dataset;

  switch (type) {
    case 'measure':
      drawMeasureWidget(targetEl, id, options);
      break;
    default:
      throw new RiverDataWidgetError('Unknown widget definition', { type, id });
  }
};
