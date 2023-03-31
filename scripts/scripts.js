import authorsParser from './authors-parser.js';
import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  createOptimizedPicture,
  readBlockConfig,
} from './lib-franklin.js';

const LCP_BLOCKS = ['leadspace', 'blog-home']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'merative'; // add your RUM generation information here

/**
 * Determine if we are serving content for the block-library, if so don't load the header or footer
 * @returns {boolean} True if we are loading block library content
 */
export function isBlockLibrary() {
  return window.location.pathname.includes('block-library');
}

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', {
      elems: [picture, h1],
    }));
    main.prepend(section);
  }
}

function buildBackToTopBlock(main) {
  const element = document.createElement('div');
  element.classList.add('back-to-top');
  main.append(element);

  const backToTop = main.querySelector(':scope > div.back-to-top');
  // add scroll listener
  window.addEventListener('scroll', () => {
    const scrollAmount = window.scrollY;
    if (scrollAmount > 100) {
      backToTop.classList.add('active');
    } else {
      backToTop.classList.remove('active');
    }
  });

  // add click listener
  backToTop.addEventListener('click', () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
}

/**
 * Helper function to create DOM elements
 * @param {string} tag DOM element to be created
 * @param {object} attributes attributes to be added
 * @param html {HTMLElement | SVGAElement | string} Additional html to be appended to tag
 */

export function createTag(tag, attributes = {}, html = undefined) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

/**
 * Retrieves the content of a metadata tag.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value
 */
export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const $meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return $meta && $meta.content;
}

