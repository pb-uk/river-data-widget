import { createSvgElement } from '../helpers/dom';
import { timeFormatter } from '../helpers/time';
import { FloodMonitoringApiError } from '../flood-monitoring-api/error';
import { FONT_STACK } from '../helpers/format';

const PLOT_COLOR = '#77C';

export interface ChartOptions {
  minTime?: number;
  maxTime?: number;
  attribution?: string;
}

export interface ChartScaleLimits {
  minTime: number;
  maxTime: number;
  timeScale: number;
  minValue: number;
  maxValue: number;
  valueScale: number;
}

export interface ChartSeries {
  data: TimeSeriesValue[];
  min?: number;
  max?: number;
  unit?: string;
  formatter?: (value: number) => string;
}

export type TimeSeriesValue = [
  ts: number, // Unix time stamp (seconds).
  v: number // Value.
];

export class Chart {
  protected el: SVGElement;
  protected series: ChartSeries[];
  protected options: ChartOptions;
  protected width = 480; // 400;
  protected height = 270; // 225;
  protected strokeWidth = 2;
  protected limits?: ChartScaleLimits;

  protected attribution = 'www.riverdata.co.uk';

  // CSS settings.
  // Just readable at 320x180.
  // Good from 400x225.
  // Perfect at 480x270 (font is 12px);
  protected styles = {
    'font-family': FONT_STACK,
    'font-size': '14px',
    display: 'block',
    margin: 'auto',
    'max-width': '150vh',
  };

  protected fontSizePx = 14;

  constructor(
    el: HTMLElement,
    series: ChartSeries[],
    options: ChartOptions = {}
  ) {
    this.series = series;
    this.options = options;
    const viewBox = `0 0 ${this.width} ${this.height}`;
    this.attribution = options.attribution ?? this.attribution;
    this.styles['font-size'] = `${this.fontSizePx}px`;
    this.el = createSvgElement('svg', { viewBox }, this.styles);
    el.append(this.el);
  }

  getLimits(): ChartScaleLimits {
    if (this.limits == null) {
      throw new FloodMonitoringApiError('Chart axis limits have not been set');
    }
    return this.limits;
  }

  getHorizontalGridlines(): SVGElement[] {
    const { minTime, maxTime, timeScale, minValue, maxValue, valueScale } =
      this.getLimits();
    const xOffset = 0;
    const yOffset = this.height;
    const x1 = xOffset;
    const x2 = xOffset + (maxTime - minTime) * timeScale;
    // Horizontal grid lines.
    const stroke = '#ddd';
    const lines = createSvgElement('g', { stroke });
    const labels = createSvgElement('g');
    const valueRange = maxValue - minValue;
    // Horizontal grid interval.
    const [interval, exponent] = getInterval(valueRange, 9);
    const factor = 10 ** -exponent;
    const base = Math.ceil((minValue * factor) / interval + 1) * interval;
    let i = 0;
    let current = base / factor;
    while (current < maxValue) {
      const y1 = yOffset - (current - minValue) * valueScale;
      lines.append(createSvgElement('line', { x1, y1, x2, y2: y1 }));
      labels.append(
        createSvgElement('text', { x: x1 + 4, y: y1 + 4 }, {}, `${current}`)
      );
      ++i;
      current = (base + i * interval) / factor;
    }
    return [lines, labels];
  }

  render() {
    // Calculate axis scales.
    const limits = getLimits(this.series[0].data);
    limits.minValue = this.series[0].min ?? limits.minValue;
    limits.maxValue = this.series[0].max ?? limits.maxValue;
    limits.minTime = this.options.minTime ?? limits.minTime;
    limits.maxTime = this.options.maxTime ?? limits.maxTime;

    this.limits = {
      ...limits,
      valueScale:
        (this.height - this.strokeWidth) / (limits.maxValue - limits.minValue),
      timeScale:
        (this.width - this.strokeWidth) / (limits.maxTime - limits.minTime),
    };

    // X axis
    const [valueLines, valueLabels] = this.getHorizontalGridlines();
    this.el.append(valueLines);

    this.plotData();

    // Plot labels on top of the line.
    this.el.append(valueLabels);
    this.el.append(
      createSvgElement(
        'text',
        { x: this.width / 2, 'text-anchor': 'middle', y: this.height - 4 },
        { fill: '#999' },
        this.attribution
      )
    );

    this.plotLastValue();
  }

  plotLastValue() {
    const { data, unit, formatter } = this.series[0];
    const [time, value] = data[data.length - 1];
    const { minTime, timeScale, minValue, maxValue, valueScale } =
      this.getLimits();

    const v = formatter == null ? value : formatter(value);
    const xOffset = this.strokeWidth / 2;
    const yOffset = this.height - this.strokeWidth / 2;
    const x = xOffset + (time - minTime) * timeScale;
    const highLabel = (value - minValue) / valueScale >= 0.5;
    const y =
      yOffset - (highLabel ? (maxValue - minValue) * valueScale - 20 : 24);

    this.el.append(
      createSvgElement(
        'text',
        { x, y, 'text-anchor': 'end' },
        { fill: PLOT_COLOR, 'font-size': '1.5em', 'font-weight': 'bold' },
        `${v} ${unit}<sup>3</sup>`
      )
    );
    this.el.append(
      createSvgElement(
        'text',
        { x, y: y + 20, 'text-anchor': 'end' },
        { fill: PLOT_COLOR },
        `${timeFormatter.format(new Date(time * 1000))}`
      )
    );
  }

  plotData() {
    const xOffset = this.strokeWidth / 2;
    const yOffset = this.height - this.strokeWidth / 2;
    const { data } = this.series[0];
    const { minTime, timeScale, minValue, valueScale } = this.getLimits();
    // First data point.
    const x = xOffset + (data[0][0] - minTime) * timeScale;
    const y = yOffset - (data[0][1] - minValue) * valueScale;
    const points = [`M${x},${y}`];
    // Remaining data points.
    for (let i = 1; i < data.length; ++i) {
      const x = xOffset + (data[i][0] - minTime) * timeScale;
      const y = yOffset - (data[i][1] - minValue) * valueScale;
      points.push(`L${x},${y}`);
    }
    // Plot the data.
    const path = createSvgElement('path', {
      d: points.join(''),
      stroke: PLOT_COLOR,
      'stroke-width': this.strokeWidth,
      fill: 'none',
    });
    this.el.append(path);
  }
}

export const getLimits = (data: TimeSeriesValue[]) => {
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
  const exponent = Math.floor(Math.log10(range)) - 1;
  const k = range / (maxDivisions * 10 ** exponent);
  const mantissa = k <= 2 ? 2 : k <= 5 ? 5 : 10;
  return [mantissa, exponent];
};
