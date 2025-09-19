import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Usando os caminhos corretos que você forneceu
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

import './App.css';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div>
      <nav className="main-nav">
        <div className="nav-links">
          {/* Dashboard é a página principal da área logada */}
          <NavLink to="/app/dashboard">Dashboard</NavLink> 
          {/* Novo link unificado de "Gestão" */}
          <NavLink to="/app/gestao">Gestão</NavLink>
          <NavLink to="/app/mural">Mural da Vergonha</NavLink>
          {/* Manutenção e Registros podem ser os próximos a serem agrupados */}
          <NavLink to="/app/manutencao">Manutenção</NavLink>
          <NavLink to="/app/historico-km">Histórico KM</NavLink>
        </div>
        <div className="nav-user">
          <span>Olá, {user?.nome}</span>
          <button onClick={logout} className="btn-logout">Sair</button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<DashboardConsumo />} />
          <Route path="/mural" element={<PaginaMural />} />
          <Route path="/historico-km" element={<PaginaHistoricoKM />} />
          <Route path="/manutencao" element={<PaginaManutencao />} />
          <Route path="/manutencao/tipos" element={<PaginaTiposManutencao />} />
          {/* Adicionando a nova estrutura de rotas aninhadas para Gestão */}
          <Route path="/gestao" element={<PaginaGestao />}>
            <Route path="veiculos" element={<PaginaVeiculos />} />
            <Route path="alocacoes" element={<PaginaAlocacoes />} />
            <Route path="vendedores" element={<PaginaVendedores />} />
            {/* Redireciona para a primeira aba por padrão */}
            <Route index element={<Navigate to="veiculos" replace />} />
          </Route>
          
          {/* Rota padrão dentro de /app redireciona para o dashboard */}
          <Route path="*" element={<Navigate to="/app/dashboard" />} />
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
        <Route path="/login" element={<PaginaLogin />} />
        {/* A rota pública para o dashboard agora usa o caminho correto do componente */}
        <Route path="/" element={<DashboardConsumo />} />
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