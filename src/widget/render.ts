import { RiverDataWidgetError } from '../error';
import { createElement } from '../helpers/dom';
import { round3 } from '../helpers/format';
import {
  parseMeasureId,
  translateMeasureProperties,
} from '../flood-monitoring-api/measure';
// import { drawFlowGauge } from './gauge';
import { Chart } from './chart';
import { getMeasureReadings } from '../flood-monitoring-api';
import { startOfDay } from '../helpers/time';

import type { ChartSeries } from './chart';

const drawMeasureWidget = async (
  parentEl: HTMLElement,
  measureId: string,
  options: Record<string, unknown> = {}
) => {
  console.log({ options });

  // Get readings for the last 7 days in local time.
  const since = startOfDay(null, -7, true);

  const data = await getMeasureReadings(measureId, { since });

  parentEl.replaceChildren();

  const measure = parseMeasureId(measureId);
  const { unit } = translateMeasureProperties(measure);

  // const [time, value] = data[data.length - 1];
  // const v = round3(value);
  // const param = m.qualifiedParameter;
  // const station = measure.stationId;
  // const unit = m.unit;

  // let textEl = createElement('div');
  // const d = dateFormatter.format(new Date(time * 1000));
  // const t = timeFormatter.format(new Date(time * 1000));
  // textEl.innerHTML = `The most recent ${param} reading for station ${station} was ${v} ${unit} at ${t} on ${d}.`;
  // widgetEl.append(textEl);

  const series1: ChartSeries = { data, unit, formatter: round3 };
  if (options.riverDataWidgetMinValue == null) {
    series1.min = 0;
  } else {
    if (options.riverDataWidgetMinValue !== true) {
      series1.min = parseFloat(<string>options.riverDataWidgetMinValue);
    }
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

    // The 'station' widget is experimental in v1.0 and should not be used.
    // case 'station':
    // break;

    default:
      throw new RiverDataWidgetError('Unknown widget definition', { type, id });
  }
};
