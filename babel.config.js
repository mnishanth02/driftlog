module.exports = (api) => {
  api.cache(true);
  const plugins = [];

  plugins.push("react-native-worklets/plugin");
  // react-native-reanimated/plugin MUST be listed last
  plugins.push("react-native-reanimated/plugin");

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
