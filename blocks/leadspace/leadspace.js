/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
import { getMetadata, decorateButtons, decorateIcons } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

/**
 * Leadspace block
 *
 */
const selectors = Object.freeze({
  videoBlock: '.leadspace.video',
  videoWrapper: '.video-wrapper',
  playButton: '.video-control.play button',
  pauseButton: '.video-control.pause button',
  openButton: 'button.open-video',
  videoModal: '.leadspace.video .video-modal',
  eventItem: '.leadspace.event p:not(.button-container)',
});

const toggleVideoOverlay = () => {
  const modal = document.querySelector(selectors.videoModal);
  if (modal?.classList.contains('open')) {
    modal.classList.remove('open');
    modal.querySelector('video').pause();
  } else {
    modal.classList.add('open');
    modal.querySelector('video').play();
  }
};

const togglePreviewVideo = (evt) => {
  const target = evt.currentTarget;
  const action = target.classList.contains('play') ? 'play' : 'pause';
  const block = target.closest(selectors.videoBlock);
  if (action === 'play') {
    // play preview video
    block.querySelector(`${selectors.videoWrapper} video`).play();
    block.querySelector(selectors.playButton).style.visibility = 'hidden';
    block.querySelector(selectors.pauseButton).style.visibility = 'visible';
  } else {
    // pause preview video
    block.querySelector(`${selectors.videoWrapper} video`).pause();
    block.querySelector(selectors.playButton).style.visibility = 'visible';
    block.querySelector(selectors.pauseButton).style.visibility = 'hidden';
  }
};

const buildOpenVideoButton = (label, duration) => {
  const watchBtn = createTag('button', { class: 'open-video', type: 'button', 'aria-label': 'Play video' });
  watchBtn.innerHTML = `<span><span>${label}</span><span>${duration}</span></span><span></span>`;
  const btnContent = watchBtn.querySelector('span:nth-child(1)');
  btnContent.classList.add('video-button-content');
  btnContent.querySelector('span:nth-child(1)').classList.add('video-button-title');
  btnContent.querySelector('span:nth-child(2)').classList.add('video-button-duration');
  watchBtn.querySelector(':scope > span:nth-child(2)').classList.add('video-button-icon');
  return watchBtn;
};

const buildVideoControlButton = (type, visible = true) => {
  const controlBtn = createTag('div', { class: `video-control ${type}` });
  controlBtn.innerHTML = '<button type="button"><span aria-hidden="true"></button>';
  const btn = controlBtn.querySelector('button');
  btn.setAttribute('aria-label', `${type} video`);
  btn.style.visibility = visible ? 'visible' : 'hidden';
  return controlBtn;
};

const buildVideoModal = (href) => {
  const videoModal = createTag('div', { class: 'video-modal', 'aria-modal': 'true', role: 'dialog' });
  const videoOverlay = createTag('div', { class: 'video-modal-overlay' });
  const videoContainer = createTag('div', { class: 'video-modal-container' });

  const videoHeader = createTag('div', { class: 'video-modal-header' });
  const videoClose = createTag('button', { class: 'video-modal-close', 'aria-label': 'close' });

  videoClose.addEventListener('click', toggleVideoOverlay);

  const videoContent = createTag('div', { class: 'video-modal-content' });
  videoContent.innerHTML = `<video controls playsinline loop preload="auto">
        <source src="${href}" type="video/mp4" />
        "Your browser does not support videos"
        </video>`;

  videoHeader.appendChild(videoClose);
  videoContainer.appendChild(videoHeader);
  videoContainer.appendChild(videoContent);
  videoModal.appendChild(videoOverlay);
  videoModal.appendChild(videoContainer);

  return videoModal;
};

