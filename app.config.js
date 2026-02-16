export default {
  expo: {
    name: "GeoDocs",
    slug: "geodocs",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // ⚠️ IMPORTANT: Update this with your computer's IP address for Expo Go on mobile
      // Find your IP: 
      //   Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
      //   Windows: ipconfig | findstr IPv4
      //   Or check Network settings
      // Example: "http://192.168.1.100:3000"
      apiUrl: process.env.API_URL || "http://localhost:3000"
    }
  }
};

