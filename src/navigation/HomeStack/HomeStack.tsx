import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../theme/theme';
import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import PujaDetailsScreen from '../../screens/HomeScreen/PujaDetailsScreen';
import PujaSuccessfullScreen from '../../screens/HomeScreen/PujaSuccessfullScreen';
import ChatScreen from '../../screens/HomeScreen/ChatScreen';
import NotificationScreen from '../../screens/ProfileScreen/NotificationScreen';

export type HomeStackParamList = {
  navigate(arg0: string): void;
  HomeScreen: undefined;
  PujaDetailsScreen: undefined;
  PujaSuccessfull: undefined;
  ChatScreen: undefined;
  NotificationScreen: undefined;
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
    </Stack.Navigator>
  );
};

export default HomeNavigator;
