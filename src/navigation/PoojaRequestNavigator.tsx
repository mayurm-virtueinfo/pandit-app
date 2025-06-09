import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { COLORS } from '../theme/theme';
import PoojaRequestScreen from '../screens/PoojaRequestScreen';
import PoojaRequestDetailScreen from '../screens/PoojaRequestDetailScreen';
import { PoojaRequestItem } from '../api/apiService';
import ChatMessagesScreen from '../screens/ChatMessagesScreen';
import PoojaItemListScreen from '../screens/PoojaItemListScreen';

export type PoojaRequestParamList = {
  PoojaRequest: undefined;
  PoojaRequestDetail: {request:PoojaRequestItem};
  ChatMessages:undefined,
  PoojaItemList:undefined
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
      />
      <Stack.Screen
        name="PoojaRequestDetail"
        component={PoojaRequestDetailScreen}
      />
      <Stack.Screen
        name="ChatMessages"
        component={ChatMessagesScreen}
      />
      <Stack.Screen
        name="PoojaItemList"
        component={PoojaItemListScreen}
      />
    </Stack.Navigator>
  );
};

export default PoojaRequestNavigator;
