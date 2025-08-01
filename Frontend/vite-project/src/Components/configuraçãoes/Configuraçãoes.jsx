import React, { useState, useEffect } from 'react';
import '../configuraçãoes/configuraçãoes.css';

const Configuracoes = ({ usuarioLogado }) => {
  const [abaAtiva, setAbaAtiva] = useState('notificacoes');
  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('usuario'))); // Estado inicial vem do localStorage
  const usuarioId  = usuario?.id;
const [senhaAtual, setSenhaAtual] = useState('');
const [novaSenha, setNovaSenha] = useState('');
const [mensagemSeguranca, setMensagemSeguranca] = useState('');

  useEffect(() => {
    // Quando a aba "Conta" for ativada, busca os dados do usuário
    if (abaAtiva === 'notificacoes' && usuarioId) {
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
              </div>
              ) : (
                <p>Carregando dados do usuário...</p>
              )}
            </div>
          )}

{abaAtiva === 'privacidade' && (
  <div>
    <h3>Configurações de Privacidade</h3>
    {usuario ? (
      <div>
<p className='text-priv'>Conta privada <label className="switch">
       <input
  type="checkbox"
  checked={!usuario.publica} // Agora: marcada = privada
  onChange={async () => {
    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/alterar-status/${usuario.id}`, {
        method: 'PUT',
        headers: {
          accept: '*/*',
        },
      });

      if (!response.ok) throw new Error('Erro ao alterar status da conta');

      const data = await response.json();
      setUsuario((prev) => ({
        ...prev,
        publica: data.usuario.publica,
      }));
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status de privacidade.');
    }
  }}
/>
          <span className="slider round"></span>
        </label>
        </p>
      </div>
    ) : (
      <p>Carregando dados do usuário...</p>
      
    )}
   <p className="descricao-privacidade">
  Quando sua conta está <strong>privada</strong>, apenas pessoas que você aprovar poderão ver suas publicações, comentários e perfil completo. 
  Se estiver <strong>pública</strong>, qualquer pessoa poderá visualizar seu conteúdo, mesmo sem seguir você.
</p>

  </div>
  
)}

         {abaAtiva === 'seguranca' && (
  <div>
    <h3>Configurações de Segurança</h3>
    <p>Altere sua senha atual aqui:</p>

    <div className="form-group">
      <label>Senha Atual</label>
      <input
        type="password"
        value={senhaAtual}
        onChange={(e) => setSenhaAtual(e.target.value)}
        placeholder="Digite sua senha atual"
      />
    </div>

    <div className="form-group">
      <label>Nova Senha</label>
      <input
        type="password"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        placeholder="Digite sua nova senha"
      />
    </div>

    <button
      onClick={async () => {
        setMensagemSeguranca('');
        if (!senhaAtual || !novaSenha) {
          setMensagemSeguranca('Preencha todos os campos.');
          return;
        }

        try {
          const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/trocar-senha-logado/${usuario.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              accept: '*/*',
            },
            body: JSON.stringify({
              senhaAtual,
              novaSenha
            }),
          });

          const result = await response.json();

          if (response.ok) {
            setMensagemSeguranca('✅ ' + result.message);
            setSenhaAtual('');
            setNovaSenha('');
          } else {
            setMensagemSeguranca('❌ ' + (result.erro || 'Erro ao trocar a senha.'));
          }
        } catch (error) {
          console.error(error);
          setMensagemSeguranca('❌ Erro de conexão com o servidor.');
        }
      }}
    >
      Trocar Senha
    </button>

    {mensagemSeguranca && (
      <p style={{ marginTop: '10px', color: mensagemSeguranca.startsWith}}>
        {mensagemSeguranca}
      </p>
    )}
  </div>
)}
        </main>
      </div>
    </div>  
  );
};

export default Configuracoes;
