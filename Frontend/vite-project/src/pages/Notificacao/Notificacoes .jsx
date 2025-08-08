import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Solicitacoes from '../../Components/Home/Solicitacoes.jsx';
import "../Notificacao/notificacao.css"; 
import { FaBell } from 'react-icons/fa'; 

function Notificacoes() {
  const navigate = useNavigate();

  // Estado para armazenar dados do usuário logado 
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  // Estado para armazenar notificações recebidas
  const [notificacoes, setNotificacoes] = useState([]);
  // Controle de carregamento para mostrar spinner ou mensagem enquanto carrega
  const [carregando, setCarregando] = useState(false);
  // Estado para armazenar solicitações de amizade (componente)
  const [solicitacoes, setSolicitacoes] = useState([]);
  // Cache para evitar buscar o mesmo usuário várias vezes
  const cacheRemetentes = useRef({});

  // Carrega os dados do usuário do localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Se não estiver logado, redireciona para a página inicial/login
      navigate('/');
      return;
    }

    const us = localStorage.getItem('usuario');
    if (us) {
      try {
        // Tenta carregar usuário do localStorage e atualizar estado
        setUsuario(JSON.parse(us));
      } catch {
        setUsuario({ nome: 'Desconhecido' });
      }
    }
  }, [navigate]);

  // Quando o usuário estiver carregado, busca as notificações
  useEffect(() => {
    if (usuario.id) {
      fetchNotificacoes();
    }
  }, [usuario]);

  // Função para buscar notificações do backend
  const fetchNotificacoes = async () => {
    setCarregando(true);
    try {
      const resp = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Notificacoes/${usuario.id}`
      );
      const data = await resp.json();

      // Se não houver notificações, limpa e termina
      if (!data.notificacoes) {
        setNotificacoes([]);
        setCarregando(false);
        return;
      }

      // Para cada notificação, busca os dados do remetente usando cache para otimizar
      const lista = await Promise.all(
        data.notificacoes.map(async (n) => {
          const rid = n.usuarioRemetenteId;
          if (!rid) return n;

          if (!cacheRemetentes.current[rid]) {
            cacheRemetentes.current[rid] = await buscarUsuarioPorId(rid);
          }

          // Junta os dados da notificação com os dados do remetente
          return { ...n, remetente: cacheRemetentes.current[rid] };
        })
      );

      // Filtra para não mostrar notificações enviadas pelo próprio usuário logado
      const listaFiltrada = lista.filter(n => n.usuarioRemetenteId !== usuario.id);

      // Atualiza o estado com as notificações prontas para exibir
      setNotificacoes(listaFiltrada);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    } finally {
      setCarregando(false);
    }
  };

  // Função para buscar dados do usuário pelo ID
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

  // Navega para a página do perfil do usuário clicado
  const irParaPerfil = (idUsuario) => {
    navigate(`/perfil/${idUsuario}`);
  };

  return (
    <div className="notificacoes-container">

      {/* Componente que exibe solicitações de amizade */}
      <Solicitacoes
        usuarioId={usuario.id}
        solicitacoes={solicitacoes}
        setSolicitacoes={setSolicitacoes}
        irParaPerfil={irParaPerfil}
      />
      
      <h2><FaBell /> Notificações</h2>
      {carregando && <p>Carregando notificações...</p>}
      {!carregando && notificacoes.length === 0 && <p>Não há notificações</p>}

      <ul>
        {notificacoes.map(n => (
          <li key={n.id}>
            {/* Imagem do remetente com clique para ir ao perfil */}
            <img
              src={n.remetente?.imagem || "https://via.placeholder.com/40"}
              alt="Foto de perfil"
              style={{ cursor: 'pointer' }}
              onClick={() => irParaPerfil(n.remetente.id)}
            />

            <div className="info-notificacao">
              <p>
                <strong>{n.remetente?.nome_usuario || "  "}</strong> {n.mensagem}
              </p>
              <small>{new Date(n.dataEnvio).toLocaleString("pt-BR")}</small>
            </div>

          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notificacoes;
