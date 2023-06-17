import { createSvgElement } from '../helpers/dom';
import { timeFormatter, dddFormatter, dMmmFormatter } from '../helpers/time';
import { FloodMonitoringApiError } from '../flood-monitoring-api/error';
import { FONT_STACK } from '../helpers/format';

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
  protected fontSizePx = 14;

  protected el: SVGElement;
  protected series: ChartSeries[];
  protected options: ChartOptions;
  protected width = 480; // 400;
  protected height = 270; // 225;
  protected plotHeight = this.height - this.fontSizePx * 4.5;
  protected strokeWidth = 2;
  protected limits?: ChartScaleLimits;

  protected plotColor = '#77C';
  protected labelBg = 'rgba(255,255,255,0.5)';
  protected labelBgWidth = '0.5em';

  protected attribution =
    'Uses Environment Agency data from the real-time API (Beta)';

  // CSS settings.
  // Just readable at 320x180.
  // Good from 400x225.
  // Perfect at 480x270 (font is 12px);
  protected styles = {
    'font-family': FONT_STACK,
    'font-size': `${this.fontSizePx}px`,
    display: 'block',
    margin: 'auto',
    'max-width': '150vh',
  };

  constructor(
    el: HTMLElement,
    series: ChartSeries[],
    options: ChartOptions = {}
  ) {
    this.series = series;
    this.options = options;
    const viewBox = `0 0 ${this.width} ${this.height}`;
    this.attribution = options.attribution ?? this.attribution;
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
    const xOffset = this.strokeWidth / 2;
    const yOffset = this.plotHeight;
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
    const timeAxisLine = createSvgElement(
      'line',
      { x1, y1: yOffset, x2, y2: yOffset },
      { stroke: '#777' }
    );

    return [lines, labels, timeAxisLine];
  }

  getTimeScale(): SVGElement[] {
    const { minTime, maxTime, timeScale } = this.getLimits();
    const xOffset = this.strokeWidth / 2;
    const yOffset = this.plotHeight + this.strokeWidth / 2;
    const y1 = yOffset + this.fontSizePx * 3;
    const y2 = yOffset - this.plotHeight;
    // Vertical grid lines.
    const stroke = '#ddd';
    const lines = createSvgElement('g', { stroke });
    const labels = createSvgElement('g');
    // Vertical grid interval.
    const base = minTime;
    const interval = 86400;
    let i = 0;
    let current = base;
    const labelOffset = 43200 * timeScale;
    const fill = '#444';
    while (current <= maxTime) {
      const x1 = xOffset + (current - minTime) * timeScale;
      const d = new Date(current * 1000);
      // lines.append(createSvgElement('line', { x1, y1, x2, y2: y1 }));
      lines.append(createSvgElement('line', { x1, y1, x2: x1, y2 }));
      labels.append(
        createSvgElement(
          'text',
          {
            x: x1 + labelOffset,
            y: y1 - this.fontSizePx * 1.8,
            'text-anchor': 'middle',
          },
          { fill },
          `${dddFormatter.format(d)}`
        ),
        createSvgElement(
          'text',
          {
            x: x1 + labelOffset,
            y: y1 - this.fontSizePx * 0.5,
            'text-anchor': 'middle',
          },
          { fill },
          `${dMmmFormatter.format(d)}`
        )
      );
      ++i;
      current = base + i * interval;
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
        (this.plotHeight - this.strokeWidth) /
        (limits.maxValue - limits.minValue),
      timeScale:
        (this.width - this.strokeWidth) / (limits.maxTime - limits.minTime),
    };

    // Time axis.
    const [timeLines, timeLabels] = this.getTimeScale();
    this.el.append(timeLines);

    // Value axis.
    const [valueLines, valueLabels, timeAxisLine] =
      this.getHorizontalGridlines();
    this.el.append(valueLines);
    this.el.append(timeAxisLine);

    this.plotData();

    // Plot labels on top of the line.
    this.el.append(timeLabels);
    this.el.append(valueLabels);

    this.el.append(
      createSvgElement(
        'text',
        {
          x: this.width / 2,
          'text-anchor': 'middle',
          y: this.height - this.fontSizePx * 0.5,
        },
        { fill: '#595959' },
        this.attribution
      )
    );

    this.plotLastValue();
  }

  plotLastValue() {
    const { data, unit, formatter } = this.series[0];
    const [time, value] = data[data.length - 1];
    const { minTime, timeScale, maxValue, minValue } = this.getLimits();

    const v = formatter == null ? value : formatter(value);
    const xOffset = this.strokeWidth / 2;
    // const yOffset = this.plotHeight - this.strokeWidth / 2;
    const x = xOffset + (time - minTime) * timeScale;
    const isHighLabel = (value - minValue) / (maxValue - minValue) < 0.5;
    const y = this.plotHeight * (isHighLabel ? 0 : 0.5) + this.fontSizePx * 2;

    this.el.append(
      // Background for value label.
      createSvgElement(
        'text',
        { x, y, 'text-anchor': 'end' },
        {
          'font-size': '1.5em',
          'font-weight': 'bold',
          stroke: this.labelBg,
          'stroke-width': this.labelBgWidth,
        },
        `${v} ${unit}`
      ),
      // Value label.
      createSvgElement(
        'text',
        { x, y, 'text-anchor': 'end' },
        { fill: this.plotColor, 'font-size': '1.5em', 'font-weight': 'bold' },
        `${v} ${unit}`
      ),
      // Background for time label.
      createSvgElement(
        'text',
        { x, y: y + this.fontSizePx * 1.5, 'text-anchor': 'end' },
        {
          stroke: this.labelBg,
          'stroke-width': this.labelBgWidth,
        },
        `${timeFormatter.format(new Date(time * 1000))}`
      ),
      // Time label.
      createSvgElement(
        'text',
        { x, y: y + this.fontSizePx * 1.5, 'text-anchor': 'end' },
        { fill: this.plotColor },
        `${timeFormatter.format(new Date(time * 1000))}`
      )
    );
  }

  plotData() {
    const xOffset = this.strokeWidth / 2;
    const yOffset = this.plotHeight - this.strokeWidth / 2;
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
      stroke: this.plotColor,
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
  for (const [, value] of data) {
    minValue = Math.min(minValue, value);
    maxValue = Math.max(maxValue, value);
  }
  return { minTime, maxTime, minValue, maxValue };
};

export const getInterval = (range: number, maxDivisions: number) => {
  const exponent = Math.floor(Math.log10(range)) - 1;
  const k = range / (maxDivisions * 10 ** exponent);
  const mantissa = k <= 2 ? 2 : k <= 5 ? 5 : 10;
  return [mantissa, exponent];
};
