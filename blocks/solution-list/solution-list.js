export default async function decorate(block) {
  // Remove first level of nesting
  const childDivs = block.querySelectorAll('.solution-list > div');

  childDivs.forEach((childDiv) => {
    while (childDiv.firstChild) {
      block.appendChild(childDiv.firstChild);
    }
    childDiv.remove();
  });
}
