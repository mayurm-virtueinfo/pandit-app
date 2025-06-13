import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInScreen from '../screens/SignInScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import PanditRegistrationScreen from '../screens/PanditRegistrationScreen';
import SelectCityAreaScreen from '../screens/SelectCityAreaScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import PoojaAndAstrologyPerformedScreen from '../screens/PoojaAndAstrologyPerformedScreen';
import LanguagesScreen from '../screens/LanguagesScreen'; // Import new screen
import { COLORS } from '../theme/theme';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type AuthStackParamList = {
  SignIn: undefined;
  OTPVerification: {phoneNumber: string, confirmation:FirebaseAuthTypes.ConfirmationResult};
  PanditRegistration: undefined;
  SelectCityArea: undefined;
  Documents: undefined;
  PoojaAndAstrologyPerformed: undefined;
  Languages: undefined; // Added for new screen
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName='SignIn'
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.backgroundPrimary },
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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PoojaAndAstrologyPerformed"
        component={PoojaAndAstrologyPerformedScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Languages"
        component={LanguagesScreen}
        options={{
          headerShown: false, // Assuming no header based on screenshot
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
