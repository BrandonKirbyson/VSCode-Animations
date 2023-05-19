import * as vscode from "vscode";

/**
 * Generates the root css file
 * @param context The extension context
 */
export function generateCSSFile(context: vscode.ExtensionContext) {
  const cssDirectory = context.extensionPath + "/dist/css/"; //The path to the css directory

  //Gets the updated css
  getUpdatedCSS(context, cssDirectory).then((css) => {
    //Writes or creates the root css file with the updated css
    vscode.workspace.fs.writeFile(
      vscode.Uri.file(context.extensionPath + "/animations.css"), //The path to the root css file
      Buffer.from(css) //Converts the string to a buffer
    );
  });
}

/**
 * Empties the root css file
 * @param context The extension context
 */
export function emptyCSSFile(context: vscode.ExtensionContext) {
  vscode.workspace.fs.writeFile(
    vscode.Uri.file(context.extensionPath + "/animations.css"), //The path to the root css file
    Buffer.from("") //Converts the string to a buffer
  );
}

/**
 * Gets the combined CSS content from the css files
 * @param cssFiles The css files to combine
 * @param cssRoot The root directory of the css files
 * @returns The combined CSS content as a string
 */
export async function getCSSFile(
  cssFilePath: `${string}.css`,
  cssRoot: string
): Promise<string> {
  let css: string = "";
  try {
    await vscode.workspace.fs
      .readFile(vscode.Uri.file(cssRoot + cssFilePath)) //Reads the file
      .then((data) => (css += data.toString())); //Adds the content to the css string
  } catch (error) {
    console.error("Error reading css file", error);
  }
  return css;
}

/**
 * Gets the combined CSS content from the css files determin
 * @param context The extension context
 * @param cssRoot The root directory of the css files
 * @returns The combined CSS content as a string
 */
export async function getUpdatedCSS(
  context: vscode.ExtensionContext,
  cssRoot: string
): Promise<string> {
  let css: string = "";
  css += await getCSSFile("Default-Transitions.css", cssRoot); //Adds the default transitions css file

  const config = vscode.workspace.getConfiguration("animations"); //Extension settings

  /**
   * Adds all enum settings to the css string
   */
  for (const key of ["Command-Palette", "Tabs", "Files"]) {
    const setting = config.get(key) as string;
    if (setting !== "None") {
      css += await getCSSFile(`${key}/${setting}.css`, cssRoot);
    }
  }

  /**
   * Adds all boolean settings to the css string
   */
  for (const key of ["Smooth-Windows"]) {
    if (config.get(key) as boolean) {
      css += await getCSSFile(`Misc/${key}.css`, cssRoot);
    }
  }

  return css;
}
