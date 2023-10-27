/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 */
export function sampleRUM(checkpoint, data = {}) {
  sampleRUM.defer = sampleRUM.defer || [];
  const defer = (fnname) => {
    sampleRUM[fnname] = sampleRUM[fnname]
      || ((...args) => sampleRUM.defer.push({ fnname, args }));
  };
  sampleRUM.drain = sampleRUM.drain
    || ((dfnname, fn) => {
      sampleRUM[dfnname] = fn;
      sampleRUM.defer
        .filter(({ fnname }) => dfnname === fnname)
        .forEach(({ fnname, args }) => sampleRUM[fnname](...args));
    });
  sampleRUM.on = (chkpnt, fn) => { sampleRUM.cases[chkpnt] = fn; };
  defer('observe');
  defer('cwv');
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
      // eslint-disable-next-line no-bitwise
      const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
      const id = `${hashCode(window.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
      const random = Math.random();
      const isSelected = (random * weight < 1);
      // eslint-disable-next-line object-curly-newline
      window.hlx.rum = { weight, id, random, isSelected, sampleRUM };
    }
    const { weight, id } = window.hlx.rum;
    if (window.hlx && window.hlx.rum && window.hlx.rum.isSelected) {
      const sendPing = (pdata = data) => {
        // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
        const body = JSON.stringify({ weight, id, referer: window.location.href, generation: window.hlx.RUM_GENERATION, checkpoint, ...data });
        const url = `https://rum.hlx.page/.rum/${weight}`;
        // eslint-disable-next-line no-unused-expressions
        navigator.sendBeacon(url, body);
        // eslint-disable-next-line no-console
        console.debug(`ping:${checkpoint}`, pdata);
      };
      sampleRUM.cases = sampleRUM.cases || {
        cwv: () => sampleRUM.cwv(data) || true,
        lazy: () => {
          // use classic script to avoid CORS issues
          const script = document.createElement('script');
          script.src = 'https://rum.hlx.page/.rum/@adobe/helix-rum-enhancer@^1/src/index.js';
          document.head.appendChild(script);
          return true;
        },
      };
      sendPing(data);
      if (sampleRUM.cases[checkpoint]) { sampleRUM.cases[checkpoint](); }
    }
  } catch (error) {
    // something went wrong
  }
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
export function loadCSS(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
  }
}

/**
 * Retrieves the content of metadata tags.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value(s)
 */
export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = [...document.head.querySelectorAll(`meta[${attr}="${name}"]`)].map((m) => m.content).join(', ');
  return meta || '';
}

/**
 * Sanitizes a name for use as class name.
 * @param {string} name The unsanitized name
 * @returns {string} The class name
 */
export function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

/*
 * Sanitizes a name for use as a js property name.
 * @param {string} name The unsanitized name
 * @returns {string} The camelCased name
 */
export function toCamelCase(name) {
  return toClassName(name).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Convert text to sentence case.
 * @param {string} text property
 * @returns {string} The sentence case value(s)
 */
export function toSentenceCase(text) {
  // Split the text by hyphens or other non-word characters
  const words = text.split(/[-\s]+/);

  // Capitalize the first letter of each word and convert the rest to lowercase
  // eslint-disable-next-line max-len
  const sentenceCaseWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  // Join the words back together with spaces
  return sentenceCaseWords.join(' ');
}

/**
 * Replace icons with inline SVG and prefix with codeBasePath.
 * @param {Element} element
 */
export function decorateIcons(element = document) {
  element.querySelectorAll('span.icon').forEach(async (span) => {
    if (span.classList.length < 2 || !span.classList[1].startsWith('icon-')) {
      return;
    }
    const icon = span.classList[1].substring(5);
    // eslint-disable-next-line no-use-before-define
    const resp = await fetch(`${window.hlx.codeBasePath}/icons/${icon}.svg`);
    if (resp.ok) {
      const iconHTML = await resp.text();
      if (iconHTML.match(/<style/i)) {
        const img = document.createElement('img');
        img.src = `data:image/svg+xml,${encodeURIComponent(iconHTML)}`;
        span.appendChild(img);
      } else {
        span.innerHTML = iconHTML;
      }
    }
  });
}

/**
 * Gets placeholders object
 * @param {string} prefix
 */
export async function fetchPlaceholders(prefix = 'default') {
  window.placeholders = window.placeholders || {};
  const loaded = window.placeholders[`${prefix}-loaded`];
  if (!loaded) {
    window.placeholders[`${prefix}-loaded`] = new Promise((resolve, reject) => {
      try {
        fetch(`${prefix === 'default' ? '' : prefix}/placeholders.json`)
          .then((resp) => resp.json())
          .then((json) => {
            const placeholders = {};
            json.data.forEach((placeholder) => {
              placeholders[toCamelCase(placeholder.Key)] = placeholder.Text;
            });
            window.placeholders[prefix] = placeholders;
            resolve();
          });
      } catch (error) {
        // error loading placeholders
        window.placeholders[prefix] = {};
        reject();
      }
    });
  }
  await window.placeholders[`${prefix}-loaded`];
  return window.placeholders[prefix];
}

/**
 * Decorates a block.
 * @param {Element} block The block element
 */
export function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName) {
    block.classList.add('block');
    block.setAttribute('data-block-name', shortBlockName);
    block.setAttribute('data-block-status', 'initialized');
    const blockWrapper = block.parentElement;
    blockWrapper.classList.add(`${shortBlockName}-wrapper`);
    const section = block.closest('.section');
    if (section) section.classList.add(`${shortBlockName}-container`);
  }
}

