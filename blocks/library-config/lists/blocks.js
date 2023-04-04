import { createTag } from '../../../scripts/scripts.js';
import {
  appendListGroup,
  createGroupItem,
  fetchListDocument,
} from '../library-utils.js';

function getAuthorName(block) {
  const blockSib = block.previousElementSibling;
  if (!blockSib) return null;
  if (['H2', 'H3'].includes(blockSib.nodeName)) {
    return blockSib.textContent;
  }
  return null;
}

function getBlockName(block) {
  const classes = block.className.split(' ');
  const name = classes.shift();
  return classes.length > 0 ? `${name} (${classes.join(', ')})` : name;
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

export default function loadBlocks(blocks, list) {
  blocks.forEach(async (block) => {
    const blockGroup = appendListGroup(list, block);
    const blockDoc = await fetchListDocument(block);
    const pageBlocks = blockDoc.body.querySelectorAll('div[class]');
    pageBlocks.forEach((pageBlock) => {
      const blockName = getAuthorName(pageBlock) || getBlockName(pageBlock);
      const blockItem = createGroupItem(
        blockName,
        () => getTable(pageBlock, getBlockName(pageBlock), block.path),
      );
      blockGroup.append(blockItem);
    });
  });
}
