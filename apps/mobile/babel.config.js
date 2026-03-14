module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@cs/music-engine': '../../packages/music-engine/src/index.ts',
            '@cs/store': '../../packages/store/src/index.ts',
            '@cs/locales': '../../packages/locales/src/index.ts',
            '@cs/supabase': '../../packages/supabase/src/index.ts',
          },
        },
      ],
    ],
  };
};
