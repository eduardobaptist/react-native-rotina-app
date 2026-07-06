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
      infoPlist: {
        UIBackgroundModes: ['location'],
      },
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
    plugins: [
      'expo-font',
      'expo-secure-store',
      '@react-native-community/datetimepicker',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'O app usa sua localização para avisar quando você chegar perto de uma tarefa.',
          locationAlwaysPermission:
            'O app usa sua localização em segundo plano para avisar quando você chegar perto de uma tarefa.',
          locationWhenInUsePermission:
            'O app usa sua localização para mostrar e selecionar locais das tarefas.',
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/rotina-app-icon.png',
        },
      ],
    ],
  },
};
