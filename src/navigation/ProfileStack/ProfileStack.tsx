import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../theme/theme';
import ProfileScreen from '../../screens/ProfileScreen/ProfileScreen';
import PastPujaScreen from '../../screens/ProfileScreen/PastBookingsScreen';
import EarningsHistoryScreen from '../../screens/ProfileScreen/EarningsHistoryScreen';
import NotificationScreen from '../../screens/ProfileScreen/NotificationScreen';

export type ProfileStackParamList = {
  navigate(arg0: string): void;
  ProfileScreen: undefined;
  PastPujaScreen: undefined;
  EarningsHistoryScreen: undefined;
  NotificationScreen: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.backgroundPrimary},
      }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="PastPujaScreen" component={PastPujaScreen} />
      <Stack.Screen
        name="EarningsHistoryScreen"
        component={EarningsHistoryScreen}
      />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
