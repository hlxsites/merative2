import { createTag } from '../../scripts/scripts.js';

const LIBRARY_PATH = '/block-library/library.json';

async function runListScript(name, content, list) {
  const { default: listFn } = await import(`./lists/${name}.js`);
  listFn(content, list);
}

async function loadList(type, content, list) {
  list.innerHTML = '';
  switch (type) {
    case 'blocks':
      runListScript('blocks', content, list);
      break;
    case 'sections':
      runListScript('sections', content, list);
      break;
    case 'buttons':
      runListScript('buttons', content, list);
      break;
    case 'placeholders':
      runListScript('placeholders', content, list);
      break;
    case 'assets':
      runListScript('assets', content, list);
      break;
    default:
      console.log(`Library type not supported: ${type}`); // eslint-disable-line no-console
  }
}

async function fetchLibrary(domain) {
  const { searchParams } = new URL(window.location.href);
  const suppliedLibrary = searchParams.get('library');
  const library = suppliedLibrary || `${domain}${LIBRARY_PATH}`;

  const resp = await fetch(library);
  if (!resp.ok) return null;
  return resp.json();
}

async function getSuppliedLibrary() {
  const { searchParams } = new URL(window.location.href);
  const repo = searchParams.get('repo');
  const owner = searchParams.get('owner');
  if (!repo || !owner) return null;
  return fetchLibrary(`https://main--${repo}--${owner}.hlx.live`);
}

async function fetchAssetsData(path) {
  if (!path) return null;
  const resp = await fetch(path);
  if (!resp.ok) return null;

  const json = await resp.json();
  return json.entities.map((entity) => entity.links[0].href);
}

async function combineLibraries(base, supplied) {
  const url = new URL(window.location.href);

  const assetsPath = url.searchParams.get('assets');

  const library = Object.entries(base).reduce((prev, [name, item]) => ({
    ...prev,
    [name]: [...(item.data || [])],
  }), {});

  library.assets = await fetchAssetsData(assetsPath);

  if (supplied) {
    Object.entries(supplied).forEach(([name, item]) => {
      const { data } = item;
      if (data?.length > 0) {
        library[name].push(...data);
      }
    });
  }

  return library;
}

function createList(libraries) {
  const container = createTag('div', { class: 'con-container' });

  const libraryList = createTag('ul', { class: 'sk-library-list' });
  container.append(libraryList);

  Object.entries(libraries).forEach(([type, lib]) => {
    if (!libraries[type] || libraries[type].length === 0) return;

    const item = createTag('li', { class: 'content-type' }, type);
    libraryList.append(item);

    const list = document.createElement('ul');
    list.classList.add('con-type-list', `con-${type}-list`);
    container.append(list);

    item.addEventListener('click', (e) => {
      const skLibrary = e.target.closest('.sk-library');
      skLibrary.querySelector('.sk-library-title-text').textContent = type;
      libraryList.classList.add('inset');
      list.classList.add('inset');
      skLibrary.classList.add('allow-back');
      loadList(type, lib, list);
    });
  });

  return container;
}

function createHeader() {
  const nav = createTag('button', { class: 'sk-library-logo' }, 'Franklin Library');
  const title = createTag('div', { class: 'sk-library-title' }, nav);
  title.append(createTag('p', { class: 'sk-library-title-text' }, 'Pick a library'));
  const header = createTag('div', { class: 'sk-library-header' }, title);

  nav.addEventListener('click', (e) => {
    const skLibrary = e.target.closest('.sk-library');
    skLibrary.querySelector('.sk-library-title-text').textContent = 'Pick a library';
    const insetEls = skLibrary.querySelectorAll('.inset');
    insetEls.forEach((el) => {
      el.classList.remove('inset');
    });
    skLibrary.classList.remove('allow-back');
  });
  return header;
}

function detectContext() {
  if (window.self === window.top) {
    document.body.classList.add('in-page');
  }
}

export default async function init(el) {
  el.querySelector('div').remove();
  detectContext();

  // Get the data
  const base = await fetchLibrary(window.location.origin);
  const supplied = await getSuppliedLibrary();
  const libraries = await combineLibraries(base, supplied);

  // Create the UI
  const skLibrary = createTag('div', { class: 'sk-library' });

  const header = createHeader();
  skLibrary.append(header);

  const list = createList(libraries);
  skLibrary.append(list);
  el.attachShadow({ mode: 'open' });

  el.shadowRoot.append(skLibrary);

  // add styles
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', '/blocks/library-config/library-config.css');
  el.shadowRoot.appendChild(link);
}
