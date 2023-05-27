/**
 * Waits for an element to be added to the document and then runs the provided function
 * @param selector The selector to wait for
 * @param fn The function to run when the element is added
 */
export function waitForElement(
  selector: string,
  fn: (element: Element) => void,
  rate = 10
) {
  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      fn(element);
    }
  }, rate);
}

/**
 * Waits for an element to be added to the document and then runs the provided function
 * @param selector The selector to wait for
 * @param fn The function to run when the element is added
 */
export function waitForElements(
  selector: string,
  fn: (element: NodeListOf<Element>) => void,
  rate = 10
) {
  const interval = setInterval(() => {
    const element = document.querySelectorAll(selector);
    if (element.length > 0) {
      clearInterval(interval);
      fn(element);
    }
  }, rate);
}
