import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import {useTranslation} from 'react-i18next';

const HelpAndSupportScreen: React.FC = () => {
  const {t} = useTranslation();

  return (
    <>
      <CustomHeader
        showBackButton={false}
        showMenuButton={true}
        title={t('help_and_support')}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Help & Support Screen</Text>
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

export default HelpAndSupportScreen;
