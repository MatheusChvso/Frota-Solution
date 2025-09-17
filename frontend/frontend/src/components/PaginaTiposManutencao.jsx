import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
// Adicionei um pouco de CSS para o modal, coloque em um arquivo .css se preferir
import './PaginaTiposManutencao.css'; 

const PaginaTiposManutencao = () => {
  const [tipos, setTipos] = useState([]);
  const [novoTipo, setNovoTipo] = useState({ nome: '', intervalo_km_padrao: '', descricao: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);

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
      setNovoTipo({ nome: '', intervalo_km_padrao: '', descricao: '' }); // Limpa o formulário
      fetchTipos(); // Atualiza a lista
    } catch (error) {
      alert('Erro ao cadastrar tipo de manutenção.');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:3001/api/manutencao/tipos/${id}`);
        fetchTipos();
      } catch (error) {
        alert(error.response?.data?.error || 'Erro ao excluir tipo.');
        console.error(error);
      }
    }
  };

  const handleEdit = (tipo) => {
    setTipoEditando(tipo); // Carrega os dados do tipo para o estado de edição
    setIsModalOpen(true);   // Abre o modal
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setTipoEditando(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/manutencao/tipos/${tipoEditando.id}`, tipoEditando);
      setIsModalOpen(false); // Fecha o modal
      setTipoEditando(null); // Limpa o estado de edição
      fetchTipos();          // Atualiza a lista
    } catch (error) {
      alert('Erro ao atualizar tipo.');
      console.error(error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTipoEditando(null);
  }

  if (isLoading) return <p>Carregando tipos de manutenção...</p>;

  return (
    <div className="container-manutencao">
      <h1>Gerenciar Tipos de Manutenção</h1>
      
      <div className="form-container">
        <h2>Cadastrar Novo Tipo</h2>
        {/* ==== FORMULÁRIO DE CADASTRO PREENCHIDO ==== */}
        <form onSubmit={handleSubmit} className="form-cadastro">
          <input
            name="nome"
            value={novoTipo.nome}
            onChange={handleInputChange}
            placeholder="Nome (Ex: Troca de Óleo)"
            required
          />
          <input
            name="intervalo_km_padrao"
            type="number"
            value={novoTipo.intervalo_km_padrao}
            onChange={handleInputChange}
            placeholder="Intervalo (KM)"
            required
          />
          <input
            name="descricao"
            value={novoTipo.descricao}
            onChange={handleInputChange}
            placeholder="Descrição"
          />
          <button type="submit">Cadastrar</button>
        </form>
      </div>

      <hr />
      
      <h2>Tipos Cadastrados</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Intervalo (KM)</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map(tipo => (
            <tr key={tipo.id}>
              <td>{tipo.nome}</td>
              <td>{tipo.intervalo_km_padrao}</td>
              <td>{tipo.descricao}</td>
              <td>
                <button className="icon-button" onClick={() => handleEdit(tipo)}><FaPencilAlt /></button>
                <button className="icon-button" onClick={() => handleDelete(tipo.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==== MODAL DE EDIÇÃO COM FORMULÁRIO PREENCHIDO ==== */}
      {isModalOpen && tipoEditando && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Tipo de Manutenção</h2>
            <form onSubmit={handleUpdateSubmit}>
              <label>Nome:</label>
              <input
                name="nome"
                value={tipoEditando.nome}
                onChange={handleModalChange}
                required
              />
              <label>Intervalo (KM):</label>
              <input
                name="intervalo_km_padrao"
                type="number"
                value={tipoEditando.intervalo_km_padrao}
                onChange={handleModalChange}
                required
              />
              <label>Descrição:</label>
              <input
                name="descricao"
                value={tipoEditando.descricao}
                onChange={handleModalChange}
              />
              <div className="modal-actions">
                <button type="submit">Salvar Alterações</button>
                <button type="button" onClick={closeModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaTiposManutencao;
