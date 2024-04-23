import { decorateIcons } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

const socialLinks = Object.freeze({
  linkedin: { url: 'linkedin.com', label: 'Open LinkedIn' },
  twitter: { url: 'twitter.com', label: 'Open Twitter' },
});

export default function decorate(block) {
  const headshotElements = block.querySelectorAll(':scope > div > div');
  headshotElements.forEach((headshot) => {
    headshot.classList.add('headshot-item');
    const picture = createTag('div', { class: 'headshot-avatar' });
    picture.appendChild(headshot.querySelector('p:first-child'));
    const details = createTag('div', { class: 'headshot-details' });
    details.append(...headshot.children);
    headshot.appendChild(picture);
    headshot.appendChild(details);
    // headshot links
    const linkContainer = createTag('div', { class: 'headshot-links' });

    // Check if there's an email ID inside an h5 element inside details
    const emailHeaders = details.querySelectorAll('h5');
    emailHeaders.forEach((emailHeader) => {
      // Check if the h5 element contains only text (no child elements)
      const emailContent = (
        emailHeader.childNodes.length === 1
        && emailHeader.childNodes[0].nodeType === Node.TEXT_NODE
      ) ? emailHeader.textContent.trim() : null;
      if (emailContent) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression pattern to match an email address
        if (emailPattern.test(emailContent)) {
          const emailLink = document.createElement('a');
          emailLink.href = `mailto:${emailContent}`;
          emailLink.innerHTML = '<span class="icon icon-email-solid"></span>';
          emailLink.setAttribute('aria-label', 'Check-in via email');
          linkContainer.appendChild(emailLink);
          emailHeader.remove();
        }
      }
    });

    const links = [...details.querySelectorAll('a')].map((anchor) => {
      const socialEntry = Object.entries(socialLinks).find(
        ([, { url }]) => anchor.href.indexOf(url) >= 0,
      );

      anchor.innerHTML = `<span class="icon icon-${socialEntry ? socialEntry[0] : 'email-solid'}"></span>`;
      const label = socialEntry ? socialEntry[1].label : 'Open profile';
      anchor.setAttribute('aria-label', label);

      // Remove all classes from the anchor element
      anchor.classList.remove('tertiary', 'button');

      return anchor.parentElement;
    });

    linkContainer.append(...links);
    details.appendChild(linkContainer);
    decorateIcons(linkContainer);
  });
}
