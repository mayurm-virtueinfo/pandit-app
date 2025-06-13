import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import RootNavigator, {AuthProvider} from './src/navigation/RootNavigator';
import {LogBox} from 'react-native';

// It's good practice to import gesture handler at the top
import 'react-native-gesture-handler';

// Ignore specific warnings if necessary, for example, from reanimated
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  'Non-serializable values were found in the navigation state', // This can happen with some params
]);
import { getApp } from '@react-native-firebase/app';
// import { getReactNativePersistence } from 'firebase/auth/react-native';
import { initializeAuth } from '@react-native-firebase/auth';

// Export auth instance
const app = getApp();

export const firebaseAuth = initializeAuth(app);

const App = () => {
  useEffect(() => {
    // Hide splash screen after a delay
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
