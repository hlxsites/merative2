import { readBlockConfig, decorateIcons, decorateButtons } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */

// hides all the links except the one clicked on
function hideLinks(event, block) {
  const activeSections = block.querySelectorAll('.footer-links .active');
  const sectionLinks = event.target.nextElementSibling;
  activeSections.forEach((activeSection) => {
    if (activeSection !== sectionLinks) {
      activeSection.classList.remove('active');
    }
  });
  const activeHeading = event.target;
  const allLinks = block.querySelectorAll('.footer-links .link-section-heading');
  allLinks.forEach((sectionHeading) => {
    if (activeHeading !== sectionHeading) {
      sectionHeading.classList.add('fold');
    }
  });
}

// expands the links of the section clicked on
function showLinks(event, block) {
  const activeLink = event.target;
  activeLink.classList.toggle('fold');
  const sectionLinks = event.target.nextElementSibling;
  hideLinks(event, block);
  sectionLinks.classList.toggle('active');
}

// adding contactus link
function addContactLink(e) {
  const contactusheader = e.target;
  const link = contactusheader.nextElementSibling.firstElementChild.href;
  window.open(link, '_self');
}

function addCSSToLinkHeadings(block) {
  const h3elements = block.querySelectorAll('.footer-links > div > div > h3');
  h3elements.forEach((h3element) => {
    h3element.classList.add('link-section-heading');
  });
}

function buildMobileFooter(block) {
  const linkHeadings = block.querySelectorAll('.footer-links .link-section-heading');
  linkHeadings.forEach((linkHeading) => {
    if (linkHeading.id !== 'contact-us') {
      linkHeading.classList.add('fold');
      linkHeading.addEventListener('click', (event) => { showLinks(event, block); });
    } else {
      linkHeading.addEventListener('click', addContactLink);
    }
  });
}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');

  footer.innerHTML = html;
  decorateButtons(footer, { decorateClasses: false });
  await decorateIcons(footer);
  block.append(footer);
  addCSSToLinkHeadings(block);

  const footerBaseLinks = document.querySelector('footer div:last-of-type > ul:last-of-type');
  const cookieConsentLi = createTag('li');
  if (footerBaseLinks) footerBaseLinks.append(cookieConsentLi);
  const cookieConsent = createTag('span', { class: 'cookie-consent' });
  cookieConsent.innerText = 'Cookie preferences';

  cookieConsentLi.append(cookieConsent);
  // eslint-disable-next-line no-undef
  cookieConsent.addEventListener('click', () => { OneTrust.ToggleInfoDisplay(); });

  // code for building mobile footer
  const mobileMedia = window.matchMedia('(max-width: 768px)');
  if (mobileMedia.matches) {
    buildMobileFooter(block);
  }
  // when media size changes
  mobileMedia.onchange = (e) => {
    if (e.matches) {
      buildMobileFooter(block);
    }
  };
}
