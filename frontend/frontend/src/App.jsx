// frontend/src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PaginaVeiculos from './components/PaginaVeiculos';
import PaginaVendedores from './components/PaginaVendedores';
import PaginaAlocacoes from './components/PaginaAlocacoes';
import PaginaLogin from './components/PaginaLogin';
import RotaProtegida from './components/RotaProtegida';
import PaginaRegistroKM from './components/PaginaRegistroKM';
import PaginaMural from './components/PaginaMural';
import PaginaRelatorio from './components/PaginaRelatorio';
import PaginaTiposManutencao from './components/PaginaTiposManutencao';
import PaginaManutencao from './components/PaginaManutencao'; 
import PaginaDashboard from './components/PaginaDashboard';// <-- Verifique se esta importação está presente
import './App.css';

// Componente de Layout principal que inclui a navegação
const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <nav className="main-nav">
        <div className="nav-links">
          <NavLink to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</NavLink>
          <NavLink to="/">Minha Página</NavLink>
          <NavLink to="/mural">Mural da Vergonha</NavLink>
          <NavLink to="/relatorios">Relatórios</NavLink>
          {/* GRUPO DE MANUTENÇÃO */}
          <NavLink to="/manutencao">Painel de Manutenção</NavLink> {/* <-- NOVO LINK ADICIONADO */}
          <NavLink to="/manutencao/tipos">Tipos de Manutenção</NavLink>
          {/* GRUPO DE GERENCIAMENTO */}
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
          <Route path="/dashboard" element={<PaginaDashboard />} />
          <Route path="/" element={<PaginaRegistroKM />} />
          <Route path="/mural" element={<PaginaMural />} />
          <Route path="/relatorios" element={<PaginaRelatorio />} />
          <Route path="/manutencao" element={<PaginaManutencao />} /> {/* <-- NOVA ROTA ADICIONADA */}
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

// O resto do arquivo (função App e export) continua igual ao que você postou
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