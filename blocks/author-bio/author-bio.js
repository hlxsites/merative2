import { createTag, getMetadata } from '../../scripts/scripts.js';
import authorsParser from '../../scripts/authors-parser.js';

export default function decorate(block) {
  const defaultAuthorImageSrc = '../../styles/favicon-thumbnail-merative.svg';
  const defaultAuthor = 'Merative';

  const pubDate = getMetadata('publication-date');
  const readtime = getMetadata('readtime');
  let authors = getMetadata('authors');
  const nameField = 'name';
  const titleField = 'title';
  const imageField = 'image';
  const prefix = 'By ';
  const content = [];

  if (!authors) {
    authors = [{
      [nameField]: defaultAuthor,
      [imageField]: defaultAuthorImageSrc,
    }];
  }

  const authorsQuantity = authors.length;
  authors = authorsParser(authors);
  block.innerHTML = authorsQuantity > 1 ? `${prefix}` : '';

  authors.forEach((author) => {
    const authorContainer = createTag('div', { class: 'author-container' });
    const authorImageTag = createTag('img', { class: 'author-img', alt: 'author-image' });
    authorImageTag.setAttribute('src', author[imageField] || defaultAuthorImageSrc);
    authorImageTag.setAttribute('alt', 'author-image');
    const authorNameTag = createTag('div', { class: 'author-name' });
    authorNameTag.innerHTML = authorsQuantity === 1 ? `${prefix}` : '';
    const authorNameHighlight = createTag('span', { class: 'author-name-hightlight' });
    const authorTitleHighlight = createTag('span', { class: 'author-title-hightlight' });
    authorNameHighlight.innerHTML = author[titleField] ? `${author[nameField]},` : author[nameField];
    authorTitleHighlight.innerHTML = author[titleField] || '';
    authorNameTag.append(authorNameHighlight);
    authorNameTag.append(authorTitleHighlight);
    authorContainer.append(authorImageTag, authorNameTag);
    content.push(authorContainer);
  });
  block.append(...content);

  if (pubDate) {
    const pipeTag = createTag('span', { class: 'pipe' });
    pipeTag.innerHTML = '|';
    const pubDateTag = createTag('span', { class: 'publication-date' });
    pubDateTag.innerHTML = pubDate;
    block.append(pipeTag, pubDateTag);
  }

  if (readtime) {
    const pipeTag = createTag('span', { class: 'pipe' });
    pipeTag.innerHTML = '|';
    const readtimeTag = createTag('span', { class: 'readtime' });
    readtimeTag.innerHTML = readtime;
    block.append(pipeTag, readtimeTag);
  }
}
