// backend/routes/leiturasKm.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware');

// ROTA ESPECIAL: Busca o veículo atual do vendedor logado e sua última KM
router.get('/meu-veiculo', proteger, async (req, res) => {
    console.log('--- 1. Rota /meu-veiculo iniciada. ---');
    try {
        const idVendedorLogado = req.vendedor.id;
        console.log('--- 2. ID do vendedor obtido do token:', idVendedorLogado, '---');

        const sql = `
            SELECT 
                v.id, v.placa, v.modelo, v.km_atual
            FROM alocacoes a
            JOIN veiculos v ON a.id_veiculo = v.id
            WHERE a.id_vendedor = ? AND a.data_fim IS NULL
        `;

        console.log('--- 3. Executando a consulta SQL... ---');
        const [rows] = await db.query(sql, [idVendedorLogado]);
        console.log('--- 4. Consulta SQL concluída com sucesso. ---');

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Nenhum veículo alocado para este vendedor.' });
        }
    } catch (error) {
        console.error('--- ERRO FATAL na rota /meu-veiculo:', error, '---');
        res.status(500).json({ error: 'Erro ao buscar veículo do vendedor.' });
    }
});

// Em backend/routes/leiturasKm.js

router.post('/', proteger, async (req, res) => {
    const idVendedorLogado = req.vendedor.id;
    const { km_atual, data_leitura } = req.body;

    if (!km_atual || !data_leitura) {
        return res.status(400).json({ error: 'KM atual e data são obrigatórios.' });
    }

    try {
        // 1. Encontrar a alocação ativa do vendedor
        const [alocacoes] = await db.query('SELECT id, id_veiculo FROM alocacoes WHERE id_vendedor = ? AND data_fim IS NULL', [idVendedorLogado]);
        if (alocacoes.length === 0) {
            return res.status(404).json({ error: 'Você não possui um veículo alocado.' });
        }
        const id_alocacao = alocacoes[0].id;
        const id_veiculo = alocacoes[0].id_veiculo;

        // 2. Buscar dados do veículo, incluindo a data do contrato
        const [veiculos] = await db.query('SELECT km_atual, data_inicio_contrato FROM veiculos WHERE id = ?', [id_veiculo]);
        const veiculo = veiculos[0];

        // --- NOVA VALIDAÇÃO ---
        // 3. Verificar se a data da leitura é anterior ao início do contrato
        if (veiculo.data_inicio_contrato && new Date(data_leitura) < new Date(veiculo.data_inicio_contrato)) {
            return res.status(400).json({ 
                error: `A data da leitura (${new Date(data_leitura).toLocaleDateString('pt-BR')}) não pode ser anterior à data de início do contrato (${new Date(veiculo.data_inicio_contrato).toLocaleDateString('pt-BR')}).`
            });
        }

        // 4. Validar se a nova KM é maior que a anterior
        if (parseInt(km_atual, 10) <= veiculo.km_atual) {
            return res.status(400).json({ error: `A nova quilometragem (${km_atual}) deve ser maior que a anterior (${veiculo.km_atual}).` });
        }

        // 5. Inserir a nova leitura
        const sql = 'INSERT INTO leituras_km (id_alocacao, km_atual, data_leitura) VALUES (?, ?, ?)';
        await db.query(sql, [id_alocacao, km_atual, data_leitura]);

        res.status(201).json({ message: 'Leitura de KM registrada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar leitura: ' + error.message });
    }
});

router.get('/historico', proteger, async (req, res) => {
  try {
    const query = `
      SELECT
        lk.id,
        lk.data_leitura,
        lk.km_atual,
        v.modelo AS veiculo_modelo,
        v.placa AS veiculo_placa,
        vend.nome AS vendedor_nome
      FROM leituras_km lk
      JOIN alocacoes a ON lk.id_alocacao = a.id
      JOIN veiculos v ON a.id_veiculo = v.id
      JOIN vendedores vend ON a.id_vendedor = vend.id
      ORDER BY lk.data_leitura DESC, lk.id DESC;
    `;

    const [historico] = await db.query(query);
    res.status(200).json(historico);

  } catch (error) {
    console.error("Erro ao buscar histórico de KM:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});


module.exports = router;
module.exports = router;