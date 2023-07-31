import { getPDFsDocuments, createDocumentCard } from '../../scripts/scripts.js';
import { decorateButtons, decorateIcons } from '../../scripts/lib-franklin.js';
import { setRowDetails } from '../related-resources/related-resources.js';

export default async function decorate(block) {
  let html = '';
  if ([...block.children].length > 0) {
    [...block.children].forEach((element) => {
      const content = element.children[0].innerHTML;
      const lastColumn = element.children[element.children.length - 1];
      const link = lastColumn.querySelectorAll('a')[0].getAttribute('href');
      html += `<div><a href="${link}">${content}</a></div>`;
      block.innerHTML = html;
    });
  } else { // fetchign documents and populating top 3 cards.
    const cardList = await getPDFsDocuments();
    const blockCopy = block.cloneNode(true);
    block.textContent = '';
    [...cardList.data].forEach((element, index) => {
      if (index < 3) {
        setRowDetails(element, blockCopy);
        if (element.title && element.description) {
          block.append(createDocumentCard(element, ['document-card']));
        }
        decorateButtons(block, {
          decorateClasses: false,
          excludeIcons: [],
        });
        decorateIcons(block);
      }
    });
  }
}
