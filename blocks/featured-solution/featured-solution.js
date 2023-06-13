export default function decorate(block) {
  [...block.children].forEach((element) => {
    element.classList.add('featured-solution__item');
  });
}
