import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AstroServicesScreen from '../screens/AstroServicesScreen';
import AddNewAstroServiceScreen from '../screens/AddNewAstroServiceScreen';
import EarningsScreen from '../screens/EarningsScreen';
import EarningDetailScreen from '../screens/EarningDetailScreen';
import SelectCityScreen from '../screens/Auth/SelectCityScreen';
import SelectAreaScreen from '../screens/Auth/SelectAreaScreen';
import SelectPoojaScreen from '../screens/Auth/SelectPoojaScreen';
import SelectLanguageScreen from '../screens/Auth/SelectLanguageScreen';

export type EarningsParamList = {
  EarningsScreen: undefined;
  EarningDetailScreen: undefined;
  SelectLanguageScreen: undefined;
};

const Stack = createStackNavigator<EarningsParamList>();

const EarningsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="SelectLanguageScreen"
        component={SelectLanguageScreen}
      />
      <Stack.Screen name="EarningsScreen" component={EarningsScreen} />
      <Stack.Screen
        name="EarningDetailScreen"
        component={EarningDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default EarningsNavigator;
