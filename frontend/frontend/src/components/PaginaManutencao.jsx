// frontend/src/components/PaginaManutencao.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatusBadge = ({ status }) => {
    const style = {
        padding: '4px 8px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.8em'
    };
    if (status === 'Atrasada') style.backgroundColor = 'var(--cor-vermelho-royal)';
    else if (status === 'Atenção') style.backgroundColor = '#ff9800'; // Laranja
    else style.backgroundColor = '#4caf50'; // Verde
    return <span style={style}>{status}</span>;
};


const PaginaManutencao = () => {
    const [frota, setFrota] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost:3001/api/manutencao/status-frota');
            setFrota(res.data);
        } catch (error) { console.error("Erro ao buscar status da frota:", error); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) return <p>Calculando status de manutenção da frota...</p>;

    return (
        <div>
            <h1>Painel de Controle de Manutenção</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {frota.map(veiculo => (
                    <div key={veiculo.id} style={{ border: '1px solid var(--cor-borda)', borderRadius: '8px', padding: '16px', width: '350px', backgroundColor: 'var(--cor-superficie)' }}>
                        <h3>{veiculo.modelo} ({veiculo.placa})</h3>
                        <p>KM Atual: {veiculo.km_atual}</p>
                        <hr style={{margin: '10px 0'}}/>
                        <h4>Status dos Serviços:</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {veiculo.manutencoes.map(m => (
                                <li key={m.id_tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span>{m.nome}</span>
                                    <StatusBadge status={m.status} />
                                </li>
                            ))}
                        </ul>
                        {/* Botão para abrir modal de histórico/registro (funcionalidade futura) */}
                        <button style={{marginTop: '10px', width: '100%'}}>Ver Histórico / Registrar Serviço</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaginaManutencao;