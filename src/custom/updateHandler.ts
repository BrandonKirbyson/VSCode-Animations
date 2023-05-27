import { CursorAnimation } from "./bonus/cursorAnimation";
import { initTabsHandler } from "./handlers/tabsHandler";
import { Messenger } from "./messenger";
import { createCustomCSS, updateCustomCSS } from "./style";

console.log("VSCode-Animations: Successfully Installed!");

/**
 * This is responsible for updating the css file when it changes
 */
(() => {
  let cursorAnimation: CursorAnimation;

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
        if (!cursorAnimation)
          cursorAnimation = new CursorAnimation(data.settings.cursorAnimation); // If the cursorAnimation is not defined, create a new one

        cursorAnimation.updateOptions(data.settings.cursorAnimation); // Update the options
      } else {
        cursorAnimation.destroy(); // Destroy the cursorAnimation
      }
    },
  });

  // Adding util js functions to the page to help with animations
  initTabsHandler();
})();
