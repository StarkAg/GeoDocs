# Expo Go Setup - GeoDocs

## Quick Start

The app is now configured to work with Expo Go!

### Starting the Development Server

**Tunnel Mode (Recommended for testing on physical devices):**
```bash
npm run tunnel
```

**Regular Mode:**
```bash
npm start
```

### Testing on Your Device

1. **Install Expo Go** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to the server:**
   - When you run `npm run tunnel`, Expo will generate a QR code
   - Open Expo Go on your phone
   - Scan the QR code (iOS: Camera app, Android: Expo Go app)
   - The app will load on your device!

### Tunnel Mode Benefits

- Works even if your phone and computer are on different networks
- Great for testing on physical devices
- No need to be on the same WiFi

### Other Commands

- `npm start` - Start Expo in LAN mode
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator
- `npm run web` - Start web version

### Troubleshooting

If tunnel mode doesn't work:
1. Make sure you have an Expo account (free): `npx expo login`
2. Try regular mode: `npm start`
3. Make sure your phone and computer are on the same WiFi for LAN mode

### Notes

- The app uses React Navigation which is fully compatible with Expo
- All dependencies are Expo-compatible
- You can test on both iOS and Android devices using the same QR code!

