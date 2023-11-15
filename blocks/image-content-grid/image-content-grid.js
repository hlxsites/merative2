export default async function decorate(block) {
  // Remove first level of nesting
  const childDivs = block.querySelectorAll('.image-content-grid > div');

  childDivs.forEach((childDiv) => {
    while (childDiv.firstChild) {
      block.appendChild(childDiv.firstChild);
    }
    childDiv.remove();
  });

  // Select the image-content-grid-container element
  const imageContentGridContainer = document.querySelector('.image-content-grid-container');

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
  const defaultContentWrapper = document.querySelector('.default-content-wrapper');

  // Get the first p element among all p elements inside the default content wrapper
  const firstPTag = defaultContentWrapper.querySelector('p');

  // Get the h2 tag from default content wrapper
  const heading = defaultContentWrapper.querySelector('h2');

  // Select the image-content-grid-wrapper element
  const imageContentGridWrapper = document.querySelector('.image-content-grid-wrapper');
  imageContentGridWrapper.insertBefore(heading, imageContentGridWrapper.firstChild);
  imageContentGridWrapper.insertBefore(firstPTag, imageContentGridWrapper.firstChild);
}
