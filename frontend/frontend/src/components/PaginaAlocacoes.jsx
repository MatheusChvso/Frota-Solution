// frontend/src/components/PaginaAlocacoes.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaginaAlocacoes = () => {
  // Estados para armazenar os dados vindos da API
  const [alocacoes, setAlocacoes] = useState([]);
  const [veiculos, setVeiculos] = useState([]); // Todos os veículos
  const [vendedores, setVendedores] = useState([]);

  // Estado para controlar o formulário de nova alocação
  const [novaAlocacao, setNovaAlocacao] = useState({
    id_veiculo: '',
    id_vendedor: '',
    data_inicio: new Date().toISOString().split('T')[0] // Data de hoje por padrão
  });

  // Função principal para buscar todos os dados necessários para a página
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      // Usamos Promise.all para fazer as 3 chamadas à API em paralelo
      const [resAlocacoes, resVeiculos, resVendedores] = await Promise.all([
        axios.get('http://192.168.17.200:3001/api/alocacoes', config),
        axios.get('http://192.168.17.200:3001/api/veiculos', config),
        axios.get('http://192.168.17.200:3001/api/vendedores', config)
      ]);
      setAlocacoes(resAlocacoes.data);
      setVeiculos(resVeiculos.data);
      setVendedores(resVendedores.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  // O useEffect chama a função fetchData uma vez quando o componente é montado
  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNovaAlocacao({ ...novaAlocacao, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://192.168.17.200:3001/api/alocacoes', novaAlocacao, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Alocação criada com sucesso!');
      setNovaAlocacao({ id_veiculo: '', id_vendedor: '', data_inicio: new Date().toISOString().split('T')[0] });
      fetchData(); // Re-busca os dados para atualizar a tela
    } catch (error) {
      console.error('Erro ao criar alocação:', error);
      alert('Erro ao criar alocação. Verifique o console.');
    }
  };

  const handleFinalizar = async (idAlocacao) => {
    if (window.confirm('Tem certeza que deseja finalizar esta alocação?')) {
      try {
        const token = localStorage.getItem('token');
        const data_fim = new Date().toISOString().split('T')[0]; // Data de hoje
        await axios.put(`http://192.168.17.200:3001/api/alocacoes/finalizar/${idAlocacao}`, { data_fim }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Alocação finalizada com sucesso!');
        fetchData(); // Re-busca os dados para atualizar a tela
      } catch (error) {
        console.error('Erro ao finalizar alocação:', error);
        alert('Erro ao finalizar alocação. Verifique o console.');
      }
    }
  };

  // Filtramos a lista de veículos para mostrar apenas os disponíveis no dropdown
  const veiculosDisponiveis = veiculos.filter(v => v.status === 'disponivel');

  return (
    <div>
      
      <h2>Nova Alocação</h2>
      <form onSubmit={handleSubmit}>
        <select name="id_veiculo" value={novaAlocacao.id_veiculo} onChange={handleInputChange} required>
          <option value="">Selecione um Veículo Disponível</option>
          {veiculosDisponiveis.map(v => (
            <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.placa}</option>
          ))}
        </select>
        <select name="id_vendedor" value={novaAlocacao.id_vendedor} onChange={handleInputChange} required>
          <option value="">Selecione um Vendedor</option>
          {vendedores.map(vend => (
            <option key={vend.id} value={vend.id}>{vend.nome}</option>
          ))}
        </select>
        <input name="data_inicio" type="date" value={novaAlocacao.data_inicio} onChange={handleInputChange} required />
        <button type="submit">Alocar Veículo</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h2>Alocações Ativas</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Veículo (Placa e Modelo)</th>
            <th>Vendedor Responsável</th>
            <th>Data de Início</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alocacoes.map(aloc => (
            <tr key={aloc.id}>
              <td>{aloc.placa} - {aloc.modelo}</td>
              <td>{aloc.vendedor_nome}</td>
              <td>{new Date(aloc.data_inicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
              <td>
                <button onClick={() => handleFinalizar(aloc.id)}>Finalizar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaginaAlocacoes;