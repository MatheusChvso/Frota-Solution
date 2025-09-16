// frontend/src/main.jsx (VERSÃO CORRIGIDA E LIMPA)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode está desativado como planejamos para estabilizar os testes
  <BrowserRouter>
    <App />
  </BrowserRouter>
);