import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AstroServicesScreen from '../screens/AstroServicesScreen';

export type AstroServiceParamList = {
  AstroServices: undefined;
};

const Stack = createStackNavigator<AstroServiceParamList>();

const AstroServiceNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="AstroServices"
        component={AstroServicesScreen}
      />
    </Stack.Navigator>
  );
};

export default AstroServiceNavigator;
