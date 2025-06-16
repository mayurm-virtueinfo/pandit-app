import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
// import {useAuth} from '../navigation/RootNavigator';
import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../provider/AuthProvider';

// Assuming useAuth provides a signOut function of type () => void
// If RootNavigator.tsx exports an AuthContextType, it would be better to use it here.
// For example: const { signOut }: AuthContextType = useAuth();

const PastBookingSettingScreen: React.FC = () => {
  const {signOutApp} = useAuth();

  const handleSignOut = () => {
    signOutApp();
  };

  return (
    <>
    <CustomHeader showBackButton={false} showMenuButton={true} title={'Settings'}/>
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PastBookingSettingScreen;
