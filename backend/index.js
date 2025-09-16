// backend/index.js (VERSÃO CORRIGIDA E LIMPA)

// A configuração do dotenv deve ser a primeira coisa a ser executada
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

// Importação das rotas
const veiculosRoutes = require('./routes/veiculos');
const vendedoresRoutes = require('./routes/vendedores');
const alocacoesRoutes = require('./routes/alocacoes');
const leiturasKmRoutes = require('./routes/leiturasKm');
const dashboardRoutes = require('./routes/dashboard');
const relatoriosRoutes = require('./routes/relatorios');
const manutencaoRoutes = require('./routes/manutencao');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Definição das Rotas da API
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api/alocacoes', alocacoesRoutes);
app.use('/api/leituras-km', leiturasKmRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/manutencao', manutencaoRoutes);

// Rota principal para verificar se a API está online
app.get('/', (req, res) => {
  res.send('API do Sistema de Gestão de Frota está no ar!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});