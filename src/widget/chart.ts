import { createSvgElement } from '../helpers/dom';

import { getReadingsLimits } from '../flood-monitoring-api/reading';

export const drawFlowChart = (
  el: HTMLElement,
  measure,
  readings,
  options: WidgetOptions
) => {
  const limits = getReadingsLimits(readings);
  // el.append(`<h3>${measure.parameter}</h3>`);
  drawData(el, readings, { limits });
};

const drawData = (plotAreaEl: HTMLElement, data, options = {}) => {
  const height = 225 - 1;
  const width = 400 - 1;
  const xOffset = 0.5;
  const yOffset = height - 0.5;
  const { minTime, maxTime, minValue, maxValue } = options.limits;
  const timeOffset = minTime;
  const timeScale = width / (maxTime - minTime);
  const valueOffset = minValue;
  const valueScale = height / (maxValue - minValue);

  const x = xOffset + (data[0][0] - timeOffset) * timeScale;
  const y = yOffset - (data[0][1] - valueOffset) * valueScale;
  const points = [`M${x},${y}`];
  for (let i = 1; i < data.length; ++i) {
    const x = xOffset + (data[i][0] - timeOffset) * timeScale;
    const y = yOffset - (data[i][1] - valueOffset) * valueScale;
    points.push(`L${x},${y}`);
  }
  const el = createSvgElement('svg', { viewBox: '0 0 400 225' });
  const path = createSvgElement('path', {
    d: points.join(''),
    stroke: '#333',
    'stroke-width': 4,
    fill: 'none',
  });
  el.append(path);
  plotAreaEl.append(el);
};
