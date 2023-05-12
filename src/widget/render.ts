import { createElement } from '../helpers/dom';
import { parseMeasureId } from '../flood-monitoring-api/measure';
import { drawFlowGauge } from './gauge';
import { drawFlowChart } from './chart';
import { fetchStationReadings } from '../flood-monitoring-api/reading';

import type { WidgetOptions } from '.';

const drawWidget = async (el: HTMLElement) => {
  // const widgetIdParts = targetEl.dataset.riverDataWidget?.split(':');
  // if (widget)
  const stationId = '3400TH';
  if (!stationId) return;
  const readings = await fetchStationReadings(stationId);
  Object.entries(readings).forEach(([measureId, timeSeriesData]) => {
    const measure = parseMeasureId(measureId);
    const options = {};
    if (measure.parameter === 'flow') {
      const [currentFlowTime, currentFlow] =
        timeSeriesData[timeSeriesData.length - 1];
      let textEl = createElement('div');
      textEl.innerHTML = `${currentFlow} m<sup>3</sup>/s at ${currentFlowTime}`;
      el.append(textEl);
      drawFlowGauge(el, currentFlow, options);

      textEl = createElement('div');
      textEl.innerHTML = `Past 24 hours`;
      drawFlowChart(el, measure, timeSeriesData, options);
    }
  });
};

export const loadWidget = (el: HTMLElement | string) => {
  const targetEl =
    typeof el === 'string' ? <HTMLElement>document.querySelector(el) : el;
  if (targetEl === null) {
    throw new Error('Target element not found');
  }
  const widgetEl = createElement('div', {}, { 'max-width': '200px' });
  if (targetEl == null) return;
  targetEl.after(widgetEl);
  drawWidget(widgetEl);
};
