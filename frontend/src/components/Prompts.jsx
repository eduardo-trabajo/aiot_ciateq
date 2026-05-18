import React, { useEffect, useState } from 'react';
import '../assets/styles/alerts.css';
import Layout from './Layout';
import prompt from '../assets/icons/prompt.svg'
import { api } from '../services/api';

const ITEMS_PER_PAGE = 10;

const Prompts = () => {
    const [consultas, setConsultas] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getIaHistory();
                setConsultas(data);
            } catch (error) {
                console.error("Error fetching IA history:", error);
            }
        };
        fetchData();
    }, []);

    const totalPaginas = Math.ceil(consultas.length / ITEMS_PER_PAGE);
    const inicio = (paginaActual - 1) * ITEMS_PER_PAGE;
    const paginadas = consultas.slice(inicio, inicio + ITEMS_PER_PAGE);

    const cambiarPagina = (nueva) => {
        if (nueva >= 1 && nueva <= totalPaginas) {
            setPaginaActual(nueva);
        }
    };

    return (
        <Layout>
            <div className="alertsTableContainer">
                <h2 className='titleWithIcon'><img src={prompt} alt="Alerts" />AI Interaction History</h2>
                <table className="alertsTable">
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>Prompt</th>
                            <th>Response</th>
                            <th>Date</th>
                        </tr>

                    </thead>
                    <tbody>
                        {paginadas.map((item) => (
                            <tr key={item._id}>
                                <td>{item.modelo}</td>
                                <td style={{ whiteSpace: 'pre-wrap' }}>{item.prompt}</td>
                                <td style={{ whiteSpace: 'pre-wrap' }}>{item.respuesta}</td>
                                <td>{new Date(item.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Controles de paginación */}
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                        Anterior
                    </button>
                    <span style={{ margin: '0 1rem' }}>
                        Página {paginaActual} de {totalPaginas}
                    </span>
                    <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                        Siguiente
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Prompts;
