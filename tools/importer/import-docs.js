/* eslint-disable no-undef */
const createMetadataBlock = (main, document) => {
  const meta = {};
  // add the template
  meta.Template = 'Document';

  // find the <title> element
  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  // find the <meta property="og:description"> element
  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  // find the <meta property="og:image"> element
  // const img = document.querySelector('[property="og:image"]');
  // if (img) {
  //   // create an <img> element
  //   const el = document.createElement('img');
  //   el.src = img.content;
  //   meta.Image = el;
  // }

  // Get tags
  let tags = '';
  document.querySelectorAll('.cmp-pdfbasicinfo__tag').forEach((tag) => {
    tags += tag.innerHTML;
    tags += ',';
    tag.remove();
  });
  if (tags) meta.DocumentTags = tags;

  const readtime = document.querySelector('.cmp-pdfbasicinfo__pretitle > span');
  if (readtime) {
    meta.ReadTime = readtime.innerHTML;
    readtime.remove();
  }

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(block);

  // returning the meta object might be usefull to other rules
  return meta;
};

export default {
  transform: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
  }) => {
    // Remove unnecessary parts of the content
    WebImporter.DOMUtils.remove(document.body, ['header', 'footer']);
    const main = document.body;
    const results = [];

    // Remove other stuff that shows up in the page
    const skipToContent = main.querySelector('.button--skipToContent');
    skipToContent.remove();
    main.querySelectorAll('iframe').forEach((el) => el.remove());
    main.querySelector('div#onetrust-consent-sdk').remove();
    if (main.querySelector('.cmp-pdfbasicinfo__action-container')) main.querySelector('.cmp-pdfbasicinfo__action-container').remove();

    // Add Leadspace block
    const title = main.querySelector('h1.cmp-pdfbasicinfo__title');
    const description = main.querySelector('.cmp-pdfbasicinfo__description');
    if (title && description) {
      const cells = [
        ['Leadspace (document)'],
        [title.outerHTML + description.innerHTML],
      ];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      main.prepend(table);
      // remove elements already added to blocks from main
      title.remove();
      description.remove();
    }

    main.append('---');

    // Add PDF block
    const pdfUrlEl = main.querySelector('.cmp-pdfviewer');
    if (pdfUrlEl) {
      const pdfUrlPath = pdfUrlEl.getAttribute('data-cmp-document-path');
      const pdfUrl = new URL(WebImporter.FileUtils.sanitizePath(pdfUrlPath), 'https://main--merative2--hlxsites.hlx.page').toString();
      const pdfCells = [
        ['PDF Viewer'],
        ['Document Link', pdfUrl],
      ];
      const pdfBlock = WebImporter.DOMUtils.createTable(pdfCells, document);
      main.append(pdfBlock);
      main.append('---');
    }

    // Add Related Documents block
    const rrText = main.querySelector('.cmp-teaser .cmp-teaser__pretitle');
    if (rrText) {
      const rrSectionTitle = document.createElement('h5');
      rrSectionTitle.innerHTML = rrText.innerHTML;
      const relatedResourcesCmp = main.querySelectorAll('.customizedCard.teaser a');
      let rrLinks = '';
      relatedResourcesCmp.forEach((link) => {
        const updatedLink = link.href.replace('/content/merative/us/en', '');
        const rrURL = new URL(WebImporter.FileUtils.sanitizePath(updatedLink), 'https://main--merative2--hlxsites.hlx.page').toString().replace('.html', '');
        const linkEl = document.createElement('a');
        linkEl.href = rrURL;
        linkEl.innerHTML += rrURL;
        rrLinks += linkEl;
        rrLinks += '\n';
        link.remove();
      });

      const relatedResourcesCells = [
        ['Related Resources'],
        [rrLinks],
      ];

      const relatedResourcesBlock = WebImporter.DOMUtils
        .createTable(relatedResourcesCells, document);
      main.append(rrSectionTitle);
      main.append(relatedResourcesBlock);
      rrText.remove();
      main.append('---');
    }

    // Add CTA block
    const ctaHeading = main.querySelector('.cmp-experiencefragment--consultation h2');
    const ctaText = main.querySelectorAll('.cmp-experiencefragment--consultation p');
    const ctaLinkText = main.querySelector('.cmp-experiencefragment--consultation a .cmp-button__text');

    if (ctaText && ctaHeading && ctaLinkText) {
      let ctaTextInner = '';
      ctaText.forEach((paragraph) => {
        ctaTextInner += paragraph.innerHTML;
        paragraph.remove();
      });
      const ctaLink = `<a href="https://www.merative.com/contact">${ctaLinkText.innerHTML}</a>`;
      // const pdfUrl = new URL(WebImporter.FileUtils.sanitizePath(pdfUrlEl.getAttribute('data-cmp-document-path')), 'https://main--merative2--hlxsites.hlx.page').toString();
      const ctaCells = [
        ['CTA'],
        [ctaHeading.outerHTML + ctaTextInner + ctaLink],
      ];
      const ctaBlock = WebImporter.DOMUtils.createTable(ctaCells, document);
      main.append(ctaBlock);
      ctaHeading.remove();
      main.querySelector('.cmp-experiencefragment--consultation a').remove();
    }

    createMetadataBlock(main, document);

    // main page import - "element" is provided, i.e. a docx will be created
    results.push({
      element: main,
      path: new URL(url).pathname,
    });

    // find pdf links in document pages (different than other pages)
    const docEl = main.querySelector('.cmp-pdfviewer');
    if (docEl) {
      const docUrl = docEl.getAttribute('data-cmp-document-path');
      if (docUrl && docUrl.endsWith('.pdf')) {
        const u = new URL(docUrl, url);
        const newPath = WebImporter.FileUtils.sanitizePath(u.pathname);
        // no "element", the "from" property is provided instead -
        // importer will download the "from" resource as "path"
        results.push({
          path: newPath,
          from: u.toString(),
        });
      }
    }

    // find pdf links
    main.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href && href.endsWith('.pdf')) {
        const u = new URL(href, url);
        const newPath = WebImporter.FileUtils.sanitizePath(u.pathname);
        // no "element", the "from" property is provided instead -
        // importer will download the "from" resource as "path"
        results.push({
          path: newPath,
          from: u.toString(),
        });
      }
    });

    return results;
  },
};
