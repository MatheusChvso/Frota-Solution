import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // O login ainda usa o axios diretamente
import api from '../api'; // Importamos a nossa instância

export const AuthContext = createContext(null);

const getInitialUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser());
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Este useEffect não é mais necessário, a lógica está no api.js
  useEffect(() => {
    setIsLoading(false);
  }, [token]);

  const login = async (email, senha) => {
    try {
      const response = await axios.post('http://192.168.17.200:3001/api/vendedores/login', { email, senha });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return true;
    } catch (error) {
      console.error('Falha no login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
