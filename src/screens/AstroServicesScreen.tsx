import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AstroServicesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Astro Services Screen</Text>
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

export default AstroServicesScreen;