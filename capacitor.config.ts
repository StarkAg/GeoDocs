import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.ribil.app',
  appName: 'Ribil',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
