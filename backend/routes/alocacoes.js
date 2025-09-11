// backend/routes/alocacoes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todas as alocações ativas
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        a.id, 
        a.data_inicio,
        v.placa, 
        v.modelo, 
        vend.nome as vendedor_nome
      FROM alocacoes a
      JOIN veiculos v ON a.id_veiculo = v.id
      JOIN vendedores vend ON a.id_vendedor = vend.id
      WHERE a.data_fim IS NULL
      ORDER BY a.data_inicio DESC;
    `;
    const [alocacoes] = await db.query(sql);
    res.json(alocacoes);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Criar uma nova alocação
router.post('/', async (req, res) => {
  const { id_veiculo, id_vendedor, data_inicio } = req.body;
  if (!id_veiculo || !id_vendedor || !data_inicio) {
    return res.status(400).json({ error: 'Veículo, vendedor e data de início são obrigatórios.' });
  }
  try {
    const sql = 'INSERT INTO alocacoes (id_veiculo, id_vendedor, data_inicio) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [id_veiculo, id_vendedor, data_inicio]);
    res.status(201).json({ message: 'Alocação criada com sucesso!', id: result.insertId });
  } catch (error) { res.status(500).json({ error: 'Erro ao criar alocação: ' + error.message }); }
});

// Finalizar uma alocação (encerrar)
router.put('/finalizar/:id', async (req, res) => {
    const { id } = req.params;
    const { data_fim } = req.body;
    if (!data_fim) {
        return res.status(400).json({ error: 'Data de finalização é obrigatória.'});
    }
    try {
        const sql = 'UPDATE alocacoes SET data_fim = ? WHERE id = ?';
        const [result] = await db.query(sql, [data_fim, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Alocação não encontrada' });
        res.json({ message: 'Alocação finalizada com sucesso!' });
    } catch (error) { res.status(500).json({ error: 'Erro ao finalizar alocação: ' + error.message }); }
});

module.exports = router;