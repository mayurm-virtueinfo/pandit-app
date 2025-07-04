import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import {useTranslation} from 'react-i18next';

const TermsAndConditionsScreen: React.FC = () => {
  const {t, i18n} = useTranslation();

  return (
    <>
      <CustomHeader
        showBackButton={false}
        showMenuButton={true}
        title={t('terms_and_conditions')}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Terms & Conditions Screen</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TermsAndConditionsScreen;
