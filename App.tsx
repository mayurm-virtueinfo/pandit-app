import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import { LogBox } from 'react-native';

// It's good practice to import gesture handler at the top
import 'react-native-gesture-handler';

// Ignore specific warnings if necessary, for example, from reanimated
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  "Non-serializable values were found in the navigation state", // This can happen with some params
]);


const App = () => {
  useEffect(() => {
    // Hide splash screen after a delay
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
};

export default App;
