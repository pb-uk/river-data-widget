import { createElement, createSvgElement } from './dom-helpers';
import { parseMeasureId } from './flood-monitoring-api/measure';
import {
  fetchStationReadings,
  getReadingsLimits,
} from './flood-monitoring-api/reading';

export { loadWidget };

interface WidgetOptions {
  el?: HTMLElement | string;
  stationId?: string;
  flowSectors?: number[];
  flowSectorBackgrounds?: string[];
}

const flowGuageDefaults = {
  flowSectors: [0, 50, 150, 200],
  flowSectorBackgrounds: ['#dfb', '#fdb', '#fcc'],
};

const drawFlowGauge = (
  el: HTMLElement,
  value: number,
  options: WidgetOptions
) => {
  const { flowSectors, flowSectorBackgrounds } = {
    ...flowGuageDefaults,
    ...options,
  };
  const fontFamily = 'system-ui, Arial, Helvetica, sans-serif';
  const fraction = 1 / 3;
  const viewBoxWidth = 420;
  const viewBoxHeight = 210;
  const svgEl = createSvgElement('svg', {
    viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    width: '100%',
  });

  // Create the gauge sectors.
  const strokeWidth = (viewBoxWidth * fraction) / 2;
  const inset = strokeWidth / 2;
  const r = viewBoxWidth / 2 - inset;
  let x = inset;
  let y = viewBoxHeight;
  const gaugeOffset = flowSectors[0];
  const gaugeRange = flowSectors[flowSectors.length - 1] - gaugeOffset;
  for (let i = 1; i < flowSectors.length; ++i) {
    const fractionOfGaugeRange = flowSectors[i] / gaugeRange;
    const xx = -Math.cos(fractionOfGaugeRange * Math.PI) * r + r + inset;
    const yy = viewBoxHeight - Math.sin(fractionOfGaugeRange * Math.PI) * r;
    const path = createSvgElement('path', {
      d: `M${x} ${y}A${r} ${r} 0 0 1 ${xx} ${yy}`,
      'stroke-width': strokeWidth,
      stroke: flowSectorBackgrounds[i - 1],
      fill: 'none',
    });
    x = xx;
    y = yy;
    svgEl.append(path);
  }
  x = inset;
  y = viewBoxHeight;
  const fractionOfGaugeRange = value / gaugeRange;
  const xx = -Math.cos(fractionOfGaugeRange * Math.PI) * r + r + inset;
  const yy = viewBoxHeight - Math.sin(fractionOfGaugeRange * Math.PI) * r;
  const path = createSvgElement('path', {
    d: `M${x} ${y}A${r} ${r} 0 0 1 ${xx} ${yy}`,
    'stroke-width': strokeWidth / 2,
    stroke: '#333',
    fill: 'none',
  });
  x = xx;
  y = yy;
  svgEl.append(path);

  el.append(svgEl);
  const valueEl = createSvgElement(
    'text',
    { x: viewBoxWidth / 2, y: viewBoxHeight * 0.925 },
    {
      fontWeight: 'bold',
      fontFamily,
      fontSize: `${viewBoxHeight / 2}px`,
      textAnchor: 'middle',
    }
  );
  valueEl.textContent = value < 100 ? value.toPrecision(2) : Math.round(value);
  svgEl.append(valueEl);
};

const drawWidget = async (el: HTMLElement, options: WidgetOptions) => {
  const { stationId } = options;
  if (!stationId) return;
  const readings = await fetchStationReadings(stationId);
  Object.entries(readings).forEach(([measureId, timeSeriesData]) => {
    const measure = parseMeasureId(measureId);
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

const drawFlowChart = (
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

const loadWidget = (options: WidgetOptions) => {
  const { el } = options;
  const targetEl = typeof el === 'string' ? document.querySelector(el) : el;
  const widgetEl = createElement('div', {}, { 'max-width': '200px' });
  if (targetEl == null) return;
  targetEl.after(widgetEl);
  drawWidget(widgetEl, options);
};
