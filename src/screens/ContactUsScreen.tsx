import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import {useTranslation} from 'react-i18next';

const ContactUsScreen: React.FC = () => {
  const {t} = useTranslation();

  return (
    <>
      <CustomHeader
        showBackButton={false}
        showMenuButton={true}
        title={t('contact_us')}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Contact Us Screen</Text>
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

export default ContactUsScreen;
