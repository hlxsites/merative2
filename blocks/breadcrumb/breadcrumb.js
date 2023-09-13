export default function decorate(block) {
  const blockName = block.getAttribute('data-block-name');
  if (!blockName) {
    return;
  }

  // Function to add or remove the ellipsis class based on the window size
  function toggleEllipsis(entries) {
    const firstLink = block.querySelector(`.${blockName}__inner div ul li:first-child`);
    if (entries[0].contentRect.width <= 400) {
      firstLink.classList.add(`${blockName}__ellipsis`);
    } else {
      firstLink.classList.remove(`${blockName}__ellipsis`);
    }
  }

  // Initialize ResizeObserver
  const resizeObserver = new ResizeObserver(toggleEllipsis);

  [...block.children].forEach((element) => {
    element.classList.add(`${blockName}__inner`);

    // Add the class to column and append a number to each of these div elements
    let counter = 1;
    const innerElements = element.querySelectorAll(`.${blockName}__inner div`);
    innerElements.forEach((divElement) => {
      const newClass = `${blockName}__col-${counter}`;
      divElement.classList.add(`${blockName}__col`, newClass);
      counter += 1; // Use prefix notation to increment the counter

      // Add a <span> element to the innerHTML of each linkItem (with null check)
      const linkItems = divElement.querySelectorAll('ul li a');
      if (linkItems) {
        linkItems.forEach((linkItem) => {
          const span = document.createElement('span');
          span.textContent = linkItem.textContent;
          linkItem.innerHTML = '';
          linkItem.appendChild(span);
        });
      }
    });

    // Observe changes in the size of the block element
    resizeObserver.observe(element);
  });
}
