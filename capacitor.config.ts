import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.doppelwriter.app',
  appName: 'DoppelWriter',
  server: {
    url: 'https://doppelwriter.com',
    cleartext: false,
  },
  ios: {
    scheme: 'DoppelWriter',
  },
};

export default config;
