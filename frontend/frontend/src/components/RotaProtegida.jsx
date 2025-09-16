// frontend/src/components/RotaProtegida.jsx (VERSÃO FINAL E CORRIGIDA)
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RotaProtegida = ({ children }) => {
  const { token, isLoading } = useContext(AuthContext); // <-- PEGA O 'isLoading' DO CONTEXTO

  // Se ainda estivermos inicializando a autenticação, mostramos uma tela de carregamento
  if (isLoading) {
    return <div>Carregando aplicação...</div>;
  }

  // Se a inicialização terminou e não há token, redireciona para o login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se a inicialização terminou e há um token, mostra a página
  return children;
};

export default RotaProtegida;