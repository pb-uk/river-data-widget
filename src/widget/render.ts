import { RiverDataWidgetError } from '../error';
import { createElement } from '../helpers/dom';
import { parseMeasureId } from '../flood-monitoring-api/measure';
import { drawFlowGauge } from './gauge';
import { drawFlowChart } from './chart';
import {
  fetchMeasureReadings,
  fetchStationReadings,
} from '../flood-monitoring-api/reading';

import type { WidgetOptions } from '.';

const drawMeasureWidget = async (
  parentEl: HTMLElement,
  measureId: string,
  options: WidgetOptions = {}
) => {
  const timeSeriesData = await fetchMeasureReadings(measureId);
  console.log({ timeSeriesData });

  const widgetEl = createElement('div', {}, { 'max-width': '200px' });
  parentEl.replaceChildren(widgetEl);

  const measure = parseMeasureId(measureId);

  // if (measure.parameter === 'flow') {
  const [time, value] = timeSeriesData[timeSeriesData.length - 1];
  let textEl = createElement('div');

  // { stationId, parameter, qualifier, type, interval, unit };
  console.log(measure);
  const param = measure.qualifiedParameter;
  const station = measure.stationId;
  const unit = measure.unit;
  // textEl.innerHTML = `The most recent ${param} reading for ${station} was ${value} m<sup>3</sup>/s at ${time}`;
  textEl.innerHTML = `The most recent ${param} reading for ${station} was ${value} ${unit} at ${time}`;
  widgetEl.append(textEl);

  textEl = createElement('div');
  textEl.innerHTML = `Past 24 hours`;
  drawFlowChart(widgetEl, measure, timeSeriesData, options);
};

const drawStationWidget = async (
  parentEl: HTMLElement,
  stationId: string,
  options: WidgetOptions = {}
) => {
  const readings = await fetchStationReadings(stationId);

  const widgetEl = createElement('div', {}, { 'max-width': '200px' });
  parentEl.replaceChildren(widgetEl);

  Object.entries(readings).forEach(([measureId, timeSeriesData]) => {
    const measure = parseMeasureId(measureId);
    if (measure.parameter === 'flow') {
      const [currentFlowTime, currentFlow] =
        timeSeriesData[timeSeriesData.length - 1];
      let textEl = createElement('div');
      textEl.innerHTML = `${currentFlow} m<sup>3</sup>/s at ${currentFlowTime}`;
      widgetEl.append(textEl);
      drawFlowGauge(widgetEl, currentFlow, options);

      textEl = createElement('div');
      textEl.innerHTML = `Past 24 hours`;
      drawFlowChart(widgetEl, measure, timeSeriesData, options);
    }
  });
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
    case 'station':
      drawStationWidget(targetEl, id, options);
      break;

    default:
      throw new RiverDataWidgetError('Unknown widget definition', { type, id });
  }
};
