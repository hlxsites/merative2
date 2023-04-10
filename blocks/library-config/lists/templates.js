import {
  appendListGroup,
  createGroupItem,
  fetchListDocument,
  createTable,
  decorateImages,
} from '../library-utils.js';

function createSection(section, path) {
  decorateImages(section, path);
  let output = '';
  [...section.children].forEach((row) => {
    if (row.nodeName === 'DIV') {
      const blockName = row.classList[0];
      output = output.concat(createTable(row, blockName, path));
    } else {
      output = output.concat(row.outerHTML);
    }
  });
  return output;
}

function createTemplate(template, path) {
  decorateImages(template, path);
  let output = '';
  [...template.children].forEach((row, i) => {
    if (row.nodeName === 'DIV') {
      if (i > 0) output = output.concat('---');
      output = output.concat(createSection(row, path));
    } else {
      output = output.concat(row.outerHTML);
    }
  });
  return output;
}

export default function loadTemplates(templates, list) {
  templates.forEach(async (template) => {
    const templateGroup = appendListGroup(list, template);
    const templateDoc = await fetchListDocument(template);
    const pageTemplate = templateDoc.body;
    const templateName = template.name;
    const templateItem = createGroupItem(
      templateName,
      () => createTemplate(pageTemplate, template.path),
    );
    if (templateItem) {
      templateGroup.append(templateItem);
    }
  });
}
