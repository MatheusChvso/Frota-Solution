// frontend/src/components/SaldoChart.jsx

import React from 'react';
import './SaldoChart.css'; // Vamos criar este CSS

const SaldoChart = ({ saldo, limiteMensal }) => {
  const saldoPositivo = saldo > 0 ? saldo : 0;
  const saldoNegativo = saldo < 0 ? Math.abs(saldo) : 0;

  // Usamos o limite mensal como uma referência para a escala da barra
  const escala = limiteMensal * 3; // Barra representa até 3 meses de saldo
  
  const larguraPositiva = (saldoPositivo / escala) * 100;
  const larguraNegativa = (saldoNegativo / escala) * 100;

  return (
    <div className="saldo-chart-container">
      <div className="saldo-negativo" style={{ width: `${Math.min(larguraNegativa, 100)}%` }}>
        {saldoNegativo > 0 && <span>-{saldoNegativo.toLocaleString()} km</span>}
      </div>
      <div className="saldo-centro"></div>
      <div className="saldo-positivo" style={{ width: `${Math.min(larguraPositiva, 100)}%` }}>
        {saldoPositivo > 0 && <span>+{saldoPositivo.toLocaleString()} km</span>}
      </div>
    </div>
  );
};

export default SaldoChart;