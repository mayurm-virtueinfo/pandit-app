import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import PoojaListScreen from '../screens/PoojaListScreen';
import AstroServicesScreen from '../screens/AstroServicesScreen';
import EarningsScreen from '../screens/EarningsScreen';
import PoojaRequestScreen from '../screens/PoojaRequestScreen';
import {COLORS} from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import PoojaRequestNavigator from './PoojaRequestNavigator';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import PoojaListNavigator from './PoojaListNavigator';
import AstroServiceNavigator from './AstroServiceNavigator';
import EarningsNavigator from './EarningsNavigator';
import HomeNavigator from './HomeStack/HomeStack';
import PujaListNavigator from './PujaListStack/PujaListStack';

export type AppBottomTabParamList = {
  HomeNavigator: undefined;
  PujaListNavigator: undefined;
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
      }}>
      <Tab.Screen
        name="HomeNavigator"
        component={HomeNavigator}
        options={({route}) => ({
          title: 'Home',
          // headerTitle: getHeaderTitle(route), // dynamic title in screen header
          tabBarIcon: ({color, size}) => (
            <Octicons name="home" size={size} color={color} />
          ),
        })}
      />
      <Tab.Screen
        name="PujaListNavigator"
        component={PujaListNavigator}
        options={{
          title: 'Puja List',
          tabBarIcon: ({color, size}) => (
            <FontAwesome name="institution" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AstroServiceNavigator"
        component={AstroServiceNavigator}
        options={{
          title: 'Settings',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EarningsNavigator"
        component={EarningsNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppBottomTabNavigator;
