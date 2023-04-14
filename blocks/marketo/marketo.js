import { createTag } from '../../scripts/scripts.js';
import { readBlockConfig, fetchPlaceholders } from '../../scripts/lib-franklin.js';

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

const embedMarketoForm = (marketoId, formId, successUrl) => {
  if (formId && marketoId) {
    const mktoScriptTag = loadScript('//go.merative.com/js/forms2/js/forms2.min.js');
    mktoScriptTag.onload = () => {
      if (successUrl) {
        window.MktoForms2.loadForm('//go.merative.com', `${marketoId}`, formId, (form) => {
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
        window.MktoForms2.loadForm('//go.merative.com', `${marketoId}`, formId);
      }
    };
  }
};

export default function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const marketoId = placeholders.marketoid;
  const formId = blockConfig['form-id'];
  const successUrl = blockConfig['success-url'];
  const section = block.closest('.section.marketo-container');

  // Handle headings in the section
  if (section.children.length > 0) {
    section.classList.add('multiple');
  }

  // Move heading to its own wrapper
  const h2 = section.querySelector('h2');
  if (h2 && h2.parentElement) {
    const clonedWrapper = h2.parentElement.cloneNode();
    clonedWrapper.classList.add('heading');
    clonedWrapper.appendChild(h2);
    section.prepend(clonedWrapper);
  }

  // Move remaining content to marketo wrapper
  const wrapper = section.querySelector('.marketo-wrapper');
  section.querySelectorAll(':scope > .default-content-wrapper:not(.heading)').forEach((div) => {
    if (div.children.length === 0) {
      section.removeChild(div);
      return;
    }
    if (div.nextElementSibling === wrapper) {
      wrapper.prepend(div);
    } else {
      wrapper.appendChild(div);
    }
  });

  if (formId && marketoId) {
    const formElement = createTag('form', { id: `mktoForm_${formId}` });
    block.textContent = '';
    block.append(formElement);

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        embedMarketoForm(marketoId, formId, successUrl);
        observer.disconnect();
      }
    });
    observer.observe(block);
    // window.setTimeout(() => embedMarketoForm(marketoId, formId, successUrl), 3000);
  }
}
