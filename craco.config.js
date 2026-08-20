module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        // Scoped narrowly to Amplify's own packages so this doesn't change
        // resolution for any other .mjs-shipping package in node_modules.
        include: /[\\/]node_modules[\\/]@?aws-amplify/,
        resolve: {
          // Webpack 4's built-in default rule for .mjs files resolves bare imports
          // using mainFields ['browser', 'main'], omitting 'module'. Amplify's
          // packages have no "browser" field, so any .mjs file inside them that
          // imports @aws-amplify/core falls through to 'main' (the CJS build),
          // while non-.mjs files (e.g. App.jsx) resolve the same package via the
          // normal ['browser', 'module', 'main'] default and land on 'module' (the
          // ESM build). That split creates two separate copies of Amplify's config
          // singleton, so configuring Amplify and reading that config disagree on
          // whether it happened. Aligning mainFields here keeps resolution
          // consistent for Amplify's own module graph.
          mainFields: ['browser', 'module', 'main'],
        },
      });
      return webpackConfig;
    },
  },
  babel: {
    presets: [],
    plugins: ['@babel/plugin-proposal-logical-assignment-operators'],
    loaderOptions: (babelLoaderOptions) => {
      babelLoaderOptions.exclude = /node_modules\/(?!(@aws-amplify|aws-amplify|uuid)\/)/;
      return babelLoaderOptions;
    },
  },
};