import { createTag } from '../../scripts/scripts.js';

export default function decorate(block) {
  const podcastContainer = createTag('div', { class: 'podcast-container' });
  podcastContainer.setAttribute('id', 'podcast-container-id');
  const podcastIframe = createTag('iframe', { class: 'podcast-iframe' });
  const podcastIframeUrl = block.querySelector('a').href;
  podcastIframe.setAttribute('src', podcastIframeUrl);
  podcastIframe.setAttribute('scrolling', 'no');
  podcastContainer.append(podcastIframe);
  block.innerHTML = podcastContainer.outerHTML;
}
