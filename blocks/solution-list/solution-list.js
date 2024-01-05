export default async function decorate(block) {
  // Remove first level of nesting
  const childDivs = block.querySelectorAll('.solution-list > div');

  childDivs.forEach((childDiv) => {
    while (childDiv.firstChild) {
      block.appendChild(childDiv.firstChild);
    }
    childDiv.remove();
  });

  // Select the solution-list-container element
  const solutionListContainer = document.querySelector('.solution-list-container');

  // Create a new div element
  const newWrapper = document.createElement('div');
  newWrapper.classList.add('solution-list-content-wrapper');

  // Iterate through the existing children and move them into the new div
  while (solutionListContainer.firstChild) {
    newWrapper.appendChild(solutionListContainer.firstChild);
  }

  // Append the new div back to the solution-list-container
  solutionListContainer.appendChild(newWrapper);
}
