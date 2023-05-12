import { loadWidget } from './widget/render.js';

const autoload = async () => {
  document
    .querySelectorAll('[data-river-data-widget]')
    .forEach((el) => loadWidget(el));
};

if (document.readyState === 'loading') {
  // Loading hasn't finished yet.
  document.addEventListener('DOMContentLoaded', autoload);
} else {
  // `DOMContentLoaded` has already fired.
  autoload();
}
