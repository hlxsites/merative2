import { decorateIcons } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

const socialLinks = Object.freeze({
  linkedin: 'linkedin.com',
  twitter: 'twitter.com',
});

export default function decorate(block) {
  const headshotElements = block.querySelectorAll(':scope > div > div');
  [...headshotElements].forEach((headshot) => {
    headshot.classList.add('headshot-item');
    const picture = createTag('div', { class: 'headshot-avatar' });
    picture.appendChild(headshot.querySelector('p:first-child'));
    const details = createTag('div', { class: 'headshot-details' });
    details.append(...headshot.children);
    headshot.appendChild(picture);
    headshot.appendChild(details);
    // headshot links
    const linkContainer = createTag('div', { class: 'headshot-links' });
    const links = [...details.querySelectorAll('a')].map((anchor) => {
      const socialEntry = Object.entries(socialLinks).find(
        ([, url]) => anchor.href.indexOf(url) >= 0,
      );
      anchor.innerHTML = `<span class="icon icon-${socialEntry ? socialEntry[0] : 'sharelink-black'}"></span>`;
      return anchor.parentElement;
    });
    linkContainer.append(...links);
    details.appendChild(linkContainer);
  });
  decorateIcons(block);
}
