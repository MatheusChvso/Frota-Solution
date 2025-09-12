// frontend/src/components/RotaProtegida.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RotaProtegida = ({ children }) => {
  const { token } = useContext(AuthContext);

  if (!token) {
    // Se não há token, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  return children; // Se há token, renderiza a página solicitada
};

export default RotaProtegida;