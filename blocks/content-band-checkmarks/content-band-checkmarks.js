import { createTag } from '../../scripts/scripts.js';
import { getVideoType, buildVideoModal, toggleVideoOverlay } from '../video/video.js';

const decorateVideoLink = (link, videoType, label = 'Play') => {
  let playBtn = link;
  if (videoType !== 'external') {
    // Create a new <button> element
    playBtn = createTag(
      'button',
      { class: 'open-video', type: 'button', 'aria-label': 'Play video' },
    );
    link.parentElement.appendChild(playBtn);
    link.parentElement.removeChild(link);
  } else {
    link.setAttribute('target', '_blank');
    link.classList.add('open-video');
  }
  playBtn.innerHTML = `<span>${label}</span>`;
  return playBtn;
};

export default function decorate(block) {
  // decorate video link
  const videoLink = block.querySelector('a');
  let videoHref;
  if (videoLink) {
    videoHref = videoLink.href;
    const videoType = getVideoType(videoHref);
    const playButton = decorateVideoLink(videoLink, videoType, videoLink.textContent);
    if (videoType !== 'external') {
      const videoModal = buildVideoModal(videoHref, videoType);
      const videoClose = videoModal.querySelector('button.video-modal-close');
      videoClose.addEventListener('click', () => toggleVideoOverlay(block));
      block.append(videoModal);

      // Display video overlay when play button is pressed
      playButton.addEventListener('click', () => toggleVideoOverlay(block));
    }
  }
}
