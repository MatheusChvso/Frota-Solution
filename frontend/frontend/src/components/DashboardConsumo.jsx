// frontend/src/pages/DashboardConsumo/DashboardConsumo.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import './DashboardConsumo.css';

// Componente auxiliar para a barra de progresso
const ProgressBar = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const cappedPercentage = Math.min(percentage, 100);
  let barColor = '#4caf50';
  if (percentage > 85) barColor = '#ff9800';
  if (percentage > 100) barColor = '#f44336';
  return (
    <div className="progress-bar-container"><div className="progress-bar-filler" style={{ width: `${cappedPercentage}%`, backgroundColor: barColor }} /></div>
  );
};

const DashboardConsumo = () => {
  const { token } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listaVeiculos, setListaVeiculos] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState('geral');

  useEffect(() => {
    const fetchVeiculos = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:3001/api/veiculos/alocados', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setListaVeiculos(response.data);
        } catch (err) {
          console.error("Não foi possível carregar a lista de veículos.", err);
          setListaVeiculos([]);
        }
      } else {
        setListaVeiculos([]); // Garante que a lista está vazia se não há token
      }
    };
    fetchVeiculos();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      let url = 'http://localhost:3001/api/dashboard/consumo-frota/geral';
      const config = { headers: {} };
      
      if (veiculoSelecionado !== 'geral') {
        url = `http://localhost:3001/api/dashboard/consumo-frota/${veiculoSelecionado}`;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        } else {
          setError("Você precisa estar logado para ver dados de um veículo específico.");
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await axios.get(url, config);
        setDashboardData(response.data);
      } catch (err) {
        setError("Não foi possível carregar os dados do dashboard.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [veiculoSelecionado, token]);

  if (isLoading) return <div className="dashboard-container"><p>Carregando dados do dashboard...</p></div>;
  if (error) return <div className="dashboard-container"><p style={{ color: 'red' }}>{error}</p></div>;
  if (!dashboardData) return null;
  console.log('--- DEBUG: DADOS RECEBIDOS PELA API ---', dashboardData);
  const { metas, consumoReal, graficoConsumoDiario, infoVeiculo } = dashboardData;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard de Consumo</h1>
        {token && listaVeiculos.length > 0 && (
          <select value={veiculoSelecionado} onChange={e => setVeiculoSelecionado(e.target.value)}>
            <option value="geral">Frota Geral</option>
            {listaVeiculos.map(veiculo => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.modelo} - {veiculo.placa}
              </option>
            ))}
          </select>
        )}
      </div>

      {infoVeiculo && (
        <div className="info-veiculo-container">
          <h3>{infoVeiculo.modelo} - {infoVeiculo.placa}</h3>
          <p>Responsável: {infoVeiculo.nomeVendedor}</p>
        </div>
      )}

      <div className="cards-grid">
        <div className="card">
          <h2>Uso Hoje</h2>
          <p className="consumo-valor">{consumoReal.hoje.toLocaleString()} km</p>
          <p className="consumo-meta">Meta: {metas.diaria.toLocaleString()} km</p>
          <ProgressBar value={consumoReal.hoje} max={metas.diaria} />
        </div>
        <div className="card">
          <h2>Uso no Mês</h2>
          <p className="consumo-valor">{consumoReal.mesAtual.toLocaleString()} km</p>
          <p className="consumo-meta">Meta: {metas.mensal.toLocaleString()} km</p>
          <ProgressBar value={consumoReal.mesAtual} max={metas.mensal} />
        </div>
        <div className="card">
          <h2>Progresso do Contrato</h2>
          <p className="consumo-valor">{consumoReal.totalAcumulado.toLocaleString()} km</p>
          <p className="consumo-meta">Meta: {metas.totalContrato.toLocaleString()} km</p>
          <ProgressBar value={consumoReal.totalAcumulado} max={metas.totalContrato} />
        </div>
      </div>
      
      <div className="grafico-container">
        <h2>Consumo Detalhado (Últimos 30 dias)</h2>
        {graficoConsumoDiario && graficoConsumoDiario.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graficoConsumoDiario} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="consumo" stroke="#8884d8" name="Consumo (KM)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>Não há dados de consumo diário para exibir o gráfico.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardConsumo;