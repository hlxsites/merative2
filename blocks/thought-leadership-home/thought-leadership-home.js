/* eslint-disable no-restricted-syntax */
import {
  createCard, getSolutionCategoryPages, createTag, getThoughtLeadership,
} from '../../scripts/scripts.js';
import { loadMoreCards, createFilters, refreshCards } from '../blog-home/blog-home.js';

const NUM_CARDS_SHOWN_AT_A_TIME = 6;
const MODE = 'thought-leadership-home';
let loadMoreElement;

function loadPersistedValues() {
  const params = new URLSearchParams(window.location.search);

  // Clear the existing data from the global object
  window.queryParam = {};

  // Iterate through the query parameters and update the global object
  for (const [key, value] of params.entries()) {
    if (!Object.prototype.hasOwnProperty.call(window.queryParam, key)) {
      window.queryParam[key] = [];
    }
    window.queryParam[key].push(value);
  }

  const checkboxes = document.querySelectorAll('input[type=checkbox][name=blogFilters]');
  Array.from(checkboxes).forEach((checkbox) => {
    const groupName = checkbox.dataset.group;
    const { value } = checkbox;
    const isChecked = Object.prototype.hasOwnProperty.call(window.queryParam, groupName)
      && window.queryParam[groupName].includes(value);
    checkbox.checked = isChecked;
  });
  refreshCards(MODE);
}

export default async function decorate(block) {
  const category = block.textContent.trim();
  block.textContent = '';
  // Make a call to get all thought leadership articles from the global query-index
  const blogList = await getThoughtLeadership(category);
  const categoriesList = await getSolutionCategoryPages();
  const topics = new Set();
  const audiences = new Set();
  const contentTypes = new Set();
  if (blogList.length) {
    const blogContent = createTag('div', { class: 'blog-content' });
    // Get default content and hero block in this section and add it to content section ara
    const defaultContent = document.querySelectorAll('.thought-leadership-home-container > .default-content-wrapper, .thought-leadership-home-container .hero-wrapper');
    defaultContent.forEach((div) => blogContent.append(div));
    if (!defaultContent.length) {
      const emptyDiv = document.createElement('div');
      emptyDiv.setAttribute('class', 'default-content-wrapper');
      blogContent.appendChild(emptyDiv);
    }

    // Create the selected filters DOM structure
    const selectedFilters = createTag('div', { class: 'selected-filters' });
    const selectedFiltersdiv = createTag('div', { class: 'selected-filters-div' });
    const selectedFiltersTitle = createTag('div', { class: 'selected-filters-title' });
    const clearAllFilters = createTag('div', { class: 'clear-all-filters' });
    const selectedFiltersList = createTag('div', { class: 'selected-filters-list' });
    selectedFiltersdiv.append(selectedFiltersTitle);
    selectedFiltersdiv.append(clearAllFilters);
    selectedFilters.append(selectedFiltersdiv);
    selectedFilters.append(selectedFiltersList);
    // Create blog cards DOM structure
    const blogCards = createTag('div', { class: 'card-group' });
    await blogList.forEach(async (row, i) => {
      const blogCard = await createCard(row, 'card-item');
      // first render show featured article and 6 cards so total 7
      // If featured article, then add class name and make active no matter what
      if (row['featured-article'] && row['featured-article'] === 'true') {
        blogCard.classList.add('featured-article');
      }
      if (i < (NUM_CARDS_SHOWN_AT_A_TIME + 1)) {
        blogCard.setAttribute('card-active', 'true');
      } else {
        blogCard.setAttribute('card-active', 'false');
      }
      if (row.topic && row.topic !== '0') {
        blogCard.setAttribute('topics', row.topic);
        const topicValues = row.topic.split(',');
        topicValues.forEach((topicValue) => {
          if (topicValue.trim() !== '') topics.add(topicValue.trim());
        });
      }
      if (row.audience && row.audience !== '0') {
        blogCard.setAttribute('audiences', row.audience);
        const audienceValues = row.audience.split(',');
        audienceValues.forEach((audienceValue) => {
          if (audienceValue.trim() !== '') audiences.add(audienceValue.trim());
        });
      }
      if (row.assettype && row.assettype !== '0') {
        blogCard.setAttribute('content-types', row.assettype);
        const contentTypeValues = row.assettype.split(',');
        contentTypeValues.forEach((contentTypeValue) => {
          if (contentTypeValue.trim() !== '') contentTypes.add(contentTypeValue.trim());
        });
      }
      blogCards.append(blogCard);
    });

    //  Full card should be clickable
    blogCards.querySelectorAll('.card-item').forEach((card) => {
      card.addEventListener('click', () => {
        const alink = card.getElementsByClassName('blog-link');
        document.location.href = alink[0].href;
      });
    });

    // Load More button
    loadMoreElement = createTag('div', { class: 'load-more' });
    if (blogList.length > (NUM_CARDS_SHOWN_AT_A_TIME + 1)) {
      loadMoreElement.innerHTML = `Load more (${(blogList.length - (NUM_CARDS_SHOWN_AT_A_TIME + 1))})`;
    } else {
      loadMoreElement.innerHTML = 'Load more (0)';
      loadMoreElement.setAttribute('aria-hidden', 'true');
    }
    loadMoreElement.addEventListener('click', () => {
      loadMoreCards();
    });
    blogContent.append(await createFilters(categoriesList, topics, audiences, contentTypes, MODE));
    blogContent.append(selectedFilters);
    blogContent.append(blogCards);
    blogContent.append(loadMoreElement);
    block.append(blogContent);
    loadPersistedValues();
  } else {
    block.remove();
  }
}
