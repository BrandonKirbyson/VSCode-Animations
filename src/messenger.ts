import * as vscode from "vscode";
import { MessengerData } from "./custom/messenger";

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
    label: "",
  };
  messengerItem.show();
}

/**
 * Sends a message to the vscode ui with the status bar item as the messenger element
 * @param css The css string to send to the vscode ui
 */
export function sendMessage(data: MessengerData) {
  const content = JSON.stringify(data);
  messengerItem.accessibilityInformation = {
    label: content,
  }; //Set the accessibility label to the css string so that the css can be added into vscode
}

/**
 * Get the messenger data to send
 */
export function getMessengerData(css: string): MessengerData {
  const settings = vscode.workspace.getConfiguration("animations"); //Extension settings

  const data = <MessengerData>{
    settings: {
      cursorAnimation: {
        enabled: settings.get("CursorAnimation"),
        color: (settings.get("CursorAnimationOptions") as any)["Color"],
        cursorStyle: (settings.get("CursorAnimationOptions") as any)[
          "CursorStyle"
        ],
        trailLength: Math.max(
          Math.min(
            (settings.get("CursorAnimationOptions") as any)["TrailLength"],
            100
          ),
          1
        ),
      },
    },
    css: css,
  };

  return data;
}
