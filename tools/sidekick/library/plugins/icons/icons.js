/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { createElement } from '../../../library-utils.js';

async function processIcons(pageBlock, path) {
  const icons = {};
  const { host } = new URL(path);
  const iconElements = [...pageBlock.querySelectorAll('span.icon')];
  await Promise.all(iconElements.map(async (icon) => {
    const iconText = icon.parentElement.nextElementSibling.textContent;
    const iconName = Array.from(icon.classList)
      .find((c) => c.startsWith('icon-'))
      .substring(5);
    // need to comment out host to run locally
    const response = await fetch(`https://${host}/icons/${iconName}.svg`);
    // const response = await fetch(`http://localhost:3000/icons/${iconName}.svg`);
    const svg = await response.text();
    icons[iconText] = { label: iconText, name: iconName, svg };
  }));
  return icons;
}

export async function fetchBlock(path) {
  if (!window.blocks) { // look for all paths from the helix-icons sheet
    window.blocks = {};
  }
  if (!window.icons) {
    window.icons = [];
  }
  if (!window.blocks[path]) {
    const resp = await fetch(`${path}.plain.html`);
    if (!resp.ok) return '';

    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const icons = await processIcons(doc, path);

    window.blocks[path] = { doc, icons };
  }

  return window.blocks[path];
}

/**
 * Called when a user tries to load the plugin.
 * This takes all icons from all sheets and puts in 1 gridContainer
 * @param {HTMLElement} container The container to render the plugin in
 * @param {Object} data The data contained in the plugin sheet
 * @param {String} query If search is active, the current search query
 */
export async function decorate(container, data, query) {
  container.dispatchEvent(new CustomEvent('ShowLoader'));
  const gridContainer = createElement('div', 'grid-container');
  const iconGrid = createElement('div', 'icon-grid');
  gridContainer.append(iconGrid);

  const promises = data.map(async (item) => {
    const { name, path } = item;
    const blockPromise = fetchBlock(path);

    try {
      const res = await blockPromise;
      if (!res) {
        throw new Error(`An error occurred fetching ${name}`);
      }
      const keys = Object.keys(res.icons).filter((key) => {
        if (!query) {
          return true;
        }
        return key.toLowerCase().includes(query.toLowerCase());
      });
      keys.sort().forEach((iconText) => {
        const icon = res.icons[iconText];
        const card = createElement('sp-card', '', { variant: 'quiet', heading: icon.label, size: 's' });
        const cardIcon = createElement('div', 'icon', { size: 's', slot: 'preview' });
        cardIcon.innerHTML = icon.svg;
        card.append(cardIcon);
        iconGrid.append(card);

        card.addEventListener('click', () => {
          navigator.clipboard.writeText(`:${icon.name}:`);
          // Show toast
          container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Icon' } }));
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      container.dispatchEvent(new CustomEvent('Toast', { detail: { message: e.message, variant: 'negative' } }));
    }

    return blockPromise;
  });

  await Promise.all(promises);

  // Show blocks and hide loader
  container.append(gridContainer);
  container.dispatchEvent(new CustomEvent('HideLoader'));
}

export default {
  title: 'Icons',
  searchEnabled: true,
};
