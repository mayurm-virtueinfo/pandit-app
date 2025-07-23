import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigatorScreenParams} from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import {COLORS} from '../theme/theme';
import {useAuth} from '../provider/AuthProvider';
import AppBottomTabNavigator, {
  AppBottomTabParamList,
} from './BottomTabNavigator';

export type MainAppStackParamList = {
  AppBottomTabNavigator: NavigatorScreenParams<AppBottomTabParamList>;
};

const MainApp = createStackNavigator<MainAppStackParamList>();

const MainAppStackNavigator = () => {
  return (
    <MainApp.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        cardStyle: {backgroundColor: COLORS.backgroundPrimary},
      }}>
      <MainApp.Screen
        name="AppBottomTabNavigator"
        component={AppBottomTabNavigator}
      />
    </MainApp.Navigator>
  );
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainAppStackParamList>;
};

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const {isAuthenticated} = useAuth();

  useEffect(() => {
    console.log('RootNavigator.tsx : ', isAuthenticated);
  }, [isAuthenticated]);
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {isAuthenticated && (
        <RootStack.Screen name="Main" component={MainAppStackNavigator} />
      )}
      {!isAuthenticated && (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