export default function decorate(block) {
  const col1 = block.firstElementChild?.children.item(0);
  const col2 = block.firstElementChild?.children.item(1);
  const leadspaceType = block.classList.contains('video') ? 'video' : 'image';

  // decorate video
  if (leadspaceType === 'video') {
    // decorate block for displaying a video
    let videoHref;
    if (col1) {
      // watch video button
      const videoLink = col1.querySelector('p > strong > a');
      const videoDuration = col1.querySelector('p:last-of-type');
      const button = buildOpenVideoButton(videoLink.textContent, videoDuration.textContent);
      videoHref = videoLink.href;

      // Display video overlay
      button.addEventListener('click', () => {
        // add video overlay
        const modal = block.querySelector(selectors.videoModal);
        if (!modal && videoHref) {
          const videoModal = buildVideoModal(videoHref);
          block.append(videoModal);
        }
        toggleVideoOverlay();
      });

      col1.removeChild(videoLink.closest('p'));
      col1.removeChild(videoDuration);
      col1.appendChild(button);
    }

    if (col2) {
      // convert preview link into a video
      const previewLink = col2.querySelector('a');
      const video = createTag('div', { class: 'video-wrapper' });
      video.innerHTML = `<video autoplay muted playsinline loop preload="auto">
        <source src="${previewLink.href}" type="video/mp4">
        </video>`;
      col2.replaceChild(video, previewLink);

      // Add preview control buttons
      const playButton = buildVideoControlButton('play', false);
      const pauseButton = buildVideoControlButton('pause');

      playButton.addEventListener('click', togglePreviewVideo);
      pauseButton.addEventListener('click', togglePreviewVideo);

      col2.appendChild(playButton);
      col2.appendChild(pauseButton);
    }

    // add scroll border decoration
    const scrollBorder = createTag('div', { class: 'scroll-border-wrapper' });
    scrollBorder.innerHTML = `<span class="scroll-border-line"></span>
    <span class="scroll-border-text">SCROLL <svg id="scroll-to-next" onClick="scrollToNextSection()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 3.125V16.875" stroke="#9900FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4.375 11.25L10 16.875L15.625 11.25" stroke="#9900FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg></span>`;

    block.append(scrollBorder);
    const scrollToNext = scrollBorder.querySelector('#scroll-to-next');
    scrollToNext.addEventListener('click', () => {
      const sections = document.querySelectorAll('.section');
      let nextSection = null;

      for (let i = 0; i < sections.length; i++) {
        const sectionTop = sections[i].offsetTop;

        if (sectionTop > 1000) {
          nextSection = sections[i];
          break; // Exit the loop once the next section is found
        }
      }
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return;
  }

  // Default (aka non-video) processing

  if (col1) {
    // group events
    const eventItems = [...col1.querySelectorAll(`${selectors.eventItem} > em`)] || [];
    const eventGroup = createTag('div', { class: 'event-group' });
    const imgElement = block.querySelector('img');
    const imageAltText = col1.querySelector('h1')?.textContent || col1.querySelector('p')?.textContent || 'leadspace-preview-image';
    if (imgElement) {
      imgElement.setAttribute('alt', imageAltText);
    }

    eventItems.forEach((item, index) => {
      item.parentElement?.classList.add('event-item', index === 0 ? 'location' : 'date');
      eventGroup.appendChild(item.parentElement);
    });

    if (eventGroup.children.length) {
      col1.append(eventGroup);
    }

    // group buttons
    const buttonGroup = createTag('div', { class: 'button-group' });
    const buttons = [...col1.querySelectorAll('.button-container')] || [];

    buttons.forEach((button) => {
      const isPrimary = button.querySelector('strong');
      const isSecondary = button.querySelector('em');
      // position button
      if (isPrimary) {
        button.style.order = '1';
      } else if (isSecondary) {
        button.style.order = '2';
      } else {
        button.style.order = '3';
      }
      buttonGroup.append(button);
    });

    if (buttonGroup.children.length) {
      col1.append(buttonGroup);
    }

    // only for Document pages
    if (getMetadata('template') === 'Document') {
      // get readtime from page metadata
      const readtimeMeta = getMetadata('readtime');
      // get audience and topic tags from page metadata
      let tags = [];
      const documenttags = getMetadata('documenttags');
      if (documenttags) {
        tags = documenttags.split(',');
      }

      // const audience = getMetadata('audience');
      // if (audience) {
      //   const audiences = audience.split(',');
      //   tags = tags.concat(audiences);
      // }
      // const topic = getMetadata('topic');
      // if (topic) {
      //   const topics = topic.split(',');
      //   tags = tags.concat(topics);
      // }

      if (tags.length >= 0) {
        const docTagContainer = createTag('div', { class: 'document-tag-container' });
        tags.forEach((tag) => {
          if (tag) {
            const docTag = createTag('span', { class: 'document-tag' });
            docTag.textContent = tag.trim();
            docTagContainer.append(docTag);
          }
        });
        const readtime = createTag('span', { class: 'readtime' });
        readtime.textContent = readtimeMeta.trim();
        docTagContainer.prepend(readtime);
        block.prepend(docTagContainer);
      }

      // Get the document URL and downloadPDF value using getMetadata
      const docUrl = getMetadata('document-link');
      const downloadPDF = getMetadata('download-pdf');

      // Check if docUrl exists and downloadPDF is not 'false'
      if (docUrl && downloadPDF !== 'false') {
        // Create the download link elements
        const downloadLinkContainer = createTag('p', { class: 'button-container' });
        const downloadLink = createTag('a', { class: 'button tertiary has-icon' });

        // Set the link attributes
        downloadLink.setAttribute('href', docUrl);
        downloadLink.setAttribute('target', '_blank');
        downloadLink.textContent = 'Download PDF';

        // Append the link to the container and the container to the block
        downloadLinkContainer.append(downloadLink);
        block.append(downloadLinkContainer);

        // Decorate the buttons and icons
        decorateButtons(block, { decorateClasses: false, excludeIcons: [] });
        decorateIcons(block);
      }
    }
  }
}
