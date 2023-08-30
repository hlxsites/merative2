import {
  getCookie,
  setCookie,
  createStringToHash,
} from '../../scripts/scripts.js';

/**
 * decorates the notification
 * @param {Element} block The notification block element
 */
export default async function decorate(block) {
  [...block.children].forEach((notificationElement) => {
    const outerDivElement = document.createElement('div');
    outerDivElement.className = 'notification-block__outer';

    const innerDivElement = document.createElement('div');
    innerDivElement.className = 'notification-block__inner';

    const titleDivElement = document.createElement('div');
    titleDivElement.className = 'notification-block__title';

    const contentDivEle = notificationElement.lastElementChild;
    const titleElement = contentDivEle.querySelector('strong');
    const titleSpanElement = document.createElement('span');
    titleSpanElement.innerHTML = titleElement.textContent;
    titleElement.replaceWith(titleSpanElement);

    titleDivElement.append(titleSpanElement);
    innerDivElement.append(titleDivElement);
    innerDivElement.append(contentDivEle);
    outerDivElement.append(innerDivElement);

    const hashCode = createStringToHash(contentDivEle.textContent);
    const notificationHashId = 'notification'.concat(hashCode);
    notificationElement.className = notificationHashId;
    if (getCookie(notificationHashId) === 'seen') {
      notificationElement.style.display = 'none';
    }
    const closeDivElement = document.createElement('div');
    closeDivElement.className = 'notification-block__close-btn';
    closeDivElement.addEventListener('click', () => {
      setCookie(notificationHashId, 'seen');
      notificationElement.style.display = 'none';
    });

    const closeElement = document.createElement('img');
    closeElement.className = 'notification-block__close-btn-icon';
    closeElement.src = '../../icons/x.svg';
    closeElement.alt = 'close cross icon';

    closeDivElement.append(closeElement);
    outerDivElement.append(closeDivElement);
    notificationElement.append(outerDivElement);

    // icon replace to info icon
    const iconElement = notificationElement.firstElementChild.querySelector('.icon');
    const iconDivElement = document.createElement('div');
    iconDivElement.className = 'icon info-icon';
    iconElement.replaceWith(iconDivElement);
  });
}
