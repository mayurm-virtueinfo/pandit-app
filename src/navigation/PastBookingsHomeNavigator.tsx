import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { COLORS } from '../theme/theme';
import PoojaRequestScreen from '../screens/PoojaRequestScreen';
import PoojaRequestDetailScreen from '../screens/PoojaRequestDetailScreen';
import { PoojaRequestItem } from '../api/apiService';
import ChatMessagesScreen from '../screens/ChatMessagesScreen';
import PoojaItemListScreen from '../screens/PoojaItemListScreen';
import PinVerificationScreen from '../screens/PinVerificationScreen';
import CancellationReasonScreen from '../screens/CancellationReasonScreen';
import CancellationPolicyScreen from '../screens/CancellationPolicyScreen';
import RateYourExperienceScreen from '../screens/RateYourExperienceScreen';
import PoojaBookingsScreen from '../screens/PoojaBookingsScreen';
import PastBookingsScreen from '../screens/PastBookingsScreen';

export type PastBookingsHomeParamList = {
  PastBookings: undefined;
};

const Stack = createStackNavigator<PastBookingsHomeParamList>();

const PastBookingsHomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // cardStyle: { backgroundColor: COLORS.backgroundPrimary },
      }}>
      <Stack.Screen
        name="PastBookings"
        component={PastBookingsScreen}
      />
    </Stack.Navigator>
  );
};

export default PastBookingsHomeNavigator;
