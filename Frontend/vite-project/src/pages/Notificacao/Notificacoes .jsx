import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Notificacao/notificacao.css";

function Notificacoes() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      try {
        const usuarioObj = JSON.parse(usuarioString);
        setUsuario(usuarioObj);
      } catch (err) {
        console.error('Erro ao analisar os dados do usuário:', err);
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
    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Notificacoes/${usuario.id}`);
      const data = await response.json();

      if (data.notificacoes) {
        // Para cada notificação, buscar o remetente (se possível)
        const notificacoesComRemetente = await Promise.all(
          data.notificacoes.map(async (n) => {
            const remetenteId = extrairIdDaMensagem(n.mensagem);
            if (remetenteId) {
              const remetente = await buscarUsuarioPorId(remetenteId);
              return { ...n, remetente };
            }
            return { ...n };
          })
        );
        setNotificacoes(notificacoesComRemetente);
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  const extrairIdDaMensagem = (mensagem) => {
    const match = mensagem.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/
    );
    return match ? match[1] : null;
  };

  const buscarUsuarioPorId = async (id) => {
    try {
      const resp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Usuarios/${id}`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
    }
    return null;
  };

  const seguirUsuario = async (idUsuario) => {
    try {
      const resposta = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario1: usuario.id,
          usuario2: idUsuario,
        }),
      });

      if (resposta.ok) {
        fetchNotificacoes();
      }
    } catch (err) {
      console.error("Erro ao seguir usuário:", err);
    }
  };

  return (
    <div className="notificacoes-container">
      <h2>Notificações</h2>
      {notificacoes.length === 0 && <p>Não há notificações</p>}

      <ul>
        {notificacoes.map((notificacao) => (
          <li key={notificacao.id}>
            <img
              src={
                notificacao.remetente?.imagem ||
                "https://via.placeholder.com/40"
              }
              alt="Foto de perfil"
            />
            <div className="info-notificacao">
              <p>
                <strong>{notificacao.remetente?.nome_usuario || ""}</strong>  {notificacao.mensagem}
              </p>
              <small>
                {new Date(notificacao.dataEnvio).toLocaleString("pt-BR")}
              </small>
            </div>
            {notificacao.remetente && (
              <button className="btn-seguir" onClick={() => seguirUsuario(notificacao.remetente.id)}>
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
