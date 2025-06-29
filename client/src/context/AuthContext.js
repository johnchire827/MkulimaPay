import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, token });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error('Failed to parse stored user data', e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    try {
      const response = await api.post('/auth/login', { 
        phone,
        password
      });
      
      const { user: userData, token } = response.data;
      const userWithToken = { ...userData, token };
      
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userWithToken);
      return userWithToken;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.response?.data?.details || 
                          'Login failed. Please check your credentials';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      // Create a clean payload without unnecessary fields
      const payload = {
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        password: userData.password,
        role: userData.role
      };
      
      const response = await api.post('/auth/register', payload);
      const { user: userDataFromResponse, token } = response.data;
      const userWithToken = { ...userDataFromResponse, token };
      
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userWithToken);
      return userWithToken;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.response?.data?.details || 
                          'Registration failed. Please try again';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      isFarmer: user?.role === 'farmer' || user?.role === 'both',
      isBuyer: user?.role === 'buyer' || user?.role === 'both'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);