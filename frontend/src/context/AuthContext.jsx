import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

const AuthContext = createContext(null);

/**
 * Premium AuthProvider to secure user session lifecycle & Google OAuth transactions
 */
export function AuthProvider({ children }) {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Post Google OAuth Credential (JWT) to backend for verification and login
   * @param {string} googleCredential - Raw JWT credential returned by Google Identity popup
   */
  const loginWithGoogle = async (googleCredential, requestedRole = 'USER') => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.post('/auth/google', { token: googleCredential, role: requestedRole });
      const { token: jwtToken } = response.data;
      login(response.data, jwtToken);
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Google authentication failed';
      setAuthError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading: loading,
        error: authError,
        login,
        logout,
        loginWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom React hook to consume session states
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
