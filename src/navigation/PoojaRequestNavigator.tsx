import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { COLORS } from '../theme/theme';
import PoojaRequestScreen from '../screens/PoojaRequestScreen';
import PoojaRequestDetailScreen from '../screens/PoojaRequestDetailScreen';
import { PoojaRequestItem } from '../api/apiService';
import ChatMessagesScreen from '../screens/ChatMessagesScreen';

export type PoojaRequestParamList = {
  PoojaRequest: undefined;
  PoojaRequestDetail: {request:PoojaRequestItem};
  ChatMessages:undefined
};

const Stack = createStackNavigator<PoojaRequestParamList>();

const PoojaRequestNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // cardStyle: { backgroundColor: COLORS.backgroundPrimary },
      }}>
      <Stack.Screen
        name="PoojaRequest"
        component={PoojaRequestScreen}
        options={{
          title: 'Pooja Requests',
          // headerShown: true,
          // headerStyle: {
          //   backgroundColor: COLORS.primary,
          // },
          // headerTintColor: COLORS.white,
        }}
      />
      <Stack.Screen
        name="PoojaRequestDetail"
        component={PoojaRequestDetailScreen}
        options={{
          title: 'Pooja Request',
          // headerShown: true,
          // headerStyle: {
          //   backgroundColor: COLORS.primary,
          // },
          // headerTintColor: COLORS.white,
        }}
      />
      <Stack.Screen
        name="ChatMessages"
        component={ChatMessagesScreen}
        options={{
          title: 'Pooja Request',
          // headerShown: true,
          // headerStyle: {
          //   backgroundColor: COLORS.primary,
          // },
          // headerTintColor: COLORS.white,
        }}
      />
    </Stack.Navigator>
  );
};

export default PoojaRequestNavigator;
