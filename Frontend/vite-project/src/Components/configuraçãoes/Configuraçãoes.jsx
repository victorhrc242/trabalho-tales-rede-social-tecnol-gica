import React, { useState, useEffect } from 'react';
import '../configuraçãoes/configuraçãoes.css';

const Configuracoes = ({ usuarioLogado }) => {
  const [abaAtiva, setAbaAtiva] = useState('notificacoes');
 const usuario = JSON.parse(localStorage.getItem('usuario'));
const usuarioId  = usuario?.id;

  useEffect(() => {
    // Quando a aba "Conta" for ativada, busca os dados do usuário
    if (abaAtiva === 'notificacoes') {
      fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioId}`, {
        headers: {
          accept: '*/*',
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Erro ao buscar usuário');
          }
          return res.json();
        })
        .then((data) => {
          setUsuario(data);
        })
        .catch((error) => {
          console.error(error);
          setUsuario(null);
        });
    }
  }, [abaAtiva, usuarioId]);

  return (
    <div className="config-container">
      <header className="config-header">
        <button
          className="btn-voltar"
          onClick={() => alert('Voltar para home (implemente como quiser)')}
          aria-label="Voltar para Home"
        >
          ←
        </button>
        <h2>Configurações</h2>
      </header>

      <div className="config-body">
        <nav className="tabs-ig">
          <button
            className={abaAtiva === 'notificacoes' ? 'active' : ''}
            onClick={() => setAbaAtiva('notificacoes')}
            aria-label="Notificações"
          >
            Conta
          </button>
          <button
            className={abaAtiva === 'privacidade' ? 'active' : ''}
            onClick={() => setAbaAtiva('privacidade')}
            aria-label="Privacidade"
          >
            Privacidade
          </button>
          <button
            className={abaAtiva === 'seguranca' ? 'active' : ''}
            onClick={() => setAbaAtiva('seguranca')}
            aria-label="Segurança"
          >
            Segurança
          </button>
        </nav>

        <main className="content-area">
          {abaAtiva === 'notificacoes' && (
            <div>
              <h3>Configurações de Conta</h3>
              {usuario ? (
                <div>
               
                  <p><strong>Nome:</strong> {usuario.nome}</p>
                  <p><strong>Nome usuário:</strong> {usuario.nome_usuario}</p>
                  <p><strong>Email:</strong> {usuario.email}</p>
                </div>
              ) : (
                <p>Carregando dados do usuário...</p>
              )}
            </div>
          )}

          {abaAtiva === 'privacidade' && (
            <div>
              <h3>Configurações de Privacidade</h3>
              <p>Aqui você pode configurar sua privacidade.</p>
            </div>
          )}

          {abaAtiva === 'seguranca' && (
            <div>
              <h3>Configurações de Segurança</h3>
              <p>Aqui você pode alterar sua senha e outras configurações de segurança.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;
