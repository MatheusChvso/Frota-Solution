// frontend/src/components/PaginaGestao.jsx

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './PaginaGestao.css'; // Vamos criar este CSS para o estilo das abas

const PaginaGestao = () => {
  return (
    <div className="container-gestao">
      <h1>Central de Gestão</h1>
      <nav className="gestao-nav-tabs">
        <NavLink to="veiculos">Veículos</NavLink>
        <NavLink to="alocacoes">Alocações</NavLink>
        <NavLink to="vendedores">Vendedores</NavLink>
      </nav>

      <div className="gestao-content">
        {/* O Outlet é o espaço onde o conteúdo da aba selecionada será renderizado */}
        <Outlet />
      </div>
    </div>
  );
};

export default PaginaGestao;