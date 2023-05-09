import {
  appendListGroup,
  createGroupItem,
  fetchListDocument,
} from '../library-utils.js';

function getIconName(span) {
  const heading = span.closest('p').previousElementSibling;
  if (heading && ['H2', 'H3'].includes(heading.nodeName)) {
    return heading.textContent;
  }
  return null;
}

function createIcon(element) {
  return `:${element.className.split('icon-').pop()}:`;
}

export default function loadIcons(icons, list) {
  icons.forEach(async (iconItem) => {
    const iconGroup = appendListGroup(list, iconItem);
    const iconDoc = await fetchListDocument(iconItem);
    const pageIcons = iconDoc.body.querySelectorAll(':scope > div span.icon');
    pageIcons.forEach((iconSpan) => {
      const iconName = getIconName(iconSpan);
      const iconElement = createGroupItem(
        iconName,
        () => createIcon(iconSpan),
      );
      if (iconElement) {
        iconGroup.append(iconElement);
      }
    });
  });
}
