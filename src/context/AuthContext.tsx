import React, { useEffect, useState, createContext, useContext } from 'react';
type User = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'corporate_admin';
  corporateId?: string;
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
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [awaiting2FA, setAwaiting2FA] = useState(false);
  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // In a real app, this would be an API call to validate the session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock API call - in a real app this would call your backend
      // const response = await fetch('/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // })
      // const data = await response.json()
      // Mock user credentials
      let mockUser: User | null = null;
      if (email === 'admin@equibillion.io' && password === 'admin123') {
        mockUser = {
          id: '1',
          email: 'admin@equibillion.io',
          name: 'Admin User',
          role: 'super_admin'
        };
      } else if (email === 'corpadmin@equibillion.io' && password === 'corp123') {
        mockUser = {
          id: '2',
          email: 'aman.singh@company.com',
          name: 'Aman Singh',
          role: 'corporate_admin',
          corporateId: '68ffe35e-4b80-4635-84d1-d4ec7a7c73a8'
        };
      } else {
        // For backward compatibility with the original implementation
        mockUser = {
          id: '1',
          email: email,
          name: 'Admin User',
          role: 'super_admin'
        };
      }
      // Mock response with 2FA requirement
      const mockResponse = {
        requires2FA: false,
        user: mockUser
      };
      if (mockResponse.requires2FA) {
        setAwaiting2FA(true);
      } else {
        setUser(mockResponse.user);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };
  const verify2FA = async (code: string) => {
    setLoading(true);
    try {
      // Mock API call for 2FA verification
      // const response = await fetch('/auth/2fa/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code }),
      // })
      // const data = await response.json()
      // Mock response
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
      // In a real app, this would be an API call to update user profile
      // await fetch(`/api/users/${userId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })
      // For the mock implementation, we'll just update the local state
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          ...data
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw new Error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    // Mock API call for logout
    // fetch('/auth/logout', { method: 'POST' })
    // Clear user data
    setUser(null);
    localStorage.removeItem('user');
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
    updateUserProfile
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