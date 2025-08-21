import './src/i18n';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import {LogBox} from 'react-native';
import 'react-native-gesture-handler';
import {AuthProvider} from './src/provider/AuthProvider';
import {ToastProvider} from 'react-native-toast-notifications';
import {moderateScale} from 'react-native-size-matters';
import {COLORS} from './src/theme/theme';
import {
  handleNotificationNavigation,
  setupNotifications,
} from './src/configuration/firebaseMessaging';
import {getAuth} from '@react-native-firebase/auth';
import {I18nextProvider} from 'react-i18next';
import i18n from './src/i18n';
import {navigationRef} from './src/helper/navigationRef';
import {getMessaging} from '@react-native-firebase/messaging';
import {requestUserPermission} from './src/configuration/notificationPermission';

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  'Non-serializable values were found in the navigation state',
]);

const auth = getAuth();
if (__DEV__) {
  auth.useEmulator('http://127.0.0.1:9099');
}
setupNotifications();

const App = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 2500);

    requestUserPermission();

    return () => clearTimeout(timer);
  }, []);

  const handleInitialNotification = async () => {
    try {
      const remoteMessage = await getMessaging().getInitialNotification();
      if (remoteMessage) {
        console.log('🚀 Opened from quit state:', remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      }
    } catch (error) {
      console.error('Error handling initial notification:', error);
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider
        style={{
          backgroundColor: COLORS.primary,
        }}
        textStyle={{
          fontSize: moderateScale(16),
          color: COLORS.textPrimary,
        }}>
        <AuthProvider>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              handleInitialNotification();
            }}>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ToastProvider>
    </I18nextProvider>
  );
};

export default App;
