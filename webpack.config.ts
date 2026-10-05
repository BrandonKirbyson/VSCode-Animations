import type { Configuration } from "webpack";

const path = require("path");

const extensionConfig: Configuration = {
  target: "node",
  mode: "none",

  entry: {
    extension: "./src/extension.ts",
    updateHandler: "./src/custom/updateHandler.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  // devtool: "nosources-source-map",
  devtool: false,
  infrastructureLogging: {
    level: "log",
  },
};
module.exports = [extensionConfig];
