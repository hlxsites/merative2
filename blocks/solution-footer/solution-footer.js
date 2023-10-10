import { decorateMain } from '../../scripts/scripts.js';
import { loadBlocks, decorateButtons } from '../../scripts/lib-franklin.js';

/**
 * Loads a fragment.
 * @param {string} path - The path to the fragment
 * @returns {HTMLElement} - The root element of the fragment
 */
async function loadFragment(path) {
  try {
    const url = new URL(path, window.location.origin); // Parse the URL

    if (url.pathname.startsWith('/')) {
      const resp = await fetch(`${url.pathname}.plain.html`);
      if (resp.ok) {
        const main = document.createElement('div');
        main.innerHTML = await resp.text();
        // Decorate main element and load additional blocks
        decorateMain(main);
        await loadBlocks(main);
        return main;
      }
      throw new Error('Failed to fetch fragment');
    } else {
      throw new Error('Invalid path');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error loading fragment: ${error}`);
  }
  return null;
}

export default async function decorate(block) {
  // Get the block name attribute from the block element
  const blockName = block.getAttribute('data-block-name');
  if (!blockName) {
    return;
  }

  // Decorate buttons within the block, ignoring class decoration
  decorateButtons(block, { decorateClasses: false });

  // Get the last child element of the block
  const lastRow = [...block.children][1];

  if (lastRow) {
    const link = lastRow.querySelector('a');
    // Extract the href attribute from the link, if it exists
    const { href } = link || {};
    const fragment = await loadFragment(href);

    if (fragment) {
      // Extract the section element from the loaded fragment
      const fragmentSection = fragment.querySelector(':scope .section');
      const { classList } = fragmentSection || [];
      if (classList) {
        // Add classes from the fragment's section element to the last row
        lastRow.classList.add(...classList);
        // Replace the last row content with fragment section content
        lastRow.replaceWith(...fragmentSection.childNodes);
      }
    }

    // Handle click events on footer base links
    block.addEventListener('click', (e) => {
      const { target } = e;
      // Check if the clicked element is a footer base link with an empty href attribute
      if (target.tagName === 'A' && target.getAttribute('href') === '') {
        e.preventDefault();
        // Call the OneTrust function to toggle info display
        // eslint-disable-next-line no-undef
        OneTrust.ToggleInfoDisplay();
      }
    });
  }
}
