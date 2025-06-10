import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PoojaListScreen from '../screens/PoojaListScreen';
import AstroServicesScreen from '../screens/AstroServicesScreen';
import EarningsScreen from '../screens/EarningsScreen';
import PoojaRequestScreen from '../screens/PoojaRequestScreen';
import { COLORS } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Imported icons
import PoojaRequestNavigator from './PoojaRequestNavigator';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import PoojaListNavigator from './PoojaListNavigator';
import AstroServiceNavigator from './AstroServiceNavigator';
import EarningsNavigator from './EarningsNavigator';

export type AppBottomTabParamList = {
  PoojaRequestNavigator: undefined;
  PoojaListNavigator: undefined;
  AstroServiceNavigator: undefined;
  EarningsNavigator: undefined;
};

const Tab = createBottomTabNavigator<AppBottomTabParamList>();

const AppBottomTabNavigator: React.FC = () => {


  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, 
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="PoojaRequestNavigator" 
        component={PoojaRequestNavigator} 
        options={({ route }) => ({
          title: 'Home', 
          // headerTitle: getHeaderTitle(route), // dynamic title in screen header
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        })}
        
        
      />
      <Tab.Screen
        name="PoojaListNavigator"
        component={PoojaListNavigator}
        options={{ 
          title: 'Pooja List', 
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="AstroServiceNavigator" 
        component={AstroServiceNavigator} 
        options={{ 
          title: 'Astro Services', 
          tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="EarningsNavigator" 
        component={EarningsNavigator} 
        options={{ 
          title: 'Earnings', 
          tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> }} 
      />
    </Tab.Navigator>
  );
};

export default AppBottomTabNavigator;