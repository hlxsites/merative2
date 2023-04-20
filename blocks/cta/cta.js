import { createTag } from '../../scripts/scripts.js';

export default function decorate(block) {
  const col1 = block.firstElementChild?.children.item(0);
  // group buttons
  const buttonGroup = createTag('div', { class: 'button-group' });
  const buttons = [...col1.querySelectorAll('.button-container')];

  buttons.forEach((button) => {
    const isPrimary = button.querySelector('strong');
    const isSecondary = button.querySelector('em');
    // position button
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
    const pictures = col1.querySelectorAll('p.only-picture');
    if (pictures.length > 0) {
      pictures[pictures.length - 1].insertAdjacentElement('beforeBegin', buttonGroup);
    } else {
      col1.append(buttonGroup);
    }
  }
}
