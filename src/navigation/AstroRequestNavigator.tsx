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
import AstroRequestScreen from '../screens/AstroRequestScreen';
import VideoCallScreen from '../screens/VideoCallScreen';

export type AstroRequestParamList = {
  AstroRequest: undefined;
  ChatMessages:undefined,
  VideoCall: undefined;
};

const Stack = createStackNavigator<AstroRequestParamList>();

const AstroRequestNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // cardStyle: { backgroundColor: COLORS.backgroundPrimary },
      }}>
      <Stack.Screen
        name="AstroRequest"
        component={AstroRequestScreen}
      />
      <Stack.Screen
        name="ChatMessages"
        component={ChatMessagesScreen}
      />
      <Stack.Screen
        name="VideoCall"
        component={VideoCallScreen}
      />
    </Stack.Navigator>
  );
};

export default AstroRequestNavigator;