function buildTags(main) {
  const tagsElement = document.createElement('div');
  const category = getMetadata('category');
  tagsElement.classList.add('tags');
  if (category) {
    tagsElement.append(buildBlock('tags', { elems: [] }));
    const firstH2 = main.querySelector('h2:first-of-type');
    const p = main.querySelector('p:first-of-type');
    // eslint-disable-next-line no-bitwise
    if (firstH2 && p && (firstH2.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      firstH2.after(tagsElement);
    }
  }
}

function buildPageDivider(main) {
  const allPageDivider = main.querySelectorAll('code');

  allPageDivider.forEach((el) => {
    const alt = el.innerText.trim();
    const lower = alt.toLowerCase();
    if (lower.startsWith('divider')) {
      if (lower === 'divider' || lower.includes('element')) {
        el.innerText = '';
        el.classList.add('divider');
      } else if (lower.includes('layout')) {
        el.innerText = '';
        el.classList.add('divider', 'layout');
      }
    }
  });
  const dividersLayout = main.querySelectorAll('div + div > p:first-of-type > code.divider.layout');
  dividersLayout.forEach((dividerLayout) => {
    dividerLayout.closest('div').classList.add('no-pad');
  });
}

// auto block build for blog left nav
function buildBlogLeftNavBlock(main) {
  if (getMetadata('template') === 'Blog Article') {
    const section = document.createElement('div');
    section.append(buildBlock('blog-left-nav', {
      elems: [],
    }));
    main.prepend(section);
  }
}

// auto block to create breadcrumb for blog articles
function buildBlogBreadCrumbBlock(main) {
  if (getMetadata('template') === 'Blog Article') {
    const section = document.createElement('div');
    section.append(buildBlock('blog-breadcrumb', {
      elems: [],
    }));
    main.prepend(section);
  }
}

// auto block to get the pdf url and put it in page metadata
function buildDocumentUrl(main) {
  if (getMetadata('template') === 'Document') {
    const pdfViewer = main.querySelector('.pdf-viewer');
    if (pdfViewer) {
      const blockConfig = readBlockConfig(pdfViewer);
      const docUrl = blockConfig['document-link'];
      if (docUrl) {
        const docUrlMetaTag = document.createElement('meta');
        docUrlMetaTag.setAttribute('name', 'document-link');
        docUrlMetaTag.setAttribute('content', docUrl);
        document.head.appendChild(docUrlMetaTag);
      }
    }
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildBackToTopBlock(main);
    buildBlogLeftNavBlock(main);
    buildBlogBreadCrumbBlock(main);
    buildDocumentUrl(main);
    buildTags(main);
    buildPageDivider(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Gets random default image for cards
 */

export function getRandomDefaultImage() {
  // get a random image from a set of 5 default images to use for this card
  const randomNumber = Math.floor(Math.random() * 5) + 1;
  return `/styles/default-images/default-card-image-${randomNumber}.png`;
}

/**
 * Gets details about pages that are indexed
 * @param {Array} pathnames list of pathnames
 */

export async function lookupPages(pathnames) {
  if (!window.pageIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
    const json = await resp.json();
    const lookup = {};
    json.data.forEach((row) => {
      lookup[row.path] = row;
      if (row.image || row.image.startsWith('/default-meta-image.png')) row.image = `/${window.hlx.codeBasePath}${row.image}`;
    });
    window.pageIndex = {
      data: json.data,
      lookup,
    };
  }
  const result = pathnames.map((path) => window.pageIndex.lookup[path]).filter((e) => e);
  return (result);
}

/**
 * Gets details about blogs that are indexed
 * @param {Array} pathnames list of pathnames
 */

export async function lookupBlogs(pathnames) {
  if (!window.blogIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/blog/blog-index-p2.json`);
    const json = await resp.json();
    const lookup = {};
    json.data.forEach((row) => {
      lookup[row.path] = row;
      if (row.image.startsWith('/default-meta-image.png')) {
        row.image = getRandomDefaultImage();
      } else {
        row.image = `/${window.hlx.codeBasePath}${row.image}`;
      }
    });
    window.blogIndex = {
      data: json.data,
      lookup,
    };
  }
  const result = pathnames.map((path) => window.blogIndex.lookup[path]).filter((e) => e);
  return (result);
}

/**
 * Gets details about all blogs that are indexed
 * or only blogs belonging to a specific category
 * @param {String} category name of the category
 */

export async function getAllBlogs(category) {
  if (!window.allBlogs) {
    const resp = await fetch(`${window.hlx.codeBasePath}/blog/blog-index-p2.json`);
    const json = await resp.json();
    json.data.forEach((row) => {
      if (row.image.startsWith('/default-meta-image.png')) {
        row.image = getRandomDefaultImage();
      } else {
        row.image = `/${window.hlx.codeBasePath}${row.image}`;
      }
    });
    window.allBlogs = json.data;
  }
  const blogArticles = window.allBlogs.filter((e) => e.template === 'Blog Article');
  blogArticles.sort((a, b) => {
    if (a.lastModified > b.lastModified) return -1;
    if (a.lastModified < b.lastModified) return 1;
    return 0;
  });

  // move featured article to the top of the sorted list
  const featuredArticleIndex = blogArticles.findIndex((el) => (el.featuredArticle === 'true'));
  const featuredArticle = blogArticles[featuredArticleIndex];
  blogArticles.splice(featuredArticleIndex, 1);
  blogArticles.unshift(featuredArticle);

  if (category) {
    // return only blogs that have the same category
    const result = blogArticles.filter((e) => e.category.trim() === category);
    return (result);
  }
  return (blogArticles);
}

/**
 * Gets details about all blog category pages that are indexed
 * for left nav
 */

export async function getBlogCategoryPages() {
  if (!window.allBlogs) {
    const resp = await fetch(`${window.hlx.codeBasePath}/blog/blog-index-p2.json`);
    const json = await resp.json();
    json.data.forEach((row) => {
      if (row.image.startsWith('/default-meta-image.png')) {
        row.image = getRandomDefaultImage();
      } else {
        row.image = `/${window.hlx.codeBasePath}${row.image}`;
      }
    });
    window.allBlogs = json.data;
  }
  // return only blog category pages for left navigation
  const result = window.allBlogs.filter((e) => e.template === 'Category');
  return (result);
}

/**
 * Creates a Card using a JSON object and style associated with the card
 * @param {Object} row JSON Object typically coming from an index array item
 * @param {String} style Class name that needs to be added to the card root div
 */

export async function createCard(row, style) {
  // Create card div
  const card = document.createElement('div');
  if (style) card.classList.add(style);

  // Add the image to the card first
  if (row.image !== '0' && row.title !== '0') {
    const cardImage = document.createElement('div');
    cardImage.classList.add('card-image');
    cardImage.append(createOptimizedPicture(row.image, row.title));
    card.prepend(cardImage);
  }

  // Create a separate child div for the card content
  const cardContent = document.createElement('div');
  cardContent.classList.add('card-content');

  // Create and add the link, title, author, readtime and category to card content and card
  const link = document.createElement('a');
  link.classList.add('blog-link');
  link.href = row.path;
  if (row.title) link.innerHTML += `${row.title}`;
  cardContent.append(link);
  if (row.description && row.description !== '0') cardContent.innerHTML += `<p>${row.description.substring(0, 160)}...</p>`;
  const author = document.createElement('div');
  author.classList.add('blog-author');

  if (!row.authors) {
    author.innerHTML += 'By Merative';
  } else {
    const authors = authorsParser(row.authors);
    const authorNames = [];
    authors.forEach((authorItem) => {
      authorNames.push(authorItem.name);
    });
    author.innerHTML += `By ${authorNames.join(', ')}`;
  }

  if (row.readtime && row.readtime !== '0') author.innerHTML += ` | ${row.readtime}`;
  cardContent.append(author);
  const category = document.createElement('div');
  category.classList.add('blog-category');
  if (row.category && row.category !== '0') category.innerHTML += row.category;
  cardContent.append(category);

  card.append(cardContent);
  return (card);
}

/**
 * Creates a Card using a JSON object and style associated with the card
 * @param {Object} row JSON Object typically coming from an index array item
 * @param {String} style Class name that needs to be added to the card root div
 */

export async function createDocumentCard(row, style) {
  // Create card div
  const card = document.createElement('div');
  if (style) card.classList.add(style);
  // Get category
  const category = document.createElement('div');
  category.classList.add('document-category');
  if (row.assetType && row.assetType !== '0') category.innerHTML += row.assetType;
  card.append(category);
  // Add the title, description and link to card
  if (row.title) card.innerHTML += `<a href="${row.path}"><h3>${row.title}</h3></a>`;
  if (row.description && row.description !== '0') card.innerHTML += `<a href="${row.path}"><p>${row.description.substring(0, 160)}...</p></a>`;
  const link = document.createElement('a');
  link.classList.add('document-link');
  link.href = row.path;
  card.append(link);
  return (card);
}

/**
 * Gets details about documents that are indexed
 * @param {Array} pathnames list of pathnames
 */

export async function lookupDocuments(pathnames) {
  if (!window.documentIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/documents/document-index.json`);
    const json = await resp.json();
    const lookup = {};
    json.data.forEach((row) => {
      lookup[row.path] = row;
      if (row.image.startsWith('/default-meta-image.png')) {
        row.image = getRandomDefaultImage();
      } else {
        row.image = `/${window.hlx.codeBasePath}${row.image}`;
      }
    });
    window.documentIndex = {
      data: json.data,
      lookup,
    };
  }
  const result = pathnames.map((path) => {
    // path is not in the documentIndex (pdfs)
    if (window.documentIndex.lookup[path] === undefined) {
      return {
        path,
      };
    }
    return window.documentIndex.lookup[path];
  });
  return (result);
}

export function decorateExternalLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    const extension = href.split('.').pop().trim();
    if (!href.startsWith('/')
      && !href.startsWith('#')) {
      if (!href.includes('merative.com') || (extension === 'pdf')) {
        a.setAttribute('target', '_blank');
      }
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateExternalLinks(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const {
    hash,
  } = window.location;
  const element = hash ? main.querySelector(hash) : false;
  if (hash && element) element.scrollIntoView();

  if (!isBlockLibrary()) {
    loadHeader(doc.querySelector('header'));
    loadFooter(doc.querySelector('footer'));
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
