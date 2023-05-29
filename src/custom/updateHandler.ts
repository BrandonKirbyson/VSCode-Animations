import { CursorAnimation } from "./bonus/cursorAnimation";
import { initTabsHandler } from "./handlers/tabsHandler";
import { Messenger } from "./messenger";
import { createCustomCSS, updateCustomCSS } from "./style";

console.log("VSCode-Animations: Successfully Installed!");

/**
 * This is responsible for updating the css file when it changes
 */
(() => {
  let cursorAnimation: CursorAnimation | null = null; // The cursorAnimation class

  // Create the messenger class
  const messenger = new Messenger({
    onLoad: (data) => {
      createCustomCSS(data.css);

      if (data.settings.cursorAnimation.enabled) {
        cursorAnimation = new CursorAnimation(data.settings.cursorAnimation); // Create a new cursorAnimation with the options
      }
    },
    onUpdate: (data) => {
      updateCustomCSS(data.css);

      if (data.settings.cursorAnimation.enabled) {
        if (!cursorAnimation) {
          cursorAnimation = new CursorAnimation(data.settings.cursorAnimation); // If the cursorAnimation is not defined, create a new one
          console.log("Creating new cursor!");
        }

        cursorAnimation.updateOptions(data.settings.cursorAnimation); // Update the options
      } else {
        if (cursorAnimation) cursorAnimation.destroy(); // Destroy the cursorAnimation
        cursorAnimation = null; // Set the cursorAnimation to null
      }
    },
  });

  // Adding util js functions to the page to help with animations
  initTabsHandler();
})();
