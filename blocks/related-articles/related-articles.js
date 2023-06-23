import { lookupBlogs, createCard } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const pathnames = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  block.textContent = '';
  // Make a call to the blog index and get the json for just the pathnames the author has put in
  const pageList = await lookupBlogs(pathnames);
  if (pageList.length) {
    pageList.forEach(async (row) => {
      block.append(await createCard(row, 'blog-card'));
    });
    block.innerHTML = '<div class="eyebrow">Related articles</div>';
  } else {
    block.remove();
  }
}
