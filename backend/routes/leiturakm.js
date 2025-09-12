// backend/routes/leiturasKm.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware');

// ROTA ESPECIAL: Busca o veículo atual do vendedor logado e sua última KM
router.get('/meu-veiculo', proteger, async (req, res) => {
    try {
        // req.vendedor.id vem do token JWT decodificado pelo middleware 'proteger'
        const idVendedorLogado = req.vendedor.id;

        const sql = `
            SELECT 
                v.id, v.placa, v.modelo, v.km_atual
            FROM alocacoes a
            JOIN veiculos v ON a.id_veiculo = v.id
            WHERE a.id_vendedor = ? AND a.data_fim IS NULL
        `;
        const [rows] = await db.query(sql, [idVendedorLogado]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Nenhum veículo alocado para este vendedor.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar veículo do vendedor: ' + error.message });
    }
});

// ROTA PARA REGISTRAR UMA NOVA LEITURA DE KM
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

        // 2. Validar se a nova KM é maior que a anterior
        const [veiculos] = await db.query('SELECT km_atual FROM veiculos WHERE id = ?', [id_veiculo]);
        if (parseInt(km_atual, 10) <= veiculos[0].km_atual) {
            return res.status(400).json({ error: `A nova quilometragem (${km_atual}) deve ser maior que a anterior (${veiculos[0].km_atual}).` });
        }

        // 3. Inserir a nova leitura
        const sql = 'INSERT INTO leituras_km (id_alocacao, km_atual, data_leitura) VALUES (?, ?, ?)';
        await db.query(sql, [id_alocacao, km_atual, data_leitura]);

        res.status(201).json({ message: 'Leitura de KM registrada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar leitura: ' + error.message });
    }
});

module.exports = router;