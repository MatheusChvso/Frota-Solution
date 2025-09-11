// frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PaginaVeiculos from './components/PaginaVeiculos';
import PaginaVendedores from './components/PaginaVendedores';
import PaginaAlocacoes from './components/PaginaAlocacoes'; // <-- 1. IMPORTE A NOVA PÁGINA
import './App.css';

function App() {
  return (
    <div>
      <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px', fontSize: '1.1em' }}>
        <Link to="/veiculos" style={{ marginRight: '15px' }}>Gerenciar Veículos</Link>
        <Link to="/vendedores" style={{ marginRight: '15px' }}>Gerenciar Vendedores</Link>
        <Link to="/alocacoes" style={{ marginRight: '15px' }}>Alocações</Link> {/* <-- 2. ADICIONE O NOVO LINK */}
      </nav>

      <div style={{ padding: '0 20px' }}>
        <Routes>
          <Route path="/" element={<PaginaVeiculos />} />
          <Route path="/veiculos" element={<PaginaVeiculos />} />
          <Route path="/vendedores" element={<PaginaVendedores />} />
          <Route path="/alocacoes" element={<PaginaAlocacoes />} /> {/* <-- 3. ADICIONE A NOVA ROTA */}
        </Routes>
      </div>
    </div>
  );
}

export default App;