import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Importando a nova página do Dashboard
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

// Componente de Layout principal que inclui a navegação
const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <nav className="main-nav">
        <div className="nav-links">
          {/* Rota principal agora é o Dashboard */}
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/mural">Mural da Vergonha</NavLink>
          {/* Link para a página de registro de KM */}
          <NavLink to="/registrar-km">Registrar KM</NavLink>

          <NavLink to="/manutencao">Painel de Manutenção</NavLink>
          <NavLink to="/manutencao/tipos">Tipos de Manutenção</NavLink>
          <NavLink to="/veiculos">Gerenciar Veículos</NavLink>
          <NavLink to="/vendedores">Vendedores</NavLink>
          <NavLink to="/alocacoes">Alocações</NavLink>
        </div>
        <div className="nav-user">
          <span>Olá, {user?.nome}</span>
          <button onClick={logout} className="btn-logout">Sair</button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          {/* Rota principal agora renderiza o DashboardConsumo */}
          <Route path="/" element={<DashboardConsumo />} />
          <Route path="/mural" element={<PaginaMural />} />
          {/* Nova rota para a página de registro de KM */}
          <Route path="/registrar-km" element={<PaginaRegistroKM />} />

          <Route path="/manutencao" element={<PaginaManutencao />} />
          <Route path="/manutencao/tipos" element={<PaginaTiposManutencao />} />
          <Route path="/veiculos" element={<PaginaVeiculos />} />
          <Route path="/vendedores" element={<PaginaVendedores />} />
          <Route path="/alocacoes" element={<PaginaAlocacoes />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PaginaLogin />} />
        <Route 
          path="/*"
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