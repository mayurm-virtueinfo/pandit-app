import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {COLORS} from '../../theme/theme';
import SignInScreen from '../../screens/Auth/SignInScreen';
import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import PujaDetailsScreen from '../../screens/HomeScreen/PujaDetailsScreen';
import PujaSuccessfullScreen from '../../screens/HomeScreen/PujaSuccessfullScreen';
import ChatMessagesScreen from '../../screens/ChatMessagesScreen';
import ChatScreen from '../../screens/HomeScreen/ChatScreen';
import PujaListScreen from '../../screens/PujaListScreen/PujaListScreen';
import AddPujaScreen from '../../screens/PujaListScreen/AddPujaScreen';

export type PujaListStackParamList = {
  navigate(arg0: string): void;
  PujaListScreen: undefined;
  AddPujaScreen: undefined;
};

const Stack = createStackNavigator<PujaListStackParamList>();

const PujaListNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="PujaListScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.backgroundPrimary},
      }}>
      <Stack.Screen name="PujaListScreen" component={PujaListScreen} />
      <Stack.Screen name="AddPujaScreen" component={AddPujaScreen} />
    </Stack.Navigator>
  );
};

export default PujaListNavigator;
