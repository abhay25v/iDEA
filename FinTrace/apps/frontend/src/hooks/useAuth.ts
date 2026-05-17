// Authentication Hook

import { useEffect, useState } from 'react';
import apiClient from '@lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

// Mock user for frontend-only development
const MOCK_USER: User = {
  id: 'dev-user-001',
  email: 'dev@fintrace.local',
  fullName: 'Dev User',
  role: 'analyst',
};

const MOCK_TOKEN = 'dev-token-bypass-123456789';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Frontend-only bypass: auto-set mock user
        const existingUser = localStorage.getItem('user');
        if (!existingUser) {
          localStorage.setItem('accessToken', MOCK_TOKEN);
          localStorage.setItem('refreshToken', MOCK_TOKEN);
          localStorage.setItem('user', JSON.stringify(MOCK_USER));
        }
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, tokens } = response.data.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      setUser(user);
      setError(null);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return { user, loading, error, login, logout };
}
