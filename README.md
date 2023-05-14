<p align="center" style="font-weight: bold; font-size: 2rem;">VSCode-Animations</p>

<lr>

## Setup

> **NOTE:** This extension requires [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css).

Once you have downloaded `Custom CSS and JS Loader`, press `ctrl + shift + p` and select `Animations: Enable Animations`

Then press `Restart` when it prompts to reload the window, the changes will be applied and the extension should work properly.

## Screenshots

![hi](https://git)

## Commands

| Command                                      | Description                                                |
| -------------------------------------------- | ---------------------------------------------------------- |
| `Animations: Enable Animations`              | Enables animations, requires reload                        |
| `Animations: Disable Animations`             | Disables animations, requires reload                       |
| `Animations: Open Animation Settings (JSON)` | Opens the animations settings json to customize animations |

## Animation List

| Menu Item         | Desciption       |
| ----------------- | ---------------- |
| `Command Palette` | `Slide`, `Scale` |
| `Primary Sidebar` | `Slide`          |

## Customization

You can customize the animations by opening the `Animations: Open Animation Settings (JSON)` command.

```json
{
  "UI Animations": {
    "Command Palette": {
      "animation": "Scale",
      "duration": 1
    },
    "Primary Sidebar": {
      "animation": "Slide",
      "duration": 1
    },
    "Secondary Sidebar": {
      "animation": "Slide",
      "duration": 1
    }
  }
}
```
