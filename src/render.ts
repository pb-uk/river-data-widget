import { createSvgElement } from './dom-helpers';
import { parseMeasureId } from './flood-monitoring-api/measure';
import { fetchStationReadings } from './flood-monitoring-api/reading';

export { loadWidget };

const drawFlowGauge = (el: HTMLElement, value: number) => {
  const sectors = [0, 50, 150, 200];
  const backgrounds = ['#dfb', '#fdb', '#fcc'];
  const fontFamily = 'system-ui, Arial, Helvetica, sans-serif';
  const fraction = 1 / 3;
  const viewBoxWidth = 420;
  const viewBoxHeight = 210;
  const svgEl = createSvgElement('svg', {
    viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
  });

  // Create the gauge sectors.
  const strokeWidth = (viewBoxWidth * fraction) / 2;
  const inset = strokeWidth / 2;
  const r = viewBoxWidth / 2 - inset;
  let x = inset;
  let y = viewBoxHeight;
  const gaugeOffset = sectors[0];
  const gaugeRange = sectors[sectors.length - 1] - gaugeOffset;
  for (let i = 1; i < sectors.length; ++i) {
    const fractionOfGaugeRange = sectors[i] / gaugeRange;
    const xx = -Math.cos(fractionOfGaugeRange * Math.PI) * r + r + inset;
    const yy = viewBoxHeight - Math.sin(fractionOfGaugeRange * Math.PI) * r;
    const path = createSvgElement('path', {
      d: `M${x} ${y}A${r} ${r} 0 0 1 ${xx} ${yy}`,
      'stroke-width': strokeWidth,
      stroke: backgrounds[i - 1],
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
  valueEl.textContent = value.toPrecision(2);
  svgEl.append(valueEl);
};

const drawWidget = async (el: HTMLElement, widget) => {
  const readings = await fetchStationReadings(widget.stationId);
  /*
  if (widget.isChart) {
    const measures = [];
    Object.entries(readings).forEach(([key, readings]) => {
      measures.push({ key, readings });
    });
    measures.forEach((measure) => {
      drawChart(el, measure);
    });
    return;
  }
  */
  const widgetData: WidgetData = {};
  console.log(readings);
  Object.entries(readings).forEach(([measureId, timeSeriesData]) => {
    // drawChart(el, measure);
    const measure = parseMeasureId(measureId);
    if (measure.parameter === 'flow') {
      const [currentFlowTime, currentFlow] =
        timeSeriesData[timeSeriesData.length - 1];
      drawFlowGauge(el, currentFlow);
    }
  });
};

const drawChart = (el: HTMLElement, measure) => {
  const limits = getReadingsLimits(measure.readings);
  const parsed = parseMeasureId(measure.key);
  el.append(`<h3>${parsed.parameter}</h3>`);
  drawData(el, measure.readings, { limits });
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
    /* 'stroke-width': 2, */ fill: 'none',
  });
  el.append(path);
  plotAreaEl.append(el);
};

const loadWidget = (widget) => {
  const el = document.createElement('div');
  widget.el.after(el);
  drawWidget(el, widget);
};
