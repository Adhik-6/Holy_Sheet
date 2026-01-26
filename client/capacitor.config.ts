import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chiggazz.holy_sheets',
  appName: 'Holy Sheets',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000',
    cleartext: true
  },
};

export default config;
