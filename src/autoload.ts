import { loadWidget } from './widget/render';

const autoload = async () => {
  document.querySelectorAll('[data-river-data-widget]').forEach((el) => {
    try {
      loadWidget(<HTMLElement>el);
    } catch (error) {
      console.error(error, { error });
    }
  });
};

if (document.readyState === 'loading') {
  // Loading hasn't finished yet.
  document.addEventListener('DOMContentLoaded', autoload);
} else {
  // `DOMContentLoaded` has already fired.
  autoload();
}
