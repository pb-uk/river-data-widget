import { createSvgElement } from '../helpers/dom';

export interface ChartOptions {
  limits?: {
    minTime?: number;
    maxTime?: number;
    minValue?: number;
    maxValue?: number;
  };
}

export type TimeSeriesData = [
  ts: number, // Unix time stamp (seconds).
  v: number // Value.
];

export const drawFlowChart = (
  el: HTMLElement,
  measure,
  readings: TimeSeriesData[],
  options: ChartOptions = {}
) => {
  // el.append(`<h3>${measure.parameter}</h3>`);
  drawChart(el, readings, { limits: { minValue: 0 }, ...options });
};

const drawChart = (
  plotAreaEl: HTMLElement,
  data: TimeSeriesData[],
  options: ChartOptions = {}
) => {
  // The height and width of the chart in.
  const strokeWidth = 2;
  const height = 225;
  const width = 400;
  const viewBox = `0 0 ${width} ${height}`;
  const xOffset = strokeWidth / 2;
  const yOffset = height - strokeWidth / 2;
  const { minTime, maxTime, minValue, maxValue } = {
    ...getLimits(data),
    ...options.limits,
  };
  console.log({ minTime, maxTime, minValue, maxValue });
  const timeOffset = minTime;
  const timeScale = (width - strokeWidth) / (maxTime - minTime);
  const valueOffset = minValue;
  const valueScale = (height - strokeWidth) / (maxValue - minValue);

  const el = createSvgElement('svg', { viewBox }, { 'font-size': '12px' });
  plotAreaEl.append(el);

  // X axis
  const [valueLines, valueLabels] = getHorizontalGridlines(
    valueOffset,
    maxValue,
    valueScale,
    yOffset,
    // const x1 = xOffset;
    xOffset,
    // const x2 = xOffset + (maxTime - timeOffset) * timeScale;
    xOffset + (maxTime - timeOffset) * timeScale
  );
  el.append(valueLines);

  // First data point.
  const x = xOffset + (data[0][0] - timeOffset) * timeScale;
  const y = yOffset - (data[0][1] - valueOffset) * valueScale;
  const points = [`M${x},${y}`];
  // Remaining data points.
  for (let i = 1; i < data.length; ++i) {
    const x = xOffset + (data[i][0] - timeOffset) * timeScale;
    const y = yOffset - (data[i][1] - valueOffset) * valueScale;
    points.push(`L${x},${y}`);
  }
  // Plot the data.
  const path = createSvgElement('path', {
    d: points.join(''),
    stroke: '#77C',
    'stroke-width': strokeWidth,
    fill: 'none',
  });
  el.append(path);

  // Plot labels on top of the line.
  el.append(valueLabels);
  const attrib = 'www.riverdata.co.uk/station/3400TH';
  el.append(
    createSvgElement(
      'text',
      { x: width / 2, 'text-anchor': 'middle', y: height - 4 },
      { fill: '#999' },
      attrib
    )
  );

  /*
  const v = round3(value);
  const station = measure.stationId;
  const unit = m.unit;
  const d = dateFormatter.format(new Date(time * 1000));
  const t = timeFormatter.format(new Date(time * 1000));
  textEl.innerHTML += `<br>Latest reading ${v} ${unit} at ${t} on ${d}.`;
  */
};

export const getLimits = (data: TimeSeriesData[]) => {
  if (data.length < 1) {
    throw new Error('Readings must not be empty');
  }
  const minTime = data[0][0];
  const maxTime = data[data.length - 1][0];
  let minValue = Infinity;
  let maxValue = -minValue;
  data.forEach(([, value]) => {
    minValue = Math.min(minValue, value);
    maxValue = Math.max(maxValue, value);
  });
  return { minTime, maxTime, minValue, maxValue };
};

export const getInterval = (range: number, maxDivisions: number) => {
  const scale = Math.floor(Math.log10(range)) - 1;
  const k = range / (maxDivisions * 10 ** scale);
  const interval = (k <= 2 ? 2 : k <= 5 ? 5 : 10) * 10 ** scale;
  console.log({ scale, k, interval, range });
  return interval;
};

export const getHorizontalGridlines = (
  minValue: number,
  maxValue: number,
  yScale: number,
  yOffset: number,
  // const x1 = xOffset;
  x1: number,
  // const x2 = xOffset + (maxTime - timeOffset) * timeScale;
  x2: number
): SVGElement[] => {
  // Horizontal grid lines.
  const stroke = '#ddd';
  const lines = createSvgElement('g', { stroke });
  const labels = createSvgElement('g');
  const valueRange = maxValue - minValue;
  // Horizontal grid interval.
  const interval = getInterval(valueRange, 6);
  let value = Math.ceil(minValue / interval + 1) * interval;
  while (value < maxValue) {
    const y1 = yOffset - (value - minValue) * yScale;
    lines.append(createSvgElement('line', { x1, y1, x2, y2: y1 }));
    labels.append(
      createSvgElement('text', { x: x1 + 4, y: y1 + 4 }, {}, `${value}`)
    );
    value += interval;
  }
  return [lines, labels];
};
