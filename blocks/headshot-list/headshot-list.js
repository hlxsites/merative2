import { lookupPeople, createHeadshotList } from '../../scripts/scripts.js';

export default async function decorate(block) {
  [...block.children].forEach(async (element) => {
    const pathnames = [...element.querySelectorAll('a')].map((a) => {
      const url = new URL(a.href);
      if (url.hostname.endsWith('.page') || url.hostname.endsWith('.live') || url.hostname.endsWith('merative.com') || url.hostname.startsWith('localhost')) return url.pathname;
      return a.href;
    });

    block.textContent = '';
    const pageList = await lookupPeople(pathnames);
    if (pageList.length) {
      pageList.forEach((row) => {
        block.append(createHeadshotList(row, 'headshot-list__item'));
      });
    }
  });
}
