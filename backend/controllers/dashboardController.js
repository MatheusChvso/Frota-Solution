const pool = require('../db'); 

exports.getDashboardData = async (req, res) => {
  const { veiculoId } = req.params;
  const params = veiculoId ? [veiculoId] : [];
  const whereVeiculo = veiculoId ? `WHERE v.id = ?` : '';
  const andAlocacaoVeiculo = veiculoId ? `AND a.id_veiculo = ?` : '';
  
  try {
    const queryConsumoHoje = `SELECT SUM(lh.odometro_atual - COALESCE(la.odometro_anterior, v.km_inicial_contrato)) AS consumo_total_hoje FROM veiculos v JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS odometro_atual FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE lk.data_leitura >= CURRENT_DATE AND lk.data_leitura < CURRENT_DATE + INTERVAL 1 DAY ${andAlocacaoVeiculo} GROUP BY a.id_veiculo) AS lh ON v.id = lh.id_veiculo LEFT JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS odometro_anterior FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE lk.data_leitura < CURRENT_DATE ${andAlocacaoVeiculo} GROUP BY a.id_veiculo) AS la ON v.id = la.id_veiculo ${whereVeiculo} ${veiculoId ? 'AND' : 'WHERE'} v.km_inicial_contrato IS NOT NULL;`;
    const queryConsumoMes = `SELECT SUM(lma.odometro_mes_atual - COALESCE(lman.odometro_anterior, v.km_inicial_contrato)) AS consumo_total_mes FROM veiculos v JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS odometro_mes_atual FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE YEAR(lk.data_leitura) = YEAR(CURRENT_DATE) AND MONTH(lk.data_leitura) = MONTH(CURRENT_DATE) ${andAlocacaoVeiculo} GROUP BY a.id_veiculo) AS lma ON v.id = lma.id_veiculo LEFT JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS odometro_anterior FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE CONCAT(YEAR(lk.data_leitura), '-', LPAD(MONTH(lk.data_leitura), 2, '0')) < CONCAT(YEAR(CURRENT_DATE), '-', LPAD(MONTH(CURRENT_DATE), 2, '0')) ${andAlocacaoVeiculo} GROUP BY a.id_veiculo) AS lman ON v.id = lman.id_veiculo ${whereVeiculo} ${veiculoId ? 'AND' : 'WHERE'} v.km_inicial_contrato IS NOT NULL;`;
    const queryLimiteTotal = `SELECT SUM(limite_km_mensal * tempo_contrato_meses) AS meta_contrato_total FROM veiculos v ${whereVeiculo};`;

    const querySaldos = !veiculoId ? `WITH leituras_recentes AS (SELECT a.id_veiculo, MAX(lk.km_atual) AS km_final FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id GROUP BY a.id_veiculo) SELECT v.id, v.placa, v.modelo, vend.nome AS responsavel, (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1) AS meses_passados, v.limite_km_mensal, (v.limite_km_mensal * (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1)) AS meta_cumulativa, (COALESCE(lr.km_final, v.km_atual) - v.km_inicial_contrato) AS consumo_real_total, (v.limite_km_mensal * (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1)) - (COALESCE(lr.km_final, v.km_atual) - v.km_inicial_contrato) AS saldo_km FROM veiculos v LEFT JOIN alocacoes a ON v.id = a.id_veiculo AND a.data_fim IS NULL LEFT JOIN vendedores vend ON a.id_vendedor = vend.id LEFT JOIN leituras_recentes lr ON v.id = lr.id_veiculo WHERE v.status = 'em_uso' AND v.data_inicio_contrato IS NOT NULL ORDER BY saldo_km ASC;` : `SELECT 1;`;
    const queryLeiturasGrafico = veiculoId ? `SELECT lk.data_leitura, lk.km_atual, COALESCE(LAG(lk.km_atual, 1) OVER (PARTITION BY a.id_veiculo ORDER BY lk.data_leitura), v.km_inicial_contrato) AS km_anterior FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id JOIN veiculos v ON a.id_veiculo = v.id WHERE lk.data_leitura >= CURDATE() - INTERVAL 30 DAY ${andAlocacaoVeiculo} ORDER BY lk.data_leitura ASC;` : `SELECT 1;`;
    const queryInfoVeiculo = veiculoId ? `SELECT v.modelo, v.placa, vend.nome AS nomeVendedor FROM veiculos v JOIN alocacoes a ON v.id = a.id_veiculo JOIN vendedores vend ON a.id_vendedor = vend.id WHERE a.id_veiculo = ? AND a.data_fim IS NULL LIMIT 1;` : `SELECT 1;`;

    const [
      [[resumoHoje]], [[resumoMes]], [[limiteTotal]], [saldos], [leiturasGrafico], [[infoVeiculo]]
    ] = await Promise.all([
      pool.query(queryConsumoHoje, veiculoId ? [veiculoId, veiculoId, veiculoId] : []),
      pool.query(queryConsumoMes, veiculoId ? [veiculoId, veiculoId, veiculoId] : []),
      pool.query(queryLimiteTotal, params),
      pool.query(querySaldos),
      pool.query(queryLeiturasGrafico, params),
      pool.query(queryInfoVeiculo, params)
    ]);
    
    const consumoPorDia = {};
    if (veiculoId && leiturasGrafico.length > 1 && leiturasGrafico[0].km_atual) {
      for (const leitura of leiturasGrafico) {
        const dia = new Date(leitura.data_leitura).toISOString().split('T')[0];
        if (!consumoPorDia[dia]) consumoPorDia[dia] = 0;
        const kmRodado = leitura.km_atual - leitura.km_anterior;
        if (kmRodado > 0) consumoPorDia[dia] += kmRodado;
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
    // VERSÃO CORRIGIDA: Esta query agora busca a data do último registo de sempre.
    const query = `
      SELECT
        vend.nome,
        v.modelo,
        v.placa,
        -- Verifica se a data do último registo é a data de hoje para definir o status
        CASE
          WHEN DATE(ur.data_ultimo_registro) = CURRENT_DATE THEN 'Feito'
          ELSE 'Pendente'
        END AS status_registro,
        -- Retorna a data do último registo, seja de hoje ou de antes
        ur.data_ultimo_registro
      FROM alocacoes a
      JOIN vendedores vend ON a.id_vendedor = vend.id
      JOIN veiculos v ON a.id_veiculo = v.id
      -- Fazemos um LEFT JOIN a uma subconsulta que encontra a data máxima para cada alocação
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
