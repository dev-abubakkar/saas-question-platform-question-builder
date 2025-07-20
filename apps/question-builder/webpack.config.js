const HtmlWebpackPlugin = require("html-webpack-plugin")
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin")

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  devServer: {
    port: 3001,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("tailwindcss"), require("autoprefixer")],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "questionBuilder",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App",
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: "^18.2.0" },
        "react-dom": { singleton: true, eager: true, requiredVersion: "^18.2.0" },
        "react-router-dom": { singleton: true, eager: true, requiredVersion: "^6.8.0" },
        "react-hook-form": { singleton: true, eager: true, requiredVersion: "^7.48.2" },
        zod: { singleton: true, eager: true, requiredVersion: "^3.22.4" },
        zustand: { singleton: true, eager: true, requiredVersion: "^4.4.7" },
        "@reduxjs/toolkit": { singleton: true, eager: true, requiredVersion: "^2.0.1" },
        "react-redux": { singleton: true, eager: true, requiredVersion: "^9.0.4" },
        axios: { singleton: true, eager: true, requiredVersion: "^1.6.2" },
        clsx: { singleton: true, eager: true, requiredVersion: "^2.0.0" },
        "react-icons": { singleton: true, eager: true, requiredVersion: "^4.12.0" },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
}
