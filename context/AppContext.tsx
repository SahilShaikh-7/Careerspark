import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, Resume } from '../types';
import { fetchUserResumes, getUserProfile, updateUserProfile } from '../services/supabaseService';

interface AppContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    resumes: Resume[];
    loading: boolean;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    signInWithEmail: (email: string, pass: string) => Promise<any>;
    signUpWithEmail: (name: string, email: string, pass: string) => Promise<any>;
    signOut: () => Promise<void>;
    updateProfile: (newProfile: Omit<Profile, 'id' | 'email'>) => Promise<void>;
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') return 'light';
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        return storedTheme || 'light';
    });
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    const userProfile = await getUserProfile(session.user.id);
                    setProfile(userProfile);
                    const userResumes = await fetchUserResumes(session.user.id);
                    setResumes(userResumes);
                }
            } catch (error) {
                console.error("Error getting initial session:", error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                setLoading(true);
                const userProfile = await getUserProfile(session.user.id);
                setProfile(userProfile);
                const userResumes = await fetchUserResumes(session.user.id);
                setResumes(userResumes);
                setLoading(false);
            } else {
                setProfile(null);
                setResumes([]);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    
    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const signInWithEmail = async (email: string, pass: string) => {
        return supabase.auth.signInWithPassword({ email, password: pass });
    };

    const signUpWithEmail = async (fullName: string, email: string, pass: string) => {
        return supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };
    
    const updateProfile = async (newProfileData: Omit<Profile, 'id' | 'email'>) => {
        if (!user) return;
        const updatedProfile = await updateUserProfile(user.id, newProfileData);
        if (updatedProfile) {
            setProfile(updatedProfile);
        }
    };


    const value = {
        session, user, profile, resumes, loading, theme, toggleTheme,
        signInWithEmail, signUpWithEmail, signOut, updateProfile,
        isAuthModalOpen, openAuthModal, closeAuthModal
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};