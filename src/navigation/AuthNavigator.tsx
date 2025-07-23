import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInScreen from '../screens/Auth/SignInScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import SelectCityAreaScreen from '../screens/SelectCityAreaScreen';
import SelectCityScreen from '../screens/Auth/SelectCityScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import PoojaAndAstrologyPerformedScreen from '../screens/PoojaAndAstrologyPerformedScreen';
import LanguagesScreen from '../screens/LanguagesScreen';
import {COLORS} from '../theme/theme';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import SelectAreaScreen from '../screens/Auth/SelectAreaScreen';
import SelectPoojaScreen from '../screens/Auth/SelectPoojaScreen';
import CompleteProfileScreen from '../screens/Auth/CompleteProfileScreen';
import AppBottomTabNavigator from './BottomTabNavigator';
import SelectLanguageScreen from '../screens/Auth/SelectLanguageScreen';
import DocumentUploadScreen from '../screens/Auth/DocumentUploadScreen';

export type AuthStackParamList = {
  replace(arg0: string): void;
  navigate(arg0: string): void;
  SignIn: undefined;
  OTPVerification: {
    phoneNumber: string;
    confirmation: FirebaseAuthTypes.ConfirmationResult;
  };
  CompleteProfileScreen: {phoneNumber: string};
  SelectCityArea: undefined;
  SelectCityScreen: {
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    city: string | number;
    caste: string | number;
    subCaste: string | number;
    gotra: string | number;
    address: string;
    profile_img: any;
  };
  SelectAreaScreen: {
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    city: string | number;
    caste: string | number;
    subCaste: string | number;
    gotra: string | number;
    address: string;
    profile_img: any;
    selectCityId: number | string;
  };
  SelectPoojaScreen: {
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    city: string | number;
    caste: string | number;
    subCaste: string | number;
    gotra: string | number;
    address: string;
    profile_img: any;
    selectCityId: number | string;
    selectedAreasId: number[];
  };
  SelectLanguageScreen: {
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    city: string | number;
    caste: string | number;
    subCaste: string | number;
    gotra: string | number;
    address: string;
    profile_img: any;
    selectCityId: number | string;
    selectedAreasId: number[];
    selectedPoojaId: number[];
  };
  DocumentUploadScreen: {
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    city: string | number;
    caste: string | number;
    subCaste: string | number;
    gotra: string | number;
    address: string;
    profile_img: any;
    selectCityId: number | string;
    selectedAreasId: number[];
    selectedPoojaId: number[];
    selectedLanguageId: number[];
  };
  Documents: undefined;
  PoojaAndAstrologyPerformed: undefined;
  Languages: undefined;
  AppBottomTabNavigator: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.backgroundPrimary},
      }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen
        name="CompleteProfileScreen"
        component={CompleteProfileScreen}
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
        name="SelectCityScreen"
        component={SelectCityScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SelectAreaScreen"
        component={SelectAreaScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SelectPoojaScreen"
        component={SelectPoojaScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SelectLanguageScreen"
        component={SelectLanguageScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DocumentUploadScreen"
        component={DocumentUploadScreen}
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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AppBottomTabNavigator"
        component={AppBottomTabNavigator}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
