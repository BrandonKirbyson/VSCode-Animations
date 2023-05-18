# VSCode-Animations

## Setup

Once you have installed and enabled `VSCode-Animations`, you should get a popup that prompts you to reload for animations to take effect. Press `Reload` and you will see the animatiosn be applied.

> **NOTE:** This extension requires [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css).

The `Custom CSS and JS Loader` extension is a dependency of this extension and is required for it to work. If you do not have it installed, you will be prompted to install it.

## Screenshots

> Coming soon upon first release

<!-- ![hi](https://git) -->

## Commands

| Command                               | Description                               |
| ------------------------------------- | ----------------------------------------- |
| `Animations: Enable Animations`       | Enables animations                        |
| `Animations: Disable Animations`      | Disables animations                       |
| `Animations: Open Animation Settings` | Opens the animations settings in settings |

## Customization

You can customize the animations by running the `Animations: Open Animation Settings` command or openning settings (`cmd + ,` or `ctrl + ,`) and searching for `Animations`. There you can change the animation types, toggle animations, and change animation speeds.

### Types

For customizing each type of animation, you can refer to the list below to see what types of animations are available for each menu item.

| Menu Item         | Options                          |
| ----------------- | -------------------------------- |
| `Command Palette` | `None`, `Slide`, `Scale`         |
| `Tabs`            | `None`, `Slide`, `Scale`, `Flip` |

### Toggles

You can toggle animations on and off for each menu item. This is useful if you want to disable animations for a specific menu item.

- `Smooth Windows`

### Durations

In settings, you can find the durations setting with is a json object that can apply custom durations to these animations:

- `Command Palette`
- `Tabs`
- `Smooth Windows`
