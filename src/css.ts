import * as vscode from "vscode";

/**
 * Gets the combined CSS content from the css files
 * @param cssFiles The css files to combine
 * @param cssRoot The root directory of the css files
 * @returns The combined CSS content as a string
 */
export async function getUpdatedCSS(
  cssFiles: `${string}.css`[],
  cssRoot: string
): Promise<string> {
  let css: string = "";
  for (const cssFile of cssFiles) {
    try {
      //Reads the file and adds the content to the css string
      await vscode.workspace.fs
        .readFile(vscode.Uri.file(cssRoot + cssFile))
        .then((data) => (css += data.toString()));
    } catch (error) {
      console.error("Error reading css file", error);
    }
  }
  return css;
}
