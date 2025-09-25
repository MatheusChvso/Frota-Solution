import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'; // 1. Importa o Link para navegação
import axios from 'axios';
import SaldoVeiculo from './SaldoVeiculo';
import { AuthContext } from '../context/AuthContext'; // 2. Importa o contexto
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DashboardConsumo.css';

const DashboardConsumo = () => {
  const { token } = useContext(AuthContext); // 3. Verifica se o utilizador está logado
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState('geral');
  const [tituloResumo, setTituloResumo] = useState('Resumo da Frota');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const url = `http://192.168.17.200:3001/api/dashboard/${veiculoSelecionado === 'geral' ? 'geral' : `veiculo/${veiculoSelecionado}`}`;

      try {
        // A requisição não precisa de token, pois a rota é pública
        const response = await axios.get(url);
        setDashboardData(response.data);

        if (veiculoSelecionado !== 'geral' && response.data.infoVeiculo) {
          setTituloResumo(`Resumo para ${response.data.infoVeiculo.modelo} (${response.data.infoVeiculo.placa})`);
        } else {
          setTituloResumo('Resumo da Frota');
        }
      } catch (error) { 
        console.error('Erro ao buscar dados do dashboard:', error);
        setDashboardData(null);
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchData();
  }, [veiculoSelecionado]);

  const handleSelectionChange = (id) => {
    setDashboardData(null);
    setVeiculoSelecionado(id);
  };

  if (isLoading || !dashboardData) {
    return <div className="dashboard-container"><p>A carregar dashboard...</p></div>;
  }
  
  const { resumo, viewData } = dashboardData;

  return (
    <div className="dashboard-container">
      {/* 4. NOVO HEADER COM O BOTÃO CONDICIONAL */}
      <div className="dashboard-header">
        <h1>Análise de Saldo de KM</h1>
        {!token && (
          <Link to="/login" className="btn-login-header">
            Fazer Login
          </Link>
        )}
      </div>

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
      
      {/* Lógica de renderização condicional */}
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

