import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import HomeNavigator from './HomeStack/HomeStack';
import PujaListNavigator from './PujaListStack/PujaListStack';
import ProfileNavigator from './ProfileStack/ProfileStack';
import SettingsNavigator from './SettingsStack/SettingsStack';
import {useTranslation} from 'react-i18next';

export type AppBottomTabParamList = {
  HomeNavigator: undefined;
  PujaListNavigator: undefined;
  SettingsNavigator: undefined;
  ProfileNavigator: undefined;
};

const Tab = createBottomTabNavigator<AppBottomTabParamList>();

const AppBottomTabNavigator: React.FC = () => {
  const {t} = useTranslation();
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
          title: t('home'),
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
          title: t('pooja_list'),
          tabBarIcon: ({color, size}) => (
            <FontAwesome name="institution" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsNavigator"
        component={SettingsNavigator}
        options={{
          title: t('settings'),
          tabBarIcon: ({color, size}) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileNavigator"
        component={ProfileNavigator}
        options={{
          title: t('profile'),
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppBottomTabNavigator;
