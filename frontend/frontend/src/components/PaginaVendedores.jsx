// frontend/src/components/PaginaVendedores.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaginaVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [novoVendedor, setNovoVendedor] = useState({ nome: '', email: '', matricula: '', senha: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState(null);

  const fetchVendedores = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/vendedores');
      setVendedores(response.data);
    } catch (error) { console.error('Erro ao buscar vendedores:', error); }
  };

  useEffect(() => { fetchVendedores(); }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNovoVendedor({ ...novoVendedor, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/vendedores', novoVendedor);
      setNovoVendedor({ nome: '', email: '', matricula: '', senha: '' });
      fetchVendedores();
    } catch (error) { console.error('Erro ao criar vendedor:', error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este vendedor?')) {
      try {
        await axios.delete(`http://localhost:3001/api/vendedores/${id}`);
        fetchVendedores();
      } catch (error) { console.error('Erro ao excluir vendedor:', error); }
    }
  };

  const handleEdit = (vendedor) => {
    setVendedorEditando(vendedor);
    setIsModalOpen(true);
  };

  const handleModalChange = (event) => {
    const { name, value } = event.target;
    setVendedorEditando({ ...vendedorEditando, [name]: value });
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/vendedores/${vendedorEditando.id}`, vendedorEditando);
      setIsModalOpen(false);
      setVendedorEditando(null);
      fetchVendedores();
    } catch (error) { console.error('Erro ao atualizar vendedor:', error); }
  };

  return (
    <div>
      <h1>Gerenciar Vendedores</h1>
      <h2>Cadastrar Novo Vendedor</h2>
      <form onSubmit={handleSubmit}>
        <input name="nome" value={novoVendedor.nome} onChange={handleInputChange} placeholder="Nome Completo" required />
        <input name="email" type="email" value={novoVendedor.email} onChange={handleInputChange} placeholder="Email" required />
        <input name="matricula" value={novoVendedor.matricula} onChange={handleInputChange} placeholder="Matrícula" />
        <input name="senha" type="password" value={novoVendedor.senha} onChange={handleInputChange} placeholder="Senha" required />
        <button type="submit">Cadastrar Vendedor</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h2>Vendedores Cadastrados</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Matrícula</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map((vendedor) => (
            <tr key={vendedor.id}>
              <td>{vendedor.nome}</td>
              <td>{vendedor.email}</td>
              <td>{vendedor.matricula}</td>
              <td>
                <button onClick={() => handleEdit(vendedor)}>Editar</button>
                <button onClick={() => handleDelete(vendedor.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && vendedorEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Vendedor</h2>
            <form onSubmit={handleUpdateSubmit}>
              <input name="nome" value={vendedorEditando.nome} onChange={handleModalChange} placeholder="Nome Completo" required />
              <input name="email" type="email" value={vendedorEditando.email} onChange={handleModalChange} placeholder="Email" required />
              <input name="matricula" value={vendedorEditando.matricula} onChange={handleModalChange} placeholder="Matrícula" />
              <button type="submit">Salvar Alterações</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaVendedores;