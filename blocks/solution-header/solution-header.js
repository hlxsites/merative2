import { createTag } from '../../scripts/scripts.js';

export default function decorate(block) {
  const blockName = block.getAttribute('data-block-name');
  if (!blockName) {
    return;
  }

  [...block.children].forEach((element) => {
    element.classList.add(`${blockName}__inner`);

    // Find all the div elements within the inner content class
    const innerElements = element.querySelectorAll(`.${blockName}__inner div`);

    // Add the class to column and append a number to each of these div elements
    let counter = 1;
    innerElements.forEach((divElement) => {
      const newClass = `${blockName}__col-${counter}`;
      divElement.classList.add(`${blockName}__col`, newClass);
      counter += 1;
    });
  });

  // Add page scroll listener to know when header turns to sticky
  const header = block.parentNode;
  window.addEventListener('scroll', () => {
    const scrollAmount = window.scrollY;
    if (scrollAmount > header.offsetHeight) {
      header.classList.add('is-sticky');
    } else {
      header.classList.remove('is-sticky');
    }
  });

  // Define a function to generate and append a semantic navigation component
  function generateAnchorLinkNav() {
    const sectionsWithTitles = document.querySelectorAll('.section[data-title]');
    const navItemsContainer = document.querySelector(`.${blockName} .${blockName}__col-2`);

    // Create an unordered list for the navigation
    const navList = document.createElement('ul');
    navList.classList.add('nav-list'); // Add a class for styling or accessibility

    sectionsWithTitles.forEach((section) => {
      // Get the value of the data-title attribute
      const sectionTitle = section.getAttribute('data-title');

      // Create a list item for each section
      const listItem = document.createElement('li');
      listItem.classList.add('nav-item'); // Add a class for styling or accessibility

      // Create an anchor link element
      const anchorLink = document.createElement('a');
      anchorLink.textContent = sectionTitle;
      const achorLinkID = section.getAttribute('id');
      anchorLink.href = `#${achorLinkID}`;

      // Append the anchor link to the list item
      listItem.appendChild(anchorLink);

      // Append the list item to the navigation list
      navList.appendChild(listItem);
    });

    // Append the navigation list to the nav items container
    navItemsContainer.appendChild(navList);
  }

  // Call the function to generate and append the semantic navigation component
  generateAnchorLinkNav();

  // Define the list of navigation links
  const navigationLinks = document.querySelectorAll(`.${blockName}__col-2 ul li a`);

  // Extract section IDs from navigation links
  const sectionIds = Array.from(navigationLinks).map((link) => link.getAttribute('href').substring(1));

  // Define the Intersection Observer options
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2, // Trigger when 50% of the element is in the viewport
  };

  // Create Intersection Observer callback function
  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const targetId = entry.target.getAttribute('id');
        const correspondingLink = document.querySelector(`.${blockName}__col-2 ul li a[href="#${targetId}"]`);

        // Remove 'active' class from all links
        navigationLinks.forEach((link) => {
          link.classList.remove('active');
        });

        // Add 'active' class to the corresponding link
        correspondingLink.classList.add('active');
      }
    });
  };

  // Create Intersection Observer instance
  const observer = new IntersectionObserver(handleIntersection, observerOptions);

  // Add observer to each section
  sectionIds.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      observer.observe(section);
    }
  });

  // Smooth scroll to anchor when a navigation link is clicked
  navigationLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });

  const navbar = document.querySelector('.solution-header__col-2');
  window.addEventListener('scroll', () => {
    // Find the selected navigation item
    const selectedNavItem = navbar.querySelector('a.active');

    // Scroll to the selected navigation item if it's not fully visible
    if (selectedNavItem) {
      const navbarRect = navbar.getBoundingClientRect();
      const selectedItemRect = selectedNavItem.getBoundingClientRect();
      if (selectedItemRect.right > navbarRect.right) {
      // Scroll to the right to make the selected item fully visible
        navbar.scrollLeft += (selectedItemRect.right - navbarRect.right) + 20;
      } else if (selectedItemRect.left < navbarRect.left) {
      // Scroll to the left to make the selected item fully visible
        navbar.scrollLeft -= (navbarRect.left - selectedItemRect.left) + 20;
      }
    }
  });

  // Create new div element to inject
  const gradientLeft = createTag('div', { class: 'gradient-left' });
  const gradientRight = createTag('div', { class: 'gradient-right' });

  // Insert the new div elements before and after the target div
  navbar.insertBefore(gradientLeft, navbar.firstChild);
  navbar.appendChild(gradientRight);
}
