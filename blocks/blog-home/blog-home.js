import {
  getAllBlogs, createCard, getBlogCategoryPages,
  createTag, sortArrayOfObjects, removeDuplicateEnteries,
} from '../../scripts/scripts.js';

const NUM_CARDS_SHOWN_AT_A_TIME = 6;
let loadMoreElement;
const MODE = 'blog-home';

// Function to update the query parameter with the current state of global object.
function updateQueryParameter() {
  const params = new URLSearchParams();

  // Convert global object to a query parameter string
  // eslint-disable-next-line no-restricted-syntax
  for (const group in window.queryParam) {
    if (Object.prototype.hasOwnProperty.call(window.queryParam, group)) {
      const values = window.queryParam[group];
      values.forEach((value) => {
        params.append(group, value);
      });
    }
  }

  // Update the browsers history with new URL
  if (params.toString()) {
    window.history.replaceState(null, '', `?${params.toString()}`);
  } else {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

function pushValueToQueryParameter(group, value) {
  if (!window.queryParam) {
    window.queryParam = {};
  }
  if (Object.prototype?.hasOwnProperty?.call((window.queryParam || {}), group)) {
    window.queryParam[group].push(value);
  } else {
    window.queryParam[group] = [value];
  }
  updateQueryParameter();
}

function popValueFromQueryParameter(group, value) {
  if (Object.prototype?.hasOwnProperty?.call((window.queryParam || {}), group)) {
    const index = window.queryParam[group].indexOf(value);
    if (index !== -1) {
      window.queryParam[group].splice(index, 1);
    }
  }
  updateQueryParameter();
}

function clearAllQueryParam() {
  // Clear the global object
  window.queryParam = {};

  // Clear all the query parameter from the URL
  window.history.replaceState(null, '', window.location.pathname);
}

export function loadMoreCards(num) {
  if (!loadMoreElement) {
    loadMoreElement = document.querySelector('.load-more');
  }
  const numCards = num !== undefined ? num : NUM_CARDS_SHOWN_AT_A_TIME;
  // Get cards that are not hidden and not active to load them
  const activeCards = document.querySelectorAll('.card-item:not([aria-hidden="true"]):not([card-active="true"])');
  if (activeCards) {
    activeCards.forEach((activeCard, i) => {
      if (i < numCards) activeCard.setAttribute('card-active', 'true');
    });
    if (activeCards.length > numCards) {
      if (loadMoreElement.hasAttribute('aria-hidden')) loadMoreElement.removeAttribute('aria-hidden');
      loadMoreElement.innerHTML = `Load more (${(activeCards.length - numCards)})`;
    } else {
      loadMoreElement.innerHTML = 'Load more (0)';
      loadMoreElement.setAttribute('aria-hidden', 'true');
    }
  } else {
    loadMoreElement.innerHTML = 'Load more (0)';
    loadMoreElement.setAttribute('aria-hidden', 'true');
  }
}

function deselectAllCheckboxes() {
  // Deselect val from the checkbox list if it is selected
  const checkboxes = document.querySelectorAll('input[type=checkbox][name=blogFilters]');
  if (checkboxes.length) {
    const selectedCheckboxes = Array.from(checkboxes).filter((i) => i.checked);
    if (selectedCheckboxes.length) {
      selectedCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
    }
  }
}

function toggleBodyOverflow(val) {
  const body = document.querySelector('body');
  if (val) {
    body.setAttribute('filters-open', val);
  } else {
    const filtersOpen = body.getAttribute('filters-open') === 'true';
    body.setAttribute('filters-open', filtersOpen ? 'false' : 'true');
  }
}

function updateFiltersCount(count, mode) {
  // update the number of checked filters to show in mobile and tablet views
  const mobileFiltersCount = document.querySelector(`.${mode} .filters > .filters-header > h2`);
  mobileFiltersCount.innerHTML = count !== null && count !== 0 ? `Filters (${count})` : 'Filters';
}

function clearFilters(mode) {
  // get's called when nothing is selected. every card shows
  const hiddenCards = document.querySelectorAll('.card-item');
  hiddenCards.forEach((card) => {
    card.removeAttribute('aria-hidden');
    card.setAttribute('card-active', 'false');
  });

  // clear our selected filters on the top
  const selectedFilters = document.querySelector(`.${mode} .selected-filters`);
  const selectedFiltersList = selectedFilters.querySelector('.selected-filters-list');
  selectedFiltersList.textContent = '';
  const selectedFiltersTitle = selectedFilters.querySelector('.selected-filters-title');
  selectedFiltersTitle.textContent = '';
  const clearAllFilters = document.querySelector('.clear-all-filters');
  clearAllFilters.textContent = '';

  if (selectedFiltersList.classList.contains('active')) {
    selectedFiltersList.classList.remove('active');
  }

  updateFiltersCount(null, mode);
  loadMoreCards(7);
  if (mode !== MODE) {
    clearAllQueryParam();
  }
}

async function createCheckboxList(label, group) {
  const div = document.createElement('div');
  const inputEl = createTag('input', {
    type: 'checkbox',
    name: 'blogFilters',
    id: label,
    value: label,
    'data-group': group,
  });
  const labelEl = createTag('label', { for: label });
  labelEl.append(label);
  div.append(inputEl);
  div.append(labelEl);
  return (div);
}

function uncheckCheckbox(val, mode) {
  // Deselect val from the checkbox list if it is selected
  const checkboxes = document.querySelectorAll('input[type=checkbox][name=blogFilters]');
  if (checkboxes.length) {
    const selectedCheckboxes = Array.from(checkboxes).filter((i) => i.checked);
    if (selectedCheckboxes.length) {
      selectedCheckboxes.forEach((checkbox) => {
        if ((checkbox.value === val) && (checkbox.checked === true)) {
          checkbox.checked = false;
          // update the cards to reflect the deselection
          // eslint-disable-next-line no-use-before-define
          refreshCards(mode);
        }
      });
    }
  }
}

export function refreshCards(mode) {
  let hits = 0;
  const checkboxes = document.querySelectorAll('input[type=checkbox][name=blogFilters]');
  // Convert checkboxes to an array to use filter and map.
  // Use Array.filter to remove unchecked checkboxes.
  // Use Array.map to extract only the checkbox values from the array of objects.
  const checkedList = Array.from(checkboxes).filter((i) => i.checked).map((i) => ({
    value: i.value, group: i.dataset.group,
  }));
  updateFiltersCount(checkedList.length, mode);
  if (checkedList.length) {
    // Set to store active cards that match the filters
    const activeCards = new Set();

    // Helper function to check if a card has a specific attribute value
    const checkCardAttribute = (card, attribute) => {
      if (card.hasAttribute(attribute)) {
        const filterGroupValues = card.getAttribute(attribute).split(',');
        const found = filterGroupValues.some(
          (checkedItem) => checkedList.find((item) => item.value && checkedItem.trim()
          && item.value.toLowerCase() === checkedItem.trim().toLowerCase()),
        );
        if (found) {
          card.removeAttribute('aria-hidden');
          card.setAttribute('card-active', 'true');
          activeCards.add(card);
        }
      }
    };

    // Get all card items
    const blogCards = document.querySelectorAll('.card-item');

    // Iterate through each card
    blogCards.forEach((card) => {
      // Hide the card by default
      card.setAttribute('aria-hidden', 'true');
      card.setAttribute('card-active', 'false');

      // Check each card attribute for matches in the checkedList
      const cardAttributes = ['topics', 'audiences'];
      cardAttributes.forEach((attribute) => checkCardAttribute(card, attribute));

      // Check 'content-types' attribute only if mode is not MODE
      const contentTypesAttr = 'content-types';
      if (mode !== MODE && card.hasAttribute(contentTypesAttr)) {
        checkCardAttribute(card, contentTypesAttr);
      }

      // Show active cards up to NUM_CARDS_SHOWN_AT_A_TIME
      if (!(card.hasAttribute('aria-hidden'))) hits += 1;
      if (hits < NUM_CARDS_SHOWN_AT_A_TIME) card.setAttribute('card-active', 'true');
    });

    if (!loadMoreElement) {
      loadMoreElement = document.querySelector('.load-more');
    }
    // update load more number
    if (hits.length > NUM_CARDS_SHOWN_AT_A_TIME) {
      if (loadMoreElement.hasAttribute('aria-hidden')) loadMoreElement.removeAttribute('aria-hidden');
      loadMoreElement.innerHTML = `Load more (${(hits.length - NUM_CARDS_SHOWN_AT_A_TIME)})`;
    } else {
      loadMoreElement.innerHTML = 'Load more (0)';
      loadMoreElement.setAttribute('aria-hidden', 'true');
    }

    // refresh selected filters at the top
    const selectedFilters = document.querySelector(mode === MODE ? '.blog-home .selected-filters' : '.thought-leadership-home .selected-filters');
    const selectedFiltersTitle = selectedFilters.querySelector('.selected-filters-title');
    selectedFiltersTitle.innerHTML = '<h4>Showing results for</h4><br />';
    const selectedFiltersList = selectedFilters.querySelector('.selected-filters-list');

    // Clear out any existing filters before showing the new ones based on filterGroup
    selectedFiltersList.textContent = '';

    // Clear out all filters
    const clearAllFilters = document.querySelector('.clear-all-filters');
    clearAllFilters.innerText = 'Clear all';
    clearAllFilters.addEventListener('click', () => {
      clearFilters(mode);
      deselectAllCheckboxes();
      clearAllFilters.innerText = '';
      if (mode !== MODE) clearAllQueryParam();
    });

    checkedList.forEach((item) => {
      const selectedValue = createTag('div', { class: 'selected-value' });
      selectedValue.append(item.value);
      selectedFiltersList.append(selectedValue);
      selectedFiltersList.classList.add('active');
      // Add another event listener for click events to remove this item and uncheck the checkbox
      selectedValue.addEventListener('click', () => {
        uncheckCheckbox(item.value, mode);
        selectedValue.innerText = '';
        popValueFromQueryParameter(item.group, item.value);
      });
    });
  } else {
    clearFilters(mode);
  }
}

async function addEventListeners(checkboxes, mode) {
  checkboxes.forEach((checkbox) => checkbox.addEventListener('change', (event) => {
    const { group } = event.target.dataset;
    const { value } = event.target;
    if (mode !== MODE) {
      if (event.target.checked) {
        pushValueToQueryParameter(group, value);
      } else {
        popValueFromQueryParameter(group, value);
      }
    }
    refreshCards(mode);
  }));
}

async function createCategories(categoriesList, mode) {
  const categoriesElement = createTag('div', { class: 'categories' });
  const catLabel = createTag('span', { class: 'category-title' });
  catLabel.append(mode !== MODE ? 'Solutions' : 'Categories');
  categoriesElement.append(catLabel);

  categoriesList.forEach((row) => {
    if (row.path !== '0' && (row.title || row['display-title'])) {
      const link = document.createElement('a');
      link.classList.add('category-link');
      link.href = row.path;
      if (window.location.pathname === row.path) {
        link.classList.add('active');
        if (row['display-title']) {
          link.innerHTML += `<h5>${row['display-title']}</h5>`;
        } else if (row.title) {
          link.innerHTML += `<h5>${row.title}</h5>`;
        }
      } else if (row['display-title']) {
        link.innerHTML += `${row['display-title']}`;
      } else if (row.title) {
        link.innerHTML += `${row.title}`;
      }
      categoriesElement.append(link);
    }
  });
  return categoriesElement;
}

export async function createFilters(categories, topics, audiences, contentTypes, mode) {
  // Create DOM elements for topics and audiences to display in the left nav
  // Root filters div
  const filters = createTag('div', {
    class: 'filters',
    role: 'button',
    'aria-expanded': 'false',
  });

  // Filters main section
  const filtersMain = createTag('div', { class: 'filters-main' });

  // Filters footer section
  const filtersFooter = createTag('div', { class: 'filters-footer' });
  const applyDiv = createTag('div', { class: 'apply' });
  applyDiv.innerHTML = 'Apply';
  const resetDiv = createTag('div', { class: 'reset' });
  resetDiv.innerHTML = 'Reset';
  filtersFooter.append(applyDiv);
  filtersFooter.append(resetDiv);

  // Filters header section
  const filtersHeader = createTag('div', { class: 'filters-header' });
  filtersHeader.innerHTML = '<h2>Filters</h2>';
  filtersHeader.addEventListener('click', () => {
    const expanded = filters.getAttribute('aria-expanded') === 'true';
    filters.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    toggleBodyOverflow();
  });
  const filtersHeaderArrow = createTag('div', { class: 'arrow' });
  filtersHeader.append(filtersHeaderArrow);

  // Add sticky Filter below header mobile/tablet
  document.addEventListener('scroll', () => {
    filters.classList.add('is-sticky');
  });

  // Add sticky shadow to header if any scroll
  filtersMain.addEventListener('scroll', () => {
    if (filtersMain.scrollTop > 0) {
      filtersHeader.classList.add('is-sticky');
    } else {
      filtersHeader.classList.remove('is-sticky');
    }
  });

  // Add Apply and Reset listeners
  applyDiv.addEventListener('click', () => {
    toggleBodyOverflow();
    filters.setAttribute('aria-expanded', 'false');
  });
  resetDiv.addEventListener('click', () => {
    // clear the filters & refresh cards, deselect any checked checkboxes,
    // close the filter modal and make sure body scroll is back to normal
    clearFilters(mode);
    deselectAllCheckboxes();
    toggleBodyOverflow('false');
    filters.setAttribute('aria-expanded', 'false');
  });

  // Adding some key press listeners as well
  // document.body.addEventListener('keyup', (e) => {
  //   const filterExpanded = filters.getAttribute('aria-expanded');
  //   if (filterExpanded === 'true') {
  //     if (e.key === 'Escape') {
  //       filters.setAttribute('aria-expanded', 'false');
  //     } else if (e.key === 'Enter') {
  //       filters.setAttribute('aria-expanded', 'false');
  //     }
  //   }
  // });

  // Audience filters
  const audiencesElement = createTag('div', {
    class: 'audiences',
    role: 'button',
    'aria-expanded': 'true',
  });
  const audienceLabel = createTag('span', { class: 'list-title' });
  audienceLabel.append('Audience');
  audiencesElement.append(audienceLabel);
  audienceLabel.addEventListener('click', () => {
    const expanded = audiencesElement.getAttribute('aria-expanded') === 'true';
    audiencesElement.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  if (audiences.size) {
    await sortArrayOfObjects(audiences, '', 'set').forEach(async (audience) => {
      audiencesElement.append(await createCheckboxList(audience, 'audience'));
    });
    filtersMain.append(audiencesElement);
  }

  if (mode !== MODE && contentTypes) {
    // Content Type filters
    const contentTypeElement = createTag('div', {
      class: 'content-types',
      role: 'button',
      'aria-expanded': 'true',
    });
    const contentTypeLabel = createTag('span', { class: 'list-title' });
    contentTypeLabel.append('Content Type');
    contentTypeElement.append(contentTypeLabel);
    contentTypeLabel.addEventListener('click', () => {
      const expanded = contentTypeElement.getAttribute('aria-expanded') === 'true';
      contentTypeElement.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    if (contentTypes.size) {
      await sortArrayOfObjects(contentTypes, '', 'set').forEach(async (contentType) => {
        contentTypeElement.append(await createCheckboxList(contentType, 'content-types'));
      });
      filtersMain.append(contentTypeElement);
    }
  }

  // Topic filters
  const topicsElement = createTag('div', {
    class: 'topics',
    role: 'button',
    'aria-expanded': 'true',
  });
  const topicLabel = createTag('span', { class: 'list-title' });
  topicLabel.append('Topics');
  topicsElement.append(topicLabel);
  topicLabel.addEventListener('click', () => {
    const expanded = topicsElement.getAttribute('aria-expanded') === 'true';
    topicsElement.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  if (topics.size) {
    await sortArrayOfObjects(topics, '', 'set').forEach(async (topic) => {
      topicsElement.append(await createCheckboxList(topic, 'topics'));
    });
    filtersMain.append(topicsElement);
  }

  // Add event listeners to all Checkboxes
  const blogFilters = filtersMain.querySelectorAll('input[type=checkbox][name=blogFilters]');
  await addEventListeners(blogFilters, mode);

  // Add Categories to filters main section
  filtersMain.prepend(await createCategories(categories, mode));

  // Create sidebar elements
  const sidebarHeadingElement = createTag('div', { class: 'sidebar-heading' });
  const sidebarLink = createTag('a', { class: 'category-link' });

  // Set sidebar title and attributes
  const isThoughtLeadership = mode !== MODE;
  const sidebarTitle = isThoughtLeadership ? 'Thought leadership' : 'Merative Blog';
  const sidebarPath = isThoughtLeadership ? '/thought-leadership' : '/blog';

  sidebarLink.href = sidebarPath;
  sidebarLink.title = sidebarTitle;

  // Check active state based on current URL
  const isBlogPage = /^\/blog$/.test(window.location.pathname);
  const isThoughtLeadershipPage = /^\/thought-leadership$/.test(window.location.pathname);

  if (isBlogPage || isThoughtLeadershipPage) {
    sidebarLink.classList.add('active');
  } else {
    sidebarLink.classList.remove('active');
  }

  // Set sidebar content
  sidebarLink.innerHTML += `<h2>${sidebarTitle}</h2>`;
  sidebarHeadingElement.append(sidebarLink);

  filtersMain.prepend(sidebarHeadingElement);
  filters.prepend(filtersHeader);
  filters.append(filtersMain);
  filters.append(filtersFooter);
  return (filters);
}

export default async function decorate(block) {
  const category = block.textContent.trim();
  block.textContent = '';
  // Make a call to get all blog details from the blog index
  const blogList = await getAllBlogs(category);
  const categoriesList = await getBlogCategoryPages();
  let topics = new Set();
  let audiences = new Set();
  if (blogList.length) {
    const blogContent = createTag('div', { class: 'blog-content' });
    // Get default content in this section and add it to blog-content
    const defaultContent = document.querySelectorAll('.blog-home-container > .default-content-wrapper');
    defaultContent.forEach((div) => blogContent.append(div));
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
      blogCards.append(blogCard);
    });

    // remove duplicate enteries
    topics = removeDuplicateEnteries(topics, 'set');
    audiences = removeDuplicateEnteries(audiences, 'set');

    // Full card should be clickable
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

    blogContent.append(await createFilters(categoriesList, topics, audiences, false, MODE));
    blogContent.append(selectedFilters);
    blogContent.append(blogCards);
    blogContent.append(loadMoreElement);
    block.append(blogContent);
  } else {
    block.remove();
  }
}
