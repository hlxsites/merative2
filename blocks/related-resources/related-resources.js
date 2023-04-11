import { lookupDocuments, createDocumentCard } from '../../scripts/scripts.js';

async function setRowDetails(row, block) {
  // Get the right element for this row
  let aElement = {};
  [...block.querySelectorAll('a')].forEach((a) => {
    const { pathname } = new URL(a.href);
    if ((a.href === row.path) || (pathname === row.path)) aElement = a;
  });
  if (aElement) {
    // Go up one level since <a> is wrapped inside a <p> usually
    let el = aElement.parentElement;
    // Loop through previous elements until you hit an <a>
    while (el) {
      if (el.previousElementSibling) {
        el = el.previousElementSibling;
      } else {
        break;
      }
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
          row.title = el.innerHTML;
          break;
        case 'H4':
        case 'H5':
          row.assetType = el.innerHTML;
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

const linkTypeParsers = [
  {
    name: 'pdf',
    className: 'dc-pdf-type',
    check: (link) => link.split('.').pop() === 'pdf',
  },
  {
    name: 'video',
    className: 'dc-video-type',
    check: (link) => {
      const videoServices = ['youtube', 'vimeo', 'youtu.be'];
      return videoServices.some((service) => link.includes(service));
    },
  },
  {
    name: 'external',
    className: 'dc-external-type',
    check: (link) => link[0] !== '/',
  },
  {
    name: 'default(internal)',
    className: 'dc-internal-type',
    check: () => true,
  },
];

const getClassNameByLinkType = (link) => linkTypeParsers
  .find((parser) => parser.check(link)).className;

export default async function decorate(block) {
  const pathnames = [...block.querySelectorAll('a')].map((a) => {
    const url = new URL(a.href);
    if (url.hostname.endsWith('.page') || url.hostname.endsWith('.live') || url.hostname.endsWith('merative.com') || url.hostname.startsWith('localhost')) return url.pathname;
    return a.href;
  });
  const blockCopy = block.cloneNode(true);
  block.textContent = '';
  // Make a call to the document index and get the json for just the pathnames the author has put in
  const pageList = await lookupDocuments(pathnames);
  if (pageList.length) {
    pageList.forEach(async (row) => {
      const className = getClassNameByLinkType(row.path);
      // If the URL was not in the index, it is curated. Let's get the content differently
      if (row.title === undefined) setRowDetails(row, blockCopy);
      block.append(await createDocumentCard(row, ['document-card', className]));
    });
  } else {
    block.remove();
  }
}
