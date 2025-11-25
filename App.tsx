import './src/i18n';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
// import SplashScreen from 'react-native-splash-screen';
import { hideSplash } from 'react-native-splash-view';
import RootNavigator from './src/navigation/RootNavigator';
import {
  LogBox,
  Linking,
  Platform,
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import 'react-native-gesture-handler';
import { AuthProvider } from './src/provider/AuthProvider';
import { ToastProvider } from 'react-native-toast-notifications';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from './src/theme/theme';
import {
  handleNotificationNavigation,
  setupNotifications,
} from './src/configuration/firebaseMessaging';
import { getAuth } from '@react-native-firebase/auth';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './src/i18n';
import { navigationRef } from './src/helper/navigationRef';
import { getMessaging } from '@react-native-firebase/messaging';
import { requestUserPermission } from './src/configuration/notificationPermission';
import DeviceInfo from 'react-native-device-info';
import checkVersion from 'react-native-store-version';
import { SessionProvider } from './src/provider/SessionProvider';
import { NetworkProvider } from './src/provider/NetworkProvider';
import Config from 'react-native-config';
import WebSocketWrapper from './src/components/WebSocketWrapper';

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  'Non-serializable values were found in the navigation state',
]);

const auth = getAuth();
if (__DEV__) {
  // auth.useEmulator('http://127.0.0.1:9099');
  auth.useEmulator('http://192.168.1.8:9099');
}
setupNotifications();

const App = () => {
  const { t } = useTranslation();

  const [isUpdateRequired, setIsUpdateRequired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // SplashScreen.hide();
      hideSplash();
    }, 2500);

    requestUserPermission();
    checkForUpdate();

    console.log('*****************   App Environment   *****************');
    console.log('Loaded ENVIRONMENT :', Config.ENVIRONMENT);
    console.log('Loaded BASE_URL :', Config.BASE_URL);
    console.log('Loaded APP_NAME :', Config.APP_NAME);
    console.log('*******************************************************');

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const getCurrentVersion = async () => {
    try {
      const version = await DeviceInfo.getVersion();
      console.log('Current Version:', version);
      return version;
    } catch (error) {
      console.error('Error getting app version:', error);
      return null;
    }
  };

  const checkForUpdate = async () => {
    try {
      const currentVersion = await getCurrentVersion();
      if (!currentVersion) {
        console.warn('Current version unavailable, skipping update check');
        return;
      }

      const check = await checkVersion({
        version: currentVersion,
        iosStoreURL:
          ' https://apps.apple.com/us/app/pujaguru-vendor/id6747111253',
        androidStoreURL:
          'https://play.google.com/store/apps/details?id=com.panditjiapp.pandit',
      });

      console.log('Check result:', check);
      console.log('Result:', currentVersion);

      if (check.result === 'new') {
        // Show the update modal
        setIsUpdateRequired(true);
      } else {
        setIsUpdateRequired(false);
        console.log('No update required');
      }
    } catch (error) {
      console.error('Error checking version:', error);
      setIsUpdateRequired(false);
    }
    console.log('Modal visibility:', isUpdateRequired);
  };

  const openStore = () => {
    const storeUrl =
      Platform.OS === 'ios'
        ? ' https://apps.apple.com/us/app/pujaguru-vendor/id6747111253'
        : 'https://play.google.com/store/apps/details?id=com.panditjiapp.pandit';
    console.log('Opening store URL:', storeUrl);
    Linking.openURL(storeUrl).catch(err =>
      console.error('Error opening store:', err),
    );
  };

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
      {/* Force Update Modal */}
      <Modal
        visible={isUpdateRequired}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={() => {}} />
        {/* Modal Content */}
        <View style={styles.mainModelContainer}>
          <View style={styles.modalView}>
            {/* <NativeBaseProvider> */}
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t('update_modal_title')}</Text>
              <Text style={styles.modalText}>{t('update_modal_message')}</Text>
              <TouchableOpacity onPress={openStore} style={styles.updateButton}>
                <Text style={styles.updateButtonText}>{t('update_now')}</Text>
              </TouchableOpacity>
            </View>
            {/* </NativeBaseProvider> */}
          </View>
        </View>
      </Modal>
      {/* App content */}
      <NetworkProvider>
        <ToastProvider
          style={{
            backgroundColor: COLORS.primary,
          }}
          textStyle={{
            fontSize: moderateScale(16),
            color: COLORS.textPrimary,
          }}
        >
          <AuthProvider>
            <SessionProvider>
              <WebSocketWrapper>
                <NavigationContainer
                  ref={navigationRef}
                  onReady={() => {
                    handleInitialNotification();
                  }}
                >
                  <RootNavigator />
                </NavigationContainer>
              </WebSocketWrapper>
            </SessionProvider>
          </AuthProvider>
        </ToastProvider>
      </NetworkProvider>
    </I18nextProvider>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  mainModelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: moderateScale(25),
    alignItems: 'center',
    elevation: 5,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginBottom: moderateScale(12),
    textAlign: 'center',
    color: COLORS.primaryTextDark,
  },
  modalText: {
    fontSize: moderateScale(15),
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: moderateScale(20),
  },
  updateButton: {
    backgroundColor: COLORS.primaryBackgroundButton,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(30),
    borderRadius: moderateScale(24),
    marginTop: moderateScale(2),
  },
  updateButtonText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
  },
});

export default App;
