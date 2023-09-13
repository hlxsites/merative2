import {
  readBlockConfig,
  decorateButtons,
  decorateIcons,
} from '../../scripts/lib-franklin.js';

import {
  createTag,
  fetchFragment,
} from '../../scripts/scripts.js';

const KEY_ENTER = 'Enter';

const mobileMedia = window.matchMedia('(max-width: 1199px)');
const desktopMedia = window.matchMedia('(min-width: 1200px)');

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  if (!sections) {
    return;
  }
  sections.querySelectorAll(':scope > ul li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function copyMegaMenu(navItem) {
  if (!navItem) {
    return;
  }
  const megaMenu = navItem.closest('ul.mega-menu');
  const megaContent = megaMenu.querySelector('.mega-menu-content');
  const megaFragment = navItem.querySelector('ul > li.fragment');
  if (megaFragment) {
    megaContent.innerHTML = megaFragment.innerHTML;
  } else {
    megaContent.innerHTML = navItem.querySelector('ul').outerHTML;
  }
}

function buildMegaMenu(navItem) {
  if (!navItem) {
    return;
  }
  const menuLinks = navItem.querySelectorAll('.columns.solution-list p > a');
  [...menuLinks].forEach((link) => {
    const cell = link.closest('div');
    const linkParent = link.parentElement;
    link.textContent = '';
    while (linkParent.previousElementSibling && linkParent.previousElementSibling.nodeName !== 'A') {
      link.prepend(linkParent.previousElementSibling);
    }
    link.setAttribute('title', link.querySelector('h5').textContent);
    cell.appendChild(link);
    linkParent.remove();
  });
}

function buildFeatured(navItem) {
  if (!navItem) {
    return;
  }
  const featuredContent = [...navItem.children];
  const featuredLink = navItem.querySelector('p > a');
  if (!featuredLink) {
    return;
  }
  const linkParent = featuredLink.parentElement;
  navItem.appendChild(featuredLink);
  linkParent.remove();
  featuredLink.textContent = '';
  featuredLink.append(...featuredContent);
}

