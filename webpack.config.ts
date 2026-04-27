const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

const IS_DEV_MODE = process.argv.some(arg => arg.includes("development"));

const BUILD_PATH = path.resolve("dist");

function makeGameConfig(instance: '1' | '2' | '3'): string {
  // html-webpack-plugin encodes both " and ' in template output (&quot;, &#39;).
  // Base64 uses only [A-Za-z0-9+/=] — none of which get HTML-encoded.
  const config = JSON.stringify({
    instance,
    assetBase: `/${instance}/assets/`,
    moneyPath: `/${instance}/money`,
    winPayoutPath: `/${instance}/win-amount`,
    winBiasPath: `/${instance}/win-bias`,
  });
  return Buffer.from(config).toString('base64');
}

module.exports = {
  devtool: IS_DEV_MODE && "cheap-module-source-map",
  entry: {
    game: "./src/index.ts",
    admin: "./src/admin/index.ts",
  },
  output: {
    path: BUILD_PATH,
    filename: "[name].[contenthash:8].js",
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".js", ".vue"],
  },
  module: {
    rules: getLoaders(),
  },
  plugins: getPlugins(),
  devServer: {
    contentBase: BUILD_PATH,
    port: 4200,
    hot: true,
    proxy: {
      "/1/money": "http://localhost:8080",
      "/2/money": "http://localhost:8080",
      "/1/win-amount": "http://localhost:8080",
      "/2/win-amount": "http://localhost:8080",
      "/1/win-bias": "http://localhost:8080",
      "/2/win-bias": "http://localhost:8080",
      "/3/money": "http://localhost:8080",
      "/3/win-amount": "http://localhost:8080",
      "/3/win-bias": "http://localhost:8080",
      "/admin/events": "http://localhost:8080",
    },
  },
  optimization: getOptimizations(),
};

function getOptimizations() {
  return {
    minimize: !IS_DEV_MODE,
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: {
      name: (entrypoint: any) => `runtime-${entrypoint.name}`,
    },
  };
}

function getLoaders() {
  return [
    {
      test: /\.tsx?$/,
      loader: "ts-loader",
      exclude: /node_modules/,
      options: {
        appendTsSuffixTo: [/\.vue$/],
      },
    },
    {
      test: /\.vue$/,
      loader: "vue-loader",
    },
    {
      test: /\.css$/,
      use: ["vue-style-loader", "css-loader"],
    },
  ];
}

function getPlugins() {
  return [
    new VueLoaderPlugin(),
    new HTMLPlugin({
      template: "./src/index.html",
      filename: "1/index.html",
      excludeChunks: ["admin"],
      gameConfig: makeGameConfig('1'),
    }),
    new HTMLPlugin({
      template: "./src/index.html",
      filename: "2/index.html",
      excludeChunks: ["admin"],
      gameConfig: makeGameConfig('2'),
    }),
    new HTMLPlugin({
      template: "./src/index.html",
      filename: "3/index.html",
      excludeChunks: ["admin"],
      gameConfig: makeGameConfig('3'),
    }),
    new HTMLPlugin({
      template: "./src/admin/index.html",
      filename: "admin/index.html",
      excludeChunks: ["game"],
    }),
    new CopyPlugin({
      patterns: [
        { from: "./src/assets/sounds/", to: "1/assets/" },
        { from: "./src/assets/sounds/", to: "2/assets/" },
        { from: "./src/assets/sounds/", to: "3/assets/" },
        { from: "./src/assets/1/", to: "1/assets/" },
        { from: "./src/assets/2/", to: "2/assets/" },
        { from: "./src/assets/3/", to: "3/assets/" },
        { from: "./src/public/", to: "public/" },
        { from: "./src/styles/", to: "styles/" },
      ],
    }),
  ];
}
