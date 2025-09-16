import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

const getInitialUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser());
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true); // <-- NOVO ESTADO DE CARREGAMENTO

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setIsLoading(false); // <-- AVISA QUE A INICIALIZAÇÃO TERMINOU
  }, [token]);

  const login = async (email, senha) => { /* ... sua função login (sem alterações) ... */ };
  const logout = () => { /* ... sua função logout (sem alterações) ... */ };

  return (
    // Exporta o novo estado 'isLoading'
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

  const login = async (email, senha) => {
    try {
      const response = await axios.post('http://localhost:3001/api/vendedores/login', { email, senha });
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
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
