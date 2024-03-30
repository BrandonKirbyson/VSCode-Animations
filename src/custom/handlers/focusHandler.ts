import { MessengerData } from "../messenger";

let focusHandler: {
  onBlur: () => void;
  onFocus: () => void;
} = {
  onBlur: () => {},
  onFocus: () => {},
};

export enum FocusDimMode {
  window = "Full Window",
  editor = "Everything But Editor",
  terminal = "Everything But Terminal",
  editorAndTerminal = "Everything But Editor and Terminal",
  none = "None",
}

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

  const alwaysDimmable =
    ".minimap, .decorationsOverviewRuler, .composite.title, .title.tabs, .editor-container:has(.settings-editor)";

  let dimmable = "";
  switch (focusSettings.mode) {
    case FocusDimMode.window:
      dimmable = ".monaco-workbench";
      break;
    case FocusDimMode.editor:
      dimmable = `.split-view-view:not(:has(.editor-instance > .monaco-editor, .editor-instance > .monaco-diff-editor)), .split-view-view:has(> .terminal-outer-container), ${alwaysDimmable}`;
      break;
    case FocusDimMode.terminal:
      dimmable = `.split-view-view:not(:has(.terminal)), ${alwaysDimmable}`;
      break;
    case FocusDimMode.editorAndTerminal:
      dimmable = `.split-view-view:not(:has(.editor-instance > .monaco-editor, .editor-instance > .monaco-diff-editor)):not(:has(.terminal)), ${alwaysDimmable}`;
      break;
    case FocusDimMode.none:
      return;
  }

  const getElements = () => {
    let elements = Array.from(document.querySelectorAll(dimmable));
    elements = elements.filter((element) => {
      return !elements.some((otherElement) => {
        return otherElement.contains(element) && otherElement !== element;
      });
    });
    return elements;
  };

  // Set the transition
  getElements().forEach((element) => {
    (
      element as HTMLElement
    ).style.transition = `opacity ${focusSettings.duration}ms`;
  });

  // Set the opacity when the window is blurred
  focusHandler.onBlur = () => {
    getElements().forEach((element) => {
      (element as HTMLElement).style.opacity = `${focusSettings.amount}%`;
    });
  };

  // Set the opacity when the window is focused
  focusHandler.onFocus = () => {
    getElements().forEach((element) => {
      (element as HTMLElement).style.opacity = `100%`;
    });
  };

  // Add the new listeners
  window.addEventListener("blur", focusHandler.onBlur);
  window.addEventListener("focus", focusHandler.onFocus);
}
