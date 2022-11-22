import { loadWidget } from './render.js';

const autoload = async () => {
  if (window.RiverWidgets == null) return;
  window.RiverWidgets.forEach(loadWidget);
};

if (document.readyState === 'loading') {
  // Loading hasn't finished yet.
  document.addEventListener('DOMContentLoaded', autoload);
} else {
  // `DOMContentLoaded` has already fired.
  autoload();
}
