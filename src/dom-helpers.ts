/**
 * RiverDataWidget https://github.com/pb-uk/river-data-widget.
 *
 * @copyright Copyright (C) 2022 pbuk https://github.com/pb-uk.
 * @license AGPL-3.0-or-later see LICENSE.md.
 */

export { createElement, createSvgElement, setAttributes, setStyles };

type AttributeList = Record<string, string | number>;

const setAttributes = <T extends HTMLElement | SVGElement>(
  el: T,
  attributes: AttributeList
): T => {
  Object.entries(attributes).forEach(([key, value]) => {
    el.setAttribute(key, `${value}`);
  });
  return el;
};

const setStyles = <T extends HTMLElement | SVGElement>(
  el: T,
  styles: AttributeList
): T => {
  Object.entries(styles).forEach(([key, value]) => {
    // Workaround (el.style.setProperty uses kebab-case keys).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>el.style)[key] = value;
  });
  return el;
};

const createElement = (
  name = 'div',
  attributes: AttributeList = {},
  styles: AttributeList = {}
): HTMLElement => {
  const el = document.createElement(name);
  return setStyles(setAttributes(el, attributes), styles);
};

const createSvgElement = (
  name = 'svg',
  attributes: AttributeList = {},
  styles: AttributeList = {}
) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  return setStyles(setAttributes(el, attributes), styles);
};
