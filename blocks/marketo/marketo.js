/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
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
            location.href = successUrl;
            if (window._satellite) {
              _satellite.track('formSubmit', {
                formName: document.title,
              });
            }
            // Return false to prevent the submission handler continuing with its own processing
            return false;
          });

          // const conReasonField = document.querySelector('#contactmeHowcanwehelp');
          // const noButtonReasons = ['Customer Support'];
          let hasTrackedFormLoad = false;
          window.MktoForms2.whenReady((f) => {
            if (!hasTrackedFormLoad && window._satellite) {
              window._satellite.track('formLoad', {
                formName: document.title,
              });
              hasTrackedFormLoad = true;
            }
            // Keeping the below code that I got from the original site.
            // function noMoreButton() {
            //   const reason = conReasonField.value;
            //   if (noButtonReasons.includes(reason)) {
            //     f.submittable(false);
            //     document.querySelector('.mktoForm .mktoButtonRow').style.display = 'none';
            //     return false;
            //   }
            //   f.submittable(true);
            //   document.querySelector('.mktoForm .mktoButtonRow').style.display = 'block';
            //   return false;
            // }
            // if (conReasonField) conReasonField.addEventListener('change', noMoreButton);

            f.addHiddenFields({
              RBN_Referral_URL_Cargo__c: document.URL,
            });
          });
          const formInputEle = document.querySelectorAll('form input, form select');
          function focusListener() {
            window._satellite?.track('formStart', {
              formName: document.title,
            });
            formInputEle.forEach((inputEle) => {
              inputEle.removeEventListener('focusin', focusListener);
            });
          }
          formInputEle.forEach((inputEle) => {
            inputEle.addEventListener('focusin', focusListener);
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
  const h2 = section.querySelector('h2:first-of-type, h3:first-of-type');
  if (h2 && h2.parentElement) {
    const h2Wrapper = h2.parentElement;
    const clonedWrapper = h2Wrapper.cloneNode();
    clonedWrapper.classList.add('heading');
    clonedWrapper.appendChild(h2);
    section.prepend(clonedWrapper);
    if (h2Wrapper.children.length === 0) {
      h2Wrapper.parentElement.removeChild(h2Wrapper);
    }
  }

  // Move remaining content to marketo wrapper
  section.querySelectorAll('.marketo-wrapper > div:not(.marketo)').forEach((div) => {
    if (div.querySelector('h6')) {
      div.classList.add('spacious');
    }
  });

  // Add read more/less link to default content
  const defaultContent = section.querySelectorAll('.default-content-wrapper:not(.heading)');
  defaultContent.forEach((wrapper) => {
    if (wrapper.querySelectorAll(':scope > p:first-of-type ~ *').length > 0) {
      const showMore = createTag('a', { role: 'button' });
      showMore.textContent = 'Read more';
      showMore.addEventListener('click', () => {
        wrapper.classList.toggle('open');
        showMore.textContent = wrapper.classList.contains('open') ? 'Read less' : 'Read more';
      });
      wrapper.classList.add('show-more');
      wrapper.appendChild(showMore);
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
