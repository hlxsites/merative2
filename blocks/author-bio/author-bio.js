import { createTag, getMetadata, lookupPeople } from '../../scripts/scripts.js';
import authorsParser from '../../scripts/authors-parser.js';

export default async function decorate(block) {
  const defaultAuthorImageSrc = '../../styles/images/AuthorPlaceholder.svg';
  const defaultAuthor = 'Merative';

  let authors = [];
  const nameField = 'name';
  const titleField = 'title';
  const imageField = 'image';
  const content = [];

  // get author details from people/query-index
  const pathnames = [...block.querySelectorAll('a')].map((a) => {
    const url = new URL(a.href);
    if (url.hostname.endsWith('.page') || url.hostname.endsWith('.live') || url.hostname.endsWith('merative.com') || url.hostname.startsWith('localhost')) return url.pathname;
    return a.href;
  });

  const peopleList = await lookupPeople(pathnames);
  if (peopleList.length) {
    peopleList.forEach((people) => {
      const author = {};
      let isAuthorFlag = false;

      // Add name
      if (people.title && people.title !== '0') {
        author[nameField] = people.title;
        isAuthorFlag = true;
      }
      // Add image
      if (people.image !== '0' && people.title !== '0') {
        const url = new URL(people.image, window.location.href);
        author[imageField] = url.pathname;
        isAuthorFlag = true;
      }
      // Add title
      if (people['display-title'] && people['display-title'] !== '0') {
        author[titleField] = people['display-title'];
        isAuthorFlag = true;
      }

      if (isAuthorFlag) {
        authors.push(author);
      }
    });
  }

  // get author details from meta-data
  if (authors.length === 0) {
    const authorMetaData = getMetadata('authors');
    authors = authorsParser(authorMetaData);
  }

  // set default author details if authors are not fetched
  if (!authors || authors.length === 0) {
    authors = [{
      [nameField]: defaultAuthor,
      [imageField]: defaultAuthorImageSrc,
    }];
  }

  block.innerHTML = '';

  authors.forEach((author) => {
    const authorContainer = createTag('div', { class: 'author-container' });
    const authorImageTag = createTag('img', { class: 'author-img', alt: 'author-image' });
    authorImageTag.setAttribute('src', author[imageField] || defaultAuthorImageSrc);
    const authorNameTag = createTag('div', { class: 'author-name' });
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
