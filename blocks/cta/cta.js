import { createTag } from '../../scripts/scripts.js';

export default function decorate(block) {
  const blockName = block.getAttribute('data-block-name');
  if (!blockName) {
    return;
  }

  [...block.children].forEach((element) => {
    element.classList.add(`${blockName}__inner`);

    // Group buttons
    const buttonGroup = createTag('div', { class: 'button-group' });
    const buttons = element.querySelectorAll('.button-container');

    buttons.forEach((button) => {
      const isPrimary = button.querySelector('strong');
      const isSecondary = button.querySelector('em');
      // Position button
      if (isPrimary) {
        button.style.order = '1';
      } else if (isSecondary) {
        button.style.order = '2';
      } else {
        button.style.order = '3';
      }
      buttonGroup.append(button);
    });

    if (buttonGroup.children.length) {
      const pictures = element.querySelectorAll('p.only-picture');
      if (pictures.length > 0) {
        pictures[pictures.length - 1].insertAdjacentElement('beforeBegin', buttonGroup);
      } else {
        element.append(buttonGroup);
      }
    }
  });
}
