import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';

// Importação dos componentes de página
import PaginaGestao from './components/PaginaGestao.jsx'; 
import DashboardConsumo from './components/DashboardConsumo.jsx';
import PaginaVeiculos from './components/PaginaVeiculos.jsx';
import PaginaVendedores from './components/PaginaVendedores.jsx';
import PaginaAlocacoes from './components/PaginaAlocacoes.jsx';
import PaginaLogin from './components/PaginaLogin.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import PaginaRegistroKM from './components/PaginaRegistroKM.jsx';
import PaginaMural from './components/PaginaMural.jsx';
import PaginaTiposManutencao from './components/PaginaTiposManutencao.jsx';
import PaginaManutencao from './components/PaginaManutencao.jsx';
import PaginaHistoricoKM from './components/PaginaHistoricoKM.jsx';

import './App.css';

// --- Componente de Layout Principal (Área Logada) ---
const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div>
      <nav className="main-nav">
        <div className="nav-links">
          {/* Links visíveis para TODOS os usuários logados */}
          <NavLink to="/app">Dashboard</NavLink> 
          <NavLink to="/app/registrar-km">Registar KM</NavLink>

          {/* ===== LÓGICA DE EXIBIÇÃO CONDICIONAL PARA ADMINS ===== */}
          {/* O bloco abaixo só aparece se o perfil do usuário for 'admin' */}
          {user?.perfil === 'admin' && (
            <>
              <NavLink to="/app/gestao">Gestão</NavLink>
              <NavLink to="/app/mural">Checklist Diário</NavLink>
              <NavLink to="/app/manutencao">Manutenção</NavLink>
              <NavLink to="/app/historico-km">Histórico KM</NavLink>
            </>
          )}
        </div>
        <div className="nav-user">
          <span>Olá, {user?.nome}</span>
          <button onClick={logout} className="btn-logout">Sair</button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          {/* A rota /app (índice) renderiza o dashboard */}
          <Route index element={<DashboardConsumo />} />
          
          {/* Rotas comuns a todos os usuários logados */}
          <Route path="registrar-km" element={<PaginaRegistroKM />} />

          {/* Rotas de Admin */}
          {/* Mesmo que um vendedor tente aceder a estas rotas pela URL, o backend irá bloqueá-lo */}
          <Route path="mural" element={<PaginaMural />} />
          <Route path="historico-km" element={<PaginaHistoricoKM />} />
          <Route path="manutencao" element={<PaginaManutencao />} />
          <Route path="manutencao/tipos" element={<PaginaTiposManutencao />} />
          <Route path="gestao" element={<PaginaGestao />}>
            <Route path="veiculos" element={<PaginaVeiculos />} />
            <Route path="alocacoes" element={<PaginaAlocacoes />} />
            <Route path="vendedores" element={<PaginaVendedores />} />
            <Route index element={<Navigate to="veiculos" replace />} />
          </Route>
          
          {/* Redireciona qualquer outra rota dentro de /app para o dashboard */}
          <Route path="*" element={<Navigate to="/app" />} />
        </Routes>
      </main>
    </div>
  );
};

// --- Componente App Principal ---
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ROTA PRINCIPAL: Página de login */}
        <Route path="/" element={<PaginaLogin />} />
        
        {/* ROTA ANTIGA DE LOGIN: Redireciona para a raiz para evitar duplicidade */}
        <Route path="/login" element={<Navigate to="/" />} />

        {/* ROTA PÚBLICA: Dashboard público */}
        <Route path="/dashboard" element={<DashboardConsumo />} />
        
        {/* ROTAS PROTEGIDAS: Engloba todo o layout da área logada */}
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

