import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadSolutionHeader,
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
 * Determine if we are serving content for a specific keyword
 * @param {string} keyword - The keyword to check in the URL path
 * @returns {boolean} True if we are loading content for the specified keyword
 */
export function locationCheck(keyword) {
  return window.location.pathname.includes(keyword);
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

/**
 * Retrieves the content of a cookie.
 * @param {string} cname The cookie name (or property)
 * @returns {string} The cookie value
 */
export function getCookie(cname) {
  const name = cname.concat('=');
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

/**
* Set the content of a cookie
* @param {string} cname The cookie name (or property)
* @param {string} cvalue The cookie value
* @param {number} exdays The cookie expiry days (default 30 days)
* @param {string} path The cookie path (optional)
*
* example - setCookie('username', cookieExist, 5); this cookie expires in 5 days.
*/
export function setCookie(cname, cvalue, exdays = 30, path = '/') {
  const expiresDate = exdays * 1000 * 60 * 60 * 24;
  const today = new Date();
  today.setTime(today.getTime() + (expiresDate));
  const expires = 'expires='.concat(today.toGMTString());
  const cookieString = cname.concat('=')
    .concat(cvalue)
    .concat(';')
    .concat(expires)
    .concat(';path=')
    .concat(path);
  document.cookie = cookieString; // cname + '=' + cvalue + ';' + expires + ';path=' + path;
}

/**
* Delete content of a cookie
* @param {string} cname The cookie name (or property)
* @param {string} path The cookie path (optional)
*/
export function deleteCookie(cname, path = '/') {
  if (getCookie(cname)) {
    document.cookie = cname.concat('=;expires=Sat, 01-Jan-2000 00:00:01 GMT;path=').concat(path);
  }
}

/**
* Create a unique hash from a specific string
* @param {string} str The String value
* @returns {number} The created hash code of string
*/
export function createStringToHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i) | 0; // eslint-disable-line no-bitwise
    hash &= hash; // eslint-disable-line no-bitwise
  }
  return hash;
}

/**
 * sets the Content-Security-Policy meta tag to the document based on JSON file
 */
async function setCSP() {
  const resp = await fetch(`${window.hlx.codeBasePath}/scripts/csp.json`);
  const json = await resp.json();
  const directives = Object.keys(json);
  const policy = directives.map((directive) => `${directive} ${json[directive].join(' ')}`).join('; ');
  const meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute('content', policy);
  document.head.appendChild(meta);
}

