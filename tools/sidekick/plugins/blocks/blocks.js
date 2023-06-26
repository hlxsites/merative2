import {
  appendListGroup,
  createGroupItem,
  fetchListDocument,
  createTable,
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

export default function loadBlocks(blocks, list) {
  blocks.forEach(async (block) => {
    const blockGroup = appendListGroup(list, block);
    const blockDoc = await fetchListDocument(block);
    const pageBlocks = blockDoc.body.querySelectorAll('div[class]');
    pageBlocks.forEach((pageBlock) => {
      const blockName = getAuthorName(pageBlock) || getBlockName(pageBlock);
      const blockItem = createGroupItem(
        blockName,
        () => createTable(pageBlock, getBlockName(pageBlock), block.path),
      );
      blockGroup.append(blockItem);
    });
  });
}
