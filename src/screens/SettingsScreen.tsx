import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import {useAuth} from '../navigation/RootNavigator';
import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../provider/AuthProvider';
import { changeLanguage } from '../i18n';
import { useTranslation } from 'react-i18next';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '../theme/theme';

// Assuming useAuth provides a signOut function of type () => void
// If RootNavigator.tsx exports an AuthContextType, it would be better to use it here.
// For example: const { signOut }: AuthContextType = useAuth();

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { signOutApp } = useAuth();

  const handleSignOut = () => {
    signOutApp();
  };

  const handleEnglish = () => {
    changeLanguage('en');
  };
  const handleHindi = () => {
    changeLanguage('hi');
  };
  return (
    <>
      <CustomHeader showBackButton={false} showMenuButton={true} title={'Settings'} />
      <View style={styles.container}>
        <Text style={styles.title}>Settings Screen</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>


        <View style={styles.containerLanguageDemo}>
          <Text style={styles.languageText}>{t('settings')}</Text>
          <Text style={styles.languageText}>{t('welcome')}</Text>
          <Text style={styles.languageText}>{t('login')}</Text>
          <Text style={styles.languageText}>{t('language')}</Text>
          <TouchableOpacity style={styles.languageChangeButton} onPress={handleEnglish}>
            <Text style={styles.signOutText}>Change to English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageChangeButton} onPress={handleHindi}>
            <Text style={styles.signOutText}>Change to Hindi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>

  );
};

const styles = StyleSheet.create({
  containerLanguageDemo: {
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: 'white',
    marginTop: moderateScale(20),
    borderColor: 'black',
    borderWidth: moderateScale(1),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  languageChangeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  languageText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
