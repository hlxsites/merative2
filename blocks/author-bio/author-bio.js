import { createTag, getMetadata } from '../../scripts/scripts.js';
import authorsParser from '../../scripts/authors-parser.js';

export default function decorate(block) {
  const defaultAuthorImageSrc = '../../styles/images/AuthorPlaceholder.svg';
  const defaultAuthor = 'Merative';

  let authors = getMetadata('authors');
  const nameField = 'name';
  const titleField = 'title';
  const imageField = 'image';
  const content = [];

  if (!authors) {
    authors = [{
      [nameField]: defaultAuthor,
      [imageField]: defaultAuthorImageSrc,
    }];
  }

  const authorsQuantity = authors.length;
  authors = authorsParser(authors);
  block.innerHTML = authorsQuantity > 1 ? '' : '';

  authors.forEach((author) => {
    const authorContainer = createTag('div', { class: 'author-container' });
    const authorImageTag = createTag('img', { class: 'author-img', alt: 'author-image' });
    authorImageTag.setAttribute('src', author[imageField] || defaultAuthorImageSrc);
    authorImageTag.setAttribute('alt', 'author-image');
    const authorNameTag = createTag('div', { class: 'author-name' });
    authorNameTag.innerHTML = authorsQuantity === 1 ? '' : '';
    const authorNameHighlight = createTag('span', { class: 'author-name-highlight' });
    const authorTitleHighlight = createTag('span', { class: 'author-title-highlight' });
    authorNameHighlight.innerHTML = author[titleField] ? `${author[nameField]},` : author[nameField];
    authorTitleHighlight.innerHTML = author[titleField] || '';
    authorNameTag.append(authorNameHighlight);
    authorNameTag.append(authorTitleHighlight);
    authorContainer.append(authorImageTag, authorNameTag);
    content.push(authorContainer);
  });
  block.append(...content);
}
