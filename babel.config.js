module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo auto-includes the react-native-worklets (Reanimated) plugin.
  return {
    presets: ['babel-preset-expo'],
  };
};
