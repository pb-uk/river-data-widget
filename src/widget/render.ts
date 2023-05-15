import { RiverDataWidgetError } from '../error';
import { createElement } from '../helpers/dom';
import {
  parseMeasureId,
  translateMeasureProperties,
} from '../flood-monitoring-api/measure';
// import { drawFlowGauge } from './gauge';
import { drawFlowChart } from './chart';
import { getMeasureReadings } from '../flood-monitoring-api';
import { startOfDay, dateFormatter, timeFormatter } from '../helpers/time';

import type { WidgetOptions } from '.';

const drawMeasureWidget = async (
  parentEl: HTMLElement,
  measureId: string,
  options: WidgetOptions = {}
) => {
  // Get readings for the last 7 days in local time.
  const since = startOfDay(-7, true);

  const timeSeriesData = await getMeasureReadings(measureId, { since });

  const widgetEl = createElement('div', {}, { 'max-width': '480px' });
  parentEl.replaceChildren(widgetEl);

  const measure = parseMeasureId(measureId);

  const [time, value] = timeSeriesData[timeSeriesData.length - 1];
  let textEl = createElement('div');

  // { stationId, parameter, qualifier, type, interval, unit, qualifiedParameter };
  const m = translateMeasureProperties(measure);
  const param = m.qualifiedParameter;
  const station = measure.stationId;
  const unit = m.unit;
  // textEl.innerHTML = `The most recent ${param} reading for ${station} was ${value} m<sup>3</sup>/s at ${time}`;
  const d = dateFormatter.format(new Date(time * 1000));
  const t = timeFormatter.format(new Date(time * 1000));
  textEl.innerHTML = `The most recent ${param} reading for station ${station} was ${value} ${unit} at ${t} on ${d}.`;
  textEl.innerHTML += `<br>Latest reading ${value} ${unit} at ${t} on ${d}.`;
  widgetEl.append(textEl);

  textEl = createElement('div');
  textEl.innerHTML = `Past 24 hours`;
  drawFlowChart(widgetEl, measure, timeSeriesData, options);
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
  const options: WidgetOptions = targetEl.dataset;

  switch (type) {
    case 'measure':
      drawMeasureWidget(targetEl, id, options);
      break;

    // The 'station' widget is experimental in v1.0 and should not be used.
    // case 'station':
    // break;

    default:
      throw new RiverDataWidgetError('Unknown widget definition', { type, id });
  }
};
