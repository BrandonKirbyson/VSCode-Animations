declare const vscode: any; //Declare vscode for ts to not complain (actual vscode is part of api and is not available in this context)
declare const document: any; //Declare document for ts to not complain (actual document is not available in this context)

/**
 * This is responsible for updating the css file when it changes
 */
(() => {
  const styleID = "VSCode-Animations-custom-css";

  const interval = setInterval(() => {
    if (!vscode.context.configuration()) return; //If vscode is not loaded, return
    clearInterval(interval); //Clear the interval
    const fs = require("fs");

    //vscode.context.configuration().profiles.profile.extensionsResource.path;
    const cssPath =
      vscode.context.configuration().extensionDevelopmentPath[0] + "/style.css";

    const css = fs.readFileSync(cssPath, "utf-8");

    createCustomCSS(css);

    fs.watch(cssPath, (eventType: string, filename: string) => {
      //If the event type is not change, return
      if (eventType !== "change") {
        console.warn("UpdateHandler: eventType not change");
        return;
      }

      //If the filename is not provided, return
      if (!filename) {
        console.warn("UpdateHandler: filename not provided");
      }

      //Read the css file
      fs.readFile(cssPath, "utf-8", (err: any, data: string) => {
        if (err) {
          //If an error ocurred, log it and return
          console.error(
            "UpdateHandler: An error ocurred reading the file :" + err.message
          );
          return;
        }
        //Update the css
        updateCustomCSS(data);
      });
    });
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
