const pool = require('../db'); 

exports.getDashboardData = async (req, res) => {
  const { veiculoId } = req.params;
  const params = veiculoId ? [veiculoId] : [];
  const whereVeiculo = veiculoId ? `WHERE v.id = ?` : '';
  const andAlocacaoVeiculo = veiculoId ? `AND a.id_veiculo = ?` : '';
  
  try {
    // --- QUERY DE CONSUMO DIÁRIO CORRIGIDA ---
    const queryConsumoHoje = `
      WITH 
      leituras_hoje AS (
        SELECT
          a.id_veiculo,
          MAX(lk.km_atual) as max_km_hoje,
          MIN(lk.km_atual) as min_km_hoje
        FROM leituras_km lk
        JOIN alocacoes a ON lk.id_alocacao = a.id
        WHERE lk.data_leitura >= CURRENT_DATE AND lk.data_leitura < CURRENT_DATE + INTERVAL 1 DAY ${andAlocacaoVeiculo}
        GROUP BY a.id_veiculo
      ),
      leitura_anterior AS (
        SELECT
          a.id_veiculo,
          MAX(lk.km_atual) as max_km_anterior
        FROM leituras_km lk
        JOIN alocacoes a ON lk.id_alocacao = a.id
        WHERE lk.data_leitura < CURRENT_DATE ${andAlocacaoVeiculo}
        GROUP BY a.id_veiculo
      )
      SELECT
        SUM(
          lh.max_km_hoje - COALESCE(la.max_km_anterior, lh.min_km_hoje)
        ) AS consumo_total_hoje
      FROM veiculos v
      JOIN leituras_hoje lh ON v.id = lh.id_veiculo
      LEFT JOIN leitura_anterior la ON v.id = la.id_veiculo
      ${whereVeiculo}
    `;
    
    // --- QUERY DE CONSUMO MENSAL CORRIGIDA ---
    const queryConsumoMes = `
      WITH 
      leituras_mes_atual AS (
        SELECT
          a.id_veiculo,
          MAX(lk.km_atual) as max_km_mes,
          MIN(lk.km_atual) as min_km_mes
        FROM leituras_km lk
        JOIN alocacoes a ON lk.id_alocacao = a.id
        WHERE YEAR(lk.data_leitura) = YEAR(CURRENT_DATE) AND MONTH(lk.data_leitura) = MONTH(CURRENT_DATE) ${andAlocacaoVeiculo}
        GROUP BY a.id_veiculo
      ),
      leitura_mes_anterior AS (
        SELECT
          a.id_veiculo,
          MAX(lk.km_atual) as max_km_anterior
        FROM leituras_km lk
        JOIN alocacoes a ON lk.id_alocacao = a.id
        WHERE lk.data_leitura < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') ${andAlocacaoVeiculo}
        GROUP BY a.id_veiculo
      )
      SELECT
        SUM(
          lma.max_km_mes - COALESCE(lan.max_km_anterior, lma.min_km_mes)
        ) AS consumo_total_mes
      FROM veiculos v
      JOIN leituras_mes_atual lma ON v.id = lma.id_veiculo
      LEFT JOIN leitura_mes_anterior lan ON v.id = lan.id_veiculo
      ${whereVeiculo}
    `;

    const queryLimiteTotal = `SELECT SUM(limite_km_mensal * tempo_contrato_meses) AS meta_contrato_total FROM veiculos v ${whereVeiculo};`;

    const querySaldos = !veiculoId ? `
      WITH leituras_recentes AS (
        SELECT a.id_veiculo, MAX(lk.km_atual) AS km_final 
        FROM leituras_km lk 
        JOIN alocacoes a ON lk.id_alocacao = a.id 
        GROUP BY a.id_veiculo
      )
      SELECT 
        v.id, v.placa, v.modelo, vend.nome AS responsavel,
        COALESCE(TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1, 0) AS meses_passados,
        COALESCE(v.limite_km_mensal, 0) AS limite_km_mensal,
        COALESCE(v.limite_km_mensal * (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1), 0) AS meta_cumulativa,
        COALESCE(COALESCE(lr.km_final, v.km_atual) - v.km_inicial_contrato, 0) AS consumo_real_total,
        COALESCE((v.limite_km_mensal * (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1)) - (COALESCE(lr.km_final, v.km_atual) - v.km_inicial_contrato), 0) AS saldo_km 
      FROM veiculos v 
      LEFT JOIN alocacoes a ON v.id = a.id_veiculo AND a.data_fim IS NULL 
      LEFT JOIN vendedores vend ON a.id_vendedor = vend.id 
      LEFT JOIN leituras_recentes lr ON v.id = lr.id_veiculo 
      WHERE v.status = 'em_uso'
      ORDER BY saldo_km ASC;
    ` : `SELECT 1;`;
    
    const queryLeiturasGrafico = veiculoId ? `SELECT lk.data_leitura, lk.km_atual, COALESCE(LAG(lk.km_atual, 1) OVER (PARTITION BY a.id_veiculo ORDER BY lk.data_leitura), v.km_inicial_contrato) AS km_anterior FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id JOIN veiculos v ON a.id_veiculo = v.id WHERE lk.data_leitura >= CURDATE() - INTERVAL 30 DAY ${andAlocacaoVeiculo} ORDER BY lk.data_leitura ASC;` : `SELECT 1;`;
    const queryInfoVeiculo = veiculoId ? `SELECT v.modelo, v.placa, vend.nome AS nomeVendedor FROM veiculos v JOIN alocacoes a ON v.id = a.id_veiculo JOIN vendedores vend ON a.id_vendedor = vend.id WHERE a.id_veiculo = ? AND a.data_fim IS NULL LIMIT 1;` : `SELECT 1;`;

    const [
      [[resumoHoje]], [[resumoMes]], [[limiteTotal]], [saldos], [leiturasGrafico], [[infoVeiculo]]
    ] = await Promise.all([
      pool.query(queryConsumoHoje, veiculoId ? [veiculoId, veiculoId] : []),
      pool.query(queryConsumoMes, veiculoId ? [veiculoId, veiculoId] : []),
      pool.query(queryLimiteTotal, params),
      pool.query(querySaldos),
      pool.query(queryLeiturasGrafico, params),
      pool.query(queryInfoVeiculo, params)
    ]);
    
    const consumoPorDia = {};
    if (veiculoId && leiturasGrafico.length > 0 && leiturasGrafico[0] && leiturasGrafico[0].km_atual) {
      for (const leitura of leiturasGrafico) {
        if (leitura && leitura.km_atual != null && leitura.km_anterior != null) {
          const dia = new Date(leitura.data_leitura).toISOString().split('T')[0];
          if (!consumoPorDia[dia]) consumoPorDia[dia] = 0;
          const kmRodado = leitura.km_atual - leitura.km_anterior;
          if (kmRodado > 0) consumoPorDia[dia] += kmRodado;
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

