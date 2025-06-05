import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import { NavigatorScreenParams } from '@react-navigation/native'; // Added NavigatorScreenParams
import BottomTabNavigator, {BottomTabParamList} from './BottomTabNavigator'; // Added BottomTabParamList import
import SettingsScreen from '../screens/SettingsScreen';

// Define ParamList for the Drawer Navigator
export type DrawerParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>; // For nested navigator
  Settings: undefined; // Assuming SettingsScreen doesn't take params
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#f4511e'},
        headerTintColor: '#fff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Drawer.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{title: 'Main App'}}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: 'Settings'}}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
