// backend/index.js

const express = require('express');
const cors = require('cors');
const db = require('./db'); // Importa nosso módulo de conexão

const app = express();
const PORT = 3001; // Porta para o backend rodar, diferente da porta do React
const veiculosRoutes = require('./routes/veiculos'); // <-- ADICIONE ESTA LINHA
const vendedoresRoutes = require('./routes/vendedores');
const alocacoesRoutes = require('./routes/alocacoes');

// Middlewares
app.use(cors()); // Permite que o frontend acesse a API
app.use(express.json()); // Permite que o servidor entenda JSON

// Rota de teste para verificar a conexão com o banco de dados
app.get('/api/test-db', async (req, res) => {
  try {
    // Pega uma conexão do pool
    const connection = await db.getConnection();

    // Executa uma consulta simples para testar
    const [rows] = await connection.query('SELECT NOW() as currentTime;');

    // Libera a conexão de volta para o pool
    connection.release();

    console.log('Teste de DB bem-sucedido:', rows[0]);
    res.json({
      success: true,
      message: 'Conexão com o banco de dados bem-sucedida!',
      databaseTime: rows[0].currentTime
    });
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    res.status(500).json({
      success: false,
      message: 'Falha ao conectar com o banco de dados.',
      error: error.message
    });
  }
});

// Rota principal
app.get('/', (req, res) => {
  res.send('API do Sistema de Gestão de Frota está no ar!');
});

app.use('/api/veiculos', veiculosRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api/alocacoes', alocacoesRoutes);
// Inicia o servidor

app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});