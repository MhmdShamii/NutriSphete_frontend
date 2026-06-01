import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nutrisphere.app',
  appName: 'NutriSphere',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '531157804784-gfpidaf09bvqmrvtrsb4jep2ke8b6hln.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
