import { createTag } from '../../scripts/scripts.js';
import { buildBlock } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
    const h1 = block.querySelector('h1');
    const picture = block.querySelector('picture');
    const icon = block.querySelector('span');
    picture.classList.add('main-banner');
    icon.setAttribute('id', 'banner-icon');
      const section = document.createElement('div');
      const sectionTwo = document.createElement('div');
      sectionTwo.append(icon);
      sectionTwo.append(h1);
      sectionTwo.setAttribute('id', 'logo-text-holder');
      section.append(buildBlock('hero', { elems: [picture, sectionTwo] }));
      block.prepend(section);
}