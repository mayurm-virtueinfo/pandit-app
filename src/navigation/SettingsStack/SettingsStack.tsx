import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../theme/theme';
import SettingsScreen from '../../screens/SettingsScreen/SettingsScreen';
import AvailabilityScreen from '../../screens/SettingsScreen/AvailabilityScreen';
import SelectCityScreen from '../../screens/Auth/SelectCityScreen';
import SelectAreaScreen from '../../screens/Auth/SelectAreaScreen';
import SelectPoojaScreen from '../../screens/Auth/SelectPoojaScreen';
import SelectLanguageScreen from '../../screens/Auth/SelectLanguageScreen';
import DocumentUploadScreen from '../../screens/Auth/DocumentUploadScreen';

export type SettingsStackParamList = {
  navigate(arg0: string): void;
  SettingsScreen: undefined;
  AvailabilityScreen: undefined;
  SelectCityScreen: undefined;
  SelectAreaScreen: undefined;
  SelectPoojaScreen: undefined;
  SelectLanguageScreen: undefined;
  DocumentUploadScreen: undefined;
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
      <Stack.Screen name="SelectCityScreen" component={SelectCityScreen} />
      <Stack.Screen name="SelectAreaScreen" component={SelectAreaScreen} />
      <Stack.Screen name="SelectPoojaScreen" component={SelectPoojaScreen} />
      <Stack.Screen
        name="SelectLanguageScreen"
        component={SelectLanguageScreen}
      />
      <Stack.Screen
        name="DocumentUploadScreen"
        component={DocumentUploadScreen}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
