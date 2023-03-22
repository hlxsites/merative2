import { lookupPages } from '../../scripts/scripts.js';

function createCard(row, style) {
  const card = document.createElement('div');
  if (style) card.classList.add(style);
  const link = document.createElement('a');
  link.classList.add('teaser-link');
  link.href = row.path;
  if (row['teaser-link-text'] && row['teaser-link-text'] !== '0') {
    link.innerText = row['teaser-link-text'];
  } else {
    link.innerText = 'Learn more about';
  }
  if (row.title) card.innerHTML += `<h6>${row.title}</h6>`;
  if (row.description) card.innerHTML += `<p>${row.description}</p>`;
  card.append(link);
  return (card);
}

export default async function decorate(block) {
  const pathnames = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  block.textContent = '';
  const pageList = await lookupPages(pathnames);
  if (pageList.length) {
    pageList.forEach((row) => {
      block.append(createCard(row, 'teaser-card'));
    });
  } else {
    block.remove();
  }
}
