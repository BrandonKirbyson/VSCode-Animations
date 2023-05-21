declare const vscode: any; //Declare vscode for ts to not complain (actual vscode is part of api and is not available in this context)
declare const document: any; //Declare document for ts to not complain (actual document is not available in this context)
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const MutationObserver: any;

console.log("UpdateHandler: Enabled");

/**
 * This is responsible for updating the css file when it changes
 */
(() => {
  const styleID = "VSCode-Animations-custom-css";

  const interval = setInterval(() => {
    const statusBarItem = document.getElementById(
      "BrandonKirbyson.vscode-animations"
    );

    if (!statusBarItem) return;

    clearInterval(interval); //Clear the interval

    const observer = new MutationObserver((mutations: any) => {
      mutations.forEach(function (mutation: any) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "aria-label"
        ) {
          const newCSS = mutation.target.getAttribute("aria-label");
          if (newCSS) {
            updateCustomCSS(newCSS);
          }
        }
      });
    });
    observer.observe(statusBarItem, {
      attributes: true, //Configure it to listen to attribute changes
    });

    // createCustomCSS(fs.readFileSync(cssPath, "utf-8"));
  }, 10);

  /**
   * Creates the custom css element and inserts it into the document
   */
  function createCustomCSS(css: string) {
    const styleElement = document.createElement("style");
    styleElement.id = styleID;

    styleElement.textContent = css;

    document.body.insertAdjacentElement("afterBegin", styleElement);
  }

  /**
   * Updates the custom css element with the provided new css
   * @param css The css to update the custom css with
   */
  function updateCustomCSS(css: string) {
    const styleElement = document.querySelector(`#${styleID}`);

    //If the style element does not exist, create it
    if (!styleElement) {
      createCustomCSS(css);
      return;
    }

    if (styleElement.textContent === css) return; //If the css is the same, return

    styleElement.textContent = css;
  }
})();
