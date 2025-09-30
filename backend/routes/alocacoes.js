const express = require('express');
const router = express.Router();
const db = require('../db');
const { protegerAdmin } = require('../middleware/authMiddleware');

// Listar todas as alocações ativas (protegido por admin)
router.get('/', protegerAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT 
        a.id, a.data_inicio,
        v.placa, v.modelo, 
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

// Criar uma nova alocação (agora atualiza o status do veículo)
router.post('/', protegerAdmin, async (req, res) => {
  const { id_veiculo, id_vendedor, data_inicio } = req.body;
  if (!id_veiculo || !id_vendedor || !data_inicio) {
    return res.status(400).json({ error: 'Veículo, vendedor e data de início são obrigatórios.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insere a nova alocação
    const sqlInsert = 'INSERT INTO alocacoes (id_veiculo, id_vendedor, data_inicio) VALUES (?, ?, ?)';
    const [result] = await connection.query(sqlInsert, [id_veiculo, id_vendedor, data_inicio]);

    // 2. Atualiza o status do veículo para 'em_uso'
    const sqlUpdate = "UPDATE veiculos SET status = 'em_uso' WHERE id = ?";
    await connection.query(sqlUpdate, [id_veiculo]);

    await connection.commit();
    res.status(201).json({ message: 'Alocação criada com sucesso!', id: result.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao criar alocação: ' + error.message });
  } finally {
    connection.release();
  }
});

// Finalizar uma alocação (agora atualiza o status do veículo para 'disponivel')
router.put('/finalizar/:id', protegerAdmin, async (req, res) => {
    const { id } = req.params;
    const { data_fim } = req.body;
    if (!data_fim) {
        return res.status(400).json({ error: 'Data de finalização é obrigatória.'});
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Descobre qual veículo está associado a esta alocação
        const [alocacoes] = await connection.query('SELECT id_veiculo FROM alocacoes WHERE id = ?', [id]);
        if (alocacoes.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Alocação não encontrada.' });
        }
        const id_veiculo = alocacoes[0].id_veiculo;

        // 2. Finaliza a alocação
        const sqlUpdateAlocacao = 'UPDATE alocacoes SET data_fim = ? WHERE id = ?';
        await connection.query(sqlUpdateAlocacao, [data_fim, id]);
        
        // 3. Devolve o status do veículo para 'disponivel'
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