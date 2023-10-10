import {
  decorateIcons, getIconTypebyPath, getVideoType, buildVideoModal, toggleVideoOverlay,
} from '../../scripts/lib-franklin.js';

// Function to create HTML for links with optional icons
function createLinkHtml(blockName, content, link, iconClass) {
  const iconSpan = iconClass ? `<span class="icon ${iconClass.join(' ')}"></span>` : '';
  return `<div class="${blockName}__item card"><a href="${link}">${content} ${iconSpan}</a></div>`;
}

// Main decoration function
export default async function decorate(block) {
  const blockName = block.getAttribute('data-block-name');
  if (!blockName) {
    return;
  }

  // Function to set the same height for card titles
  function setCardTitleHeight() {
    const cardTitles = block.querySelectorAll('h3');
    let maxHeight = 0;

    // Find the maximum height among card titles
    cardTitles.forEach((cardTitle) => {
      cardTitle.style.height = 'auto'; // Reset height for accurate measurement
      const titleHeight = cardTitle.getBoundingClientRect().height;
      if (titleHeight > maxHeight) {
        maxHeight = titleHeight;
      }
    });

    // Set all card titles to the same maximum height
    cardTitles.forEach((cardTitle) => {
      cardTitle.style.height = `${maxHeight}px`;
    });
  }

  // Create a ResizeObserver to monitor block size changes
  const resizeObserver = new ResizeObserver(setCardTitleHeight);
  resizeObserver.observe(block);

  let html = '';

  // Loop through child elements and generate HTML
  [...block.children].forEach((element) => {
    const content = element.children[0].innerHTML;
    const lastColumn = element.children[element.children.length - 1];
    const link = lastColumn.querySelector('a').getAttribute('href');

    const iconClasses = getIconTypebyPath(link);
    const linkHtml = createLinkHtml(blockName, content, link, iconClasses);

    html += linkHtml;
  });

  // Set the modified HTML content
  block.innerHTML = html;

  // Select all anchor elements within the 'block' container
  block.querySelectorAll('a').forEach((a) => {
    // Determine the type of video based on the href attribute
    const videoType = getVideoType(a.href);

    // Check if the video type is 'youtube' or 'mp4'
    if (['youtube', 'mp4'].includes(videoType)) {
      // Build a modal for the video
      const videoModal = buildVideoModal(a.href, videoType);

      const videoClose = videoModal.querySelector('button.video-modal-close');

      // Add a click event listener to close the video modal when the close button is clicked
      videoClose.addEventListener('click', () => toggleVideoOverlay(videoModal));

      a.addEventListener('click', (e) => {
        e.preventDefault();

        // Toggle the video overlay when the anchor element is clicked
        toggleVideoOverlay(videoModal);
      });

      // Append the video modal to the 'block' container
      block.appendChild(videoModal);
    }
  });

  // Replace icons with inline SVG
  decorateIcons(block);

  // Set initial card title heights
  setCardTitleHeight();
}
