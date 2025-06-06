import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import PoojaListScreen from '../screens/PoojaListScreen';
import AddNewPoojaScreen from '../screens/AddNewPoojaScreen';
import { PoojaRequestItem } from '../api/apiService';
import PoojaRequestDetailScreen from '../screens/PoojaRequestDetailScreen';

export type PoojaListParamList = {
  PoojaList: undefined;
  AddNewPooja: undefined;
  PoojaRequestDetail: {request:PoojaRequestItem};
};

const Stack = createStackNavigator<PoojaListParamList>();

const PoojaListNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="PoojaList"
        component={PoojaListScreen}
      />
      <Stack.Screen
        name="AddNewPooja"
        component={AddNewPoojaScreen} // Assuming you have an AddNewPoojaScreen component
      />
      <Stack.Screen
        name="PoojaRequestDetail"
        component={PoojaRequestDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default PoojaListNavigator;
