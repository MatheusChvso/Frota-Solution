// backend/routes/veiculos.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware'); // Importando o middleware de segurança

// ROTA GET: Listar todos os veículos (pública, não precisa de 'proteger')
router.get('/', async (req, res) => {
  try {
    const [veiculos] = await db.query('SELECT * FROM veiculos ORDER BY id DESC');
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar veículos: ' + error.message });
  }
});

// As operações de criar, atualizar e deletar devem ser protegidas
router.post('/', proteger, async (req, res) => {
  const { placa, marca, modelo, ano, km_atual, limite_km_mensal } = req.body;
  if (!placa || !marca || !modelo || !ano) {
    return res.status(400).json({ error: 'Placa, marca, modelo e ano são obrigatórios.' });
  }
  try {
    const sql = 'INSERT INTO veiculos (placa, marca, modelo, ano, km_atual, limite_km_mensal) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [placa, marca, modelo, ano, km_atual, limite_km_mensal]);
    res.status(201).json({ message: 'Veículo criado com sucesso!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar veículo: ' + error.message });
  }
});

router.put('/:id', proteger, async (req, res) => {
  const { id } = req.params;
  const { placa, marca, modelo, ano, km_atual, limite_km_mensal, data_inicio_contrato, tempo_contrato_meses, km_inicial_contrato, status } = req.body;
  if (!placa || !marca || !modelo || !ano || !status) {
    return res.status(400).json({ error: 'Campos principais são obrigatórios.' });
  }
  try {
    const sql = `
      UPDATE veiculos 
      SET placa = ?, marca = ?, modelo = ?, ano = ?, km_atual = ?, limite_km_mensal = ?, 
          data_inicio_contrato = ?, tempo_contrato_meses = ?, km_inicial_contrato = ?, status = ?
      WHERE id = ?
    `;
    const params = [placa, marca, modelo, ano, km_atual, limite_km_mensal, data_inicio_contrato, tempo_contrato_meses, km_inicial_contrato, status, id];
    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }
    res.json({ message: 'Veículo atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar veículo: ' + error.message });
  }
});

router.delete('/:id', proteger, async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'DELETE FROM veiculos WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }
    res.json({ message: 'Veículo deletado com sucesso!' });
  } catch (error) {
    // ADICIONE ESTA LINHA PARA VER O ERRO DETALHADO
    console.error('--- ERRO DETALHADO AO DELETAR VEÍCULO:', error, '---'); 
    res.status(500).json({ error: 'Erro ao deletar veículo: ' + error.message });
  }
});
module.exports = router;