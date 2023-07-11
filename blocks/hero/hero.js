import { buildBlock } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const h1 = block.querySelector('h1');
  const icon = block.querySelector('span');
  const allPictures = block.querySelectorAll('.only-picture picture img');
  const imageAltText = h1.innerHTML || 'hero-preview-image';

  const resolutions = ['1200px', '768px', '375px'];
  icon.setAttribute('id', 'banner-icon');
  const sectionTwo = document.createElement('div');
  sectionTwo.append(icon);
  sectionTwo.append(h1);
  sectionTwo.setAttribute('class', 'hero__content');

  // create the <picture> element
  const onePictureElement = document.createElement('picture');

  const imgElement = document.createElement('img');
  imgElement.setAttribute('src', 'path/to/image.jpg');
  imgElement.setAttribute('id', 'imgcls');
  imgElement.setAttribute('alt', imageAltText);
  // Loop through the each <picture> element
  allPictures.forEach((pictureElement, index) => {
    const sourceElement = document.createElement('source');
    sourceElement.setAttribute('srcset', pictureElement.src);
    sourceElement.setAttribute('type', 'image/webp');
    sourceElement.setAttribute('media', `(min-width: ${resolutions[index]})`);

    onePictureElement.appendChild(sourceElement);
  });

  onePictureElement.appendChild(imgElement);
  const section = document.createElement('div');
  section.append(buildBlock('hero', { elems: [onePictureElement, sectionTwo] }));
  block.prepend(section);
}
