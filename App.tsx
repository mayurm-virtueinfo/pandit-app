import './src/i18n'; // ✅ import BEFORE anything else
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import {LogBox} from 'react-native';

// It's good practice to import gesture handler at the top
import 'react-native-gesture-handler';
import { AuthProvider } from './src/provider/AuthProvider';
import { ToastProvider } from 'react-native-toast-notifications';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from './src/theme/theme';
import { registerNotificationListeners, requestUserPermission } from './src/configuration/firebaseMessaging';

// Ignore specific warnings if necessary, for example, from reanimated
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  'Non-serializable values were found in the navigation state', // This can happen with some params
]);
// import { getApp } from '@react-native-firebase/app';
// // import { getReactNativePersistence } from 'firebase/auth/react-native';
// import { initializeAuth } from '@react-native-firebase/auth';

// // Export auth instance
// const app = getApp();

// export const firebaseAuth = initializeAuth(app);
import { getAuth } from '@react-native-firebase/auth';

// Connect to emulator (do this ONCE at app startup)
const auth = getAuth();
if (__DEV__) {
  auth.useEmulator('http://127.0.0.1:9099'); // or 'http://localhost:9099'
}
const App = () => {
  useEffect(() => {
    // Hide splash screen after a delay
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 2500); // Show splash for 2.5 seconds

    requestUserPermission();
    registerNotificationListeners();

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <ToastProvider
          style={{
            // borderRadius: 20,
            backgroundColor: COLORS.primary,
            // borderWidth: 1,
            // borderColor: Colors.tertiaryGrey,
          }}
          textStyle={{
            // fontFamily: fonts.nunitoRegular,
            fontSize: moderateScale(16),
            color: COLORS.textPrimary,
          }}
          // icon={<SVGIcon iconType={SvgIconTypes.IcTick} />}
        >
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
    </ToastProvider>
  );
};

export default App;
