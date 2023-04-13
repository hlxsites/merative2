import { createTag } from '../../scripts/scripts.js';

export function writeToClipboard(blob) {
  const data = [new ClipboardItem({ [blob.type]: blob })];
  navigator.clipboard.write(data);
}

export function appendListGroup(list, listData) {
  const titleText = createTag('p', { class: 'item-title' }, listData.name);
  const title = createTag('li', { class: 'block-group' }, titleText);
  const previewButton = createTag('button', { class: 'preview-group' }, 'Preview');
  title.append(previewButton);
  list.append(title);

  const groupList = createTag('ul', { class: 'block-group-list' });
  list.append(groupList);

  title.addEventListener('click', () => {
    title.classList.toggle('is-open');
  });

  previewButton.addEventListener('click', (e) => {
    e.stopPropagation();
    window.open(listData.path, '_blockpreview');
  });

  return groupList;
}

export function createGroupItem(itemName, onCopy = () => undefined) {
  if (itemName) {
    const item = document.createElement('li');
    const name = document.createElement('p');
    name.textContent = itemName;
    const copy = document.createElement('button');
    copy.addEventListener('click', (e) => {
      const copyContent = onCopy();
      const copyButton = e.target;
      copyButton.classList.toggle('copied');
      const blob = new Blob([copyContent], { type: 'text/html' });
      writeToClipboard(blob);
      setTimeout(() => {
        copyButton.classList.toggle('copied');
      }, 3000);
    });
    item.append(name, copy);
    return item;
  }
  return undefined;
}

export async function fetchListDocument(listData) {
  try {
    const resp = await fetch(`${listData.path}.plain.html`);
    if (!resp.ok) {
      return null;
    }
    const html = await resp.text();
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  } catch (e) {
    return null;
  }
}

export function decorateImages(block, path) {
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
}

export function createTable(block, name, path) {
  decorateImages(block, path);
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
