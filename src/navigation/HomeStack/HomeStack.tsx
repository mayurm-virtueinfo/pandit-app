import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../theme/theme';
import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import PujaDetailsScreen from '../../screens/HomeScreen/PujaDetailsScreen';
import PujaSuccessfullScreen from '../../screens/HomeScreen/PujaSuccessfullScreen';
import ChatScreen from '../../screens/HomeScreen/ChatScreen';
import NotificationScreen from '../../screens/ProfileScreen/NotificationScreen';
import PujaCancellationScreen from '../../screens/HomeScreen/PujaCancellationScreen';

export type HomeStackParamList = {
  replace(arg0: string): unknown;
  navigate(arg0: string): void;
  HomeScreen: undefined;
  PujaDetailsScreen: {id?: any; progress?: boolean};
  PujaSuccessfull: undefined;
  ChatScreen: undefined;
  NotificationScreen: undefined;
  PujaCancellationScreen: {id: number};
};

const Stack = createStackNavigator<HomeStackParamList>();

const HomeNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.backgroundPrimary},
      }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="PujaDetailsScreen" component={PujaDetailsScreen} />
      <Stack.Screen name="PujaSuccessfull" component={PujaSuccessfullScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen
        name="PujaCancellationScreen"
        component={PujaCancellationScreen}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
