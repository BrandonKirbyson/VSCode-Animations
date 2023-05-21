import * as vscode from "vscode";

/**
 * The status bar item that will be used to send messages to the vscode ui
 */
export const messengerItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100
);

/**
 * Initializes the status bar item
 */
export function initMessenger() {
  messengerItem.text = "";
  messengerItem.accessibilityInformation = {
    label: "Init",
  };
  messengerItem.show();
}

/**
 * Sends a message to the vscode ui with the status bar item as the messenger element
 * @param css The css string to send to the vscode ui
 */
export function sendMessage(css: string) {
  messengerItem.accessibilityInformation = {
    label: css,
  }; //Set the accessibility label to the css string so that the css can be added into vscode
}
