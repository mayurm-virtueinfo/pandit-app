import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInScreen from '../screens/SignInScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import PanditRegistrationScreen from '../screens/PanditRegistrationScreen';
import SelectCityAreaScreen from '../screens/SelectCityAreaScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  OTPVerification: {phoneNumber: string};
  PanditRegistration: undefined;
  SelectCityArea: undefined; // Added for the new screen
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen
        name="PanditRegistration"
        component={PanditRegistrationScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SelectCityArea"
        component={SelectCityAreaScreen}
        options={{
          headerShown: false, // Assuming no header based on screenshot and other screens
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
