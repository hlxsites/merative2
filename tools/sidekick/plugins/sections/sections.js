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
import {
  createElement,
  renderScaffolding,
  fetchBlockPage,
  copyBlock,
  getLibraryMetadata,
  initSplitFrame,
  renderPreview,
} from '../../library-utils.js';

function createBlockTable(block) {
  let blockName = block.classList[0];
  if (blockName !== 'library-metadata') {
    blockName = blockName
      .replace('-', ' ')
      .split(' ')
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ');
    const rows = [...block.children];
    const maxCols = rows.reduce((cols, row) => (
      row.children.length > cols ? row.children.length : cols), 0);
    const table = createElement('table', '', {
      border: 1,
    }, createElement('tr', '', {}, createElement('td', '', {
      colspan: maxCols,
      style: 'background-color:#f4cccd;',
    }, blockName)));

    rows.forEach((row) => {
      const tableRow = createElement('tr');
      [...row.children].forEach((col) => {
        const td = createElement('td');
        td.innerHTML = col.innerHTML;
        tableRow.append(td);
      });
      table.append(tableRow);
    });

    return table;
  }

  return block;
}

function preCopy(docBody) {
  const doc = docBody.cloneNode(true);

  const sectionBreak = createElement('p', '', {}, '---');
  const sections = doc.querySelectorAll(':scope > div');
  sections.forEach((section, i) => {
    if (i < (sections.length - 1)) {
      section.insertAdjacentElement('beforeend', sectionBreak.cloneNode(true));
    }

    const blocks = section.querySelectorAll(':scope > div');
    blocks.forEach((block) => {
      const blockTable = createBlockTable(block);
      block.replaceWith(blockTable);
    });
  });

  return doc;
}

async function loadSections(data, container, sideNav) {
  const promises = data.map(async (item) => {
    const { name, path } = item;
    const sectionPromise = fetchBlockPage(path);
    try {
      const res = await sectionPromise;
      if (!res) {
        throw new Error(`An error occurred fetching ${name}`);
      }
      const blockInfo = getLibraryMetadata(res.body);

      const sectionNavItem = createElement('sp-sidenav-item', '', {
        label: name,
        action: true,
      }, [
        createElement('sp-icon-file-section', '', { slot: 'icon', size: 's' }),
        createElement('sp-icon-copy', '', { slot: 'action-icon' }),
      ]);
      sectionNavItem.addEventListener('OnAction', () => {
        const toCopy = preCopy(res.body);
        copyBlock(toCopy, path, container);
      }, false);
      sectionNavItem.addEventListener('click', () => {
        container.dispatchEvent(new CustomEvent('LoadSection', {
          detail: {
            path,
            page: res.body,
            blockInfo,
          },
        }));
      });
      sideNav.append(sectionNavItem);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      container.dispatchEvent(new CustomEvent('Toast', { detail: { message: e.message, variant: 'negative' } }));
    }
  });

  await Promise.all(promises);
}

/**
 * Called when a user tries to load the plugin
 * @param {HTMLElement} container The container to render the plugin in
 * @param {Object} data The data contained in the plugin sheet
 * @param {String} query If search is active, the current search query
 */
export async function decorate(container, data) {
  container.dispatchEvent(new CustomEvent('ShowLoader'));
  const content = renderScaffolding();
  const sideNav = createElement('sp-sidenav', '', { 'data-testid': 'sections' });

  await loadSections(data, container, sideNav);

  const listContainer = content.querySelector('.list-container');
  listContainer.append(sideNav);

  container.addEventListener('LoadSection', (e) => {
    const {
      path,
      page,
      blockInfo,
    } = e.detail;

    initSplitFrame(content);

    const blockTitle = content.querySelector('.block-title');
    blockTitle.textContent = blockInfo.name;

    const details = content.querySelector('.details');
    details.innerHTML = '';
    if (blockInfo.description) {
      const description = createElement('p', '', {}, blockInfo.description);
      details.append(description);
    }

    renderPreview(page, path, content.querySelector('.frame-view'));

    const copyButton = content.querySelector('.copy-button');
    copyButton?.addEventListener('click', () => {
      const toCopy = preCopy(page);
      copyBlock(toCopy, path, container);
    });
  });

  // Show blocks and hide loader
  container.append(content);
  container.dispatchEvent(new CustomEvent('HideLoader'));
}

export default {
  title: 'Sections',
  searchEnabled: false,
};
