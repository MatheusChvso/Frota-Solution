// backend/routes/leiturasKm.js (VERSÃO FINAL CORRIGIDA)
const express = require('express');
const router = express.Router();
const db = require('../db');
// Adicione a vírgula e o protegerAdmin
const { proteger, protegerAdmin } = require('../middleware/authMiddleware');

// --- NOVA ROTA PARA O ADMIN ---
// Busca TODOS os veículos ativos e quem está com eles
router.get('/todos-veiculos-ativos', protegerAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT 
                v.id, v.placa, v.modelo, v.km_atual, a.id as id_alocacao, vend.nome as nome_condutor
            FROM alocacoes a
            JOIN veiculos v ON a.id_veiculo = v.id
            JOIN vendedores vend ON a.id_vendedor = vend.id
            WHERE a.data_fim IS NULL
            ORDER BY vend.nome, v.modelo
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('ERRO na rota /todos-veiculos-ativos:', error);
        res.status(500).json({ error: 'Erro ao buscar lista geral de veículos.' });
    }
});

// ROTA ESPECIAL: Busca TODOS os veículos ativos do vendedor logado
router.get('/meu-veiculo', proteger, async (req, res) => {
    try {
        const idVendedorLogado = req.vendedor.id;
        const sql = `
            SELECT 
                v.id, v.placa, v.modelo, v.km_atual, a.id as id_alocacao
            FROM alocacoes a
            JOIN veiculos v ON a.id_veiculo = v.id
            WHERE a.id_vendedor = ? AND a.data_fim IS NULL
        `;
        const [rows] = await db.query(sql, [idVendedorLogado]);
        res.json(rows);
    } catch (error) {
        console.error('ERRO na rota /meu-veiculo:', error);
        res.status(500).json({ error: 'Erro ao buscar veículos do vendedor.' });
    }
});


// Rota para registrar KM (AGORA COM TRANSAÇÃO E ATUALIZAÇÃO DO VEÍCULO)
router.post('/', proteger, async (req, res) => {
    const { km_atual, data_leitura, id_alocacao } = req.body;

    if (!km_atual || !data_leitura || !id_alocacao) {
        return res.status(400).json({ error: 'KM atual, data e a alocação do veículo são obrigatórios.' });
    }

    const connection = await db.getConnection(); // Pega uma conexão do pool

    try {
        await connection.beginTransaction(); // Inicia a transação

        // 1. Pega o ID do veículo a partir do ID da alocação
        const [alocacoes] = await connection.query('SELECT id_veiculo FROM alocacoes WHERE id = ?', [id_alocacao]);
        if (alocacoes.length === 0) {
            await connection.rollback(); // Desfaz a transação
            return res.status(404).json({ error: 'Alocação não encontrada.' });
        }
        const id_veiculo = alocacoes[0].id_veiculo;

        // 2. Busca dados do veículo para validação
        const [veiculos] = await connection.query('SELECT km_atual, data_inicio_contrato FROM veiculos WHERE id = ?', [id_veiculo]);
        const veiculo = veiculos[0];

        // 3. Validações
        if (parseInt(km_atual, 10) <= veiculo.km_atual) {
            await connection.rollback();
            return res.status(400).json({ error: `A nova quilometragem (${km_atual}) deve ser maior que a anterior (${veiculo.km_atual}).` });
        }

        // 4. Inserir a nova leitura na tabela de histórico
        const sqlInsertLeitura = 'INSERT INTO leituras_km (id_alocacao, km_atual, data_leitura) VALUES (?, ?, ?)';
        await connection.query(sqlInsertLeitura, [id_alocacao, km_atual, data_leitura]);

        // 5. ATUALIZAR a KM na tabela principal de veículos (O PASSO QUE FALTAVA)
        const sqlUpdateVeiculo = 'UPDATE veiculos SET km_atual = ? WHERE id = ?';
        await connection.query(sqlUpdateVeiculo, [km_atual, id_veiculo]);
        
        await connection.commit(); // Confirma as alterações no banco de dados
        res.status(201).json({ message: 'Leitura de KM registrada com sucesso!' });

    } catch (error) {
        await connection.rollback(); // Desfaz tudo em caso de erro
        console.error('Erro ao registrar leitura de KM:', error);
        res.status(500).json({ error: 'Erro interno ao registrar leitura.' });
    } finally {
        connection.release(); // Libera a conexão de volta para o pool
    }
});


// Rota de histórico (COM A LÓGICA DE KM PERCORRIDOS CORRIGIDA)
router.get('/historico', proteger, async (req, res) => {
  try {
    const query = `
      SELECT
        lk.id,
        lk.data_leitura,
        lk.km_atual,
        LAG(lk.km_atual, 1) OVER (PARTITION BY a.id_veiculo ORDER BY lk.data_leitura, lk.id) AS km_anterior,
        -- Calcula a diferença apenas entre leituras consecutivas. A primeira será NULL.
        (lk.km_atual - LAG(lk.km_atual, 1) OVER (PARTITION BY a.id_veiculo ORDER BY lk.data_leitura, lk.id)) AS km_percorridos,
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
