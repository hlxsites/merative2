import { createTag } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Fetch the iframe link
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : '';

  // Create the iframe tag
  const iframe = createTag('iframe', { class: 'iframe-window', id: 'navattic-iframe' });
  iframe.src = path;

  // Set the height and width
  iframe.width = '100%';
  iframe.height = 1200;

  // Remove the elements inside iframe block
  block.innerHTML = '';

  // Append iframe to block
  block.appendChild(iframe);
}
