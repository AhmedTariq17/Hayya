# Hayya - Your Spiritual Companion

A premium, world-class Islamic mobile application built with React Native and Expo. Features beautiful Apple-inspired design, smooth animations, and comprehensive Islamic content.

## 🌟 Features

### Core Features
- **Prayer Times**: Accurate prayer times based on your location with beautiful countdown timers
- **Qibla Finder**: Interactive compass to find the direction of Kaaba
- **Digital Tasbih**: Smart counter for dhikr with statistics and history
- **99 Names of Allah**: Beautiful presentation of Al-Asma ul-Husna with meanings
- **Holy Quran**: Read and explore the Quran with translations
- **Duas Collection**: Essential daily prayers and supplications
- **Hadith Collection**: Authentic narrations from Sahih sources
- **Islamic Calendar**: Hijri calendar with important Islamic dates

### Premium UI/UX
- ✨ Apple-inspired design system
- 🎨 Premium animations and micro-interactions
- 🌓 Light and dark mode support
- ♿ Full accessibility support (VoiceOver/TalkBack)
- 📱 Adaptive layouts for all screen sizes
- 🎯 Haptic feedback throughout the app
- 🔔 Smart notifications for prayer times

## 🛠 Technical Stack

### Core Technologies
- **React Native** (0.81.4)
- **Expo SDK** (~54.0.13)
- **TypeScript** (~5.9.2)
- **React Navigation** (v7)
- **Reanimated** (v4) for smooth animations

### Key Dependencies
- `expo-location` - GPS location services
- `expo-haptics` - Haptic feedback
- `expo-notifications` - Prayer time notifications
- `react-native-reanimated` - High-performance animations
- `expo-linear-gradient` - Beautiful gradients
- `react-native-svg` - Custom graphics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HayyaApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

5. Run on Android:
```bash
npm run android
```

## 📁 Project Structure

```
HayyaApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── common/          # Common components (buttons, cards, etc.)
│   ├── contexts/            # React contexts (theme, etc.)
│   ├── data/                # Static data (duas, names of Allah)
│   ├── hooks/               # Custom React hooks
│   ├── navigation/          # Navigation configuration
│   ├── screens/             # App screens
│   ├── services/            # API services (prayer times, location)
│   ├── theme/               # Design system (colors, typography, spacing)
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── assets/                  # Images, fonts, icons
├── App.tsx                  # App entry point
└── app.json                 # Expo configuration
```

## 🎨 Design System

### Colors
The app uses a carefully crafted color palette:
- **Primary**: Islamic green (`#2D7E5B`)
- **Secondary**: Premium gold (`#D4AF37`)
- **Accent colors**: Teal, Purple, Coral, Sky
- **Semantic**: Success, Warning, Error, Info

### Typography
iOS-inspired typography scale:
- Large Title: 34px
- Title 1: 28px
- Title 2: 22px
- Body: 17px
- Caption: 12px

### Spacing
Consistent 8pt grid system:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

## 🔧 Development

### Code Quality
- ✅ **TypeScript** for type safety
- ✅ **ESLint** for code linting
- ✅ **Error Boundaries** for crash prevention
- ✅ **React.memo** for performance optimization

### Best Practices
1. All components are fully typed with TypeScript
2. Accessibility labels on all interactive elements
3. Haptic feedback for better UX
4. Optimized re-renders with React.memo
5. Proper error handling throughout

### Adding New Features
1. Create component in `src/components/`
2. Add screen in `src/screens/`
3. Register route in `src/navigation/MainNavigator.tsx`
4. Follow existing design patterns

## ♿ Accessibility

The app is fully accessible:
- Screen reader support (VoiceOver/TalkBack)
- Semantic HTML roles
- Descriptive labels and hints
- Keyboard navigation
- High contrast support

## 🌍 Localization

Currently supports:
- English interface
- Arabic text for Quran, Duas, and Names of Allah
- RTL layout ready

## 📱 Platform Support

- ✅ iOS 13+
- ✅ Android 6.0+
- ✅ Responsive design for all screen sizes
- ✅ Tablet optimized

## 🔐 Permissions

The app requests the following permissions:
- **Location**: For accurate prayer times
- **Notifications**: For prayer time alerts
- **Vibration**: For haptic feedback

## 🐛 Error Handling

- Global error boundary catches crashes
- Graceful fallback UI
- Development error details
- Production error reporting ready

## 🚀 Performance

Optimizations include:
- React.memo on frequently rendered components
- Lazy loading for heavy screens
- Optimized images and assets
- Efficient re-renders
- 60 FPS animations

## 📦 Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Lint
npm run lint
```

## 📄 License

Copyright © 2024. All rights reserved.

## 🤝 Contributing

This is a private project. Please contact the owner for contribution guidelines.

## 📞 Support

For support, please contact: [Your contact info]

## 🙏 Acknowledgments

- Islamic content sourced from authentic sources
- Design inspired by Apple's Human Interface Guidelines
- Built with love for the Muslim community

---

**Made with ❤️ for the Ummah**
