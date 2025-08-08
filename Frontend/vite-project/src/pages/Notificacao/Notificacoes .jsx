import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Solicitacoes from '../../Components/Home/Solicitacoes.jsx';  // ajuste o caminho conforme seu projeto
import "../Notificacao/notificacao.css";
import { FaBell } from 'react-icons/fa';

function Notificacoes() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const cacheRemetentes = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    const us = localStorage.getItem('usuario');
    if (us) {
      try {
        setUsuario(JSON.parse(us));
      } catch {
        setUsuario({ nome: 'Desconhecido' });
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (usuario.id) {
      fetchNotificacoes();
    }
  }, [usuario]);

  const fetchNotificacoes = async () => {
    setCarregando(true);
    try {
      const resp = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Notificacoes/${usuario.id}`
      );
      const data = await resp.json();
      if (!data.notificacoes) {
        setNotificacoes([]);
        setCarregando(false);
        return;
      }

      const lista = await Promise.all(
        data.notificacoes.map(async (n) => {
          const rid = n.usuarioRemetenteId;
          if (!rid) return n;

          if (!cacheRemetentes.current[rid]) {
            cacheRemetentes.current[rid] = await buscarUsuarioPorId(rid);
          }

          return { ...n, remetente: cacheRemetentes.current[rid] };
        })
      );

      setNotificacoes(lista);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    } finally {
      setCarregando(false);
    }
  };

  const buscarUsuarioPorId = async (id) => {
    try {
      const r = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${id}`
      );
      if (r.ok) {
        return await r.json();
      }
    } catch (err) {
      console.error("Erro ao buscar remetente por ID:", err);
    }
    return null;
  };

  const seguirUsuario = async (idUs) => {
    try {
      const r = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguir`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario1: usuario.id, usuario2: idUs }),
        }
      );
      if (r.ok) fetchNotificacoes();
    } catch (err) {
      console.error("Erro ao seguir usuário:", err);
    }
  };

  // Função para navegar até o perfil do usuário
  const irParaPerfil = (idUsuario) => {
    navigate(`/perfil/${idUsuario}`);
  };

  return (
    <div className="notificacoes-container">
      <h2><FaBell /> Notificações</h2>

      {/* Renderizando o componente de solicitações */}
      <Solicitacoes
        usuarioId={usuario.id}
        solicitacoes={solicitacoes}
        setSolicitacoes={setSolicitacoes}
        irParaPerfil={irParaPerfil}
      />

      {carregando && <p>Carregando notificações...</p>}
      {!carregando && notificacoes.length === 0 && <p>Não há notificações</p>}

      <ul>
        {notificacoes.map(n => (
          <li key={n.id}>
            <img
              src={n.remetente?.imagem || "https://via.placeholder.com/40"}
              alt="Foto de perfil"
            />
            <div className="info-notificacao">
              <p>
                <strong>{n.remetente?.nome_usuario || ""}</strong> {n.mensagem}
              </p>
              <small>{new Date(n.dataEnvio).toLocaleString("pt-BR")}</small>
            </div>
            {n.remetente && (
              <button
                className="btn-seguir"
                onClick={() => seguirUsuario(n.remetente.id)}
              >
                Seguir
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notificacoes;
