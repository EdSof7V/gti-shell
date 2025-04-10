"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthContextType, UserType } from '../lib/types/auth';
import Cookies from 'js-cookie';

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthContextProviderProps {
    children: ReactNode;
}

// Cookie configuration
const COOKIE_OPTIONS = {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const // 'lax' allows the cookie to be sent with navigation requests
};

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();
                    
                    const isGoogleProvider = firebaseUser.providerData.some(
                        provider => provider.providerId === 'google.com'
                    );
                    
                    if (isGoogleProvider) {
                        Cookies.set('google-session-token', token, COOKIE_OPTIONS);
                    }
                    
                    // Update user state
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                    });
                } catch (error) {
                    console.error("Error getting ID token:", error);
                    Cookies.remove('google-session-token');
                    setUser(null);
                }
            } else {
                Cookies.remove('google-session-token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async (): Promise<any> => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        

        
        try {
            const result = await signInWithPopup(auth, provider);
            
            if (result.user) {
                const token = await result.user.getIdToken();
                Cookies.set('google-session-token', token, COOKIE_OPTIONS);
                
                const urlParams = new URLSearchParams(window.location.search);
                const redirectPath = urlParams.get('redirect');
                
                if (redirectPath) {
                    window.location.href = redirectPath;
                }
            }
            
            return result;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await signOut(auth);
            Cookies.remove('google-session-token');
            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (!user) return;
        
        const refreshToken = async () => {
            try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const token = await currentUser.getIdToken(true);
                    Cookies.set('google-session-token', token, COOKIE_OPTIONS);
                }
            } catch (error) {
                console.error("Error refreshing token:", error);
            }
        };
        
        const intervalId = setInterval(refreshToken, 50 * 60 * 1000);
        
        return () => clearInterval(intervalId);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};