/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 */
export function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope>div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('a')) {
          const as = [...col.querySelectorAll('a')];
          if (as.length === 1) {
            value = as[0].href;
          } else {
            value = as.map((a) => a.href);
          }
        } else if (col.querySelector('img')) {
          const imgs = [...col.querySelectorAll('img')];
          if (imgs.length === 1) {
            value = imgs[0].src;
          } else {
            value = imgs.map((img) => img.src);
          }
        } else if (col.querySelector('p')) {
          const ps = [...col.querySelectorAll('p')];
          if (ps.length === 1) {
            value = ps[0].textContent;
          } else {
            value = ps.map((p) => p.textContent);
          }
        } else value = row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Decorates all sections in a container element.
 * @param {Element} main The container element
 */
export function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.setAttribute('data-section-status', 'initialized');

    /* process section metadata */
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      let styles;

      Object.keys(meta).forEach((key) => {
        switch (key) {
          case 'style':
            styles = meta.style.split(',').map((style) => toClassName(style.trim()));
            styles.forEach((style) => section.classList.add(style));
            break;
          case 'theme':
            section.setAttribute('data-theme', meta.theme);
            break;
          case 'id':
            section.setAttribute('id', toClassName(meta.id));
            if (key === 'title') {
              section.setAttribute('data-title', meta.title);
            } else {
              section.setAttribute('data-title', toSentenceCase(meta.id));
            }
            break;
          default:
            section.dataset[toCamelCase(key)] = meta[key];
        }
      });

      sectionMeta.parentNode.remove();
    }
  });
}

/**
 * Updates all section status in a container element.
 * @param {Element} main The container element
 */
export function updateSectionsStatus(main) {
  const sections = [...main.querySelectorAll(':scope > div.section')];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const status = section.getAttribute('data-section-status');
    if (status !== 'loaded') {
      const loadingBlock = section.querySelector('.block[data-block-status="initialized"], .block[data-block-status="loading"]');
      if (loadingBlock) {
        section.setAttribute('data-section-status', 'loading');
        break;
      } else {
        section.setAttribute('data-section-status', 'loaded');
      }
    }
  }
}

/**
 * Decorates all blocks in a container element.
 * @param {Element} main The container element
 */
export function decorateBlocks(main) {
  main
    .querySelectorAll('div.section > div > div')
    .forEach(decorateBlock);
}

/**
 * Builds a block DOM Element from a two dimensional array
 * @param {string} blockName name of the block
 * @param {any} content two dimensional array or string or object of content
 */
export function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  // build image block nested div structure
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => {
        if (val) {
          if (typeof val === 'string') {
            colEl.innerHTML += val;
          } else {
            colEl.appendChild(val);
          }
        }
      });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return (blockEl);
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} block The block element
 */
