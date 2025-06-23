import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Notificacao/notificacao.css";

function Notificacoes() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    // Checar se o token existe no localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Tentar pegar o usuário do localStorage
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
      // Aqui você pode carregar as notificações baseadas no `usuario.id`
      // Por exemplo, fazendo uma requisição para obter as notificações:
      fetchNotificacoes();
    }
  }, [usuario]);

  const fetchNotificacoes = async () => {
    try {
      // Substitua com a URL da sua API para obter as notificações
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Notificacoes/${usuario.id}`);
      const data = await response.json();

      // A resposta da API pode ter um formato diferente, então vamos ajustar
      // Aqui assumimos que a resposta tem um formato com o campo `notificacoes`
      if (data.notificacoes) {
        setNotificacoes(data.notificacoes);
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };
  // Seguir Usuario
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
      // Atualizar notificações para refletir novo estado
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
              <strong>{notificacao.remetente?.nome_usuario || "Usuário"}</strong> Seguiu você
            </p>
            <small>
              {new Date(notificacao.dataEnvio).toLocaleString("pt-BR")}
            </small>
          </div>
          {notificacao.seguido ? (
            <button className="btn-seguindo">Seguindo</button>
          ) : (
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
