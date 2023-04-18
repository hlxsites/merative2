import {
  // readBlockConfig,
  decorateButtons,
  decorateIcons,
  loadBlocks,
  decorateBlock,
} from '../../scripts/lib-franklin.js';

async function fetchFragment(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok) {
    const container = document.createElement('div');
    container.innerHTML = await resp.text();
    decorateBlock(container);
    await loadBlocks(container);
    return container;
  }
  return null;
}

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  if (!sections) {
    return;
  }
  sections.querySelectorAll(':scope > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function toggleSection(section) {
  const expanded = section.getAttribute('aria-expanded') === 'true';
  collapseAllNavSections(section.closest('ul').parentElement);
  section.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  // const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  // const navPath = cfg.nav || '/nav';
  // const resp = await fetch(`${navPath}.plain.html`);
  const resp = await fetch('/drafts/amol/nav.plain.html');
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
    if (sectionName === 'tools') {
      decorateButtons(section);
    }
  });

  const navSections = navChildren[1];
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
      // deal with top level dropdowns first
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
      }
      // replacing bold nav titles with divs for styling
      if (navSection.querySelector('strong')) {
        const sectionHeading = navSection.querySelector('strong');
        const sectionHeadingNew = document.createElement('div');
        sectionHeadingNew.classList.add('section-heading');
        sectionHeadingNew.textContent = sectionHeading.textContent;
        navSection.replaceChild(sectionHeadingNew, sectionHeading);
      }
      navSection.addEventListener('click', () => {
        toggleSection(navSection);
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
        const megaHeading = levelTwo.querySelector(':scope > strong');
        if (megaHeading) {
          // mega menu
          const megaHeadingNew = document.createElement('div');
          megaHeadingNew.classList.add('level-two-heading');
          megaHeadingNew.innerText = megaHeading.innerText;
          megaHeading.remove();
          levelTwo.prepend(megaHeadingNew);
          levelTwo.classList.add('mega-menu');
          levelTwo.parentElement.classList.add('mega-menu');
        }
        levelTwo.classList.add('level-two');
        levelTwo.parentElement.classList.add('level-two');
        levelTwo.addEventListener('click', (event) => {
          toggleSection(levelTwo);
          event.stopPropagation();
        });
        // Setup level 3 links
        levelTwo.querySelectorAll(':scope > ul > li').forEach((levelThree) => {
          levelThree.classList.add('level-three');
          levelThree.addEventListener('click', (event) => {
            const expanded = levelThree.getAttribute('aria-expanded') === 'true';
            collapseAllNavSections(levelTwo);
            levelThree.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            event.stopPropagation();
          });
          // Setup level 4 links
          levelThree.querySelectorAll(':scope > ul > li').forEach((levelFour) => {
            levelFour.classList.add('level-four');
          });
        });
      });

      const sectionMenu = navSection.querySelector('ul.mega-menu');
      if (sectionMenu) {
        // add close icon
        const closeLink = document.createElement('a');
        closeLink.className = 'close';
        closeLink.setAttribute('aria-label', 'Close');
        closeLink.innerHTML = '<span class="icon icon-x" />';
        sectionMenu.appendChild(closeLink);
        closeLink.addEventListener('click', (event) => {
          toggleSection(navSection);
          event.stopPropagation();
        })
      }
    });
  }

  // Auto block fragment urls
  await Promise.all([...nav.querySelectorAll('a')].map(async (link) => {
    if (!link.href) {
      return null;
    }
    const url = new URL(link.href);
    if (url.pathname.startsWith('/fragments/')) {
      const fragmentBlock = await fetchFragment(link.href);
      link.parentElement.append(fragmentBlock);
      link.remove();
      return true;
    }
    return null;
  }));

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
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
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
