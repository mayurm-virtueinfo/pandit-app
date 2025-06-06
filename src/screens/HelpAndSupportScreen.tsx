import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomHeader from '../components/CustomHeader';

const HelpAndSupportScreen: React.FC = () => {
  return (
    <>
    <CustomHeader showBackButton={false} showMenuButton={true} title={'Help & Support'}/>
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