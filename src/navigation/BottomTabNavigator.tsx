import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PoojaListScreen from '../screens/PoojaListScreen';
import AstroServicesScreen from '../screens/AstroServicesScreen';
import EarningsScreen from '../screens/EarningsScreen';
import PoojaRequestScreen from '../screens/PoojaRequestScreen';
import { COLORS } from '../theme/theme';
// Import icons later if needed

export type AppBottomTabParamList = {
  Home: undefined;
  PoojaList: undefined;
  AstroServices: undefined;
  Earnings: undefined;
};

const Tab = createBottomTabNavigator<AppBottomTabParamList>();

const AppBottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Usually handled by Drawer or Stack
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Home" component={PoojaRequestScreen} />
      <Tab.Screen name="PoojaList" component={PoojaListScreen} options={{ title: 'Pooja List' }} />
      <Tab.Screen name="AstroServices" component={AstroServicesScreen} options={{ title: 'Astro Services' }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
    </Tab.Navigator>
  );
};

export default AppBottomTabNavigator;