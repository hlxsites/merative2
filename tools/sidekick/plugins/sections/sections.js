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
import { createElement, writeToClipboard } from '../../library-utils.js';

function processPlaceholders(pageBlock) {
  const placeholders = {};
  const placeholdersEls = [...pageBlock.querySelectorAll('div.placeholders > div')];
  placeholdersEls.forEach((el) => {
    const label = el.children[0].textContent;
    const value = el.children[1].innerHTML;
    placeholders[label] = {label, value};
  });
  return placeholders;
}

export async function fetchBlock(path) {
  if (!window.blocks) {
    window.blocks = {};
  }
  if (!window.placeholders) {
    window.placeholders = [];
  }
  if (!window.blocks[path]) {
    const resp = await fetch(`${path}.plain.html`);
    if (!resp.ok) return '';

    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const placeholders = processPlaceholders(doc);

    window.blocks[path] = {doc, placeholders};
  }

  return window.blocks[path];
}

/**
 * Called when a user tries to load the plugin
 * @param {HTMLElement} container The container to render the plugin in
 * @param {Object} data The data contained in the plugin sheet
 * @param {String} query If search is active, the current search query
 */
export async function decorate(container, data, query) {
  container.dispatchEvent(new CustomEvent('ShowLoader'));
  const sideNav = createElement('sp-sidenav', '', { variant: 'multilevel', 'data-testid': 'icons' });

  const promises = data.map(async (item) => {
    const {name, path} = item;
    const blockPromise = fetchBlock(path);

    try {
      const res = await blockPromise;
      if (!res) {
        throw new Error(`An error occurred fetching ${name}`);
      }
      const keys = Object.keys(res.placeholders).filter((key) => {
        if (!query) {
          return true;
        }
        return key.toLowerCase().includes(query.toLowerCase());
      });
      keys.sort().forEach((iconText) => {
        const placeholder = res.placeholders[iconText];
        const childNavItem = createElement('sp-sidenav-item', '', {label: placeholder.label, 'data-testid': 'item'});
        sideNav.append(childNavItem);

        childNavItem.addEventListener('click', () => {
          const blob = new Blob([placeholder.value], {type: 'text/html'});
          writeToClipboard(blob);
          // Show toast
          container.dispatchEvent(new CustomEvent('Toast', {detail: {message: 'Copied Placeholder'}}));
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      container.dispatchEvent(new CustomEvent('Toast', {detail: {message: e.message, variant: 'negative'}}));
    }

    return blockPromise;
  });

  await Promise.all(promises);

  // Show blocks and hide loader
  container.append(sideNav);
  container.dispatchEvent(new CustomEvent('HideLoader'));
}

export default {
  title: 'Sections',
  searchEnabled: true,
};