function buildTags(main) {
  const tagsElement = document.createElement('div');
  const category = getMetadata('category');
  tagsElement.classList.add('tags');
  if (category) {
    tagsElement.append(buildBlock('tags', { elems: [] }));
    // if there's a lede before the picture
    const firstP = main.querySelector('p:first-of-type:not(.only-picture)');
    const pic = main.querySelector('.only-picture');
    if (firstP && pic
      // eslint-disable-next-line no-bitwise
      && (firstP.compareDocumentPosition(pic) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      firstP.classList.add('lede');
    }
    const bio = main.querySelector('.author-bio');
    // eslint-disable-next-line no-bitwise
    if (pic && bio && (pic.compareDocumentPosition(bio) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      pic.before(tagsElement);
    }
  }
}

function buildPublicationInfo() {
  // Check if the publication info element has already been added
  const existingPublicationInfo = document.querySelector('.publication-info-wrapper');
  if (existingPublicationInfo) {
    return; // Exit the function if the element already exists
  }

  if (getMetadata('template') === 'Blog Article') {
    const tagsElement = document.querySelector('.article-content-wrapper .tags-wrapper');
    if (!tagsElement || !tagsElement.parentNode) {
      return; // Exit the function if tagsElement or its parent node is null
    }

    const publicationInfoElement = document.createElement('div');
    publicationInfoElement.classList.add('publication-info-wrapper');

    const pubDate = getMetadata('publication-date');
    const readtime = getMetadata('readtime');

    if (pubDate || readtime) {
      const pubDateTag = createTag('span', { class: 'publication-date' });
      pubDateTag.innerHTML = `Published ${pubDate}`;

      const pipeTag = createTag('span', { class: 'pipe' });
      pipeTag.innerHTML = '|';
      const readtimeTag = createTag('span', { class: 'publication-readtime' });
      readtimeTag.innerHTML = readtime;

      publicationInfoElement.append(pubDateTag, pipeTag, readtimeTag);

      // Insert the publicationInfoElement before the tagsElement
      tagsElement.parentNode.insertBefore(publicationInfoElement, tagsElement);
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
function buildBlogLeftNavBlock() {
  if (getMetadata('template') === 'Blog Article') {
    const topMain = document.querySelector('body > main');
    const section = document.createElement('div');
    section.append(buildBlock('blog-left-nav', {
      elems: [],
    }));
    topMain.prepend(section);
  }
}

// auto block to create breadcrumb for blog articles
function buildBlogBreadCrumbBlock() {
  if (getMetadata('template') === 'Blog Article') {
    const topMain = document.querySelector('body > main');
    const section = document.createElement('div');
    section.append(buildBlock('blog-breadcrumb', {
      elems: [],
    }));
    topMain.prepend(section);
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
 * Fetch frgament by path
 */
export async function fetchFragment(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok) {
    const container = document.createElement('main');
    container.innerHTML = await resp.text();
    // eslint-disable-next-line no-use-before-define
    decorateMain(container);
    await loadBlocks(container);
    return container.querySelector(':scope .section');
  }
  return null;
}

// Auto block to create breadcrumb for pages with `breadcrumb` metadata
async function buildBreadcrumb() {
  const breadcrumbMetadata = getMetadata('breadcrumb');
  const breadcrumbImageMetadata = getMetadata('breadcrumb-image');

  if (breadcrumbMetadata) {
    const main = document.querySelector('main');

    // Fetch breadcrumb content asynchronously
    const fragmentBlock = await fetchFragment(breadcrumbMetadata);

    // Prepend breadcrumb content to the main element
    main.prepend(fragmentBlock);

    // Check if `breadcrumb-image` metadata is set to 'False' and add class accordingly
    if (breadcrumbImageMetadata && breadcrumbImageMetadata.toLowerCase() === 'false') {
      fragmentBlock.classList.add('breadcrumb-no-image');
    }
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */

function buildAutoBlocks(main) {
  try {
    buildBlogLeftNavBlock();
    buildBlogBreadCrumbBlock();
    buildDocumentUrl(main);
    buildTags(main);
    buildPublicationInfo();
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

  const result = pathnames.map((path) => {
    // path is not in the index (external links)
    if (window.pageIndex.lookup[path] === undefined) {
      return {
        path,
      };
    }
    return window.pageIndex.lookup[path];
  });
  return (result);
}

/**
 * Gets details about blogs that are indexed
 * @param {Array} pathnames list of pathnames
 */

export async function lookupBlogs(pathnames) {
  if (!window.blogIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/blog/query-index.json`);
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
 * Gets details about people that are indexed
 * @param {Array} pathnames list of pathnames
 */

export async function lookupPeople(pathnames) {
  if (!window.peopleIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/people/query-index.json`);
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
    window.peopleIndex = {
      data: json.data,
      lookup,
    };
  }
  const result = pathnames.map((path) => window.peopleIndex.lookup[path]).filter((e) => e);
  return (result);
}

/**
 * Fetches and transforms data from a JSON file
 * @param {string} path - The path to the JSON file
 * @returns {Promise<Array>} - A promise resolving to the transformed data array
 */
async function fetchData(path) {
  const response = await fetch(path);
  const json = await response.json();

  return json.data.map((row) => {
    if (row.image.startsWith('/default-meta-image.png')) {
      row.image = getRandomDefaultImage();
    } else {
      row.image = `/${window.hlx.codeBasePath}${row.image}`;
    }
    return row;
  });
}

/**
 * Retrieves all blogs or blogs of a specific category
 * @param {string} category - The name of the category (optional)
 * @returns {Promise<Array>} - A promise resolving to the filtered blogs array
 */
export async function getAllBlogs(category) {
  if (!window.allBlogs) {
    window.allBlogs = await fetchData(`${window.hlx.codeBasePath}/blog/query-index.json`);
  }

  const blogArticles = window.allBlogs.filter((e) => e.template === 'Blog Article');

  // Move the featured article to the top of the sorted list
  const featuredArticleIndex = blogArticles.findIndex((el) => el['featured-article'] === 'true');
  if (featuredArticleIndex > -1) {
    const featuredArticle = blogArticles.splice(featuredArticleIndex, 1)[0];
    blogArticles.unshift(featuredArticle);
  }

  if (category) {
    const categoryValue = category.trim().toLowerCase();
    return blogArticles.filter((e) => e.category.trim().toLowerCase() === categoryValue);
  }

  return blogArticles;
}

/**
 * Retrieves all thought leadership articles or articles of a specific category
 * @param {string} category - The name of the category (optional)
 * @returns {Promise<Array>} - A promise resolving to the filtered thought leadership articles array
 */
export async function getThoughtLeadership(category) {
  if (!window.allThoughtLeadership) {
    window.allThoughtLeadership = await fetchData(`${window.hlx.codeBasePath}/query-index.json`);
  }

  const allThoughtLeadership = window.allThoughtLeadership.filter((e) => e.thoughtleadership === 'true');

  // Move the featured article to the top of the sorted list
  const featuredArticleIndex = allThoughtLeadership.findIndex((el) => el['featured-article'] === 'true');
  if (featuredArticleIndex > -1) {
    const featuredArticle = allThoughtLeadership.splice(featuredArticleIndex, 1)[0];
    allThoughtLeadership.unshift(featuredArticle);
  }

  if (category) {
    const categoryValue = category.trim().toLowerCase();
    return allThoughtLeadership.filter((e) => e.category.trim().toLowerCase() === categoryValue);
  }

  return allThoughtLeadership;
}

/**
 * Gets details about all blog category pages that are indexed
 * for left nav
 */

export async function getBlogCategoryPages() {
  if (!window.allBlogs) {
    const resp = await fetch(`${window.hlx.codeBasePath}/blog/query-index.json`);
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
 * Gets details about all solution category pages that are indexed
 * for left nav
 */

export async function getSolutionCategoryPages() {
  if (!window.allPages) {
    const resp = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
    const json = await resp.json();
    json.data.forEach((row) => {
      if (row.image.startsWith('/default-meta-image.png')) {
        row.image = getRandomDefaultImage();
      } else {
        row.image = `/${window.hlx.codeBasePath}${row.image}`;
      }
    });
    window.allPages = json.data;
  }
  // return only solution category pages for left navigation
  const result = window.allPages.filter((e) => e.template === 'solution');
  return (result);
}

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

  // Create title - render display-title if it exists
  if (typeof row['display-title'] !== 'undefined' && row['display-title'] !== null && row['display-title'] !== '0') {
    link.innerHTML += `${row['display-title']}`;
  } else {
    link.innerHTML += `${row.title}`;
  }

  cardContent.append(link);
  if (row.description && row.description !== '0') cardContent.innerHTML += `<p>${row.description}</p>`;
  const author = document.createElement('div');
  author.classList.add('blog-author');

  if (!row.authors) {
    author.innerHTML += 'By Merative';
  } else {
    const authorsParser = await import('./authors-parser.js');
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
 * @param {Array} styles Class names that needs to be added to the card root div
 */
export function createDocumentCard(row, styles) {
  // Create card div
  const card = createTag('div');
  if (styles.length) {
    styles.forEach((style) => card.classList.add(style));
  }
  // Get category
  const category = createTag('div', { class: 'document-category' });
  if (row.assettype && row.assettype !== '0') {
    category.innerHTML += row.assettype;
  } else if (row.template === 'Blog Article') {
    category.innerHTML += 'Blog';
  }
  card.append(category);
  // Add the title, description and link to card
  const link = createTag('a', { href: row.path, 'aria-label': row.title });
  if (row.title) {
    const titleLink = link.cloneNode();
    titleLink.innerHTML = `<h3>${row.title}</h3>`;
    card.append(titleLink);
  }
  if (row.description && row.description !== '0') {
    const descriptionLink = link.cloneNode();
    descriptionLink.innerHTML = `<p>${row.description}</p>`;
    card.append(descriptionLink);
  }
  const linkContainer = createTag('div', { class: 'document-link-container' });
  const buttonLink = link.cloneNode();
  buttonLink.classList.add('button', 'document-link');
  linkContainer.append(buttonLink);
  card.append(linkContainer);
  return (card);
}

/**
 * Creates a Headshot List using a JSON object and style associated with the List
 * @param {Object} row JSON Object typically coming from an index array item
 * @param {Array} styles Class names that needs to be added to the List root div
 */
export function createHeadshotList(row, styles) {
  const list = document.createElement('div');
  if (styles) list.classList.add(styles);

  // Add image
  if (row.image !== '0' && row.title !== '0') {
    const listImage = document.createElement('div');
    listImage.classList.add('headshot-list__image');
    listImage.appendChild(createOptimizedPicture(row.image, row.title));
    list.prepend(listImage);
  }

  // Add content
  const listContent = document.createElement('div');
  listContent.classList.add('headshot-list__content');

  if (row.title) {
    listContent.innerHTML += `<div class="headshot-list__title">${row.title}</div>`;
  }

  if (row['display-title']) {
    listContent.innerHTML += `<h4>${row['display-title']}</h4>`;
  }

  if (row.description) {
    listContent.innerHTML += `<p>${row.description}</p>`;
  }

  listContent.innerHTML += '<hr></hr>';

  // Socials
  const socialLinks = [];

  if (row.twitter && row.twitter !== '0') {
    socialLinks.push({
      href: row.twitter,
      label: 'Open Twitter',
      iconClass: 'icon-twitter',
    });
  }

  if (row.linkedin && row.linkedin !== '0') {
    socialLinks.push({
      href: row.linkedin,
      label: 'Open LinkedIn',
      iconClass: 'icon-linkedin',
    });
  }

  if (socialLinks.length > 0) {
    const listContentSocial = document.createElement('div');
    listContentSocial.classList.add('headshot-list__socials');

    socialLinks.forEach((linkInfo) => {
      const link = document.createElement('a');
      link.href = linkInfo.href;
      link.target = '_blank';
      link.setAttribute('aria-label', linkInfo.label);

      const iconSpan = document.createElement('span');
      iconSpan.classList.add('icon', linkInfo.iconClass);
      link.appendChild(iconSpan);

      listContentSocial.appendChild(link);
    });

    decorateIcons(listContentSocial);
    listContent.appendChild(listContentSocial);
  }
  list.appendChild(listContent);

  return list;
}

/**
 * Gets details about documents that are indexed
 * @param {Array} pathnames list of pathnames
 */

export async function lookupDocuments(pathnames) {
  if (!window.pageIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
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
    window.pageIndex = {
      data: json.data,
      lookup,
    };
  }
  const result = pathnames.map((path) => {
    // path is not in the documentIndex (pdfs)
    if (window.pageIndex.lookup[path] === undefined) {
      return {
        path,
      };
    }
    return window.pageIndex.lookup[path];
  });
  return (result);
}

/**
 * Gets details about pages that are indexed filtered by path
 * @param {String} filter return only pages that start with this filter
 */

export async function getSearchIndex(filter) {
  if (!window.pageIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
    const json = await resp.json();
    window.pageIndex = {
      data: json.data,
    };
  }

  const result = window.pageIndex.data.filter((row) => row.path.startsWith(filter));
  return (result);
}

/**
 * Gets pdf and documents list that are indexed
 */

export async function getPDFsDocuments() {
  const resp = await fetch(`${window.hlx.codeBasePath}/documents/query-index.json`);
  const result = await resp.json();
  return (result);
}

/**
 * Remove duplicate enteries from array or set
 * @param {Array | Set} arr Array or Set object
 * @param {string} type Identifier to check Array or Set. Value: set or array
 * @returns {Array | Set} Result
 */
export function removeDuplicateEnteries(arr, type) {
  const mapArr = new Map();
  let result = [];

  // Check if the array empty
  if (!arr.length && type !== 'set') {
    return result;
  }
  if (!arr.size && type === 'set') {
    return new Set([]);
  }

  arr.forEach((item) => {
    const key = item.toString().trim().toLowerCase();
    if (!mapArr.has(key)) {
      mapArr.set(key, item);
    }
  });
  result = [...mapArr.values()];
  if (type === 'set') {
    result = new Set(result);
  }

  return result;
}

export function sortArrayOfObjects(arr, property, type) {
  let result = [];
  let sortedArray;
  // Check if the array empty
  if (!arr.length && type !== 'set') {
    return result;
  }
  if (!arr.size && type === 'set') {
    return new Set([]);
  }

  switch (type) {
    case 'set':
      // Convert Set to Array
      sortedArray = Array.from(arr).sort();
      result = new Set(sortedArray);
      break;
    case 'number':
      result = arr.sort((a, b) => (a[property] - b[property]));
      break;
    case 'string':
      result = arr.sort((a, b) => {
        const title1 = a[property]?.toLowerCase();
        const title2 = b[property]?.toLowerCase();

        if (title1 < title2) {
          return -1;
        }
        if (title1 > title2) {
          return 1;
        }
        return 0;
      });
      break;
    default:
  }

  return result;
}

export function decorateExternalLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href) {
      const extension = href.split('.').pop().trim();
      if (!href.startsWith('/')
        && !href.startsWith('#')) {
        if (!href.includes('merative.com') || (extension === 'pdf')) {
          a.setAttribute('target', '_blank');
        }
      }
    }
  });
}

/* so we can remove the space that P adds via CSS */
function decorateOnlyPicture(main) {
  const onlyPictures = main.querySelectorAll('p > picture:only-child, div > picture:only-child');
  onlyPictures.forEach((onlyPicture) => {
    onlyPicture.closest('p, div').classList.add('only-picture');
  });
}

/**
 * Restructure DOM into Two Column Layout.
 * @param main
 */
function restructureContentLayout(main) {
  // Find the Section Content Body element
  const sectionContentBody = main.querySelector('.section-content-body');
  if (!sectionContentBody) {
    return;
  }

  // Find the Marketo element
  const marketoWrapper = main.querySelector('.marketo-wrapper');
  if (!marketoWrapper) {
    return;
  }

  // Check if '.section-content-body__text' already exists, otherwise create it
  let contentBodyText = main.querySelector('.section-content-body__text');
  if (!contentBodyText) {
    contentBodyText = document.createElement('div');
    contentBodyText.classList.add('section-content-body__text');

    // Get all parent-level elements within '.section-content-body'
    const parentElements = Array.from(sectionContentBody.children);

    // Iterate through the parent-level elements
    parentElements.forEach((element) => {
      // Check if the element is not equal to  '.marketo-wrapper'
      if (!element.classList.contains('marketo-wrapper')) {
        contentBodyText.appendChild(element);
      }
    });

    // Insert '.section-content-body__text' before '.marketo-wrapper'
    sectionContentBody.insertBefore(contentBodyText, marketoWrapper);

    // Add '.section-content-body__form' class to '.marketo-wrapper'
    marketoWrapper.classList.add('section-content-body__form');
  }
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
  decorateOnlyPicture(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  restructureContentLayout(main);
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
  await setCSP();
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const {
    hash,
  } = window.location;
  const element = hash ? main.querySelector(hash) : false;
  if (hash && element) element.scrollIntoView();

  if (!locationCheck('block-library') && !locationCheck('quick-links') && !locationCheck('campaigns') && !(getMetadata('template') === 'navattic')) {
    loadHeader(doc.querySelector('header'));
    loadFooter(doc.querySelector('footer'));
    await buildBreadcrumb();
  } else if (locationCheck('campaigns')) {
    loadSolutionHeader(doc.querySelector('header'));
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
