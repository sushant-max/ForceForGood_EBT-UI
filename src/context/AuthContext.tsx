import axios from 'axios';
import React, { useEffect, useState, createContext, useContext, useRef } from 'react';

// --- Type Definitions (Re-using yours) ---
type User = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'corporate_admin';
  corporateId?: string;
  corporateName?: string;
};
type UserUpdateData = {
  name?: string;
  email?: string;
};
type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (allowedRoles: string[]) => boolean;
  updateUserProfile: (userId: string, data: UserUpdateData) => Promise<void>;
  getToken: () => string | null;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// ------------------------------------------

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [awaiting2FA, setAwaiting2FA] = useState(false);
  
  // Use a ref to hold the timer ID for cleanup
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to clear all local storage data and state
  const clearAuthData = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('expiry');
    
    // Clear the timer if it exists
    if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
    }
  };

  const logout = () => {
    // Mock API call for logout
    // fetch('/auth/logout', { method: 'POST' })
    clearAuthData();
  };
  
  // --- EFFECT 1: Initial Load Check ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        clearAuthData(); // Logout if stored data is corrupt
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    // Listen for storage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // If any auth-related data changed, reload to sync state
      if (e.key === 'token' || e.key === 'user' || e.key === 'expiry') {
        console.log('Auth state changed in another tab, reloading to sync...');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup: Clear timer and event listener when component unmounts
    return () => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
        }
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Runs only on mount/unmount

  const getToken = () => {
    const storedExpiry:any = localStorage.getItem('expiry');
    if (user && storedExpiry) {
        const currentTimeS:any = Math.floor(Date.now() / 1000);
        const timeUntilExpiry:any = storedExpiry - currentTimeS;

        if (timeUntilExpiry > 0) {
            return localStorage.getItem('token');
        } else {
          logout(); // Token expired
          return null;
        }
    } else {
      logout(); // No user or expiry info
      return null;
    }
  };
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loginDetails = {
        emailId: email,
        password: password
      };

      const response = await axios.post('https://us-central1-test-donate-tags.cloudfunctions.net/register/login', 
        loginDetails
      );

      if(response.status !== 200) {
        alert('Failed to sign in. Please check your credentials.');
        return;
      }
      
      const userResponse: User = response.data.user;
      const responseData = {
          requires2FA: false, // assuming this logic is handled elsewhere for now
          user: userResponse
      };

      if (responseData.requires2FA) {
        setAwaiting2FA(true);
      } else {
        // Crucial Step: Storing Expiry Data
        const expiryValue = response.data.expiryAt; // Should be an ISO date string or timestamp (milliseconds)

        setUser(responseData.user);
        localStorage.setItem('user', JSON.stringify(responseData.user));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('expiry', expiryValue); // Store the expiry time
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to sign in. Please check your credentials.');
      // Ensure data is cleared on failed login attempt
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };
  
  // (The rest of your functions: verify2FA, updateUserProfile, hasPermission remain unchanged)
  const verify2FA = async (code: string) => {
    setLoading(true);
    try {
      const mockUser = {
        id: '1',
        email: 'admin@equibillion.io',
        name: 'Admin User',
        role: 'super_admin' as const
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setAwaiting2FA(false);
    } catch (error) {
      console.error('2FA verification failed:', error);
      throw new Error('2FA verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserProfile = async (userId: string, data: UserUpdateData) => {
    setLoading(true);
    try {
      if (user && user.id === userId) {
        const request = {
          emailId: data.email,
          name: data.name
        };
        const response = await axios.put(`https://us-central1-test-donate-tags.cloudfunctions.net/admin/${user.id}`, request, 
          { headers: { 'Authorization': `Bearer ${getToken()}` } }
        )
        
        if(response.status !== 200) {
          throw new Error('Failed to update profile. Please try again.');
        }
        alert('Profile updated successfully. You are now being logged out. Please log in again with your updated credentials.');
        logout();
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw new Error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const hasPermission = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };


  return <AuthContext.Provider value={{
    user,
    loading,
    login,
    verify2FA,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    updateUserProfile,
    getToken
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
