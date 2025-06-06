import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PoojaListScreen from '../screens/PoojaListScreen';
import AstroServicesScreen from '../screens/AstroServicesScreen';
import EarningsScreen from '../screens/EarningsScreen';
import PoojaRequestScreen from '../screens/PoojaRequestScreen';
import { COLORS } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Imported icons

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
        headerShown: false, 
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={PoojaRequestScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} 
      />
      <Tab.Screen 
        name="PoojaList" 
        component={PoojaListScreen} 
        options={{ 
          title: 'Pooja List', 
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="AstroServices" 
        component={AstroServicesScreen} 
        options={{ 
          title: 'Astro Services', 
          tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> }} 
      />
    </Tab.Navigator>
  );
};

export default AppBottomTabNavigator;