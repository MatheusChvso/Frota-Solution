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
    const { km_atual, data_leitura, id_alocacao } = req.body; // Recebe o ID da alocação

    if (!km_atual || !data_leitura || !id_alocacao) {
        return res.status(400).json({ error: 'KM atual, data e o veículo (alocação) são obrigatórios.' });
    }

    try {
        // 1. Pega o ID do veículo a partir do ID da alocação para validação
        const [alocacoes] = await db.query('SELECT id_veiculo FROM alocacoes WHERE id = ?', [id_alocacao]);
        if (alocacoes.length === 0) {
            return res.status(404).json({ error: 'Alocação não encontrada.' });
        }
        const id_veiculo = alocacoes[0].id_veiculo;

        // 2. Buscar dados do veículo para validação
        const [veiculos] = await db.query('SELECT km_atual, data_inicio_contrato FROM veiculos WHERE id = ?', [id_veiculo]);
        const veiculo = veiculos[0];

        // 3. Validações
        if (veiculo.data_inicio_contrato && new Date(data_leitura) < new Date(veiculo.data_inicio_contrato)) {
            return res.status(400).json({ 
                error: `A data da leitura não pode ser anterior à data de início do contrato.`
            });
        }
        if (parseInt(km_atual, 10) <= veiculo.km_atual) {
            return res.status(400).json({ error: `A nova quilometragem (${km_atual}) deve ser maior que a anterior (${veiculo.km_atual}).` });
        }

        // 4. Inserir a nova leitura usando o id_alocacao
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
        -- Usa LAG() para pegar o KM da leitura anterior para o mesmo veículo
        -- Se for a primeira leitura, usa o KM inicial do contrato como base
        COALESCE(
          LAG(lk.km_atual, 1) OVER (PARTITION BY a.id_veiculo ORDER BY lk.data_leitura, lk.id),
          v.km_inicial_contrato
        ) AS km_anterior,
        -- Calcula a diferença
        (lk.km_atual - COALESCE(
          LAG(lk.km_atual, 1) OVER (PARTITION BY a.id_veiculo ORDER BY lk.data_leitura, lk.id),
          v.km_inicial_contrato
        )) AS km_percorridos,
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