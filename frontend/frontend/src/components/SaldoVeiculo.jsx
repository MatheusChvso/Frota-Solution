import React from 'react';
import './SaldoVeiculo.css'; // Importa o ficheiro CSS

const SaldoVeiculo = ({ veiculo }) => {
  const { consumo_real_total, meta_cumulativa } = veiculo;

  // Se a meta for 0 ou não existir, exibe a barra desativada com um aviso
  if (!meta_cumulativa || meta_cumulativa <= 0) {
    return (
      <div className="saldo-veiculo-container">
        <div className="saldo-info-text-vazio">
          <span>Meta não definida</span>
        </div>
        <div className="saldo-progress-bar-container">
          <div className="saldo-progress-bar-filler-vazio" />
        </div>
      </div>
    );
  }

  const percentage = (consumo_real_total / meta_cumulativa) * 100;
  
  let barColor = '#4caf50'; // Verde
  if (percentage > 85) barColor = '#ff9800'; // Laranja
  if (percentage > 100) barColor = '#f44336'; // Vermelho

  return (
    <div className="saldo-veiculo-container">
      <div className="saldo-info-text">
        <span>Consumo: <strong>{consumo_real_total.toLocaleString()} km</strong></span>
        <span>Meta Acumulada: <strong>{meta_cumulativa.toLocaleString()} km</strong></span>
      </div>

      <div className="saldo-progress-bar-container">
        <div 
          className="saldo-progress-bar-filler" 
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }} 
        />
        {percentage > 100 && (
            <div className="saldo-progress-bar-over" style={{ width: `${Math.min(percentage - 100, 100)}%` }} />
        )}
      </div>
    </div>
  );
};

export default SaldoVeiculo;

