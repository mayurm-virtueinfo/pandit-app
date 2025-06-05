import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PoojaListScreen from '../screens/PoojaListScreen';
import AstroServicesScreen from '../screens/AstroServicesScreen';
import EarningsScreen from '../screens/EarningsScreen';
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
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="PoojaList" component={PoojaListScreen} options={{ title: 'Pooja List' }} />
      <Tab.Screen name="AstroServices" component={AstroServicesScreen} options={{ title: 'Astro Services' }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
    </Tab.Navigator>
  );
};

export default AppBottomTabNavigator;