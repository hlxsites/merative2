/**
 * set max-width to element
 * @param {Element[]} elements Child nodes in which class of respective max-width add
 * @param {string} className The class name for respective max-width
 */
function setMaxWidth(elements, className) {
  [...elements].forEach((ele) => {
    ele.classList.add(className);
  });
}

/**
 * decorates the stat
 * @param {Element} block The stat block element
 */
export default async function decorate(block) {
  const statParent = block.firstElementChild;
  const childLenth = statParent.children.length;

  if (childLenth === 3) {
    setMaxWidth(statParent.children, 'max-width-third');
  } else if (childLenth === 2) {
    setMaxWidth(statParent.children, 'max-width-half');
  } else {
    statParent.classList.add('no-effect');
  }
}
