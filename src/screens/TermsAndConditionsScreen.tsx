import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomHeader from '../components/CustomHeader';

const TermsAndConditionsScreen: React.FC = () => {
  return (
    <>
    <CustomHeader showBackButton={false} showMenuButton={true} title={'Terms & Conditions'}/>
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