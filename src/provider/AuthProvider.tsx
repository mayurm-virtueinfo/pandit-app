import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { FirebaseAuthTypes, getAuth, signOut, onAuthStateChanged, signInWithPhoneNumber } from '@react-native-firebase/auth';
// Authentication Context
interface AuthContextType {
    isAuthenticated: boolean;
    signIn: () => void;
    signOutApp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
    children: ReactNode;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const subscriber = onAuthStateChanged(getAuth(), (user) => {
            setUser(user);
        });
        return subscriber;
    }, []);

    useEffect(() => {
        setIsAuthenticated(!!user);
        console.log("user changed, updated isAuthenticated to", !!user);
    }, [user]);

    const signIn = () => {
        setIsAuthenticated(true);
    };

    const signOutApp = () => {
        handleSignOut();
    };
    const handleSignOut = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            console.log('User signed out!');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const value = {
        user,
        isAuthenticated,
        signIn,
        signOutApp,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};