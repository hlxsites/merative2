import { toClassName } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const blockName = block.getAttribute('data-block-name');
  if (!blockName) {
    return;
  }

  [...block.children].forEach((element) => {
    element.classList.add(`${blockName}__item`);

    // Find last column
    const lastColumn = element.querySelectorAll('div:last-child');
    const themeClass = toClassName(lastColumn[0].innerText);

    if (themeClass) {
      element.setAttribute('data-theme', themeClass);
    }
  });
}
