// frontend/src/App.jsx (VERSÃO FINAL COM ROTA PÚBLICA/PRIVADA)

import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Importe suas páginas e componentes
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

import './App.css';

// Layout da área logada (com a barra de navegação)
const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div>
      <nav className="main-nav">
        <div className="nav-links">
          {/* Links agora apontam para dentro de /app */}
          <NavLink to="/app/dashboard">Dashboard</NavLink>
          <NavLink to="/app/mural">Mural da Vergonha</NavLink>
          <NavLink to="/app/registrar-km">Registrar KM</NavLink>
          <NavLink to="/app/manutencao">Painel de Manutenção</NavLink>
          {/* ...e assim por diante para todos os links */}
          <NavLink to="/app/manutencao/tipos">Tipos de Manutenção</NavLink>
          <NavLink to="/app/veiculos">Gerenciar Veículos</NavLink>
          <NavLink to="/app/vendedores">Vendedores</NavLink>
          <NavLink to="/app/alocacoes">Alocações</NavLink>
        </div>
        <div className="nav-user">
          <span>Olá, {user?.nome}</span>
          <button onClick={logout} className="btn-logout">Sair</button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          {/* As rotas aqui são relativas ao /app */}
          <Route path="/dashboard" element={<DashboardConsumo />} />
          <Route path="/mural" element={<PaginaMural />} />
          <Route path="/registrar-km" element={<PaginaRegistroKM />} />
          <Route path="/manutencao" element={<PaginaManutencao />} />
          <Route path="/manutencao/tipos" element={<PaginaTiposManutencao />} />
          <Route path="/veiculos" element={<PaginaVeiculos />} />
          <Route path="/vendedores" element={<PaginaVendedores />} />
          <Route path="/alocacoes" element={<PaginaAlocacoes />} />
          {/* Rota padrão dentro de /app redireciona para o dashboard */}
          <Route path="*" element={<Navigate to="/app/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

// Componente App principal que gerencia as rotas de topo
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota 1: Login (pública) */}
        <Route path="/login" element={<PaginaLogin />} />

        {/* Rota 2: Dashboard Principal (pública) */}
        <Route path="/" element={<DashboardConsumo />} />

        {/* Rota 3: Área do Aplicativo (protegida) */}
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