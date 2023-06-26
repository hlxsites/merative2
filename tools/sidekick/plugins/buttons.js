import { appendListGroup, createGroupItem, fetchListDocument } from '../library-utils.js';

function getButtonName(button) {
  return button.textContent;
}

function getButtonHTML(button) {
  const span = document.createElement('span');
  span.innerHTML = button.closest('p').outerHTML;
  const iconSpan = span.querySelector('span.icon');
  if (iconSpan) {
    const iconClass = [...iconSpan.classList.values()].find((className) => className.startsWith('icon-'));
    const iconName = iconClass.substring(iconClass.indexOf('-') + 1);
    iconSpan.outerHTML = ` :${iconName}:`;
  }
  return span.innerHTML;
}

export default function loadButtons(buttons, list) {
  buttons.forEach(async (button) => {
    const buttonGroup = appendListGroup(list, button);
    const buttonDoc = await fetchListDocument(button);
    if (buttonDoc === null) {
      return;
    }
    const pageButtons = buttonDoc.body.querySelectorAll('a');
    pageButtons.forEach((pageButton) => {
      const buttonName = getButtonName(pageButton);
      const buttonItem = createGroupItem(
        buttonName,
        () => getButtonHTML(pageButton),
      );
      if (buttonItem) {
        buttonGroup.append(buttonItem);
      }
    });
  });
}
