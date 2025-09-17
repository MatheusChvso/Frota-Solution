import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DashboardConsumo.css';

// Componente auxiliar para a barra de progresso
const ProgressBar = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const cappedPercentage = Math.min(percentage, 100);

  let barColor = '#4caf50'; // Verde (bom)
  if (percentage > 85) barColor = '#ff9800'; // Laranja (alerta)
  if (percentage > 100) barColor = '#f44336'; // Vermelho (excedido)

  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-filler" 
        style={{ width: `${cappedPercentage}%`, backgroundColor: barColor }} 
      />
    </div>
  );
};

const DashboardConsumo = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Token de autenticação não encontrado.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3001/api/dashboard/consumo-frota', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setDashboardData(response.data);
      } catch (err) {
        setError("Não foi possível carregar os dados do dashboard. Verifique sua conexão ou login.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="dashboard-container"><p>Carregando dados do dashboard...</p></div>;
  }
  if (error) {
    return <div className="dashboard-container"><p style={{ color: 'red' }}>{error}</p></div>;
  }
  if (!dashboardData) {
    return null;
  }

  // A linha corrigida está aqui!
  const { metas, consumoReal, graficoConsumoDiario } = dashboardData;

  return (
    <div className="dashboard-container">
      <h1>Dashboard de Consumo da Frota</h1>
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
        {graficoConsumoDiario.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={graficoConsumoDiario}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="consumo" stroke="#8884d8" name="Consumo (KM)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>Não há dados suficientes para exibir o gráfico de consumo diário.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardConsumo;