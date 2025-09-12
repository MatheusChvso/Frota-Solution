// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Se temos um token, configuramos o header padrão do Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Aqui você poderia buscar os dados do usuário se o token apenas contivesse o ID
      const storedUser = localStorage.getItem('user');
      if(storedUser) setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const login = async (email, senha) => {
    try {
      const response = await axios.post('http://localhost:3001/api/vendedores/login', { email, senha });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);

      return true; // Sucesso
    } catch (error) {
      console.error('Falha no login:', error);
      return false; // Falha
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};