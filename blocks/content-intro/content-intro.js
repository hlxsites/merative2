export default function decorate(block) {
  [...block.children].forEach((element) => {
    element.classList.add('content-intro__inner');

    // Find all the div elements within the elements with class 'content-intro__inner'
    const innerElements = element.querySelectorAll('.content-intro__inner div');

    // Add the class 'content-intro__col' and append a number to each of these div elements
    let counter = 1;
    innerElements.forEach((divElement) => {
      const newClass = `content-intro__col-${counter}`;
      divElement.classList.add('content-intro__col', newClass);
      counter += 1; // Use prefix notation to increment the counter

      // Find the <h2> element inside each .content-intro__inner div
      const h2Element = divElement.querySelector('h2');

      if (h2Element) {
        // Find the previous sibling of <h2> element
        const previousElement = h2Element.previousElementSibling;

        if (previousElement && previousElement.tagName.toLowerCase() === 'p') {
          previousElement.classList.add('content-intro__eyebrow');
        }
      }
    });
  });
}
