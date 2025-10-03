const express = require('express');
const router = express.Router();
const db = require('../db');
const { protegerAdmin } = require('../middleware/authMiddleware');

// Listar todas as alocações ativas (protegida para admins)
router.get('/', protegerAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT 
        a.id, a.data_inicio, v.placa, v.modelo, vend.nome as vendedor_nome
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

// --- NOVA ROTA PARA O HISTÓRICO COMPLETO ---
router.get('/historico', protegerAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT 
        a.id, a.data_inicio, a.data_fim, v.placa, v.modelo, vend.nome as vendedor_nome
      FROM alocacoes a
      JOIN veiculos v ON a.id_veiculo = v.id
      JOIN vendedores vend ON a.id_vendedor = vend.id
      ORDER BY a.data_inicio DESC;
    `;
    const [historico] = await db.query(sql);
    res.json(historico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico de alocações: ' + error.message });
  }
});

// Criar uma nova alocação (protegida para admins)
router.post('/', protegerAdmin, async (req, res) => {
  const { id_veiculo, id_vendedor, data_inicio } = req.body;
  if (!id_veiculo || !id_vendedor || !data_inicio) {
    return res.status(400).json({ error: 'Veículo, vendedor e data de início são obrigatórios.' });
  }
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const sqlAlocacao = 'INSERT INTO alocacoes (id_veiculo, id_vendedor, data_inicio) VALUES (?, ?, ?)';
    const [result] = await connection.query(sqlAlocacao, [id_veiculo, id_vendedor, data_inicio]);

    const sqlUpdateVeiculo = "UPDATE veiculos SET status = 'em_uso' WHERE id = ?";
    await connection.query(sqlUpdateVeiculo, [id_veiculo]);
    
    await connection.commit();
    res.status(201).json({ message: 'Alocação criada com sucesso!', id: result.insertId });
  } catch (error) { 
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao criar alocação: ' + error.message }); 
  } finally {
    connection.release();
  }
});

// Finalizar uma alocação (protegida para admins)
router.put('/finalizar/:id', protegerAdmin, async (req, res) => {
    const { id } = req.params;
    const { data_fim } = req.body;
    if (!data_fim) {
        return res.status(400).json({ error: 'Data de finalização é obrigatória.'});
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [alocacao] = await connection.query('SELECT id_veiculo FROM alocacoes WHERE id = ?', [id]);
        if (alocacao.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Alocação não encontrada.' });
        }
        const { id_veiculo } = alocacao[0];

        const sqlFinalizar = 'UPDATE alocacoes SET data_fim = ? WHERE id = ?';
        await connection.query(sqlFinalizar, [data_fim, id]);

        const sqlUpdateVeiculo = "UPDATE veiculos SET status = 'disponivel' WHERE id = ?";
        await connection.query(sqlUpdateVeiculo, [id_veiculo]);

        await connection.commit();
        res.json({ message: 'Alocação finalizada com sucesso!' });
    } catch (error) { 
        await connection.rollback();
        res.status(500).json({ error: 'Erro ao finalizar alocação: ' + error.message }); 
    } finally {
        connection.release();
    }
});

module.exports = router;