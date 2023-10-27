/* eslint-disable no-undef */
const createMetadataBlock = (main, document) => {
  const meta = {};
  // add the template
  meta.Template = 'Support';

  // find the <title> element
  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const breadcrumb = document.querySelector('.breadcrumb.breadcrumb--primary');
  if (breadcrumb) {
    meta.Breadcrumb = '/fragments/breadcrumbs/curam-support';
    breadcrumb.remove();
  }

  // find the <meta property="og:description"> element
  // const desc = document.querySelector('[property="og:description"]');
  // if (desc) {
  //   meta.Description = desc.content;
  // }

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
    if (skipToContent) skipToContent.remove();
    main.querySelectorAll('iframe').forEach((el) => el.remove());
    main.querySelector('div#onetrust-consent-sdk')?.remove();
    if (main.querySelector('.cmp-pdfbasicinfo__action-container')) main.querySelector('.cmp-pdfbasicinfo__action-container').remove();

    // move title from span to H1
    const title = main.querySelector('span.cmp-text__heading-h1');
    if (title) {
      const h1 = document.createElement('H1');
      h1.innerHTML += title.innerHTML;
      main.prepend(h1);
      // remove elements already added to blocks from main
      title.remove();
    }

    const headingTwos = main.querySelectorAll('span.cmp-text__heading-h2');
    if (headingTwos.length > 0) {
      headingTwos.forEach((h2) => {
        const newH2 = document.createElement('H2');
        newH2.innerHTML += h2.innerHTML;
        h2.replaceWith(newH2);
      });
    }

    const headingThrees = main.querySelectorAll('span.cmp-text__heading-h3');
    if (headingThrees.length > 0) {
      headingThrees.forEach((h3) => {
        const newH3 = document.createElement('H3');
        newH3.innerHTML += h3.innerHTML;
        h3.replaceWith(newH3);
      });
    }

    // Handle Tables from the source content
    const tables = main.querySelectorAll('table');
    if (tables.length > 0) {
      tables.forEach((table) => {
        const cells = [
          ['Table'],
          [table.outerHTML],
        ];
        const newTable = WebImporter.DOMUtils.createTable(cells, document);
        table.parentElement.append(newTable);
        table.remove();
      });
    }

    // Handle bold text
    const boldText = main.querySelectorAll('span.cmp-text__body-small-regular, span.cmp-text__body-normal-medium');
    if (boldText.length > 0) {
      boldText.forEach((txt) => {
        const newText = document.createElement('STRONG');
        newText.innerHTML += txt.innerHTML;
        txt.replaceWith(newText);
      });
    }

    // Need this to fix issue where b>span does not translate well like span>b
    const boldSpans = main.querySelectorAll('b span');
    if (boldSpans.length > 0) {
      boldSpans.forEach((boldSpan) => {
        boldSpan.innerHTML = `<b>${boldSpan.textContent.trim()}</b> `;
        if (boldSpan.parentElement) boldSpan.parentElement.replaceWith(boldSpan);
      });
    }

    // Fix empty strong tags
    const strongs = main.querySelectorAll('strong');
    if (strongs.length > 0) {
      strongs.forEach((s) => {
        if (!s.textContent) s.remove();
      });
    }

    // Check if the page has a Document Information right nav and import it as a block instead
    const documentInfoSpan = main.querySelector('span.cmp-text__eyebrow-eyebrow');
    if (documentInfoSpan && documentInfoSpan.innerHTML === 'Document Information') {
      // Update the text to H5
      const newDocInfoSpan = document.createElement('H5');
      newDocInfoSpan.innerHTML += documentInfoSpan.innerHTML.trim();
      documentInfoSpan.parentElement.prepend(newDocInfoSpan);
      documentInfoSpan.remove();
      const docInfo = newDocInfoSpan.parentElement.parentElement;
      if (docInfo) {
        // Add Right Nav block
        const cells = [
          ['Right Nav'],
          [docInfo.innerHTML],
        ];
        const table = WebImporter.DOMUtils.createTable(cells, document);
        main.append(table);
        // remove elements already added to blocks from main
        docInfo.remove();
      }
    }

    createMetadataBlock(main, document);

    // main page import - "element" is provided, i.e. a docx will be created
    results.push({
      element: main,
      path: new URL(url).pathname,
    });

    return results;
  },
};
