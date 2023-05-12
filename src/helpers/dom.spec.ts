import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import { createElement, createSvgElement, setAttributes } from './dom';

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
