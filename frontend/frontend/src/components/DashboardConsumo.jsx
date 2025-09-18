// frontend/src/pages/DashboardConsumo/DashboardConsumo.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SaldoVeiculo from '../components/SaldoVeiculo';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DashboardConsumo.css';

const DashboardConsumo = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Não precisamos mais da lista de veículos, pois a própria tabela servirá como seletor
  const [veiculoSelecionado, setVeiculoSelecionado] = useState('geral');
  const [tituloResumo, setTituloResumo] = useState('Resumo da Frota');

  useEffect(() => {
    const fetchData = async () => {
      // Começa o carregamento sempre que a seleção muda
      setIsLoading(true);
      
      const url = `http://localhost:3001/api/dashboard/${veiculoSelecionado === 'geral' ? 'geral' : `veiculo/${veiculoSelecionado}`}`;

      try {
        const response = await axios.get(url);
        setDashboardData(response.data);

        if (veiculoSelecionado !== 'geral' && response.data.infoVeiculo) {
          setTituloResumo(`Resumo para ${response.data.infoVeiculo.modelo} (${response.data.infoVeiculo.placa})`);
        } else {
          setTituloResumo('Resumo da Frota');
        }
      } catch (error) { 
        console.error('Erro ao buscar dados do dashboard:', error);
        setDashboardData(null); // Limpa os dados em caso de erro
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchData();
  }, [veiculoSelecionado]);

  // Função para mudar a seleção e limpar os dados antigos, forçando o "loading"
  const handleSelectionChange = (id) => {
    setDashboardData(null); // <-- MUDANÇA IMPORTANTE: limpa dados antigos
    setVeiculoSelecionado(id);
  };

  // Se não houver dados AINDA, mostra o loading.
  if (isLoading || !dashboardData) {
    return <div className="dashboard-container"><p>Carregando dashboard...</p></div>;
  }
  
  const { resumo, viewData } = dashboardData;

  return (
    <div className="dashboard-container">
      <div className="resumo-container">
        <div className="resumo-header">
          <h2>{tituloResumo}</h2>
          {veiculoSelecionado !== 'geral' && (
            <button onClick={() => handleSelectionChange('geral')} className="btn-limpar-selecao">
              Ver Frota Geral
            </button>
          )}
        </div>
        {resumo && (
          <div className="resumo-grid">
            <div className="resumo-card"><h3>Consumo Hoje</h3><p>{resumo.consumoDia.toLocaleString()} km</p></div>
            <div className="resumo-card"><h3>Consumo no Mês</h3><p>{resumo.consumoMes.toLocaleString()} km</p></div>
            <div className="resumo-card"><h3>Limite Total do Contrato</h3><p>{resumo.limiteTotalContrato.toLocaleString()} km</p></div>
          </div>
        )}
      </div>
      
      {/* A tabela agora só é renderizada na visão geral */}
      {veiculoSelecionado === 'geral' && viewData ? (
        <table className="tabela-saldos">
          <thead>
            <tr>
              <th>Veículo</th>
              <th>Responsável</th>
              <th style={{width: '50%'}}>Balanço de Consumo</th>
              <th>Saldo Atual (km)</th>
            </tr>
          </thead>
          <tbody>
            {viewData.map(veiculo => (
              // Verificação de segurança para garantir que o objeto é do tipo correto
              veiculo.hasOwnProperty('saldo_km') && (
                <tr key={veiculo.id} onClick={() => handleSelectionChange(veiculo.id)} className="linha-clicavel">
                  <td>{veiculo.modelo} ({veiculo.placa})</td>
                  <td>{veiculo.responsavel || 'N/A'}</td>
                  <td><SaldoVeiculo veiculo={veiculo} /></td>
                  <td style={{ color: veiculo.saldo_km < 0 ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
                    {veiculo.saldo_km.toLocaleString()}
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      ) : (
         // O gráfico agora é renderizado quando um veículo é selecionado
        <div className="grafico-container">
          <h2>Consumo Detalhado (Últimos 30 dias)</h2>
          {viewData && viewData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="consumo" stroke="#8884d8" name="Consumo (KM)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Não há dados de consumo para este veículo no período.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardConsumo;