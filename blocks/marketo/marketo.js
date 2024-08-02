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
          form.onSuccess(() => {
            // location.href = successUrl;
            // if (window._satellite) {
            //   _satellite.track('formSubmit', {
            //     formName: document.title,
            //   });
            // }
            // Drift API call to commit form data immediately upon form submit
            if (typeof drift !== 'undefined') {
              drift.on('ready', (api) => {
                try {
                  api.commitFormData({
                    campaignId: 2787244,
                  });

                  if (location.href.includes('/contact')) {
                    // Drift popup custom code
                    drift.api.collectFormData(values, {
                      campaignId: 2787244,
                      followupUrl: successUrl,
                      stageData: true,
                    });
                  }

                  // Adobe Launch tracking for form submission
                  if (window._satellite) {
                    _satellite.track('formSubmit', {
                      formName: document.title,
                    });
                  }
                } catch (error) {
                  console.error('Error with Drift API calls:', error);
                }
              });
            } else {
              console.error('Drift is not defined');
            }
            // Return false to prevent the submission handler continuing with its own processing
            return false;
          });

          let hasTrackedFormLoad = false;
          window.MktoForms2.whenReady((f) => {
            if (!hasTrackedFormLoad && window._satellite) {
              window._satellite.track('formLoad', {
                formName: document.title,
              });
              hasTrackedFormLoad = true;
            }

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
  // Read block configuration
  const blockConfig = readBlockConfig(block);
  const marketoId = placeholders.marketoid;

  // Extract form configuration details
  const formTitle = blockConfig['form-title'];
  const formId = blockConfig['form-id'];
  const successUrl = blockConfig['success-url'];

  if (formId && marketoId) {
    // Create the form element
    const formElement = createTag('form', { id: `mktoForm_${formId}` });
    block.textContent = '';

    // Create and append form title (if available)
    if (formTitle) {
      const titleElement = createTag('h2', { id: `${formTitle.toLowerCase()}` });
      titleElement.textContent = formTitle;
      block.append(titleElement);
    }

    // Append the form element
    block.append(formElement);

    // Set up an observer to embed the Marketo form when block is in view
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        // Embed the Marketo form
        embedMarketoForm(marketoId, formId, successUrl);
        observer.disconnect();
      }
    });

    // Start observing the block
    observer.observe(block);
  }
}
