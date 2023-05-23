import * as vscode from "vscode";

/**
 * Adds the js filepath to the list of imports in the settings.json file for the Custom CSS and JS Loader extension
 * @param path The path to the root js file
 */
export function addToConfig(path: string): Thenable<boolean> {
  const config = vscode.workspace.getConfiguration();
  let customImports = config.get<string[]>("vscode_custom_css.imports"); //Get the current list of imports

  if (customImports) customImports = removeOldConfigPaths(path, customImports); //Remove any old paths from the list

  //If the path is added, this will be set to true
  let pathAdded = false;

  //If the list exists and the root CSS file is not already in the list
  if (customImports && !customImports.includes(path)) {
    customImports.push(path); //Add the root CSS file to the list
    pathAdded = true;
  }
  return config
    .update(
      //Update the list of imports
      "vscode_custom_css.imports",
      customImports,
      vscode.ConfigurationTarget.Global
    )
    .then(() => pathAdded); //Update the list of imports and returns if the path was added or not
}

/**
 * Removes any old paths from the list of imports in the settings.json file for the Custom CSS and JS Loader extension
 * @param currentPath The current path to the root js file
 * @param configPaths The list of paths in the settings.json file for the Custom CSS and JS Loader extension
 * @returns The list of paths with any old paths removed
 */
function removeOldConfigPaths(currentPath: string, configPaths: string[]) {
  const endOfPath = "/dist/updateHandler.js";
  const endOfPathDev = "VSCode-Animations/dist/updateHandler.js";
  let cleanedConfigPaths: string[] = [];
  for (let i = 0; i < configPaths.length; i++) {
    const path = configPaths[i];
    if (path === currentPath) cleanedConfigPaths.push(path); //If the path is the current path, keep it

    if (
      (path.substring(path.length - endOfPath.length) === endOfPath || //If path ends with /dist/updateHandler.js
        path.substring(path.length - endOfPathDev.length) === endOfPathDev) && //If path ends with VSCode-Animations/dist/updateHandler.js
      (path.includes("VSCode-Animations") ||
        path.includes("brandonkirbyson.vscode-animations")) //If path contains reference to VSCode-Animations
    )
      continue;

    cleanedConfigPaths.push(path); //Keep anything that wasn't filtered out
  }
  console.log("Config paths", cleanedConfigPaths);
  return cleanedConfigPaths;
}

/**
 * Removes the js filepath from the list of imports in the settings.json file for the Custom CSS and JS Loader extension
 * @param path The path to the root js file
 */
export function removeFromConfig(path: string): Thenable<void> {
  const config = vscode.workspace.getConfiguration();
  const customCssImports = config.get<string[]>("vscode_custom_css.imports"); //Get the current list of imports
  if (customCssImports) removeOldConfigPaths(path, customCssImports);
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
