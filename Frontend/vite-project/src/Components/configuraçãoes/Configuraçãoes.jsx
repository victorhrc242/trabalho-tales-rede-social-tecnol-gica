import React, { useState, useEffect } from 'react';
import '../configuraçãoes/configuraçãoes.css';

const Configuracoes = ({ usuarioLogado }) => {
  const [abaAtiva, setAbaAtiva] = useState('notificacoes');
  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('usuario'))); // Estado inicial vem do localStorage
  const usuarioId  = usuario?.id;

  useEffect(() => {
    // Quando a aba "Conta" for ativada, busca os dados do usuário
    if (abaAtiva === 'notificacoes' && usuarioId) {
      fetch(`http://localhost:5124/api/auth/usuario/${usuarioId}`, {
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
          setUsuario(data); // Atualiza o estado com os dados da API
        })
        .catch((error) => {
          console.error(error);
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
              <h3>Informações da Conta</h3>
              {usuario ? (
                <div>
                  <p><strong>Nome:</strong> {usuario.nome}</p>
                  <p><strong>Email:</strong> {usuario.email}</p>
                  <p><strong>Biografia:</strong> {usuario.biografia}</p>
                  <p><strong>Data de Aniversário:</strong> {new Date(usuario.dataaniversario + 'T00:00:00Z').toLocaleDateString('pt-BR')}</p>
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
