'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Defines the shape of the authentication context.
 * @property {User | null} user - The currently authenticated user, or null if not authenticated.
 * @property {boolean} loading - Indicates if the authentication state is currently being loaded.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Creates a React context for authentication, with an initial undefined value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication context to its children components.
 * Manages user authentication state using Supabase and makes it available throughout the application.
 * @param {Readonly<{ children: React.ReactNode }>} props - The props for the AuthProvider component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider's scope.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State to hold the authenticated user information.
  const [user, setUser] = useState<User | null>(null);
  // State to indicate if the authentication status is still being loaded.
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Subscribes to authentication state changes from Supabase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Fetches the current session to initialize the user state.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Cleans up the subscription when the component unmounts.
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]); // Dependency array ensures effect runs only when supabase client changes.

  return (
    // Provides the user and loading state to children components.
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context containing user and loading state.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}