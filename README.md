<p align="center"><img src="./static/logo.png" height=120 /></p>
<p align="center" style="font-weight: bold; font-size: 2rem;">VSCode Animations</p>
<p align="center">
 <img alt="Visual Studio Marketplace Rating (Stars)" src="https://img.shields.io/visual-studio-marketplace/stars/brandonkirbyson.vscode-animations?color=blue&style=for-the-badge">
<img alt="Visual Studio Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/brandonkirbyson.vscode-animations?style=for-the-badge&color=brightgreen">
 <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/brandonkirbyson.vscode-animations?color=blue&style=for-the-badge&color=brightgreen">
 <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/brandonkirbyson/vscode-animations?color=blue&style=for-the-badge">
</p>

<hr />

**VSCode Animations** is a Visual Studio Code extension that adds clean animations to the vscode UI. This is the **first** and **only** extension to add animations to vscode and is a **must-have** because vscode lacks many needed animations that this extension easily provides, not to mention that it also adds **many more** animations and is all **customizable**.

Check out [Discussions](https://github.com/BrandonKirbyson/VSCode-Animations/discussions) for Q&A, suggestions, announcements and more!

> This extension is actively being developed and will gain many more animations over time. Feel free to request any animations you would like to see added!

[Demo Video](https://github.com/BrandonKirbyson/VSCode-Animations/assets/86384607/b6f951e4-b246-4410-89ea-46cbc170ca6a)

Check it out on [github](https://github.com/BrandonKirbyson/VSCode-Animations)!

## Table of Contents

- [Getting Started](#getting-started)
- [Showcase](#showcase)
- [Commands](#commands)
- [Features & Customization](#features--customization)
- [Custom CSS](#custom-css)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Getting Started

1. Install the extension with either of these methods:

   - Get it from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=BrandonKirbyson.vscode-animations)

   - Search for `VSCode Animations` in the extensions tab in the editor

2. Reload the editor when prompted
   Once you have installed and enabled `VSCode Animations`, you should get a popup that prompts you to reload for animations to take effect. Press `Reload` and you will see the animations be applied.

3. You might see a prompt that says `"VSCode installation is corrupt"`.

   - To fix, click the settings icon on the notification and `"Do not show again"`.
   - Unfortunately custom js and css needs to be embedded into vscode's UI itself so vscode will throw a warning.

4. Enjoy the animations!

#### Troubleshooting

If it doesn't seem to work, open the command palette (`cmd + shift + p` or `ctrl + shift + p`) and search for `Reload Custom CSS and JS`.

If it still doesnt work, check [here](#troubleshooting) for more steps.

> **Note:** The extension should prompt you to reload when it gets updated.

##### Dependencies

This extension requires [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css). If you do not have it installed, you will be prompted to install it.

It is an amazing extension that you can learn more about [here](https://github.com/be5invis/vscode-custom-css).

##### Personal Recommendation

If you are using the cursor animations from this extension, I recommend turning cursor blinking to `smooth` because `blink` can make the animation look a little weird.

You can find this setting by searching for `Editor: Cursor Blinking` in settings (`cmd + ,` or `ctrl + ,`).

## Showcase

Here is a little showcase of most of the animations. Sorry for the low quality gifs, they look much better in person!

> **Note:** The gifs are slowed down to show the animations better.

#### Smooth Mode

This is the main feature of the extension. It makes everything super smooth and clean!

<img src="./static/gifs/Smooth-Mode.gif" alt="Smooth-Mode" width="300"/>

#### Command Palette

This is fun and satisfying to use!

<img src="./static/gifs/Command-Palette.gif" alt="Command-Palette" width="300" />

#### Tabs

A must-have for tabs!

<img src="./static/gifs/Tabs.gif" alt="Tabs" width="300"/>

#### Scrolling

Satisfying scrolling if you like that sort of thing!

<img src="./static/gifs/Scrolling.gif" alt="Scrolling" width="100"/>

#### Cursor

A nice little cursor animation, inspired by [this](https://github.com/qwreey75/dotfiles/tree/master/vscode/trailCursorEffect).

<img src="./static/gifs/Cursor.gif" alt="Cursor" width="300"/>

#### Active

A nice little animation for the active item!

<img src="./static/gifs/Active.gif" alt="Active" width="300"/>

#### ...more coming soon!

## Commands

All commands can be found by pressing `cmd + shift + p` or `ctrl + shift + p` and searching for `Animations`.

| Command                               | Description                                                   |
| ------------------------------------- | ------------------------------------------------------------- |
| `Animations: Enable Animations`       | Enables animation                                             |
| `Animations: Disable Animations`      | Disables animations                                           |
| `Animations: Open Animation Settings` | Opens the animations settings                                 |
| `Animations: Open Custom CSS`         | Opens the custom css file in a new tab                        |
| `Animations: Install Animations`      | Installs the animations js handler to vscode, requires reload |

##### Enabling, disabling or customizing animations will instantly take effect. No need to reload!

## Features & Customization

You can customize the animations by running the `Animations: Open Animation Settings` command or opening settings (`cmd + ,` or `ctrl + ,`) and searching for `Animations`. There you can change the animation types, toggle animations, and change animation speeds.

### Types

For customizing each type of animation, you can refer to the list below to see what types of animations are available for each menu item.

| Menu Item         | Options                          |
| ----------------- | -------------------------------- |
| `Command Palette` | `None`, `Scale`, `Slide`, `Fade` |
| `Tabs`            | `None`, `Scale`, `Slide`, `Flip` |
| `Scrolling`       | `None`, `Scale`, `Slide`, `Fade` |
| `Active`          | `None`, `Scale`, `Indent`        |

### Toggles

You can toggle animations on and off for each menu item. This is useful if you want to disable animations for a specific menu item.

- `Smooth Mode`
- `Custom CSS`

### Durations

In settings, you can find the durations setting with is a json object that can apply custom durations to any animations. Reference the lists above to see what animations you can change the duration of.

### Cursor

You can customize the cursor animation by running the `Animations: Open Animation Settings` command or opening settings (`cmd + ,` or `ctrl + ,`) and searching for `Animations`. There you can change the cursor animation style, toggle the cursor animation, and change more of the animtion settings.

#### Cursor Animation Settings

| Setting       | Description                                  | Options                          |
| ------------- | -------------------------------------------- | -------------------------------- |
| `Color`       | The color of the cursor animation            | `Hex` or `RGB` color as `string` |
| `Style`       | The type of animation to use for the cursor. | `Block`, `Line`                  |
| `TrailLength` | The length of the trail behind the cursor.   | `Number`                         |

## Custom CSS

You can customize the animations even further by editing the custom css file. You can open the custom css file by running the `Animations: Open Custom CSS` command or opening settings (`cmd + ,` or `ctrl + ,`) and searching for `Custom CSS`.

To find css selectors to use, you can use the `Developer: Toggle Developer Tools` command to inspect the editor and find the selectors you want to use.

##### The custom css file will live update

## Troubleshooting

If you are having issues with the extension, try these steps:

1. Reload the editor

   - Press `cmd + shift + p` or `ctrl + shift + p` and search for `Reload Window` and press enter

2. Run `Animations: Install Animations` command

   - Press `cmd + shift + p` or `ctrl + shift + p` and search for `Animations: Install Animations` and press enter, then reload when prompted

3. Make sure you have the [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css) extension installed and enabled

4. Enable Custom CSS and JS Extension

   - Press `cmd + shift + p` or `ctrl + shift + p` and search for `Enable Custom CSS and JS` and press enter, then reload when prompted

5. Check the custom css file for errors

   - Press `cmd + shift + p` or `ctrl + shift + p` and search for `Open Custom CSS` and press enter
   - Check to see if you made any errors or possibly overrided other styling

6. Uninstall and reinstall the extension

   - Your settings should be saved but your custom css if you have any will be deleted so make sure to back that up

If you are still having issues, please open an issue.

## Contributing

If you have any suggestions or find an issue, please open an issue, pull request, or start a discussion.

If you would like to request an animation, please open an issue or discussion with the `animation` label and I will try to add it. If you have the css or an example of the animation in action, feel free to include it in the issue or discussion.

<br>

### Enjoy the animations!
