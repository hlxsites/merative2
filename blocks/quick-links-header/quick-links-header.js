export default function decorate(block) {
  const blockName = block.getAttribute('data-block-name');
  if (!blockName) {
    return;
  }

  [...block.children].forEach((element) => {
    element.classList.add(`${blockName}__inner`);

    // Find all the div elements within the inner content class
    const innerElements = element.querySelectorAll(`.${blockName}__inner div`);

    // Add the class to column and append a number to each of these div elements
    let counter = 1;
    innerElements.forEach((divElement) => {
      const newClass = `${blockName}__col-${counter}`;
      divElement.classList.add(`${blockName}__col`, newClass);
      counter += 1; // Use prefix notation to increment the counter
    });
  });
}
