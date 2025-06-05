import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { NavigatorScreenParams } from '@react-navigation/native';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'; // Added for custom content

// Navigators
import AppBottomTabNavigator, { AppBottomTabParamList } from './BottomTabNavigator';

// Screens
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EarningsScreen from '../screens/EarningsScreen'; // Also in BottomTab, can be reused or a different one
import LedgersScreen from '../screens/LedgersScreen';
import HelpAndSupportScreen from '../screens/HelpAndSupportScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import { useAuth } from './RootNavigator'; // Import useAuth

export type AppDrawerParamList = {
  MainApp: NavigatorScreenParams<AppBottomTabParamList>; // Main content with Bottom Tabs
  Profile: undefined;
  Settings: undefined;
  DrawerEarnings: undefined; // Naming it differently if it's a distinct screen from tab
  Ledgers: undefined;
  HelpAndSupport: undefined;
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  AboutUs: undefined;
  ContactUs: undefined;
  // Logout is handled via custom content, not a screen
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

const CustomDrawerContent = (props: any) => {
  const { signOut } = useAuth(); // Get signOut from context

  const handleLogoutPress = () => {
    signOut();
    // Navigation to Auth stack is handled by RootNavigator's conditional rendering
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <DrawerItem
          label="Logout"
          onPress={handleLogoutPress} // Use the new handler
          labelStyle={styles.logoutLabel}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const AppDrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      initialRouteName="MainApp"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveTintColor: '#6200ee',
        drawerInactiveTintColor: 'gray',
      }}
    >
      <Drawer.Screen
        name="MainApp"
        component={AppBottomTabNavigator}
        options={{ title: 'Home Dashboard' }} // Title for the drawer item
      />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="DrawerEarnings" component={EarningsScreen} options={{ title: 'Earnings' }} />
      <Drawer.Screen name="Ledgers" component={LedgersScreen} />
      <Drawer.Screen name="HelpAndSupport" component={HelpAndSupportScreen} options={{ title: 'Help & Support' }} />
      <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <Drawer.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ title: 'Terms & Conditions' }} />
      <Drawer.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About Us' }} />
      <Drawer.Screen name="ContactUs" component={ContactUsScreen} options={{ title: 'Contact Us' }} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: 'auto', // Pushes logout to the bottom
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  logoutLabel: {
    fontWeight: 'bold',
    color: '#dc3545', // A reddish color for logout
  },
});

export default AppDrawerNavigator;
