export default function decorate(block) {
  // Get the block name from the data attribute
  const blockName = block.getAttribute('data-block-name');

  if (!blockName) {
    return;
  }

  // Define class names for reuse
  const innerClassName = `${blockName}__inner`;
  const colClassName = `${blockName}__col`;
  const eyebrowClassName = `${blockName}__eyebrow`;

  // Loop through each child element of the block
  [...block.children].forEach((element) => {
    // Add the inner class to the element
    element.classList.add(innerClassName);

    // Find all div elements within the inner content
    const innerElements = element.querySelectorAll(`.${innerClassName} div`);

    let counter = 1;
    innerElements.forEach((divElement) => {
      // Add column class and numbered class to each div
      const newColClass = `${colClassName}-${counter}`;
      divElement.classList.add(colClassName, newColClass);
      counter += 1;

      // Find the h2 element inside the div
      const h2Element = divElement.querySelector('h2');

      if (h2Element) {
        // Find the previous sibling of h2 element
        const previousElement = h2Element.previousElementSibling;

        // Add eyebrow class to preceding paragraph if it exists
        if (previousElement && previousElement.tagName.toLowerCase() === 'p') {
          previousElement.classList.add(eyebrowClassName);
        }
      } else if (innerElements.length > 0) {
        const firstDivElement = innerElements[0];

        // Check if the firstDivElement doesn't contain an h2 element
        if (!firstDivElement.querySelector('h2')) {
          // Create a new paragraph for eyebrow content
          const contentIntroEyebrow = document.createElement('p');
          contentIntroEyebrow.classList.add(eyebrowClassName);
          contentIntroEyebrow.textContent = firstDivElement.textContent;
          firstDivElement.textContent = '';
          firstDivElement.appendChild(contentIntroEyebrow);
        }
      }
    });
  });
}
