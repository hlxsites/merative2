export default function decorate(block) {
  // Get the parent div element
  const parentDiv = block.querySelector('div');

  // Get the first inner div element
  const innerDiv1 = parentDiv.querySelector('div');

  // Get the (p) and (h2)  tag
  const paragraph1 = innerDiv1.querySelector('p:first-of-type');
  const heading2 = innerDiv1.querySelector('h2');
  const paragraph2 = innerDiv1.querySelector('p:last-of-type');

  // create new divs instead of p and h2 tag

  const titleDiv = document.createElement('div');
  const contentWrapper = document.createElement('div');
  const subTitle = document.createElement('div');
  const desc = document.createElement('p');

  // Set the content of the new divs
  titleDiv.innerHTML = paragraph1.innerHTML;
  subTitle.innerHTML = heading2.innerHTML;
  desc.innerHTML = paragraph2.innerHTML;

  // adding class to divs
  titleDiv.classList.add('title');
  contentWrapper.classList.add('content-wrapper');
  subTitle.classList.add('sub-title');
  desc.classList.add('description');

  // Create a new div element
  const finalComponent = document.createElement('div');

  // Append the (p) and (h2) tag to the new div
  contentWrapper.appendChild(subTitle);
  contentWrapper.appendChild(desc);
  finalComponent.appendChild(titleDiv);
  finalComponent.appendChild(contentWrapper);

  block.innerHTML = finalComponent.innerHTML;
}
