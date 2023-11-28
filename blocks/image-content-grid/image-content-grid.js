/* eslint-disable max-len */
export default async function decorate(block) {
  // Remove first level of nesting
  const childDivs = block.querySelectorAll('.image-content-grid > div');

  childDivs.forEach((childDiv) => {
    while (childDiv.firstChild) {
      block.appendChild(childDiv.firstChild);
    }
    childDiv.remove();
  });

  // Function to find the ancestor with the class .image-content-grid-container
  function findImageContentGridContainer(element) {
    let parent = element.parentElement;

    while (parent) {
      if (parent.classList.contains('image-content-grid-container')) {
        return parent; // Return the element with the desired class
      }
      parent = parent.parentElement; // Move up to the next parent element
    }

    return null; // Return null if the ancestor isn't found
  }

  const imageContentGridContainer = findImageContentGridContainer(block);

  // Create a new div element
  const newWrapper = document.createElement('div');
  newWrapper.classList.add('main-image-content-grid-wrapper');

  // Iterate through the existing children and move them into the new div
  while (imageContentGridContainer.firstChild) {
    newWrapper.appendChild(imageContentGridContainer.firstChild);
  }

  // Append the new div back to the solution-list-container
  imageContentGridContainer.appendChild(newWrapper);

  // Get the parent element with class "default-content-wrapper"
  const defaultContentWrapper = imageContentGridContainer.querySelector('.default-content-wrapper');

  // Get the first p element among all p elements inside the default content wrapper
  const firstPTag = defaultContentWrapper.querySelector('p');

  // Get the h2 tag from default content wrapper
  const heading = defaultContentWrapper.querySelector('h2');

  // Select the image-content-grid-wrapper element
  const imageContentGridWrapper = imageContentGridContainer.querySelector('.image-content-grid-wrapper');
  imageContentGridWrapper.insertBefore(heading, imageContentGridWrapper.firstChild);
  imageContentGridWrapper.insertBefore(firstPTag, imageContentGridWrapper.firstChild);
}
