// frontend/src/components/PaginaTiposManutencao.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaginaTiposManutencao = () => {
  const [tipos, setTipos] = useState([]);
  const [novoTipo, setNovoTipo] = useState({ nome: '', intervalo_km_padrao: '', descricao: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTipos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/manutencao/tipos');
      setTipos(response.data);
    } catch (error) {
      console.error("Erro ao buscar tipos de manutenção:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoTipo({ ...novoTipo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/manutencao/tipos', novoTipo);
      alert('Tipo de manutenção cadastrado com sucesso!');
      setNovoTipo({ nome: '', intervalo_km_padrao: '', descricao: '' });
      fetchTipos();
    } catch (error) {
      alert('Erro ao cadastrar tipo de manutenção.');
      console.error(error);
    }
  };

  if (isLoading) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Gerenciar Tipos de Manutenção</h1>
      <p>Cadastre aqui os serviços que seus veículos precisam, como "Troca de Óleo" e o intervalo de KM para cada um.</p>

      <h2>Cadastrar Novo Tipo de Manutenção</h2>
      <form onSubmit={handleSubmit}>
        <input name="nome" value={novoTipo.nome} onChange={handleInputChange} placeholder="Nome do Serviço (ex: Troca de Óleo)" required />
        <input name="intervalo_km_padrao" type="number" value={novoTipo.intervalo_km_padrao} onChange={handleInputChange} placeholder="Intervalo Padrão em KM (ex: 10000)" required />
        <textarea name="descricao" value={novoTipo.descricao} onChange={handleInputChange} placeholder="Descrição (opcional)" />
        <button type="submit">Cadastrar Tipo</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h2>Tipos de Manutenção Cadastrados</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nome do Serviço</th>
            <th>Intervalo Padrão</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map(tipo => (
            <tr key={tipo.id}>
              <td>{tipo.nome}</td>
              <td>{tipo.intervalo_km_padrao} km</td>
              <td>{tipo.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaginaTiposManutencao;