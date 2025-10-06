import React, { useState, useEffect } from 'react';
import api from '../api'; // Usar o ficheiro central

const PaginaAlocacoes = () => {
  const [alocacoes, setAlocacoes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [novaAlocacao, setNovaAlocacao] = useState({
    id_veiculo: '',
    id_vendedor: '',
    data_inicio: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const [resAlocacoes, resVeiculos, resVendedores] = await Promise.all([
        api.get('/alocacoes'),
        api.get('/veiculos'),
        api.get('/vendedores')
      ]);
      setAlocacoes(resAlocacoes.data);
      setVeiculos(resVeiculos.data);
      setVendedores(resVendedores.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

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
      await api.post('/alocacoes', novaAlocacao);
      alert('Alocação criada com sucesso!');
      setNovaAlocacao({ id_veiculo: '', id_vendedor: '', data_inicio: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      console.error('Erro ao criar alocação:', error);
      alert('Erro ao criar alocação. Verifique o console.');
    }
  };

  const handleFinalizar = async (idAlocacao) => {
    if (window.confirm('Tem a certeza de que deseja finalizar esta alocação?')) {
      try {
        const data_fim = new Date().toISOString().split('T')[0];
        await api.put(`/alocacoes/finalizar/${idAlocacao}`, { data_fim });
        alert('Alocação finalizada com sucesso!');
        fetchData();
      } catch (error) {
        console.error('Erro ao finalizar alocação:', error);
        alert('Erro ao finalizar alocação. Verifique o console.');
      }
    }
  };

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
        <table>
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
                        <td>{new Date(aloc.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
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
