// Cole este código completo em frontend/src/components/PaginaTiposManutencao.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

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
    } catch (error) { console.error("Erro ao buscar tipos de manutenção:", error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTipos(); }, []);

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
    } catch (error) { alert('Erro ao cadastrar tipo de manutenção.'); console.error(error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:3001/api/manutencao/tipos/${id}`);
        fetchTipos();
      } catch (error) { alert(error.response?.data?.error || 'Erro ao excluir tipo.'); console.error(error); }
    }
  };

  const handleEdit = (tipo) => {
    setTipoEditando(tipo);
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setTipoEditando(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/manutencao/tipos/${tipoEditando.id}`, tipoEditando);
      setIsModalOpen(false);
      fetchTipos();
    } catch (error) { alert('Erro ao atualizar tipo.'); console.error(error); }
  };

  if (isLoading) return <p>Carregando tipos de manutenção...</p>;

  return (
    <div>
      <h1>Gerenciar Tipos de Manutenção</h1>
      <h2>Cadastrar Novo Tipo</h2>
      <form onSubmit={handleSubmit}>{/* Formulário de cadastro aqui */}</form>
      <hr />
      <h2>Tipos Cadastrados</h2>
      <table>
        <thead>
          <tr><th>Nome</th><th>Intervalo (KM)</th><th>Descrição</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {tipos.map(tipo => (
            <tr key={tipo.id}>
              <td>{tipo.nome}</td>
              <td>{tipo.intervalo_km_padrao}</td>
              <td>{tipo.descricao}</td>
              <td>
                <button onClick={() => handleEdit(tipo)}><FaPencilAlt /></button>
                <button onClick={() => handleDelete(tipo.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && tipoEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Tipo de Manutenção</h2>
            <form onSubmit={handleUpdateSubmit}>{/* Formulário de edição aqui */}</form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PaginaTiposManutencao;