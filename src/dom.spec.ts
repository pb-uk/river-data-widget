import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import {
  createElement,
  createSvgElement,
  setAttributes,
  setStyles,
} from './dom';

const dom = new JSDOM();
dom.reconfigure({ url: 'https://localhost/' });
global.document = dom.window.document;

describe('DOM helper functions', function () {
  describe('setAttributes', function () {
    it('should set attributes on a HTML Element', function () {
      const { document } = new JSDOM().window;
      const el = document.createElement('div');

      setAttributes(el, { id: 123 });

      expect(el.getAttribute('id')).to.equal('123');
    });
  });

  describe('createElement', function () {
    it('should create a HTML Element', function () {
      const el = createElement();
      expect(el.tagName).to.equal('DIV');
    });
  });

  describe('createSvgElement', function () {
    it('should create an SVG Element', function () {
      const el = createSvgElement();
      expect(el.tagName).to.equal('svg');
    });
  });
});

/*
const setAttributes = <T extends HTMLElement | SVGElement>(
  el: T,
  attributes: Record<string, unknown>
): T => {
  Object.entries(attributes).forEach(([key, value]) => {
    el.setAttribute(key, <string>value);
  });
  return el;
};

const setStyles = <T extends HTMLElement | SVGElement>(
  el: T,
  styles: AttributeList
): T => {
  Object.entries(styles).forEach(([key, value]) => {
    // Workaround
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>el.style)[key] = value;
    // el.style.setProperty(key, value);
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
*/
