// backend/routes/veiculos.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Importa a conexão do banco

// ROTA GET: Listar todos os veículos
router.get('/', async (req, res) => {
  try {
    const [veiculos] = await db.query('SELECT * FROM veiculos ORDER BY id DESC');
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar veículos: ' + error.message });
  }
});

// ROTA POST: Criar um novo veículo
router.post('/', async (req, res) => {
  // Pega os dados do corpo da requisição
  const { placa, marca, modelo, ano, km_atual, limite_km_mensal, status = 'disponivel' } = req.body;

  if (!placa || !marca || !modelo || !ano) {
    return res.status(400).json({ error: 'Placa, marca, modelo e ano são obrigatórios.' });
  }

  try {
    const sql = 'INSERT INTO veiculos (placa, marca, modelo, ano, km_atual, limite_km_mensal, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [placa, marca, modelo, ano, km_atual, limite_km_mensal, status]);
    res.status(201).json({ message: 'Veículo criado com sucesso!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar veículo: ' + error.message });
  }
});



// ROTA DELETE: Deletar um veículo por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'DELETE FROM veiculos WHERE id = ?';
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    res.json({ message: 'Veículo deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar veículo: ' + error.message });
  }
});



// ROTA PUT: Atualizar um veículo por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  // 1. ADICIONE 'limite_km_contrato' AQUI PARA RECEBER O DADO
  const { placa, marca, modelo, ano, km_atual, limite_km_mensal, limite_km_contrato, status } = req.body;

  if (!placa || !marca || !modelo || !ano || !status) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // 2. ADICIONE O CAMPO NA QUERY SQL DE UPDATE
    const sql = `
      UPDATE veiculos 
      SET placa = ?, marca = ?, modelo = ?, ano = ?, km_atual = ?, limite_km_mensal = ?, limite_km_contrato = ?, status = ?
      WHERE id = ?
    `;
    // 3. ADICIONE A VARIÁVEL NA LISTA DE PARÂMETROS DA QUERY
    const [result] = await db.query(sql, [placa, marca, modelo, ano, km_atual, limite_km_mensal, limite_km_contrato, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    res.json({ message: 'Veículo atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar veículo: ' + error.message });
  }
});

// ** (No futuro, adicionaremos aqui as rotas de GET por ID, PUT e DELETE) **

module.exports = router;