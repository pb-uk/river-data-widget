/**
 * RiverDataWidget https://github.com/pb-uk/river-data-widget.
 *
 * @copyright Copyright (C) 2022 pbuk https://github.com/pb-uk.
 * @license AGPL-3.0-or-later see LICENSE.md.
 */
import { loadWidget } from './widget/render';

export { version } from '.';

const autoload = async () => {
  for (const el of document.querySelectorAll('[data-river-data-widget]')) {
    try {
      loadWidget(<HTMLElement>el);
    } catch (error) {
      console.error(error, { error });
    }
  }
};

if (document.readyState === 'loading') {
  // Loading hasn't finished yet.
  document.addEventListener('DOMContentLoaded', autoload);
} else {
  // `DOMContentLoaded` has already fired.
  autoload();
}
