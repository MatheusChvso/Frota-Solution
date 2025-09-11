// frontend/src/components/ListaVeiculos.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListaVeiculos = () => {
  // 'useState' cria um "estado" para armazenar a lista de veículos.
  // Começa como um array vazio [].
  const [veiculos, setVeiculos] = useState([]);

  // 'useEffect' é um hook que executa uma função quando o componente é montado.
  // Perfeito para buscar dados iniciais.
  useEffect(() => {
    // Função para buscar os dados da API
    const fetchVeiculos = async () => {
      try {
        // Faz a chamada GET para a nossa API no backend
        const response = await axios.get('http://localhost:3001/api/veiculos');
        // Atualiza o estado 'veiculos' com os dados recebidos
        setVeiculos(response.data);
      } catch (error) {
        console.error('Erro ao buscar veículos:', error);
      }
    };

    fetchVeiculos();
  }, []); // O array vazio [] significa que este efeito roda apenas uma vez.

  return (
    <div>
      <h1>Frota de Veículos</h1>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>KM Atual</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Faz um loop na lista de veículos e cria uma linha para cada um */}
          {veiculos.map((veiculo) => (
            <tr key={veiculo.id}>
              <td>{veiculo.placa}</td>
              <td>{veiculo.marca}</td>
              <td>{veiculo.modelo}</td>
              <td>{veiculo.ano}</td>
              <td>{veiculo.km_atual}</td>
              <td>{veiculo.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaVeiculos;