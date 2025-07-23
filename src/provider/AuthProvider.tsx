import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {
  FirebaseAuthTypes,
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithPhoneNumber,
} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../utils/AppContent';
// Authentication Context
interface AuthContextType {
  isAuthenticated: boolean;
  signIn: (token: string, refresh_token: string) => Promise<void>;
  signOutApp: () => void;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), user => {
      setUser(user);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async user => {
      try {
        if (user) {
          const token = await AsyncStorage.getItem(AppConstant.ACCESS_TOKEN);
          setIsAuthenticated(!!token);
        } else {
          await AsyncStorage.removeItem(AppConstant.ACCESS_TOKEN);
          await AsyncStorage.removeItem(AppConstant.REFRESH_TOKEN);
          await AsyncStorage.removeItem(AppConstant.FIREBASE_UID);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (access_token: string, refresh_token: string) => {
    try {
      await AsyncStorage.setItem(AppConstant.ACCESS_TOKEN, access_token);
      await AsyncStorage.setItem(AppConstant.REFRESH_TOKEN, refresh_token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };
  const signOutApp = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      await AsyncStorage.removeItem(AppConstant.ACCESS_TOKEN);
      await AsyncStorage.removeItem(AppConstant.REFRESH_TOKEN);
      await AsyncStorage.removeItem(AppConstant.FIREBASE_UID);
      await AsyncStorage.removeItem(AppConstant.USER_ID);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    signIn,
    signOutApp,
    setIsAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
