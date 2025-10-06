const pool = require('../db'); 

exports.getDashboardData = async (req, res) => {
  const { veiculoId } = req.params;
  const params = veiculoId ? [veiculoId] : [];
  
  try {
    // -- Query para consumo diário (simplificada e corrigida)
    const queryConsumoHoje = `
      SELECT IFNULL(SUM(consumo), 0) AS consumo_total_hoje
      FROM (
        SELECT 
          (MAX(km_atual) - MIN(km_atual)) AS consumo
        FROM leituras_km lk
        JOIN alocacoes a ON lk.id_alocacao = a.id
        WHERE lk.data_leitura = CURRENT_DATE
        ${veiculoId ? `AND a.id_veiculo = ?` : ''}
        GROUP BY a.id_veiculo
      ) AS consumo_diario;
    `;

    // -- Query para consumo mensal (simplificada e corrigida)
    const queryConsumoMes = `
      SELECT IFNULL(SUM(consumo), 0) AS consumo_total_mes
      FROM (
        SELECT 
          (MAX(km_atual) - MIN(km_atual)) AS consumo
        FROM leituras_km lk
        JOIN alocacoes a ON lk.id_alocacao = a.id
        WHERE YEAR(lk.data_leitura) = YEAR(CURRENT_DATE) AND MONTH(lk.data_leitura) = MONTH(CURRENT_DATE)
        ${veiculoId ? `AND a.id_veiculo = ?` : ''}
        GROUP BY a.id_veiculo
      ) AS consumo_mensal;
    `;
    
    const queryLimiteTotal = `SELECT SUM(limite_km_mensal * tempo_contrato_meses) AS meta_contrato_total FROM veiculos v ${veiculoId ? `WHERE v.id = ?` : ''};`;

    // --- QUERY DE SALDOS CORRIGIDA PARA SER MAIS ROBUSTA ---
    // Agora usa INNER JOIN para garantir que apenas veículos com alocação ativa sejam exibidos
    const querySaldos = !veiculoId ? `
      SELECT 
        v.id, v.placa, v.modelo, vend.nome AS responsavel,
        COALESCE(TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1, 0) AS meses_passados,
        COALESCE(v.limite_km_mensal, 0) AS limite_km_mensal,
        COALESCE(v.limite_km_mensal * (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1), 0) AS meta_cumulativa,
        COALESCE(v.km_atual - v.km_inicial_contrato, 0) AS consumo_real_total,
        COALESCE((v.limite_km_mensal * (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1)) - (v.km_atual - v.km_inicial_contrato), 0) AS saldo_km
      FROM veiculos v
      INNER JOIN alocacoes a ON v.id = a.id_veiculo AND a.data_fim IS NULL
      LEFT JOIN vendedores vend ON a.id_vendedor = vend.id
      ORDER BY saldo_km ASC;
    ` : `SELECT 1;`;
    
    // --- QUERY DO GRÁFICO CORRIGIDA PARA SER MAIS ROBUSTA ---
    const queryLeiturasGrafico = veiculoId ? `
      SELECT 
        lk.data_leitura, 
        lk.km_atual, 
        -- Garante que o km_anterior nunca seja nulo, usando 0 como último recurso
        COALESCE(
          LAG(lk.km_atual, 1) OVER (PARTITION BY a.id_veiculo ORDER BY lk.data_leitura), 
          v.km_inicial_contrato, 
          0
        ) AS km_anterior 
      FROM leituras_km lk 
      JOIN alocacoes a ON lk.id_alocacao = a.id 
      JOIN veiculos v ON a.id_veiculo = v.id 
      WHERE lk.data_leitura >= CURDATE() - INTERVAL 30 DAY AND a.id_veiculo = ? 
      ORDER BY lk.data_leitura ASC;
    ` : `SELECT 1;`;

    const queryInfoVeiculo = veiculoId ? `SELECT v.modelo, v.placa, vend.nome AS nomeVendedor FROM veiculos v JOIN alocacoes a ON v.id = a.id_veiculo JOIN vendedores vend ON a.id_vendedor = vend.id WHERE a.id_veiculo = ? AND a.data_fim IS NULL LIMIT 1;` : `SELECT 1;`;

    const [
      [[resumoHoje]], [[resumoMes]], [[limiteTotal]], [saldos], [leiturasGrafico], [[infoVeiculo]]
    ] = await Promise.all([
      pool.query(queryConsumoHoje, params),
      pool.query(queryConsumoMes, params),
      pool.query(queryLimiteTotal, params),
      pool.query(querySaldos),
      pool.query(queryLeiturasGrafico, params),
      pool.query(queryInfoVeiculo, params)
    ]);
    
    const consumoPorDia = {};
    if (veiculoId && leiturasGrafico.length > 0) {
       for (let i = 0; i < leiturasGrafico.length; i++) {
        const leitura = leiturasGrafico[i];
        const dia = new Date(leitura.data_leitura).toISOString().split('T')[0];
        
        // A lógica para determinar o KM anterior agora é mais segura
        const kmAnterior = (i > 0) 
            ? leiturasGrafico[i-1].km_atual 
            : (leitura.km_anterior || 0); // Usa o valor da query, com fallback para 0
        
        const kmRodado = leitura.km_atual - kmAnterior;
        
        if (kmRodado > 0) {
            consumoPorDia[dia] = (consumoPorDia[dia] || 0) + kmRodado;
        }
      }
    }
    const graficoFinal = Object.keys(consumoPorDia).map(dia => ({ dia: new Date(dia).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit'}), consumo: consumoPorDia[dia] }));
    
    res.status(200).json({
      resumo: { consumoDia: Number(resumoHoje?.consumo_total_hoje ?? 0), consumoMes: Number(resumoMes?.consumo_total_mes ?? 0), limiteTotalContrato: Number(limiteTotal?.meta_contrato_total ?? 0) },
      viewData: veiculoId ? graficoFinal : saldos,
      infoVeiculo: veiculoId ? infoVeiculo : null
    });

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

exports.getStatusRegistrosDiarios = async (req, res) => {
  try {
    const query = `
      SELECT
        vend.nome,
        v.modelo,
        v.placa,
        CASE
          WHEN DATE(ur.data_ultimo_registro) = CURRENT_DATE THEN 'Feito'
          ELSE 'Pendente'
        END AS status_registro,
        ur.data_ultimo_registro
      FROM alocacoes a
      JOIN vendedores vend ON a.id_vendedor = vend.id
      JOIN veiculos v ON a.id_veiculo = v.id
      LEFT JOIN (
        SELECT
          id_alocacao,
          MAX(data_leitura) as data_ultimo_registro
        FROM leituras_km
        GROUP BY id_alocacao
      ) AS ur ON a.id = ur.id_alocacao
      WHERE
        a.data_fim IS NULL AND v.status = 'em_uso'
      ORDER BY
        status_registro, ur.data_ultimo_registro DESC, vend.nome;
    `;

    const [status] = await pool.query(query);
    res.status(200).json(status);

  } catch (error) {
    console.error("Erro ao buscar status de registos diários:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

