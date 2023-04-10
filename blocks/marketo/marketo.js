import { createTag } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

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

const embedMarketoForm = (formId, divId, successUrl) => {
  // PDF Viewer for doc pages
  if (formId && divId) {
    const mktoScriptTag = loadScript('//go.merative.com/js/forms2/js/forms2.min.js');
    mktoScriptTag.onload = () => {
      if (successUrl) {
        window.MktoForms2.loadForm('//go.merative.com', `${formId}`, divId, (form) => {
          // Add an onSuccess handler
          // eslint-disable-next-line no-unused-vars
          form.onSuccess((values, followUpUrl) => {
            // Take the lead to a different page on successful submit,
            // ignoring the form's configured followUpUrl
            // eslint-disable-next-line no-restricted-globals
            location.href = successUrl;
            // Return false to prevent the submission handler continuing with its own processing
            return false;
          });
        });
      } else {
        window.MktoForms2.loadForm('//go.merative.com', `${formId}`, divId);
      }
    };
  }
};

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const formId = blockConfig['form-id'];
  const divId = blockConfig['div-id'];
  const successUrl = blockConfig['success-url'];

  // Handle H2s in the section
  const section = block.parentElement.parentElement;
  if (section.children.length > 0) section.classList.add('multiple');
  const h2 = section.querySelector('h2');

  if (h2 && h2.parentElement) {
    h2.parentElement.classList.add('h2');
    section.classList.add('h2');
  }

  if (formId && divId) {
    const formDiv = createTag('form', { id: `mktoForm_${divId}` });
    block.textContent = '';
    block.append(formDiv);

    window.setTimeout(() => embedMarketoForm(formId, divId, successUrl), 3000);
  }
}
