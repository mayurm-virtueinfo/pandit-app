import './src/i18n';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import {
  LogBox,
  AppState,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
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
import {
  initCallKeep,
  setOnAnswerListener,
  setOnEndListener,
} from './src/configuration/callValidation';
import {navigate} from './src/utils/NavigationService';

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  'Non-serializable values were found in the navigation state',
]);

const auth = getAuth();
if (__DEV__) {
  auth.useEmulator('http://192.168.1.20:9099');
}
setupNotifications();

const App = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 2500);

    requestUserPermission();

    initCallKeep();

    setOnAnswerListener(({callUUID, payload}) => {
      navigate('Main', {
        screen: 'AppBottomTabNavigator',
        params: {
          screen: 'HomeNavigator',
          params: {
            screen: 'ChatScreen',
            params: {
              booking_id: payload?.booking_id,
              user_id: payload?.sender_id,
              other_user_name: payload?.callerName || 'Call',
              videocall: true,
              callUUID,
              incomingMeetingUrl: payload?.meeting_url,
              ...payload,
            },
          },
        },
      });
    });

    setOnEndListener(({callUUID}) => {
      navigate('Main', {
        screen: 'AppBottomTabNavigator',
        params: {
          screen: 'HomeNavigator',
          params: {
            screen: 'ChatScreen',
            params: {
              endCall: true,
              callUUID,
            },
          },
        },
      });
    });

    return () => clearTimeout(timer);
  }, []);

  const {CustomAppState} = NativeModules;

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(CustomAppState);
    const subscription = eventEmitter.addListener(
      'CustomAppStateChange',
      event => {
        console.log('Custom App State:', event.state);
        if (event.state === 'onPause') {
          console.log('App is inactive (paused)');
        } else if (event.state === 'onStop') {
          console.log('App is in background');
        } else if (event.state === 'onStart') {
          console.log('App is active');
        }
      },
    );

    return () => subscription.remove();
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
