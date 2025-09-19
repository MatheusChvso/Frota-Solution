// backend/routes/manutencao.js (VERSÃO COMPLETA E FINAL)

const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware');

// --- 1. GERENCIAMENTO DE TIPOS DE MANUTENÇÃO ---

// Listar todos os tipos de manutenção
router.get('/tipos', proteger, async (req, res) => {
  try {
    const [tipos] = await db.query('SELECT * FROM tipos_manutencao ORDER BY nome');
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipos de manutenção: ' + error.message });
  }
});

// Criar um novo tipo de manutenção
router.post('/tipos', proteger, async (req, res) => {
  const { nome, intervalo_km_padrao, descricao } = req.body;
  if (!nome || !intervalo_km_padrao) {
    return res.status(400).json({ error: 'Nome e Intervalo de KM são obrigatórios.' });
  }
  try {
    const sql = 'INSERT INTO tipos_manutencao (nome, intervalo_km_padrao, descricao) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [nome, intervalo_km_padrao, descricao]);
    res.status(201).json({ message: 'Tipo de manutenção criado com sucesso!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tipo de manutenção: ' + error.message });
  }
});

// Atualizar um tipo de manutenção
router.put('/tipos/:id', proteger, async (req, res) => {
    const { id } = req.params;
    const { nome, intervalo_km_padrao, descricao } = req.body;
    if (!nome || !intervalo_km_padrao) {
        return res.status(400).json({ error: 'Nome e Intervalo de KM são obrigatórios.' });
    }
    try {
        const sql = 'UPDATE tipos_manutencao SET nome = ?, intervalo_km_padrao = ?, descricao = ? WHERE id = ?';
        const [result] = await db.query(sql, [nome, intervalo_km_padrao, descricao, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Tipo de manutenção não encontrado.' });
        res.json({ message: 'Tipo de manutenção atualizado com sucesso!' });
    } catch (error) { res.status(500).json({ error: 'Erro ao atualizar tipo de manutenção: ' + error.message }); }
});

// Deletar um tipo de manutenção
router.delete('/tipos/:id', proteger, async (req, res) => {
    const { id } = req.params;
    try {
        const [uso] = await db.query('SELECT 1 FROM historico_manutencao WHERE id_tipo_manutencao = ? LIMIT 1', [id]);
        if (uso.length > 0) {
            return res.status(400).json({ error: 'Não é possível excluir. Este tipo de serviço já está sendo usado no histórico de manutenções.' });
        }
        const [result] = await db.query('DELETE FROM tipos_manutencao WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Tipo de manutenção não encontrado.' });
        res.json({ message: 'Tipo de manutenção deletado com sucesso!' });
    } catch (error) { res.status(500).json({ error: 'Erro ao deletar tipo: ' + error.message }); }
});


// --- 2. GERENCIAMENTO DO HISTÓRICO DE MANUTENÇÃO ---

// Buscar histórico de um veículo específico
router.get('/historico/:id_veiculo', proteger, async (req, res) => {
    try {
        const { id_veiculo } = req.params;
        const sql = `
            SELECT h.*, t.nome as nome_manutencao 
            FROM historico_manutencao h
            JOIN tipos_manutencao t ON h.id_tipo_manutencao = t.id
            WHERE h.id_veiculo = ? 
            ORDER BY h.data_realizacao DESC
        `;
        const [historico] = await db.query(sql, [id_veiculo]);
        res.json(historico);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar histórico: ' + error.message }); }
});

// Registrar um novo serviço no histórico
router.post('/historico', proteger, async (req, res) => {
    const { id_veiculo, id_tipo_manutencao, data_realizacao, km_realizacao, custo, observacoes } = req.body;
    if (!id_veiculo || !id_tipo_manutencao || !data_realizacao || !km_realizacao) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }
    try {
        // Se 'custo' for uma string vazia, converte para null; senão, mantém o valor.
        const custoFinal = custo === '' || custo === undefined ? null : custo;

        const sql = 'INSERT INTO historico_manutencao (id_veiculo, id_tipo_manutencao, data_realizacao, km_realizacao, custo, observacoes) VALUES (?, ?, ?, ?, ?, ?)';
        
        const [result] = await db.query(sql, [id_veiculo, id_tipo_manutencao, data_realizacao, km_realizacao, custoFinal, observacoes]);
        
        res.status(201).json({ message: 'Histórico de manutenção registrado com sucesso!', id: result.insertId });
    } catch (error) { res.status(500).json({ error: 'Erro ao registrar histórico: ' + error.message }); }
});


// --- 3. ROTA INTELIGENTE: STATUS DE MANUTENÇÃO DA FROTA ---

// Calcular e retornar o status de manutenção de todos os veículos
router.get('/status-frota', proteger, async (req, res) => {
    try {
        const [veiculos] = await db.query('SELECT id, modelo, placa, km_atual, km_inicial_contrato FROM veiculos');
        const [tiposManutencao] = await db.query('SELECT * FROM tipos_manutencao');
        const [historico] = await db.query('SELECT * FROM historico_manutencao ORDER BY km_realizacao DESC');

        const statusFrota = veiculos.map(veiculo => {
            const statusManutencoes = tiposManutencao.map(tipo => {
                const ultimaRealizada = historico.find(h => h.id_veiculo === veiculo.id && h.id_tipo_manutencao === tipo.id);
                const kmBase = ultimaRealizada ? ultimaRealizada.km_realizacao : (veiculo.km_inicial_contrato || 0);
                const kmProxima = kmBase + tipo.intervalo_km_padrao;
                const kmRestantes = kmProxima - veiculo.km_atual;

                let status = 'Em dia';
                if (kmRestantes <= 0) status = 'Atrasada';
                else if (kmRestantes <= tipo.intervalo_km_padrao * 0.15) status = 'Atenção';

                return {
                    id_tipo: tipo.id,
                    nome: tipo.nome,
                    km_restantes: kmRestantes,
                    status: status
                };
            });
            return { ...veiculo, manutencoes: statusManutencoes };
        });
        res.json(statusFrota);
    } catch (error) { res.status(500).json({ error: 'Erro ao calcular status da frota: ' + error.message }); }
});

module.exports = router;