// frontend/src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PaginaVeiculos from './components/PaginaVeiculos';
import PaginaVendedores from './components/PaginaVendedores';
import PaginaAlocacoes from './components/PaginaAlocacoes';
import PaginaLogin from './components/PaginaLogin';
import RotaProtegida from './components/RotaProtegida';
import PaginaRegistroKM from './components/PaginaRegistroKM';
import PaginaMural from './components/PaginaMural';
import PaginaRelatorio from './components/PaginaRelatorio';
import './App.css';

// Componente de Layout principal que inclui a navegação
const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px', fontSize: '1.1em', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Link to="/" style={{ marginRight: '15px' }}>Minha Página</Link>
          <Link to="/mural" style={{ marginRight: '15px' }}>Mural da Vergonha</Link>
          <Link to="/veiculos" style={{ marginRight: '15px' }}>Veículos</Link>
          <Link to="/vendedores" style={{ marginRight: '15px' }}>Vendedores</Link>
          <Link to="/alocacoes" style={{ marginRight: '15px' }}>Alocações</Link>
          <Link to="/relatorios" style={{ marginRight: '15px' }}>Relatórios</Link>
        </div>
        <div>
          <span>Olá, {user?.nome}</span>
          <button onClick={logout} style={{ marginLeft: '15px' }}>Sair</button>
        </div>
      </nav>
      <div style={{ padding: '0 20px' }}>
        <Routes>
          <Route path="/" element={<PaginaRegistroKM />} /> 
          <Route path="/mural" element={<PaginaMural />} />
          <Route path="/veiculos" element={<PaginaVeiculos />} />
          <Route path="/vendedores" element={<PaginaVendedores />} />
          <Route path="/alocacoes" element={<PaginaAlocacoes />} />
          <Route path="/relatorios" element={<PaginaRelatorio />} />
          {/* Rota padrão dentro do layout protegido */}
          <Route path="*" element={<Navigate to="/veiculos" />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PaginaLogin />} />


        <Route 
          path="/*" // Qualquer outra rota...
          element={
            <RotaProtegida> {/* ...será protegida... */}
              <MainLayout /> {/* ...e renderizará o layout principal */}
            </RotaProtegida>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}
export default App;