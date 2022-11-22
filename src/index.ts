/**
 * RiverDataWidget https://github.com/pb-uk/river-data-widget.
 *
 * @copyright Copyright (C) 2022 pbuk https://github.com/pb-uk.
 * @license AGPL-3.0-or-later see LICENSE.md.
 */

// eslint-disable-next-line
// @ts-ignore

import { createSvgElement } from './dom';
export { version } from '../package.json';

const drawGuage = (el: HTMLElement, value = 430) => {
  // const sectors = [0, 30, 150, 250];
  // const backgrounds = ['#6a4', '#f81', '#f11'];
  const fontFamily = 'system-ui, Arial, Helvetica, sans-serif';
  const fraction = 1 / 3;
  const viewBoxWidth = 420;
  const viewBoxHeight = 210;
  const strokeWidth = (viewBoxWidth * fraction) / 2;
  const inset = strokeWidth / 2;
  const svgEl = createSvgElement('svg', {
    style: 'background: pink',
    viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
  });
  const r = viewBoxWidth / 2 - inset;
  const points = [
    `M${inset} ${viewBoxHeight}`,
    `A${r} ${r} 0 0 1 ${viewBoxWidth - inset} ${viewBoxHeight}`,
  ];
  const path = createSvgElement('path', {
    d: points.join(''),
    'stroke-width': strokeWidth,
    stroke: '#333',
    fill: 'none',
  });
  svgEl.append(path);
  el.append(svgEl);
  const valueEl = createSvgElement(
    'text',
    { x: viewBoxWidth / 2, y: viewBoxHeight * 0.925 },
    {
      fontWeight: 'bold',
      fontFamily,
      fontSize: viewBoxHeight / 2,
      textAnchor: 'middle',
    }
  );
  valueEl.textContent = <string>(<unknown>value);
  svgEl.append(valueEl);
};

const baseUrl = 'https://environment.data.gov.uk/flood-monitoring';

const drawWidget = async (el: HTMLElement, widget) => {
  const readings = await fetchStationReadings(widget.stationId);
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
  drawGuage(el, 480, {});
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

const getReadingsLimits = (readings) => {
  if (readings.length < 1) {
    throw new Error('Readings must not be empty');
  }
  const minTime = readings[0][0];
  const maxTime = readings[readings.length - 1][0];
  let minValue = Infinity;
  let maxValue = -minValue;
  readings.forEach(([, value]) => {
    minValue = Math.min(minValue, value);
    maxValue = Math.max(maxValue, value);
  });
  return { minTime, maxTime, minValue, maxValue };
};

const apiFetch = async (path, query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  const uri = queryString
    ? `${baseUrl}${path}?${queryString}`
    : `${baseUrl}${path}`;
  const response = await fetch(uri);
  return [await response.json(), response];
};

const parseMeasureId = (measureId) => {
  // ............base/ stat-paramet-qualifi- type  -interva-unit
  const regExp = /(.*)-([^-]*)-([^-]*)-([^-]*)-([^-]*)-([^-]*)$/;
  const matches = measureId.match(regExp).reverse();
  const [unit, interval, type, qualifier, parameter, stationId] = matches;
  return { stationId, parameter, qualifier, type, interval, unit };
};

const ms4Hours = 14400000;
const ms1Day = 86400000;
const fetchStationReadings = async (stationId) => {
  const since =
    new Date(Math.floor(Date.now() / ms4Hours) * ms4Hours - ms1Day)
      .toISOString()
      .substring(0, 19) + 'Z';
  const params = { _sorted: '', since, parameter: 'flow' };
  const [data] = await apiFetch(`/id/stations/${stationId}/readings`, params);

  const ranges = {};
  data.items.forEach(({ measure, dateTime, value }) => {
    if (ranges[measure] == null) {
      ranges[measure] = [];
    }
    ranges[measure].unshift([new Date(dateTime).valueOf() / 1000, value]);
  });

  const rangesById = {};
  Object.entries(ranges).forEach(([key, range]) => {
    rangesById[key.substring(key.lastIndexOf('/') + 1)] = range;
  });
  return rangesById;
};

const loadWidget = (widget) => {
  const el = document.createElement('div');
  widget.el.after(el);
  drawWidget(el, widget);
};

export const Riverdata = {
  onload: async () => {
    if (window.RiverWidgets == null) return;
    window.RiverWidgets.forEach(loadWidget);
  },
};

if (document.readyState === 'loading') {
  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', Riverdata.onload);
} else {
  // `DOMContentLoaded` has already fired
  Riverdata.onload();
}
