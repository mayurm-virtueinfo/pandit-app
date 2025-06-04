import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import DrawerNavigator from './DrawerNavigator';

export type MainStackParamList = {
  DrawerNav: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide header since DrawerNavigator has its own headers
      }}>
      <Stack.Screen name="DrawerNav" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
