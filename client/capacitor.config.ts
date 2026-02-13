import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chiggazz.holy_sheets',
  appName: 'Holy Sheets',
  webDir: 'out', // This points to your static build folder
  
  // ❌ DELETE or COMMENT OUT this entire block for Production!
  /* server: {
    androidScheme: 'https',
    url: 'http://localhost:3000',
    cleartext: true
  },
  */
};

export default config;