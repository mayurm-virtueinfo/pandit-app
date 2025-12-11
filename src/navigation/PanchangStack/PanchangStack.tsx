import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../../theme/theme';
import CalendarScreen from '../../screens/PanchangScreen/PanchangScreen';

export type PanchangStackParamList = {
  replace(arg0: string): unknown;
  navigate(arg0: string): void;
  CalendarScreen: undefined;
};

const Stack = createStackNavigator<PanchangStackParamList>();

const PanchangNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CalendarScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.backgroundPrimary },
      }}
    >
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
    </Stack.Navigator>
  );
};

export default PanchangNavigator;
