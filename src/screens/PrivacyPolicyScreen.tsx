import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Privacy Policy Screen</Text>
    </View>
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

export default PrivacyPolicyScreen;