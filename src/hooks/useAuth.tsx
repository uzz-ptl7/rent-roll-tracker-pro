
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Transaction } from '@/types/transaction';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  saveTransactions: (transactions: Transaction[]) => void;
  loadTransactions: () => Transaction[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default credentials - stored in localStorage but can be changed
const DEFAULT_CREDENTIALS = {
  username: 'family',
  password: 'rent2024'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem('rentTracker_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Initialize default credentials if not set
    const storedCredentials = localStorage.getItem('rentTracker_credentials');
    if (!storedCredentials) {
      localStorage.setItem('rentTracker_credentials', JSON.stringify(DEFAULT_CREDENTIALS));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const storedCredentials = localStorage.getItem('rentTracker_credentials');
    const credentials = storedCredentials ? JSON.parse(storedCredentials) : DEFAULT_CREDENTIALS;
    
    if (username === credentials.username && password === credentials.password) {
      setIsAuthenticated(true);
      localStorage.setItem('rentTracker_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rentTracker_auth');
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const storedCredentials = localStorage.getItem('rentTracker_credentials');
    const credentials = storedCredentials ? JSON.parse(storedCredentials) : DEFAULT_CREDENTIALS;
    
    if (currentPassword === credentials.password) {
      const newCredentials = { ...credentials, password: newPassword };
      localStorage.setItem('rentTracker_credentials', JSON.stringify(newCredentials));
      return true;
    }
    return false;
  };

  const saveTransactions = (transactions: Transaction[]) => {
    localStorage.setItem('rentTracker_transactions', JSON.stringify(transactions));
  };

  const loadTransactions = (): Transaction[] => {
    const stored = localStorage.getItem('rentTracker_transactions');
    return stored ? JSON.parse(stored) : [];
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      changePassword,
      saveTransactions,
      loadTransactions
    }}>
      {children}
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
