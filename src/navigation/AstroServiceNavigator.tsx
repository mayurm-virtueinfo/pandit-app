import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AstroServicesScreen from '../screens/AstroServicesScreen';
import AddNewAstroServiceScreen from '../screens/AddNewAstroServiceScreen';

export type AstroServiceParamList = {
  AstroServices: undefined;
  AddNewAstroService: undefined;
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
      <Stack.Screen
        name="AddNewAstroService"
        component={AddNewAstroServiceScreen}
      />
    </Stack.Navigator>
  );
};

export default AstroServiceNavigator;
