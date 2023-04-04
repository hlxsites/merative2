import { lookupPages } from '../../scripts/scripts.js';

async function setRowDetails(row, block) {
  // Get the right element for this row
  let aElement = {};
  [...block.querySelectorAll('a')].forEach((a) => {
    const { pathname } = new URL(a.href);
    if ((a.href === row.path) || (pathname === row.path)) aElement = a;
  });
  if (aElement) {
    row['teaser-link-text'] = aElement.innerText;
    // Go up one level since <a> is wrapped inside a <p> usually
    let el = aElement.parentElement;
    // Loop through previous elements until you hit an <a>
    while (el) {
      el = el.previousElementSibling;
      // Break if you find an anchor link in the previous element
      const childAnchor = el.querySelector('a');
      if (childAnchor) {
        break;
      }
      // set the row object properties based on the type of node we hit
      switch (el.nodeName) {
        case 'H1':
        case 'H2':
        case 'H3':
        case 'H4':
        case 'H5':
        case 'H6':
          row.title = el.innerHTML;
          break;
        case 'P':
          row.description = el.innerHTML;
          break;
        default:
          break;
      }
    }
  }
}

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
  const blockCopy = block.cloneNode(true);
  block.textContent = '';
  const pageList = await lookupPages(pathnames);
  if (pageList.length) {
    pageList.forEach((row) => {
      // If the URL was not in the index, it is curated. Let's get the content differently
      if (row.title === undefined) setRowDetails(row, blockCopy);
      block.append(createCard(row, 'teaser-card'));
    });
  } else {
    block.remove();
  }
}
