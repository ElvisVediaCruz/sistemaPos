import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode} from 'react';
import type { AuthUser, UserTipo } from '../types';
import { loginRequest } from '../api/auth.api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user_name: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserTipo[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pos_token');
    const savedUser = localStorage.getItem('pos_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (user_name: string, password: string) => {
    const result = await loginRequest(user_name, password);
    localStorage.setItem('pos_token', result.token);
    localStorage.setItem('pos_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles: UserTipo[]) => {
    return user ? roles.includes(user.tipo) : false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
