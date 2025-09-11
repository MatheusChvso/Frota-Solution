// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PaginaVeiculos from './components/PaginaVeiculos'; // Importe o componente renomeado
// Futuramente importaremos a página de vendedores aqui
import './App.css';

function App() {
  return (
    <div>
      <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
        <Link to="/veiculos" style={{ marginRight: '15px' }}>Gerenciar Veículos</Link>
        {/* Futuramente adicionaremos o link para vendedores aqui */}
      </nav>

      <div style={{ padding: '0 20px' }}>
        <Routes>
          {/* A rota padrão e a /veiculos carregarão a mesma página */}
          <Route path="/" element={<PaginaVeiculos />} />
          <Route path="/veiculos" element={<PaginaVeiculos />} />
          {/* Futuramente adicionaremos a rota para vendedores aqui */}
        </Routes>
      </div>
    </div>
  );
}

export default App;