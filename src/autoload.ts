/**
 * RiverDataWidget https://github.com/pb-uk/river-data-widget.
 *
 * @copyright Copyright (C) 2022 pbuk https://github.com/pb-uk.
 * @license AGPL-3.0-or-later see LICENSE.md.
 */
export { version } from '../package.json';
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
