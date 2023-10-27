import { createTag, getSearchIndex } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

let index;
let searchTerm = '';
let results;

async function showResults() {
  // clear the results
  results.innerHTML = '';
  // filter and redraw the results
  const ul = createTag('ul');
  index
    .filter((row) => (row.title.toLowerCase().includes(searchTerm.toLowerCase())
      || row.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .forEach((row) => {
      const link = createTag('a', { href: row.path, 'aria-label': row.title }, row.title);
      const li = createTag('li', { class: 'search-result' }, link);
      ul.append(li);
    });
  results.append(ul);
}

export default async function decorate(block) {
  const cfg = await readBlockConfig(block);
  block.textContent = '';
  const filter = cfg.filter || '';
  index = await getSearchIndex(filter);
  const input = createTag('input', {
    type: 'text',
    placeholder: 'Type a search term or article type, such as release notes or news.',
  });
  const form = createTag('form', { onsubmit: 'event.preventDefault();' }, input);
  const searchIcon = createTag('span', { class: 'search-icon' });
  results = createTag('div', { class: 'results' });
  form.append(searchIcon);
  block.append(form);
  block.append(results);

  // Search input listener
  input.addEventListener('input', async (e) => {
    // saving the input value
    searchTerm = e.target.value;
    // re-displaying results based on the new search_term
    await showResults();
  });
}
