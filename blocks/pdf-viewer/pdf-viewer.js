import { getMetadata, createTag } from '../../scripts/scripts.js';
import { fetchPlaceholders, readBlockConfig } from '../../scripts/lib-franklin.js';

const placeholders = await fetchPlaceholders();

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

const embedPDFViewer = (
  divId,
  docUrl,
  embedMode = '',
  showAnnotationTools = false,
  showPrintPDF = true,
  showDownloadPDF = true,
  defaultViewMode = 'FIT_WIDTH',
  enableFormFilling = false,
  showBookmarks = false,
  showThumbnails = false,
  showZoomControl = true,
  showLeftHandPanel = true,
) => {
  // PDF Viewer for doc pages
  if (docUrl) {
    const docFilename = docUrl.split('/').pop();
    loadScript('https://documentservices.adobe.com/view-sdk/viewer.js');
    let pdfAPIKey;
    if (window.location.host.startsWith('localhost')) {
      pdfAPIKey = placeholders.pdfapikeylocalhost;
    } else if (window.location.host.startsWith('pdf-viewer')) {
      pdfAPIKey = placeholders.pdfapikeypdfviewer;
    } else if (window.location.host.endsWith('.page')) {
      pdfAPIKey = placeholders.pdfapikeypage;
    } else if (window.location.host.endsWith('.live')) {
      pdfAPIKey = placeholders.pdfapikeylive;
    } else if (window.location.host.endsWith('merative.com')) {
      pdfAPIKey = placeholders.pdfapikey;
    }

    if (pdfAPIKey) {
      document.addEventListener('adobe_dc_view_sdk.ready', async () => {
        // eslint-disable-next-line no-undef
        const adobeDCView = new AdobeDC.View({ clientId: pdfAPIKey, divId });
        if (adobeDCView) {
          // eslint-disable-next-line no-undef
          adobeDCView.previewFile({
            content: { location: { url: docUrl } },
            metaData: { fileName: docFilename },
          }, {
            embedMode,
            showAnnotationTools,
            showPrintPDF,
            showDownloadPDF,
            defaultViewMode,
            enableFormFilling,
            showBookmarks,
            showThumbnails,
            showZoomControl,
            showLeftHandPanel,
          });

          // Add data-hj-allow-iframe attribute to the generated iframe
          const iframe = document.querySelector(`#${divId} iframe`);
          if (iframe) {
            iframe.setAttribute('data-hj-allow-iframe', '');
          }
        }
      });
    }
  }
};

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const docUrl = blockConfig['document-link'];
  const embedMode = blockConfig['embed-mode'];
  const showAnnotationTools = (blockConfig['show-annotation-tools'] === 'true');
  const showPrintPDF = (blockConfig['show-print-pdf'] === 'true');
  const showDownloadPDF = (blockConfig['show-download-pdf'] === 'true');
  const defaultViewMode = blockConfig['default-view-mode'];
  const enableFormFilling = (blockConfig['enable-form-filling'] === 'true');
  const showBookmarks = (blockConfig['show-bookmarks'] === 'true');
  const showThumbnails = (blockConfig['show-thumbnails'] === 'true');
  const showZoomControl = (blockConfig['show-zoom-control'] === 'true');
  const showLeftHandPanel = (blockConfig['show-left-hand-panel'] === 'true');

  if (docUrl) {
    const randomUUID = window.crypto.randomUUID();
    const divId = `adobe-dc-view-${randomUUID}`;
    const docDiv = createTag('div', { id: divId });

    // Add embed mode class
    if (embedMode) {
      const embedModeCleanedUp = embedMode.replace(/[_\s]/g, '-').toLowerCase();
      const concatenatedClass = `embed-mode--${embedModeCleanedUp}`;
      block.classList.add(concatenatedClass);
    } else {
      block.classList.add('embed-mode--full-window');
    }
    block.textContent = '';
    block.append(docDiv);

    // Get document asset type
    const assetType = getMetadata('assettype');
    const isWhitepaper = assetType.toLowerCase() === 'whitepaper';
    const isSolutionBrief = assetType.toLowerCase() === 'solution brief';

    // If the assetType is 'Whitepaper' or 'Solution Brief'
    if (isWhitepaper || isSolutionBrief) {
      block.classList.add('pdf-viewer-orientation--portrait');
    } else {
      block.classList.add('pdf-viewer-orientation--landscape');
    }

    window.setTimeout(() => embedPDFViewer(
      divId,
      docUrl,
      embedMode,
      showAnnotationTools,
      showPrintPDF,
      showDownloadPDF,
      defaultViewMode,
      enableFormFilling,
      showBookmarks,
      showThumbnails,
      showZoomControl,
      showLeftHandPanel,
    ), 3000);
  }
}
