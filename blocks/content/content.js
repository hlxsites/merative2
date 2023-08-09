export default function decorate(block) {
  [...block.children].forEach((element) => {
    element.classList.add('content__item');

    // Find all the div elements within the elements with class 'content__item'
    const itemElements = element.querySelectorAll('.content__item div');

    // Add the class 'content-intro__col' and append a number to each of these div elements
    let counter = 1;
    itemElements.forEach((divElement) => {
      const newClass = `content__col-${counter}`;
      divElement.classList.add('content__col', newClass);
      counter += 1; // Use prefix notation to increment the counter

      // Find the <h2> element inside each .content__item div
      const h2Element = divElement.querySelector('h2');

      if (h2Element) {
        // Find the previous sibling of <h2> element
        const previousElement = h2Element.previousElementSibling;

        if (previousElement && previousElement.tagName.toLowerCase() === 'p') {
          previousElement.classList.add('content__eyebrow');
        }
      }
    });
  });
}
