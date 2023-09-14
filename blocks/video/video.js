import { createTag } from '../../scripts/scripts.js';

const selectors = Object.freeze({
  videoModal: '.video-modal',
  videoContent: '.video-modal-content',
});

const videoTypeMap = Object.freeze({
  youtube: [/youtube\.com/, /youtu\.be/],
  external: [/vimeo\.com/],
});

/**
 * Determine the type of video from its href.
 * @param href
 * @return {undefined|youtube|external}
 */
export const getVideoType = (href) => {
  const videoEntry = Object.entries(videoTypeMap).find(
    ([, allowedUrls]) => allowedUrls.some((urlToCompare) => urlToCompare.test(href)),
  );
  if (videoEntry) {
    return videoEntry[0];
  }
  return undefined;
};

/**
 * Extract YouTube video id from its URL.
 * @param href A valid YouTube URL
 * @return {string|null}
 */
const getYouTubeId = (href) => {
  const ytExp = /(?:[?&]v=|\/embed\/|\/1\/|\/v\/|https:\/\/(?:www\.)?youtu\.be\/)([^&\n?#]+)/;
  const match = href.match(ytExp);
  if (match && match.length > 1) {
    return match[1];
  }
  return null;
};

let player;

/**
 * Create a new YT Player and store the result of its player ready event.
 * @param element iFrame element YouTube player will be attached to.
 * @param videoId The YouTube video id
 */
const loadYouTubePlayer = (element, videoId) => {
  // The API will call this function when the video player is ready.
  const onPlayerReady = (event) => {
    event.target.playVideo();
  };

  // eslint-disable-next-line no-new
  player = new window.YT.Player(element, {
    videoId,
    playerVars: {
      start: 0, // Always start from the beginning
    },
    events: {
      onReady: onPlayerReady,
    },
  });
};

/**
 * Toggle video overlay modal between open and closed.
 * When the overlay is opened the video will start playing.
 * When the overlay is closed the video will be paused.
 * @param block Block containing a video modal
 */
export const toggleVideoOverlay = (block) => {
  const modal = block.querySelector(selectors.videoModal);
  const videoContent = modal.querySelector(selectors.videoContent);
  const videoType = videoContent.getAttribute('data-videoType');
  const videoId = videoContent.getAttribute('data-videoId');

  if (modal?.classList?.contains('open')) {
    modal.classList.remove('open');
    if (videoType === 'youtube') {
      player?.stopVideo();
      // Destroy the iframe when the video is closed.
      const iFrame = document.getElementById(`ytFrame-${videoId}`);
      if (iFrame) {
        const container = iFrame.parentElement;
        container.removeChild(iFrame);
      }
    } else {
      modal.querySelector('video')?.pause();
      modal.querySelector('video').currentTime = 0;
    }
  } else {
    modal.classList.add('open');
    if (videoType === 'youtube') {
      // Create a YouTube compatible iFrame
      videoContent.innerHTML = `<div id="ytFrame-${videoId}" data-hj-allow-iframe="true"></div>`;
      if (window.YT) {
        loadYouTubePlayer(`ytFrame-${videoId}`, videoId);
      } else {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        // eslint-disable-next-line func-names
        window.onYouTubePlayerAPIReady = function () {
          loadYouTubePlayer(`ytFrame-${videoId}`, videoId);
        };
      }
    } else {
      modal.querySelector('video')?.play();
    }
  }
};

/**
 * Decorate the video link as a play button.
 * @param link Existing video link
 * @param videoType Type of the video
 * @param label Label for the button
 * @return {HTMLElement} The new play button
 */
const decorateVideoLink = (link, videoType, label = 'Play') => {
  let playBtn = link;
  if (videoType !== 'external') {
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

/**
 * Display video within a modal overlay. Video can be served directly or via YouTube.
 * @param href
 * @return {HTMLElement}
 */
export const buildVideoModal = (href, videoType) => {
  const videoModal = createTag('div', { class: 'video-modal', 'aria-modal': 'true', role: 'dialog' });
  const videoOverlay = createTag('div', { class: 'video-modal-overlay' });
  const videoContainer = createTag('div', { class: 'video-modal-container' });

  const videoHeader = createTag('div', { class: 'video-modal-header' });
  const videoClose = createTag('button', { class: 'video-modal-close', 'aria-label': 'close' });
  videoHeader.appendChild(videoClose);
  videoContainer.appendChild(videoHeader);

  const videoContent = createTag('div', { class: 'video-modal-content' });
  if (videoType === 'youtube') {
    const videoId = getYouTubeId(href);
    videoContent.dataset.ytid = videoId;
    videoContent.setAttribute('data-videoType', 'youtube');
    videoContent.setAttribute('data-videoId', videoId);
  } else {
    videoContent.innerHTML = `<video controls playsinline loop preload="auto">
        <source src="${href}" type="video/mp4" />
        "Your browser does not support videos"
        </video>`;
  }
  videoContainer.appendChild(videoContent);

  videoModal.appendChild(videoOverlay);
  videoModal.appendChild(videoContainer);

  return videoModal;
};

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];

  if (cols.length === 1) {
    //  clean up paragraphs from single column variant
    const [firstCol] = cols;
    const paragraphs = firstCol.querySelectorAll(':scope > p');
    [...paragraphs].forEach((elem) => {
      while (elem.firstChild) {
        firstCol.insertBefore(elem.firstChild, elem);
      }
      firstCol.removeChild(elem);
    });
  }

  // decorate text container
  const heading = block.querySelector('h2');
  if (heading) {
    heading.closest('div').classList.add('video-text');
  }

  // decorate picture container
  const picture = block.querySelector('picture');
  if (picture) {
    const pictureContainer = picture.closest('div');
    pictureContainer.classList.add('video-image');
    if (pictureContainer.parentNode.childElementCount === 1) {
      pictureContainer.classList.add('single-video');
    }
    pictureContainer.appendChild(picture);
  }

  // decorate video link
  const videoLink = block.querySelector('.video-image a');
  let videoHref;
  if (videoLink) {
    videoHref = videoLink.href;
    const videoType = getVideoType(videoHref);
    const playButton = decorateVideoLink(videoLink, videoType, 'Play');
    if (videoType !== 'external') {
      const videoModal = buildVideoModal(videoHref, videoType);
      const videoClose = videoModal.querySelector('button.video-modal-close');
      videoClose.addEventListener('click', () => toggleVideoOverlay(block));
      block.append(videoModal);

      // Display video overlay when play button is pressed
      playButton.addEventListener('click', () => toggleVideoOverlay(block));
    }
  }

  // Check if the div is the first element of its parent
  const textDivElement = block.querySelector('.video-text');
  if (!textDivElement?.previousElementSibling) {
    textDivElement?.classList.add('text-left');
  }
}
