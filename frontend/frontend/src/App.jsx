import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import PaginaGestao from './components/PaginaGestao';
import DashboardConsumo from './components/DashboardConsumo';
import PaginaVeiculos from './components/PaginaVeiculos';
import PaginaVendedores from './components/PaginaVendedores';
import PaginaAlocacoes from './components/PaginaAlocacoes';
import PaginaLogin from './components/PaginaLogin';
import RotaProtegida from './components/RotaProtegida';
import PaginaRegistroKM from './components/PaginaRegistroKM';
import PaginaMural from './components/PaginaMural';
import PaginaTiposManutencao from './components/PaginaTiposManutencao';
import PaginaManutencao from './components/PaginaManutencao';
import PaginaHistoricoKM from './components/PaginaHistoricoKM';
// 1. Importar o novo componente
import PaginaHistoricoAlocacao from './components/PaginaHistoricoAlocacao';

import './App.css';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div>
      <nav className="main-nav">
        <div className="nav-links">
          <NavLink to="/app">Dashboard</NavLink>
          
          {user?.perfil === 'admin' && (
            <>
              <NavLink to="/app/gestao">Gestão</NavLink>
              <NavLink to="/app/mural">Checklist Diário</NavLink>
              <NavLink to="/app/manutencao">Manutenção</NavLink>
              <NavLink to="/app/tipos-manutencao">Tipos de Manutenção</NavLink>
              <NavLink to="/app/historico-km">Histórico KM</NavLink>
              {/* 2. Adicionar o novo link ao menu do admin */}
              <NavLink to="/app/historico-alocacoes">Histórico Alocações</NavLink>
            </>
          )}
          
          <NavLink to="/app/registrar-km">Registrar KM</NavLink>

        </div>
        <div className="nav-user">
          <span>Olá, {user?.nome}</span>
          <button onClick={logout} className="btn-logout">Sair</button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route index element={<DashboardConsumo />} />
          <Route path="/mural" element={<PaginaMural />} />
          <Route path="/historico-km" element={<PaginaHistoricoKM />} />
          <Route path="/manutencao" element={<PaginaManutencao />} />
          <Route path="/tipos-manutencao" element={<PaginaTiposManutencao />} />
          <Route path="/registrar-km" element={<PaginaRegistroKM />} />
          
          {/* 3. Adicionar a nova rota */}
          <Route path="/historico-alocacoes" element={<PaginaHistoricoAlocacao />} />

          <Route path="/gestao" element={<PaginaGestao />}>
            <Route path="veiculos" element={<PaginaVeiculos />} />
            <Route path="alocacoes" element={<PaginaAlocacoes />} />
            <Route path="vendedores" element={<PaginaVendedores />} />
            <Route index element={<Navigate to="veiculos" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/app" />} />
        </Routes>
      </main>
    </div>
  );
};

// Componente App principal
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PaginaLogin />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/dashboard" element={<DashboardConsumo />} />
        
        <Route 
          path="/app/*"
          element={
            <RotaProtegida>
              <MainLayout />
            </RotaProtegida>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;

