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
  const { user, logout } = useContext(AuthContext); // user agora tem user.perfil
  return (
    <div>
      <nav className="main-nav">
        <div className="nav-links">
          <NavLink to="/app">Dashboard</NavLink>

          {/* --- LÓGICA DE EXIBIÇÃO CONDICIONAL --- */}
          {user?.perfil === 'admin' && (
            <>
              <NavLink to="/app/gestao">Gestão</NavLink>
              <NavLink to="/app/mural">Checklist Diário</NavLink>
              <NavLink to="/app/manutencao">Manutenção</NavLink>
              <NavLink to="/app/historico-km">Histórico KM</NavLink>
            </>
          )}

          {/* Link que aparece para todos os usuários logados */}
          <NavLink to="/app/registrar-km">Registrar KM</NavLink>

        
        </div>
        <div className="nav-user">
          <span>Olá, {user?.nome}</span>
          <button onClick={logout} className="btn-logout">Sair</button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          {/* A rota /app agora renderiza o dashboard logado */}
          <Route index element={<DashboardConsumo />} />
          <Route path="/mural" element={<PaginaMural />} />
          <Route path="/historico-km" element={<PaginaHistoricoKM />} />
          <Route path="/manutencao" element={<PaginaManutencao />} />
          <Route path="/manutencao/tipos" element={<PaginaTiposManutencao />} />
          <Route path="/registrar-km" element={<PaginaRegistroKM />} />
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
        {/* ROTA PRINCIPAL: Agora é a página de login */}
        <Route path="/" element={<PaginaLogin />} />
        
        {/* ROTA ANTIGA DE LOGIN: Redireciona para a raiz para evitar duplicidade */}
        <Route path="/login" element={<Navigate to="/" />} />

        {/* ROTA PÚBLICA: Dashboard público agora fica em /dashboard */}
        <Route path="/dashboard" element={<DashboardConsumo />} />
        
        {/* ROTAS PROTEGIDAS */}
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