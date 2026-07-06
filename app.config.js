module.exports = {
  expo: {
    name: 'Rotina App',
    slug: 'rotina-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/rotina-app-icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/rotina-app-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.eduardobaptista.rotinaapp',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/rotina-app-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.eduardobaptista.rotinaapp',
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-font', 'expo-secure-store', '@react-native-community/datetimepicker'],
  },
};
