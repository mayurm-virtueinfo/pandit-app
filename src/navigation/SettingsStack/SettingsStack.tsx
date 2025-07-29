import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../theme/theme';
import SettingsScreen from '../../screens/SettingsScreen/SettingsScreen';
import AvailabilityScreen from '../../screens/SettingsScreen/AvailabilityScreen';
import EditCityScreen from '../../screens/SettingsScreen/EditCityScreen';
import EditAreaScreen from '../../screens/SettingsScreen/EditAreaScreen';
import EditPanditPoojaScreen from '../../screens/SettingsScreen/EditPanditPoojaScreen';
import EditPanditLanguageScreen from '../../screens/SettingsScreen/EditPanditLanguageScreen';
import EditPanditDocumentsScreen from '../../screens/SettingsScreen/EditPanditDocumentsScreen';

export type SettingsStackParamList = {
  navigate(arg0: string): void;
  SettingsScreen: undefined;
  AvailabilityScreen: undefined;
  EditCityScreen: any;
  EditAreaScreen: any;
  EditSelectedPooja: undefined;
  EditPanditLanguageScreen: undefined;
  EditPanditDocumentsScreen: undefined;
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
      <Stack.Screen name="EditCityScreen" component={EditCityScreen} />
      <Stack.Screen name="EditAreaScreen" component={EditAreaScreen} />
      <Stack.Screen
        name="EditSelectedPooja"
        component={EditPanditPoojaScreen}
      />
      <Stack.Screen
        name="EditPanditLanguageScreen"
        component={EditPanditLanguageScreen}
      />
      <Stack.Screen
        name="EditPanditDocumentsScreen"
        component={EditPanditDocumentsScreen}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
