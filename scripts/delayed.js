import { sampleRUM, fetchPlaceholders } from './lib-franklin.js';

const placeholders = await fetchPlaceholders();
// const isProd = window.location.hostname.endsWith(placeholders.hostname);
const productionLib = 'ccb695f49426/launch-8817b4b01dd6';
const previewLib = 'ccb695f49426/launch-f7e352870932-development';

const loadScript = (url, attrs) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (attrs) {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const attr in attrs) {
      script.setAttribute(attr, attrs[attr]);
    }
  }
  head.append(script);
  return script;
};

// Core Web Vitals RUM collection
sampleRUM('cwv');

// OneTrust Cookies Consent Notice start

const otId = placeholders.onetrustid;
if (otId) {
  loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', {
    type: 'text/javascript',
    charset: 'UTF-8',
    'data-domain-script': `${otId}`,
  });

  window.OptanonWrapper = () => {
    if (window.location.host.endsWith('.page') || window.location.host.startsWith('localhost')) {
      loadScript(`https://assets.adobedtm.com/868c1e78d208/${previewLib}.min.js`);
    } else {
      loadScript(`https://assets.adobedtm.com/868c1e78d208/${productionLib}.min.js`);
    }
  };
}
// OneTrust Cookies Consent Notice end

// YouTube API (only when page includes a YouTube video)
if (document.querySelector('[data-ytid]')) {
  loadScript('https://www.youtube.com/iframe_api', {
    type: 'text/javascript',
  });
}

// Check if the element with id 'podcast-container-id' exists in the document
if (document.querySelector('#podcast-container-id')) {
  const podcastURL = document.querySelector('#podcast-container-id').querySelector('.podcast-iframe').src;
  if (podcastURL) {
    loadScript(podcastURL, {
      type: 'text/javascript',
    });
  }
}

// Adobe Target
window.targetGlobalSettings = {
  bodyHidingEnabled: false,
};
