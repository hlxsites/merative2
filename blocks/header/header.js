import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll(':scope > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
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
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    decorateIcons(nav);

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((e, j) => {
      const section = nav.children[j];
      if (section) section.classList.add(`nav-${e}`);
    });

    const navSections = [...nav.children][1];
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        // deal with top level dropdowns first
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        // replacing bold nav titles with divs for styling
        if (navSection.querySelector('strong')) {
          const sectionHeading = navSection.querySelector('strong');
          const sectionHeadingNew = document.createElement('div');
          sectionHeadingNew.classList.add('section-heading');
          sectionHeadingNew.textContent = sectionHeading.textContent;
          navSection.replaceChild(sectionHeadingNew, sectionHeading);
        }
        navSection.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
        // Setup level 2 links
        navSection.querySelectorAll(':scope > ul > li').forEach((levelTwo) => {
          const l2Heading = levelTwo.querySelector(':scope > strong');
          if (l2Heading) {
            const l2HeadingNew = document.createElement('div');
            l2HeadingNew.classList.add('level-two-heading');
            l2HeadingNew.innerText = l2Heading.innerText;
            l2Heading.remove();
            levelTwo.prepend(l2HeadingNew);
          } else {
            // this is a level 2 link that has the old look and feel
            levelTwo.classList.add('old');
            levelTwo.parentElement.classList.add('old');
          }
          levelTwo.classList.add('level-two');
          levelTwo.parentElement.classList.add('level-two');
          levelTwo.addEventListener('click', (event) => {
            const expanded = levelTwo.getAttribute('aria-expanded') === 'true';
            collapseAllNavSections(navSection);
            levelTwo.setAttribute('aria-expanded', expanded ? 'false' : 'true');
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
      });
    }

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
}
