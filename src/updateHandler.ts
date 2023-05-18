declare const vscode: any; //Declare vscode for ts to not complain (actual vscode is part of api and is not available in this context)
declare const document: any; //Declare document for ts to not complain (actual document is not available in this context)

console.log("UpdateHandler: Enabled");

/**
 * This is responsible for updating the css file when it changes
 */
(() => {
  const styleID = "VSCode-Animations-custom-css";

  const interval = setInterval(() => {
    if (!vscode.context.configuration()) return; //If vscode is not loaded, return
    clearInterval(interval); //Clear the interval
    const fs = require("fs");

    let extensionPath: string;
    //If the extension is being developed
    if (
      vscode.context.configuration().extensionDevelopmentPath &&
      vscode.context.configuration().extensionDevelopmentPath.length > 0
    ) {
      extensionPath =
        vscode.context.configuration().extensionDevelopmentPath[0]; //Get the path to this extension
    } else {
      //Get the list of extensions
      const extensions = JSON.parse(
        fs.readFileSync(
          vscode.context.configuration().profiles.profile.extensionsResource
            .path, //The path to the extensions json file
          "utf-8"
        )
      );

      //Finds the index of this extension in the list of extensions
      const index = extensions.findIndex(
        (extension: any) =>
          extension.identifier.id === "brandonkirbyson.vscode-animations"
      );

      extensionPath = extensions[index].location.fsPath; //Get the path to this extension
    }

    console.log("UpdateHandler: extensionPath: " + extensionPath);
    const cssPath = extensionPath + "/animations.css";

    createCustomCSS(fs.readFileSync(cssPath, "utf-8"));

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
