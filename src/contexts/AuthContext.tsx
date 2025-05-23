import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: any | null; // Using any temporarily, should be properly typed
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  register: (email: string, password: string, name: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        
        if (data.session?.user) {
          // Get user details from the users table if needed
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user data:', userError);
          }
          
          // Combine auth data with profile data
          setUser({
            ...data.session.user,
            ...userData,
            role: userData?.role || 'user', // Default role
          });
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        
        // Get user details from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user data:', userError);
        }
        
        // Combine auth data with profile data
        setUser({
          ...session.user,
          ...userData,
          role: userData?.role || 'user', // Default role
        });
        
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Cleanup
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  };

  // Register with email and password
  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: email,
              name: name,
              role: 'user', // Default role
            },
          ]);
          
        if (profileError) {
          throw profileError;
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { data: null, error };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};