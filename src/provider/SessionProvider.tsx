import React, {useState, useEffect, useContext, createContext} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {registerApiSessionHandler} from '../api/apiDev';
import {useAuth} from './AuthProvider';
import {navigationRef} from '../helper/navigationRef';
import {COLORS} from '../theme/theme';
import {useTranslation} from 'react-i18next';

const SessionContext = createContext<any>(null);

export const SessionProvider = ({children}: any) => {
  const [sessionExpired, setSessionExpired] = useState(false);
  const {signOutApp} = useAuth();

  const {t} = useTranslation();

  const handleSessionExpire = async () => {
    setSessionExpired(true);
  };

  const handleLoginAgain = async () => {
    setSessionExpired(false);
    await signOutApp();
    if (navigationRef.isReady()) {
      navigationRef.reset({index: 0, routes: [{name: 'Auth'}]});
    }
  };

  useEffect(() => {
    registerApiSessionHandler(handleSessionExpire);
  }, []);

  return (
    <SessionContext.Provider value={{handleSessionExpire}}>
      {children}
      <Modal visible={sessionExpired} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>{t('session_expire')}</Text>
            <Text style={styles.msg}>{t('session_expire_message')}</Text>
            <TouchableOpacity style={styles.btn} onPress={handleLoginAgain}>
              <Text style={styles.btnText}>{t('login_again')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  title: {fontSize: 20, fontWeight: '700', marginBottom: 10},
  msg: {fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20},
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  btnText: {color: COLORS.white, fontSize: 16, fontWeight: '600'},
});
