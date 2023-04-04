import { createTag } from '../../../scripts/scripts.js';
import createCopy from '../library-utils.js';
import { readBlockConfig } from '../../../scripts/lib-franklin.js';

function getSectionName(section) {
  const sectionMeta = section.querySelector('div.section-metadata');
  let styles;
  if (sectionMeta) {
    const meta = readBlockConfig(sectionMeta);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') {
        styles = meta.style;
      }
    });
  }
  return styles;
}

function getTable(block, name, path) {
  const url = new URL(path);
  block.querySelectorAll('img').forEach((img) => {
    const srcSplit = img.src.split('/');
    const mediaPath = srcSplit.pop();
    img.src = `${url.origin}/${mediaPath}`;
    const { width, height } = img;
    const ratio = width > 200 ? 200 / width : 1;
    img.width = width * ratio;
    img.height = height * ratio;
  });
  const rows = [...block.children];
  const maxCols = rows.reduce((cols, row) => (
    row.children.length > cols ? row.children.length : cols), 0);
  const table = document.createElement('table');
  table.setAttribute('border', 1);
  const headerRow = document.createElement('tr');
  headerRow.append(createTag('th', { colspan: maxCols }, name));
  table.append(headerRow);
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((col) => {
      const td = document.createElement('td');
      if (row.children.length < maxCols) {
        td.setAttribute('colspan', maxCols);
      }
      td.innerHTML = col.innerHTML;
      tr.append(td);
    });
    table.append(tr);
  });
  return table.outerHTML;
}

function getSection(section, path) {
  const url = new URL(path);
  section.querySelectorAll('img').forEach((img) => {
    const srcSplit = img.src.split('/');
    const mediaPath = srcSplit.pop();
    img.src = `${url.origin}/${mediaPath}`;
    const { width, height } = img;
    const ratio = width > 200 ? 200 / width : 1;
    img.width = width * ratio;
    img.height = height * ratio;
  });
  let output = '---';
  const rows = [...section.children];
  rows.forEach((row) => {
    if (row.nodeName === 'DIV') {
      const blockName = row.classList[0];
      output = output.concat(getTable(row, blockName, path));
    } else {
      output = output.concat(row.outerHTML);
    }
  });
  output = output.concat('---');
  return output;
}

export default async function loadSections(sections, list) {
  sections.forEach(async (section) => {
    const titleText = createTag('p', { class: 'item-title' }, section.name);
    const title = createTag('li', { class: 'block-group' }, titleText);
    const previewButton = createTag('button', { class: 'preview-group' }, 'Preview');
    title.append(previewButton);
    list.append(title);

    const sectionList = createTag('ul', { class: 'block-group-list' });
    list.append(sectionList);

    title.addEventListener('click', () => {
      title.classList.toggle('is-open');
    });

    previewButton.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(section.path, '_blockpreview');
    });

    const resp = await fetch(`${section.path}.plain.html`);
    if (!resp.ok) return;

    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const pageSections = doc.body.querySelectorAll(':scope > div');
    pageSections.forEach((pageSection) => {
      const sectionName = getSectionName(pageSection);
      if (sectionName) {
        const item = document.createElement('li');
        const name = document.createElement('p');
        name.textContent = getSectionName(pageSection);
        const copy = document.createElement('button');
        copy.addEventListener('click', (e) => {
          const pageSectionContent = getSection(pageSection, section.path);
          e.target.classList.add('copied');
          setTimeout(() => { e.target.classList.remove('copied'); }, 3000);
          const blob = new Blob([pageSectionContent], { type: 'text/html' });
          createCopy(blob);
        });
        item.append(name, copy);
        sectionList.append(item);
      }
    });
  });
}
