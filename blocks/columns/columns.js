export default function decorate(block) {
  const isContentBand = block.classList.contains('content-band');
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  if (isContentBand) {
    block.querySelectorAll('.only-picture').forEach((el) => {
      const content = el.parentElement.querySelector('h3, h2, h1').textContent || 'Content Band preview image';
      el.querySelector('img').alt = content;
    });
  } else {
    cols.forEach((col) => {
      const content = col.querySelector('h1, h2, h3, h4, h5').textContent || 'Column preview image';
      col.querySelectorAll('img').map((img) => { img.alt = content; return img; });
    });
  }
}