export async function loadBlock(block) {
  const status = block.getAttribute('data-block-status');
  if (status !== 'loading' && status !== 'loaded') {
    block.setAttribute('data-block-status', 'loading');
    const blockName = block.getAttribute('data-block-name');
    try {
      const cssLoaded = new Promise((resolve) => {
        loadCSS(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`, resolve);
      });
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try {
            const mod = await import(`../blocks/${blockName}/${blockName}.js`);
            if (mod.default) {
              await mod.default(block);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`failed to load module for ${blockName}`, error);
          }
          resolve();
        })();
      });
      await Promise.all([cssLoaded, decorationComplete]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load block ${blockName}`, error);
    }
    block.setAttribute('data-block-status', 'loaded');
  }
}

/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} main The container element
 */
export async function loadBlocks(main) {
  updateSectionsStatus(main);
  const blocks = [...main.querySelectorAll('div.block')];
  for (let i = 0; i < blocks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(blocks[i]);
    updateSectionsStatus(main);
  }
}

// createOptimizedPicture moved to scripts.js

/**
 * Normalizes all headings within a container element.
 * @param {Element} el The container element
 * @param {[string]} allowedHeadings The list of allowed headings (h1 ... h6)
 */
export function normalizeHeadings(el, allowedHeadings) {
  const allowed = allowedHeadings.map((h) => h.toLowerCase());
  el.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((tag) => {
    const h = tag.tagName.toLowerCase();
    if (allowed.indexOf(h) === -1) {
      // current heading is not in the allowed list -> try first to "promote" the heading
      let level = parseInt(h.charAt(1), 10) - 1;
      while (allowed.indexOf(`h${level}`) === -1 && level > 0) {
        level -= 1;
      }
      if (level === 0) {
        // did not find a match -> try to "downgrade" the heading
        while (allowed.indexOf(`h${level}`) === -1 && level < 7) {
          level += 1;
        }
      }
      if (level !== 7) {
        tag.outerHTML = `<h${level} id="${tag.id}">${tag.textContent}</h${level}>`;
      }
    }
  });
}

/**
 * Set template (page structure) and theme (page styles).
 */
export function decorateTemplateAndTheme() {
  const addClasses = (elem, classes) => {
    classes.split(',').forEach((v) => {
      elem.classList.add(toClassName(v.trim()));
    });
  };
  const template = getMetadata('template');
  if (template) addClasses(document.body, template);
  const theme = getMetadata('theme');
  if (theme) addClasses(document.body, theme);
}

const iconMap = Object.freeze({
  video: { expression: [/^.*(youtube|vimeo|youtu.be).*$/i, /^.*\.(mp4)$/i], className: 'icon-play-button' },
  download: { expression: [/^.*\.(pdf)$/i], className: 'icon-download' },
  bookmark: { expression: [/^#.+$/i], className: 'icon-arrow' },
  internal: { expression: [/^\/.+$/i, /^(.*?(\bibm.com\b)[^$]*)$/i], className: 'icon-arrow' },
  external: { expression: [/^((?!merative.com|ibm.com).)*$/i, /^mailto.*$/i], className: 'icon-arrow' },
});

function getButtonIcon(button) {
  if (button.querySelector('span.icon') || !button.href) {
    return undefined;
  }
  // automatically apply icon
  const iconEntry = Object.entries(iconMap).find(
    ([, item]) => item.expression.some((exp) => exp.test(button.getAttribute('href'))),
  );
  if (iconEntry) {
    const [iconVariant, iconItem] = iconEntry;
    return [iconItem.className, iconVariant];
  }
  return undefined;
}

function getButtonLabel(button) {
  // try sibling text
  const sibling = button.parentElement?.previousElementSibling;
  if (sibling && sibling.textContent) {
    return sibling.textContent;
  }
  // try href
  if (button.href) {
    return button.href.replace(/[^\w]/gi, '-');
  }
  return undefined;
}

const videoTypeMap = Object.freeze({
  youtube: [/youtube\.com/, /youtu\.be/],
  mp4: [/\.mp4/],
  external: [/vimeo\.com/],
});

/**
 * Determine the type of video from its href.
 * @param href
 * @return {undefined|youtube|mp4|external}
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

/**
 * Helper function to create DOM elements
 * @param {string} tag DOM element to be created
 * @param {object} attributes attributes to be added
 * @param html {HTMLElement | SVGAElement | string} Additional html to be appended to tag
 */

export function createTag(tag, attributes = {}, html = undefined) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

/**
 * Display video within a modal overlay. Video can be served directly or via YouTube.
 * @param href
 * @return {HTMLElement}
 */
export const buildVideoModal = (href, videoType) => {
  const videoModal = createTag('div', { class: 'video-modal', 'aria-modal': 'true', role: 'dialog' });
  videoModal.style.display = 'none';
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
export const toggleVideoOverlay = (modal) => {
  const videoContent = modal.querySelector('.video-modal-content');
  const videoType = videoContent.getAttribute('data-videoType');
  const videoId = videoContent.getAttribute('data-videoId');

  if (modal?.classList?.contains('open')) {
    modal.style.display = 'none';
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
    modal.style.display = 'block';
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
 * Determine the icon class based on the URL path
 */

export function getIconTypebyPath(url) {
  const iconEntry = Object.entries(iconMap).find(
    ([, item]) => item.expression.some((exp) => exp.test(url)),
  );
  if (iconEntry) {
    const [iconVariant, iconItem] = iconEntry;
    return [iconItem.className, iconVariant];
  }
  return undefined;
}

/**
 * decorates paragraphs containing a single link as buttons.
 * @param {Element} element container element
 * @param {Object} options options object to control how decoration is performed
 */
export function decorateButtons(element, options = {}) {
  const mergedOptions = { ...{ decorateClasses: true, excludeIcons: ['internal'] }, ...options };
  element.querySelectorAll('a').forEach((a) => {
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
      if (element.tagName === 'MAIN') {
        document.body.appendChild(videoModal);
      } else {
        element.appendChild(videoModal);
      }
    }

    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      const down = a.firstElementChild;
      if (!a.querySelector('img')) {
        if (mergedOptions.decorateClasses) {
          if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
            up.classList.add('button-container');
            if (!down || down.tagName === 'SPAN') {
              a.classList.add('button', 'tertiary');
            } else if (down && down.tagName === 'EM') {
              a.classList.add('button', 'secondary');
            } else {
              a.classList.add('button', 'primary');
            }
          }
          if (up.childNodes.length === 1 && up.tagName === 'STRONG'
            && twoup.childNodes.length === 1 && twoup.tagName === 'P') {
            a.classList.add('button', 'primary');
            twoup.classList.add('button-container');
          }
          if (up.childNodes.length === 1 && up.tagName === 'EM'
            && twoup.childNodes.length === 1 && twoup.tagName === 'P') {
            a.classList.add('button', 'secondary');
            twoup.classList.add('button-container');
          }
        }
        if (a.classList.contains('button')) {
          // add icon
          const iconClass = getButtonIcon(a);
          if (iconClass && iconClass.every((cls) => !mergedOptions.excludeIcons.includes(cls))) {
            // add span
            const span = document.createElement('span');
            span.classList.add('icon', ...iconClass);
            a.appendChild(span);
          }
          if (a.querySelector('span.icon')) {
            a.classList.add('has-icon');
          }
        }
      }
    }
    // add aria-label when included in options or when no text content
    const hasAriaLabel = !!a.getAttribute('aria-label');
    if (!hasAriaLabel && (mergedOptions.ariaLabel || !a.textContent)) {
      const label = mergedOptions.ariaLabel || getButtonLabel(a);
      if (label) {
        a.setAttribute('aria-label', label);
      } else {
        a.setAttribute('aria-hidden', 'true');
      }
    }
  });
}

/**
 * load LCP block and/or wait for LCP in default content.
 */
export async function waitForLCP(lcpBlocks) {
  const block = document.querySelector('.block');
  const hasLCPBlock = (block && lcpBlocks.includes(block.getAttribute('data-block-name')));
  if (hasLCPBlock) await loadBlock(block);

  document.querySelector('body').classList.add('appear');
  const lcpCandidate = document.querySelector('main img');
  await new Promise((resolve) => {
    if (lcpCandidate && !lcpCandidate.complete) {
      lcpCandidate.setAttribute('loading', 'eager');
      lcpCandidate.addEventListener('load', resolve);
      lcpCandidate.addEventListener('error', resolve);
    } else {
      resolve();
    }
  });
}

/**
 * loads a block named 'header' into header
 */

export function loadHeader(header) {
  const headerBlock = buildBlock('header', '');
  header.append(headerBlock);
  decorateBlock(headerBlock);
  document.querySelector('body').classList.add('header-visible');

  return loadBlock(headerBlock);
}

/**
 * loads a block named 'solution-header' into header
 */

export function loadSolutionHeader(header) {
  const solutionHeaderBlock = document.querySelector('.solution-header-wrapper');

  if (solutionHeaderBlock) {
    header.append(solutionHeaderBlock);

    // Create a promise that resolves when the next animation frame is available
    const waitForAnimationFrame = () => new Promise(requestAnimationFrame);

    // Wait for the next animation frame before adding the class
    waitForAnimationFrame().then(() => {
      document.querySelector('body').classList.add('header-visible');
    });
  }
}

/**
 * loads a block named 'footer' into footer
 */

export function loadFooter(footer) {
  const footerBlock = buildBlock('footer', '');
  footer.append(footerBlock);
  decorateBlock(footerBlock);
  return loadBlock(footerBlock);
}

/**
 * init block utils
 */

function init() {
  window.hlx = window.hlx || {};
  window.hlx.codeBasePath = '';

  const scriptEl = document.querySelector('script[src$="/scripts/scripts.js"]');
  if (scriptEl) {
    try {
      [window.hlx.codeBasePath] = new URL(scriptEl.src).pathname.split('/scripts/scripts.js');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  sampleRUM('top');

  window.addEventListener('load', () => sampleRUM('load'));

  window.addEventListener('unhandledrejection', (event) => {
    sampleRUM('error', { source: event.reason.sourceURL, target: event.reason.line });
  });

  window.addEventListener('error', (event) => {
    sampleRUM('error', { source: event.filename, target: event.lineno });
  });
}

init();
