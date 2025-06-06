import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import PoojaListScreen from '../screens/PoojaListScreen';

export type PoojaListParamList = {
  PoojaList: undefined;
  // PoojaRequestDetail: {request:PoojaRequestItem};
};

const Stack = createStackNavigator<PoojaListParamList>();

const PoojaListNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // cardStyle: { backgroundColor: COLORS.backgroundPrimary },
      }}>
      <Stack.Screen
        name="PoojaList"
        component={PoojaListScreen}
        options={{
          title: 'Pooja List',
          // headerShown: true,
          // headerStyle: {
          //   backgroundColor: COLORS.primary,
          // },
          // headerTintColor: COLORS.white,
        }}
      />
      {/* <Stack.Screen
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
      /> */}
    </Stack.Navigator>
  );
};

export default PoojaListNavigator;
