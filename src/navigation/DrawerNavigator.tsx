import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute, NavigatorScreenParams } from '@react-navigation/native';
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
// import { useAuth } from './RootNavigator'; // Import useAuth
import { COLORS } from '../theme/theme';
import CustomHeader from '../components/CustomHeader';
import AstroRequestScreen from '../screens/AstroRequestScreen';
import AstroRequestNavigator from './AstroRequestNavigator';
import PastBookingsBottomTabNavigator from './PastBookingsBottomTabNavigator';
import AvailabilityScreen from '../screens/AvailabilityScreen';
import EarningsNavigator from './EarningsNavigator';
import { useAuth } from '../provider/AuthProvider';

export type AppDrawerParamList = {
  MainApp: NavigatorScreenParams<AppBottomTabParamList>; // Main content with Bottom Tabs
  PastBooking: NavigatorScreenParams<AppBottomTabParamList>; // Main content with Bottom Tabs
  Profile: undefined;
  Settings: undefined;
  EarningsNavigator: undefined; // Naming it differently if it's a distinct screen from tab
  Availabality:undefined;
  Ledgers: undefined;
  HelpAndSupport: undefined;
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  AboutUs: undefined;
  ContactUs: undefined;
  AstroRequestNavigator: undefined;
  // Logout is handled via custom content, not a screen
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

const CustomDrawerContent = (props: any) => {
  const { signOutApp } = useAuth(); // Get signOut from context

  const handleLogoutPress = () => {
    signOutApp();
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
  // Utility function to get the title based on the current tab route name
  const getHeaderTitle = (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'PoojaRequest';
    console.log('DrawerNavigator.tsx : routeName : ',routeName)
    switch (routeName) {
      case 'PoojaRequest':
        return 'Pooja Requests';
      case 'PoojaRequestNavigator':
        return 'Pooja Requests';
      case 'PoojaList':
        return 'Pooja List';
      case 'AstroServices':
        return 'Astro Services';
      case 'Earnings':
        return 'Earnings';
      default:
        return '---1';
    }
  };
  return (
    <Drawer.Navigator
      initialRouteName="MainApp"
      drawerContent={props => <CustomDrawerContent {...props} />}
      // screenOptions={{
      //   headerStyle: { backgroundColor: '#6200ee' },
      //   headerTintColor: '#fff',
      //   headerTitleStyle: { fontWeight: 'bold' },
      //   drawerActiveTintColor: '#6200ee',
      //   drawerInactiveTintColor: 'gray',
      // }}
      screenOptions={{
        // header: () => <CustomHeader />,
        headerShown: false, // Show header for each screen
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textPrimary,
      }}
    >
      <Drawer.Screen
        name="MainApp"
        component={AppBottomTabNavigator}
        options={({ route }) => ({
          // title: getHeaderTitle(route), // <- dynamic title here
          drawerLabel: 'Home Dashboard', // static label in drawer
          headerTitle: getHeaderTitle(route), // dynamic title in screen header
        })}
      />
      <Drawer.Screen
        name="PastBooking"
        component={PastBookingsBottomTabNavigator}
        options={({ route }) => ({
          // title: getHeaderTitle(route), // <- dynamic title here
          drawerLabel: 'Past Bookings', // static label in drawer
          headerTitle: getHeaderTitle(route), // dynamic title in screen header
        })}
      />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="EarningsNavigator" component={EarningsNavigator} options={{ title: 'Earnings' }} />
      <Drawer.Screen name="Availabality" component={AvailabilityScreen} options={{ title: 'Availabality' }} />
      <Drawer.Screen name="Ledgers" component={LedgersScreen} />
      <Drawer.Screen name="HelpAndSupport" component={HelpAndSupportScreen} options={{ title: 'Help & Support' }} />
      <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <Drawer.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ title: 'Terms & Conditions' }} />
      <Drawer.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About Us' }} />
      <Drawer.Screen name="ContactUs" component={ContactUsScreen} options={{ title: 'Contact Us' }} />
      <Drawer.Screen name="AstroRequestNavigator" component={AstroRequestNavigator} options={{ title: 'Astro Request' }} />
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
