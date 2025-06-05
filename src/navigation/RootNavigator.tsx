import React, {createContext, useContext, useState, ReactNode} from 'react';
import {createStackNavigator, StackNavigationOptions} from '@react-navigation/stack';
import { NavigatorScreenParams } from '@react-navigation/native'; // Import NavigatorScreenParams
import AuthNavigator from './AuthNavigator';
// import MainNavigator from './MainNavigator'; // MainNavigator is being replaced by a new flow
import AppDrawerNavigator, { AppDrawerParamList } from './DrawerNavigator'; // Corrected import path
import LanguagesScreen from '../screens/LanguagesScreen'; // Import LanguagesScreen

// Authentication Context
interface AuthContextType {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = () => {
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Root Stack Types
// Define the param list for the stack that includes LanguagesScreen and AppDrawerNavigator
export type MainAppStackParamList = {
  Languages: undefined;
  AppDrawer: NavigatorScreenParams<AppDrawerParamList>; // AppDrawerNavigator itself
};

const MainApp = createStackNavigator<MainAppStackParamList>();

const MainAppStackNavigator = () => {
  return (
    <MainApp.Navigator screenOptions={{ headerShown: false }}>
      <MainApp.Screen name="Languages" component={LanguagesScreen} />
      <MainApp.Screen name="AppDrawer" component={AppDrawerNavigator} />
    </MainApp.Navigator>
  );
};

// Root Stack Types - Main now points to MainAppStack
export type RootStackParamList = {
  Auth: undefined; // AuthNavigator for unauthenticated users
  Main: NavigatorScreenParams<MainAppStackParamList>; // MainAppStackNavigator for authenticated users
};

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const {isAuthenticated} = useAuth();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        // contentStyle: {backgroundColor: 'transparent'}, // Removed to fix error, apply to screens if needed
      }}>
      {isAuthenticated ? (
        <RootStack.Screen
          name="Main"
          component={MainAppStackNavigator} // Use the new MainAppStackNavigator
          // options={{ // Removed animationTypeForReplace for simplicity and to fix type error
          //   animationTypeForReplace: 'push',
          // } as StackNavigationOptions}
        />
      ) : (
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
          // options={{ // Removed animationTypeForReplace
          //   animationTypeForReplace: 'pop',
          // }}
        />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