function toggleSection(section) {
  const expanded = section.getAttribute('aria-expanded') === 'true';
  collapseAllNavSections(section.closest('ul').parentElement);
  section.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  // auto expand mega-menu
  const megaMenu = section.querySelector('ul.mega-menu');
  if (!expanded && megaMenu && desktopMedia.matches) {
    // copy initial content
    const firstNavItem = megaMenu.querySelector('li.mega-menu:first-of-type');
    if (firstNavItem) {
      toggleSection(firstNavItem);
      copyMegaMenu(firstNavItem);
    }
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) {
    return;
  }

  const html = await resp.text();

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.innerHTML = html;
  decorateIcons(nav);

  const navChildren = [...nav.children];
  const classes = ['brand', 'sections', 'tools'];

  navChildren.forEach((section, index) => {
    const sectionName = classes[index];
    section.classList.add(`nav-${sectionName}`);
    if (sectionName === 'brand') {
      decorateButtons(section, { decorateClasses: false });
    } else if (sectionName === 'tools') {
      decorateButtons(section);
    }
  });

  const navSections = navChildren[1];
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
      // deal with top level dropdowns first
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        navSection.setAttribute('tabindex', '0');
      }
      // replacing bold nav titles with divs for styling
      if (navSection.querySelector('strong')) {
        const sectionHeading = navSection.querySelector('strong');
        const sectionHeadingNew = createTag('div', { class: 'section-heading' });
        sectionHeadingNew.textContent = sectionHeading.textContent;
        navSection.replaceChild(sectionHeadingNew, sectionHeading);
      }

      navSection.addEventListener('click', (event) => {
        if (!event.target.closest('.mega-menu')) {
          toggleSection(navSection);
        }
      });
      navSection.addEventListener('keydown', (event) => {
        if (!event.target.closest('.mega-menu') && event.key === KEY_ENTER) {
          toggleSection(navSection);
          event.preventDefault();
        }
      });

      // Setup level 2 links
      navSection.querySelectorAll(':scope > ul > li').forEach((levelTwo) => {
        const megaTitle = levelTwo.querySelector(':scope > em');
        if (megaTitle) {
          const megaTitleNew = document.createElement('h3');
          megaTitleNew.innerText = megaTitle.innerText;
          levelTwo.replaceWith(megaTitleNew);
          return;
        }
        // mega menu
        const megaHeading = levelTwo.querySelector(':scope > strong');
        if (megaHeading) {
          const megaHeadingNew = createTag('div', { class: 'level-two-heading' });
          megaHeadingNew.innerText = megaHeading.innerText;
          megaHeading.remove();
          levelTwo.prepend(megaHeadingNew);
          levelTwo.classList.add('mega-menu');
          levelTwo.setAttribute('tabindex', '0');
          levelTwo.parentElement.classList.add('mega-menu');
        }
        // featured menu
        const featuredLink = levelTwo.querySelector(':scope > a');
        if (featuredLink && featuredLink.getAttribute('href').startsWith('/fragments')) {
          levelTwo.classList.add('featured');
          levelTwo.parentElement.classList.add('featured');
        }
        levelTwo.classList.add('level-two');
        levelTwo.parentElement.classList.add('level-two');

        levelTwo.addEventListener('click', (event) => {
          toggleSection(levelTwo);
          if (levelTwo.classList.contains('mega-menu')) {
            copyMegaMenu(levelTwo);
          }
          event.stopPropagation();
        });
        levelTwo.addEventListener('keydown', (event) => {
          if (event.key === KEY_ENTER) {
            toggleSection(levelTwo);
            if (levelTwo.classList.contains('mega-menu')) {
              copyMegaMenu(levelTwo);
            }
            event.preventDefault();
          }
        });

        // Setup level 3 links
        levelTwo.querySelectorAll(':scope > ul > li').forEach((levelThree) => {
          levelThree.classList.add('level-three');

          levelThree.addEventListener('click', (event) => {
            toggleSection(levelThree);
            event.stopPropagation();
          });

          // Setup level 4 links
          levelThree.querySelectorAll(':scope > ul > li').forEach((levelFour) => {
            levelThree.classList.add('sub-menu');
            levelFour.classList.add('level-four');
          });
        });
      });

      // Setup mega menu content
      const megaMenu = navSection.querySelector('ul.mega-menu');
      if (megaMenu) {
        // add some flex containers
        const megaLinks = createTag('aside');
        megaLinks.append(...megaMenu.children);
        const megaContent = createTag('div', { class: 'mega-menu-content' });
        // add close icon
        const closeLink = createTag('button', { class: 'close', 'aria-label': 'Close' });
        closeLink.innerHTML = '<span class="icon icon-x" />';
        closeLink.addEventListener('click', (event) => {
          toggleSection(navSection);
          event.stopPropagation();
        });
        megaMenu.append(megaLinks, megaContent, closeLink);
      }
    });
  }

  // Auto block fragment urls
  await Promise.all([...nav.querySelectorAll('li.featured > a, li.level-three > a')].map(async (link) => {
    if (!link.href) {
      return null;
    }
    const url = new URL(link.href);
    if (url.pathname.startsWith('/fragments/')) {
      const fragmentBlock = await fetchFragment(link.href);
      const navItem = link.parentElement;
      navItem.append(fragmentBlock);
      navItem.classList.add('fragment');
      link.remove();
      if (navItem.classList.contains('featured')) {
        buildFeatured(navItem);
      } else {
        buildMegaMenu(navItem);
      }
      return true;
    }
    return null;
  }));

  // Update DOM based on screen size
  const mediaChangeHandler = () => {
    const navTools = nav.querySelector('.nav-tools');
    if (mobileMedia.matches && navTools.parentElement === nav) {
      navSections.appendChild(navTools);
    } else if (desktopMedia.matches && navTools.parentElement === navSections) {
      nav.appendChild(navTools);
    }
  };
  mediaChangeHandler();
  mobileMedia.addEventListener('change', mediaChangeHandler);

  // add page scroll listener to know when header turns to sticky
  const header = block.parentNode;
  window.addEventListener('scroll', () => {
    const scrollAmount = window.scrollY;
    if (scrollAmount > header.offsetHeight) {
      header.classList.add('is-sticky');
    } else {
      header.classList.remove('is-sticky');
    }
  });

  // hamburger for mobile
  const hamburger = createTag('a', {
    class: 'nav-hamburger', role: 'button', tabindex: '0', 'aria-label': 'Menu',
  });
  hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    document.body.style.overflowY = expanded ? '' : 'hidden';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  decorateIcons(nav);
  block.append(nav);
}
