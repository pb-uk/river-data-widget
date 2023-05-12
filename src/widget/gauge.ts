import { createSvgElement } from '../helpers/dom';

import type { WidgetOptions } from './index';

const flowGaugeDefaults = {
  flowSectors: [0, 50, 150, 200],
  flowSectorBackgrounds: ['#dfb', '#fdb', '#fcc'],
};

export const drawFlowGauge = (
  el: HTMLElement,
  value: number,
  options: WidgetOptions
) => {
  const { flowSectors, flowSectorBackgrounds } = {
    ...flowGaugeDefaults,
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
  valueEl.textContent =
    value < 100 ? value.toPrecision(2) : Math.round(value).toString();
  svgEl.append(valueEl);
};
