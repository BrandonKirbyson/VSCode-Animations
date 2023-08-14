import * as vscode from "vscode";

/**
 * The minimum version of this extension that the user must have installed via custom injection
 */
const minHandlerVersion = "1.0.14";

/**
 * Checks if the user has the minimum version of this extension installed via custom injection
 * @param v1 A version number to compare
 * @param v2 A version number to be compared to
 * @returns
 */
function isAllowedVersion(version: string) {
  const v1 = version.split(".");
  const v2 = minHandlerVersion.split(".");
  for (let i = 0; i < v1.length; i++) {
    const n1 = parseInt(v1[i]);
    const n2 = parseInt(v2[i]);
    if (n1 > n2) return true;
    if (n1 < n2) return false;
  }
  return true;
}

/**
 * Adds the js filepath to the list of imports in the settings.json file for the Custom CSS and JS Loader extension
 * @param path The path to the root js file
 */
export function addToConfig(path: string): Thenable<boolean> {
  const config = vscode.workspace.getConfiguration();
  let customImports = config.get<string[]>("vscode_custom_css.imports"); //Get the current list of imports

  if (customImports && customImports.length > 0) {
    const regex = /brandonkirbyson\.vscode-animations-\d+\.\d+\.\d+/; //Regex to match the version number in the extension id
    //Loop through the list of imports
    for (let i = 0; i < customImports.length; i++) {
      const match = customImports[i].match(regex); //Get the version number from the extension id using the regex
      if (match && match.length > 0) {
        const version = match[0].split("-")[match[0].split("-").length - 1]; //Get the version number from the extension id
        if (isAllowedVersion(version)) {
          return Promise.resolve(false); //If the user has the minimum version installed, return false
        }
      }
    }
  }

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
