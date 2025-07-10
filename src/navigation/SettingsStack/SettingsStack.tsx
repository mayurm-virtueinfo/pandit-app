import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../theme/theme';
import SettingsScreen from '../../screens/SettingsScreen/SettingsScreen';
import AvailabilityScreen from '../../screens/SettingsScreen/AvailabilityScreen';

export type SettingsStackParamList = {
  navigate(arg0: string): void;
  SettingsScreen: undefined;
  AvailabilityScreen: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.backgroundPrimary},
      }}>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="AvailabilityScreen" component={AvailabilityScreen} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
