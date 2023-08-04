import { MessengerData } from "../messenger";

const dimmableElements =
  ".sidebar, .activitybar, .breadcrumbs, .statusbar, .titlebar, .title.tabs";

const dimmableElementsWholeEditor = ".monaco-workbench";

let focusHandler: {
  onBlur: () => void;
  onFocus: () => void;
} = {
  onBlur: () => {},
  onFocus: () => {},
};

/**
 * This adds the focus handler which dims the editor when the window is not focused
 * @param focusSettings The focus settings
 */
export function addFocusHandler(
  focusSettings: MessengerData["settings"]["focus"]
) {
  // Remove the old listeners
  window.removeEventListener("blur", focusHandler.onBlur);
  window.removeEventListener("blur", focusHandler.onFocus);

  if (!focusSettings.enabled) return; // If focus dimming is not enabled, return

  // Get the dimmable elements based on the settings
  const dimmable = focusSettings.wholeEditor
    ? dimmableElementsWholeEditor
    : dimmableElements;

  // Set the transition
  document.querySelectorAll(dimmable).forEach((element) => {
    (
      element as HTMLElement
    ).style.transition = `opacity ${focusSettings.duration}ms`;
  });

  // Set the opacity when the window is blurred
  focusHandler.onBlur = () => {
    document.querySelectorAll(dimmable).forEach((element) => {
      (element as HTMLElement).style.opacity = `${focusSettings.amount}%`;
    });
  };

  // Set the opacity when the window is focused
  focusHandler.onFocus = () => {
    document.querySelectorAll(dimmable).forEach((element) => {
      (element as HTMLElement).style.opacity = `100%`;
    });
  };

  // Add the new listeners
  window.addEventListener("blur", focusHandler.onBlur);
  window.addEventListener("focus", focusHandler.onFocus);
}
