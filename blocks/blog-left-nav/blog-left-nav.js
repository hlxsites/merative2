import { createTag } from '../../scripts/scripts.js';

function openLink(e) {
  const idName = e.target.getAttribute('title');
  let url = null;
  const currentUrl = window.location.href;
  if (idName !== null) {
    if (idName.includes('linkedin')) {
      url = `https://www.linkedin.com/sharing/share-offsite/?url= ${currentUrl}`;
      window.open(url, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=300,width=800,height=500');
    } else if (idName.includes('twitter')) {
      url = `https://twitter.com/share?url= ${currentUrl}`;
      window.open(url, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=300,width=800,height=500');
    } else if (idName.includes('facebook')) {
      url = `https://www.facebook.com/sharer/sharer.php?u= ${currentUrl}`;
      window.open(url, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=300,width=800,height=500');
    } else if (idName.includes('share')) {
      navigator.clipboard.writeText(window.location.href);
    }
  }
  e.preventDefault();
}

const sections = [];

function anchorTagLinkCreation(contentLinkId, contentLink) {
  const aLink = document.createElement('a');
  aLink.append(contentLink);
  aLink.classList.add('content-link');
  aLink.href = `#${contentLinkId}`;
  document.getElementById('blog-content-link').append(aLink);
  document.getElementsByClassName('content-link')[0].classList.add('active');
  document.getElementById(contentLinkId).classList.add('scroll-margin');
  sections.push(document.getElementById(contentLinkId));
  window.addEventListener('scroll', () => {
    const scrollAmount = window.scrollY;
    sections.forEach((element) => {
      if (scrollAmount >= ((element.offsetTop) - 130)) {
        const idName = element.getAttribute('id');
        if (idName === contentLinkId) {
          aLink.classList.add('active');
        } else {
          aLink.classList.remove('active');
        }
      }
    });
  });
}

function anchorTagSocialMediaCreation(socialMedia) {
  const clsName = `social-share-${socialMedia}`;
  // const sid = `social_share_link${socialMedia}`;
  const aLink = document.createElement('a');
  aLink.setAttribute('class', clsName);
  // aLink.setAttribute('id', sid);
  aLink.title = socialMedia;
  aLink.href = '#';
  aLink.addEventListener('click', openLink);
  return aLink;
}

export default function decorate(block) {
  // find the article content div
  const articleContent = document.querySelector('.article-content');
  const contentDivs = articleContent.querySelectorAll(':scope > div');

  const articleContentWrapper = createTag('div', { class: 'article-content-wrapper' });
  contentDivs.forEach((div) => {
    articleContentWrapper.append(div);
  });

  const articleMainWrapper = createTag('div', { class: 'article-main-wrapper' });
  articleMainWrapper.append(block);
  articleMainWrapper.append(articleContentWrapper);
  articleContent.textContent = '';
  articleContent.append(articleMainWrapper);

  const blogContentLink = createTag('div', { class: 'blog-content-links' });
  blogContentLink.setAttribute('id', 'blog-content-link');
  block.textContent = '';
  block.append(blogContentLink);

  const headerTags = articleContentWrapper.querySelectorAll('h1, h2, h3');
  headerTags.forEach((headerTag) => {
    // Ignore heading tags with no content
    if (headerTag.textContent) anchorTagLinkCreation(headerTag.getAttribute('id'), headerTag.textContent);
  });

  const socialLinks = ['linkedin', 'twitter', 'facebook', 'share'];
  const socialShareLinks = createTag('div', { class: 'social-share-links' });
  socialShareLinks.setAttribute('id', 'social-share-links-id');

  socialLinks.forEach((item) => {
    socialShareLinks.append(anchorTagSocialMediaCreation(item));
  });
  block.append(socialShareLinks);

  // add page scroll listener to know when header turns to sticky
  window.addEventListener('scroll', () => {
    const scrollAmount = window.scrollY;
    const linksHeight = document.getElementById('blog-content-link').clientHeight;
    const socialTop = linksHeight + 240;
    document.getElementById('social-share-links-id').style.setProperty('top', `${socialTop}px`);
    if (scrollAmount >= (articleContentWrapper.offsetHeight) - 300) {
      document.getElementById('blog-content-link').classList.add('blog-content-links-is-sticky');
    } else {
      document.getElementById('blog-content-link').classList.remove('blog-content-links-is-sticky');
    }
  });

  // clean up the old div
  const main = document.querySelector('main');
  const blogLeftNavContainer = main.querySelector('.section.blog-left-nav-container');
  main.removeChild(blogLeftNavContainer);
}
