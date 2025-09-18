// frontend/src/pages/DashboardConsumo/DashboardConsumo.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SaldoVeiculo from '../components/SaldoVeiculo';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DashboardConsumo.css';

const DashboardConsumo = () => {
  const { token } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listaVeiculos, setListaVeiculos] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState('geral');

  // Busca a lista de veículos para o dropdown (apenas para usuários logados)
  useEffect(() => {
    const fetchVeiculos = async () => { if (token) { try { const { data } = await axios.get('http://localhost:3001/api/veiculos/alocados', { headers: { 'Authorization': `Bearer ${token}` } }); setListaVeiculos(data); } catch (err) { console.error("Não foi possível carregar a lista de veículos."); } } };
    fetchVeiculos();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let url = `http://localhost:3001/api/dashboard/${veiculoSelecionado === 'geral' ? 'geral' : `veiculo/${veiculoSelecionado}`}`;
      const config = { headers: {} };
      if (veiculoSelecionado !== 'geral') { config.headers['Authorization'] = `Bearer ${token}`; }
      try {
        const response = await axios.get(url, config);
        setDashboardData(response.data);
      } catch (error) { console.error('Erro ao buscar dados do dashboard:', error); } 
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [veiculoSelecionado, token]);

  if (isLoading) return <div className="dashboard-container"><p>Carregando dashboard...</p></div>;
  if (!dashboardData) return <div className="dashboard-container"><p>Não foi possível carregar os dados.</p></div>;

  const { resumo, viewData, infoVeiculo } = dashboardData;

  return (
    <div className="dashboard-container">
      {/* ... (código do header e resumo sem alteração) */}
      <div className="dashboard-header"><h1>Análise de Consumo</h1>{token && (<select value={veiculoSelecionado} onChange={e => setVeiculoSelecionado(e.target.value)}><option value="geral">Frota Geral</option>{listaVeiculos.map(v => <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>)}</select>)}</div>
      {resumo && (<div className="resumo-grid"><div className="resumo-card"><h3>Consumo Hoje</h3><p>{resumo.consumoDia.toLocaleString()} km</p></div><div className="resumo-card"><h3>Consumo no Mês</h3><p>{resumo.consumoMes.toLocaleString()} km</p></div><div className="resumo-card"><h3>Limite Total</h3><p>{resumo.limiteTotalContrato.toLocaleString()} km</p></div></div>)}
      {infoVeiculo && (<div className="info-veiculo-container"><h3>{infoVeiculo.modelo} - {infoVeiculo.placa}</h3><p>Responsável: {infoVeiculo.nomeVendedor}</p></div>)}

      
       {veiculoSelecionado === 'geral' ? (
        <table className="tabela-saldos">
          <thead><tr><th>Veículo</th><th>Responsável</th><th style={{width: '50%'}}>Balanço</th><th>Saldo (km)</th></tr></thead>
          <tbody>
            {viewData && viewData.map(veiculo => (
              // ==== A CORREÇÃO ESTÁ AQUI ====
              // Só renderiza a linha se o objeto tiver a propriedade 'saldo_km'
              veiculo.hasOwnProperty('saldo_km') && (
                <tr key={veiculo.id}>
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
        // Se for um VEÍCULO ESPECÍFICO, renderiza o GRÁFICO
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