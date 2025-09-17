import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardConsumo.css'; // Vamos criar este arquivo para os estilos

// Componente auxiliar para a barra de progresso
const ProgressBar = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const cappedPercentage = Math.min(percentage, 100); // Garante que a barra não passe de 100%

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
      // Pega o token do localStorage para autenticar a requisição
      const token = localStorage.getItem('token');

      if (!token) {
        setError("Token de autenticação não encontrado.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3001/api/dashboard/consumo-frota', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez

  if (isLoading) {
    return <div className="dashboard-container"><p>Carregando dados do dashboard...</p></div>;
  }

  if (error) {
    return <div className="dashboard-container"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  if (!dashboardData) {
    return null; // Não renderiza nada se não houver dados
  }

  const { metas, consumoReal } = dashboardData;

  return (
    <div className="dashboard-container">
      <h1>Dashboard de Consumo da Frota</h1>
      <div className="cards-grid">
        {/* Card Diário */}
        <div className="card">
          <h2>Uso Hoje</h2>
          <p className="consumo-valor">{consumoReal.hoje.toLocaleString()} km</p>
          <p className="consumo-meta">Meta: {metas.diaria.toLocaleString()} km</p>
          <ProgressBar value={consumoReal.hoje} max={metas.diaria} />
        </div>

        {/* Card Mensal */}
        <div className="card">
          <h2>Uso no Mês</h2>
          <p className="consumo-valor">{consumoReal.mesAtual.toLocaleString()} km</p>
          <p className="consumo-meta">Meta: {metas.mensal.toLocaleString()} km</p>
          <ProgressBar value={consumoReal.mesAtual} max={metas.mensal} />
        </div>

        {/* Card Contrato */}
        <div className="card">
          <h2>Progresso do Contrato</h2>
          <p className="consumo-valor">{consumoReal.totalAcumulado.toLocaleString()} km</p>
          <p className="consumo-meta">Meta: {metas.totalContrato.toLocaleString()} km</p>
          <ProgressBar value={consumoReal.totalAcumulado} max={metas.totalContrato} />
        </div>
      </div>
      <div className="grafico-container">
        <h2>Consumo Detalhado</h2>
        <p>(O gráfico de consumo diário será implementado aqui)</p>
      </div>
    </div>
  );
};

export default DashboardConsumo;