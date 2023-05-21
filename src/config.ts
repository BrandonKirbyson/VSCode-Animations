import * as vscode from "vscode";

/**
 * Adds the js filepath to the list of imports in the settings.json file for the Custom CSS and JS Loader extension
 * @param path The path to the root js file
 */
export function addToConfig(path: string): Thenable<boolean> {
  const config = vscode.workspace.getConfiguration();
  const customCssImports = config.get<string[]>("vscode_custom_css.imports"); //Get the current list of imports
  if (customCssImports && !customCssImports.includes(path)) {
    //If the list exists and the root CSS file is not already in the list
    customCssImports.push(path); //Add the root CSS file to the list
    return config
      .update(
        //Update the list of imports
        "vscode_custom_css.imports",
        customCssImports,
        vscode.ConfigurationTarget.Global
      )
      .then(() => true); //Returns the promise of the update with a value of true since it actually updated
  }
  return Promise.resolve(false); //Returns a promise that resolves to false
}

/**
 * Removes the js filepath from the list of imports in the settings.json file for the Custom CSS and JS Loader extension
 * @param path The path to the root js file
 */
export function removeFromConfig(path: string): Thenable<void> {
  const config = vscode.workspace.getConfiguration();
  const customCssImports = config.get<string[]>("vscode_custom_css.imports"); //Get the current list of imports
  if (customCssImports && customCssImports.includes(path)) {
    //If the list exists and the root CSS file is in the list
    customCssImports.splice(customCssImports.indexOf(path), 1); //Remove the root CSS file from the list
    return config.update(
      //Update the list of imports
      "vscode_custom_css.imports",
      customCssImports,
      vscode.ConfigurationTarget.Global
    ); //Returns the promise of the update
  }
  return Promise.resolve();
}
