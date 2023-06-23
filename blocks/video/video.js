import { createTag } from '../../scripts/scripts.js';

const selectors = Object.freeze({
  videoModal: '.video-modal',
  videoContent: '.video-modal-content',
});

const pendingPlayers = [];

/**
 * Keep track of all the YouTube players for each video on the page
 */
const playerMap = {};

const videoTypeMap = Object.freeze({
  youtube: [/youtube\.com/, /youtu\.be/],
  external: [/vimeo\.com/],
});

/**
 * Determine the type of video from its href.
 * @param href
 * @return {undefined|youtube|external}
 */
const getVideoType = (href) => {
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

const getYouTubePlayer = (element) => {
  if (!element) {
    return undefined;
  }
  return playerMap[element.dataset.ytid];
};

/**
 * Toggle video overlay modal between open and closed.
 * When the overlay is opened the video will start playing.
 * When the overlay is closed the video will be paused.
 * @param block Block containing a video modal
 */
const toggleVideoOverlay = (block) => {
  const modal = block.querySelector(selectors.videoModal);
  const videoContent = modal.querySelector(selectors.videoContent);
  const ytPlayer = getYouTubePlayer(videoContent);
  if (modal?.classList.contains('open')) {
    modal.classList.remove('open');
    if (ytPlayer) {
      ytPlayer.pauseVideo();
    } else {
      modal.querySelector('video')?.pause();
    }
  } else {
    modal.classList.add('open');
    if (ytPlayer) {
      ytPlayer.playVideo();
    } else {
      modal.querySelector('video')?.play();
    }
  }
};

/**
 * Decorate the video link as a play button.
 * @param link Existing video link
 * @param label Label for the button
 * @return {HTMLElement} The new play button
 */
const decorateVideoLink = (link, label = 'Play') => {
  let playBtn = link;
  if (getVideoType(link.href) !== 'external') {
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
 * Create a new YT Player and store the result of its player ready event.
 * @param element iFrame element YouTube player will be attached to.
 * @param videoId The YouTube video id
 */
const loadYouTubePlayer = (element, videoId) => {
  const onPlayerReady = (event) => {
    playerMap[videoId] = event.target;
  };
  // we have to create a new YT Player but then need to wait for its onReady event
  // before assigning it to the player map
  // eslint-disable-next-line no-new
  new window.YT.Player(element, {
    videoId,
    events: {
      onReady: onPlayerReady,
    },
  });
};

/**
 * Display video within a modal overlay. Video can be served directly or via YouTube.
 * @param href
 * @return {HTMLElement}
 */
const buildVideoModal = (href) => {
  const videoModal = createTag('div', { class: 'video-modal', 'aria-modal': 'true', role: 'dialog' });
  const videoOverlay = createTag('div', { class: 'video-modal-overlay' });
  const videoContainer = createTag('div', { class: 'video-modal-container' });

  const videoHeader = createTag('div', { class: 'video-modal-header' });
  const videoClose = createTag('button', { class: 'video-modal-close', 'aria-label': 'close' });
  videoHeader.appendChild(videoClose);
  videoContainer.appendChild(videoHeader);

  const videoContent = createTag('div', { class: 'video-modal-content' });
  if (getVideoType(href) === 'youtube') {
    // Create a YouTube compatible iFrame
    const videoId = getYouTubeId(href);
    videoContent.dataset.ytid = videoId;
    videoContent.innerHTML = `<div id="ytFrame-${videoId}"></div>`;
    if (!window.YT) {
      pendingPlayers.push({ id: videoId, element: videoContent.firstElementChild });
    } else {
      loadYouTubePlayer(videoContent.firstElementChild, videoId);
    }
    if (!window.onYouTubeIframeAPIReady) {
      // onYouTubeIframeAPIReady will load the video after the script is loaded
      window.onYouTubeIframeAPIReady = () => {
        while (pendingPlayers.length) {
          const { id, element } = pendingPlayers.pop();
          loadYouTubePlayer(element, id);
        }
      };
    }
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
    pictureContainer.appendChild(picture);
  }

  // decorate video link
  const videoLink = block.querySelector('a');
  let videoHref;
  if (videoLink) {
    videoHref = videoLink.href;

    const playButton = decorateVideoLink(videoLink, 'Play');

    if (getVideoType(videoHref) !== 'external') {
      const videoModal = buildVideoModal(videoHref);
      const videoClose = videoModal.querySelector('button.video-modal-close');
      videoClose.addEventListener('click', () => toggleVideoOverlay(block));
      block.append(videoModal);

      // Display video overlay when play button is pressed
      playButton.addEventListener('click', () => toggleVideoOverlay(block, videoHref));
    }
  }

  // decorate video title that's placed below the image
  const secondRow = block.querySelector('div:nth-of-type(2)');
  if (secondRow) {
    const videoTitleElement = secondRow.querySelector('div');

    if (videoTitleElement) {
      const videoTitleText = videoTitleElement.textContent;
      const paragraphElement = document.createElement('p');
      paragraphElement.textContent = videoTitleText;
      videoTitleElement.innerHTML = '';
      videoTitleElement.appendChild(paragraphElement);

      videoTitleElement.classList.add('video-title');
    }
  }
}
