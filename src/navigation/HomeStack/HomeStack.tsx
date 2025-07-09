import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {COLORS} from '../../theme/theme';
import SignInScreen from '../../screens/SignInScreen';
import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import PujaDetailsScreen from '../../screens/HomeScreen/PujaDetailsScreen';
import PujaSuccessfullScreen from '../../screens/HomeScreen/PujaSuccessfullScreen';
import ChatMessagesScreen from '../../screens/ChatMessagesScreen';
import ChatScreen from '../../screens/HomeScreen/ChatScreen';

export type HomeStackParamList = {
  navigate(arg0: string): void;
  HomeScreen: undefined;
  PujaDetailsScreen: undefined;
  PujaSuccessfull: undefined;
  ChatScreen: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

const HomeNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.backgroundPrimary},
      }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="PujaDetailsScreen" component={PujaDetailsScreen} />
      <Stack.Screen name="PujaSuccessfull" component={PujaSuccessfullScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
