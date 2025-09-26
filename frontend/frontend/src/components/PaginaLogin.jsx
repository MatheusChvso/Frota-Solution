import React, { useState, useContext } from 'react';
// 1. Importar o 'Link' junto com o 'useNavigate'
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './PaginaLogin.css';
const PaginaLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const sucesso = await login(email, senha);
    if (sucesso) {
      // Mude esta linha para redirecionar para a área protegida
      navigate('/app/dashboard'); 
    } else {
      setError('Email ou senha inválidos.');
    }
  };

  return (
    <div className="login-container">
        <div className="login-art"></div>
        <div className="login-form-container">
            <div style={{ maxWidth: '400px', width: '100%' }}>
                <h2>Bem-vindo à Gestão de Frota</h2>
                <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: '20px'}}>Faça o login para continuar.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Senha"
                        required
                    />
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                    <button type="submit" style={{width: '100%'}}>Entrar</button>

                    {/* 2. Link para o dashboard público adicionado aqui */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <Link to="/dashboard">Ver Dashboard da Frota</Link> {/* <--- LINHA CORRIGIDA */}
                    </div>
                    
                </form>
            </div>
        </div>
    </div>
  );
};

export default PaginaLogin;