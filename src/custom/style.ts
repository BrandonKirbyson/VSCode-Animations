export const styleID = "VSCode-Animations-custom-css";

/**
 * Creates the custom css element and inserts it into the document
 */
export function createCustomCSS(css: string) {
  const styleElement = document.createElement("style");
  styleElement.id = styleID;

  styleElement.textContent = css;

  document.body.insertAdjacentElement("afterbegin", styleElement);
}

/**
 * Updates the custom css element with the provided new css
 * @param css The css to update the custom css with
 */
export function updateCustomCSS(css: string) {
  const styleElement = document.querySelector(`#${styleID}`);

  //If the style element does not exist, create it
  if (!styleElement) {
    createCustomCSS(css);
    return;
  }

  if (styleElement.textContent === css) return; //If the css is the same, return

  styleElement.textContent = css;
}
