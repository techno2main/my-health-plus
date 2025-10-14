import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9b28bf5c364248d399e87202aad720d8',
  appName: 'health-plus',
  webDir: 'dist',
  server: {
    url: 'https://9b28bf5c-3642-48d3-99e8-7202aad720d8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
