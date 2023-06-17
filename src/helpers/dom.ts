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
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, `${value}`);
  }
  return el;
};

const setStyles = <T extends HTMLElement | SVGElement>(
  el: T,
  styles: AttributeList
): T => {
  for (const [key, value] of Object.entries(styles)) {
    // Workaround (el.style.setProperty uses kebab-case keys).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>el.style)[key] = value;
  }
  return el;
};

const createElement = (
  name = 'div',
  attributes: AttributeList = {},
  styles: AttributeList = {},
  innerHTML: string | false = false
): HTMLElement => {
  const el = document.createElement(name);
  if (innerHTML !== false) {
    el.innerHTML = innerHTML;
  }
  return setStyles(setAttributes(el, attributes), styles);
};

const createSvgElement = (
  name = 'svg',
  attributes: AttributeList = {},
  styles: AttributeList = {},
  innerHTML: string | false = false
) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  if (innerHTML !== false) {
    el.innerHTML = innerHTML;
  }
  return setStyles(setAttributes(el, attributes), styles);
};
