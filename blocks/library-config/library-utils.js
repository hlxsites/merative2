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

export function createGroupItem(itemName, onCopy = () => void 0) {
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
