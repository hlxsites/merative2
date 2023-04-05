import {
  appendListGroup,
  createGroupItem,
  fetchListDocument,
  createTable,
  decorateImages,
} from '../library-utils.js';
import { readBlockConfig } from '../../../scripts/lib-franklin.js';

function getAuthorName(sectionMeta) {
  const sibling = sectionMeta.parentElement.previousElementSibling;
  if (sibling) {
    const heading = sibling.querySelector('h2');
    return heading?.textContent;
  }
  return undefined;
}

function getSectionName(section) {
  const sectionMeta = section.querySelector('div.section-metadata');
  let sectionName;
  if (sectionMeta) {
    const meta = readBlockConfig(sectionMeta);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') {
        sectionName = getAuthorName(sectionMeta) || meta.style;
      }
    });
  }
  return sectionName;
}

function createSection(section, path) {
  decorateImages(section, path);
  let output = '---';
  [...section.children].forEach((row) => {
    if (row.nodeName === 'DIV') {
      const blockName = row.classList[0];
      output = output.concat(createTable(row, blockName, path));
    } else {
      output = output.concat(row.outerHTML);
    }
  });
  output = output.concat('---');
  return output;
}

export default function loadSections(sections, list) {
  sections.forEach(async (section) => {
    const sectionGroup = appendListGroup(list, section);
    const sectionDoc = await fetchListDocument(section);
    const pageSections = sectionDoc.body.querySelectorAll(':scope > div');
    pageSections.forEach((pageSection) => {
      const sectionName = getSectionName(pageSection);
      const sectionItem = createGroupItem(
        sectionName,
        () => createSection(pageSection, section.path),
      );
      if (sectionItem) {
        sectionGroup.append(sectionItem);
      }
    });
  });
}
