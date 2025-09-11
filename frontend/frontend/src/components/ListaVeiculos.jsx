// frontend/src/components/ListaVeiculos.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListaVeiculos = () => {
  const [veiculos, setVeiculos] = useState([]);

  // Novo estado para controlar os campos do formulário
  const [novoVeiculo, setNovoVeiculo] = useState({
    placa: '',
    marca: '',
    modelo: '',
    ano: '',
    km_atual: '',
    limite_km_mensal: '',
  });

  // A função para buscar os veículos, que já tínhamos
  const fetchVeiculos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/veiculos');
      setVeiculos(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  // useEffect para buscar os dados quando o componente é montado
  useEffect(() => {
    fetchVeiculos();
  }, []);

  // Função para lidar com a mudança nos inputs do formulário
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNovoVeiculo({ ...novoVeiculo, [name]: value });
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (event) => {
  event.preventDefault(); // Impede o recarregamento da página

  console.log('1. Início do handleSubmit. Enviando dados:', novoVeiculo);

  try {
    const response = await axios.post('http://localhost:3001/api/veiculos', novoVeiculo);

    console.log('2. Sucesso! Resposta da API:', response.data);

    // Limpa o formulário
    setNovoVeiculo({
      placa: '',
      marca: '',
      modelo: '',
      ano: '',
      km_atual: '',
      limite_km_mensal: '',
    });

    console.log('3. Formulário limpo.');

    // Atualiza a lista de veículos para mostrar o novo item!
    await fetchVeiculos(); 

    console.log('4. Lista de veículos atualizada.');

  } catch (error) {
    console.error('ERRO DETECTADO! Ocorreu um problema:', error);

    // Vamos inspecionar o objeto de erro para mais detalhes
    if (error.response) {
      // O servidor respondeu com um status de erro (4xx, 5xx)
      console.error('Dados do erro:', error.response.data);
      console.error('Status do erro:', error.response.status);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Requisição do erro:', error.request);
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Mensagem de erro:', error.message);
    }
  }
};

  return (
    <div>
      <h1>Gestão de Frota</h1>

      {/* Seção do Formulário de Cadastro */}
      <h2>Cadastrar Novo Veículo</h2>
      <form onSubmit={handleSubmit}>
        <input name="placa" value={novoVeiculo.placa} onChange={handleInputChange} placeholder="Placa" required />
        <input name="marca" value={novoVeiculo.marca} onChange={handleInputChange} placeholder="Marca" required />
        <input name="modelo" value={novoVeiculo.modelo} onChange={handleInputChange} placeholder="Modelo" required />
        <input name="ano" type="number" value={novoVeiculo.ano} onChange={handleInputChange} placeholder="Ano" required />
        <input name="km_atual" type="number" value={novoVeiculo.km_atual} onChange={handleInputChange} placeholder="KM Atual" />
        <input name="limite_km_mensal" type="number" value={novoVeiculo.limite_km_mensal} onChange={handleInputChange} placeholder="Limite KM Mensal" />
        <button type="submit">Cadastrar</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      {/* Seção da Tabela de Veículos */}
      <h2>Frota Atual</h2>
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