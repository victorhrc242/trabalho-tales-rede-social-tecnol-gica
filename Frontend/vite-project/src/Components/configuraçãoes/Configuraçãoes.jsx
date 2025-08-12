import React, { useState, useEffect } from 'react';
import '../configuraçãoes/configuraçãoes.css';

const Configuracoes = ({ usuarioLogado }) => {
  const [abaAtiva, setAbaAtiva] = useState('notificacoes');
  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('usuario'))); // Estado inicial vem do localStorage
  const usuarioId  = usuario?.id;
const [senhaAtual, setSenhaAtual] = useState('');
const [novaSenha, setNovaSenha] = useState('');
const [mensagemSeguranca, setMensagemSeguranca] = useState('');
const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
const [senhaExcluir, setSenhaExcluir] = useState('');
const [mensagemExcluir, setMensagemExcluir] = useState('');

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
useEffect(() => {
  if (abaAtiva === 'privacidade') {
    const usuarioStorage = localStorage.getItem('usuario');
    if (usuarioStorage) {
      setUsuario(JSON.parse(usuarioStorage));
    }
  }
}, [abaAtiva]);
useEffect(() => {
  if ((abaAtiva === 'notificacoes' || abaAtiva === 'privacidade') && usuarioId) {
    fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioId}`, {
      headers: {
        accept: '*/*',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar usuário');
        return res.json();
      })
      .then(data => {
        setUsuario(data);
        localStorage.setItem('usuario', JSON.stringify(data)); // mantém localStorage atualizado
      })
      .catch(error => {
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
          <button
            className={abaAtiva === 'Politica de privacidade' ? 'active' : ''}
            onClick={() => setAbaAtiva('Politica de privacidade')}
            aria-label="Política de Privacidade"
          >
           Politica pvd
          </button>
          <button
            className={abaAtiva === 'Termos de uso' ? 'active' : ''}
            onClick={() => setAbaAtiva('Termos de uso')}
            aria-label="Termos de uso"
          >
          Termos de Uso
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

                   <button
      style={{ marginTop: '20px', backgroundColor: '#f44336', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      onClick={() => setModalExcluirAberto(true)}
    >
      Excluir Conta
    </button>
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
              <p className="text-priv">
                Conta privada{' '}
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!usuario.publica}
                    onChange={async () => {
                      try {
                        const response = await fetch(
                          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/alterar-status/${usuario.id}`,
                          { method: 'PUT', headers: { accept: '*/*' } }
                        );
                        if (!response.ok) throw new Error('Erro ao alterar status da conta');
                        const data = await response.json();
                        const usuarioAtualizado = { ...usuario, publica: data.usuario.publica };
                        setUsuario(usuarioAtualizado);
                        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
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
            Quando sua conta está <strong>privada</strong>, apenas pessoas que você aprovar poderão ver suas publicações,
            comentários e perfil completo. Se estiver <strong>pública</strong>, qualquer pessoa poderá visualizar seu conteúdo,
            mesmo sem seguir você.
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
        {abaAtiva === 'Politica de privacidade' && (
          <div className="privacidade-info">
            <h2>Política de Privacidade</h2>

        <p>
          A <strong>Olicorp Innovations</strong> valoriza a sua privacidade. Esta Política de Privacidade descreve como
          coletamos, usamos e protegemos suas informações ao utilizar a rede social <strong>Paradise</strong>.
        </p>

        <h3>1. Informações Coletadas</h3>
        <p>Ao utilizar a Paradise, podemos coletar os seguintes dados:</p>
        <ul>
          <li>Informações fornecidas no cadastro (nome, e-mail, senha, etc.);</li>
          <li>Interações na plataforma (curtidas, comentários, seguidores, visualizações);</li>
          <li>Tempo de visualização e engajamento com postagens e vídeos;</li>
          <li>Dados de dispositivo e IP para segurança e personalização.</li>
        </ul>

        <h3>2. Uso das Informações</h3>
        <p>
          Os dados coletados são utilizados para:
        </p>
        <ul>
          <li>Personalizar o feed e recomendações com base nos seus interesses;</li>
          <li>Melhorar a experiência do usuário com algoritmos de inteligência artificial;</li>
          <li>Garantir a segurança da plataforma e dos usuários;</li>
          <li>Entrar em contato em caso de problemas, atualizações ou notificações importantes.</li>
        </ul>

        <h3>3. Compartilhamento de Dados</h3>
        <p>
          Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto quando exigido por lei
          ou para o funcionamento seguro da plataforma (ex: serviços de autenticação e hospedagem).
        </p>

        <h3>4. Segurança da Informação</h3>
        <p>
          Adotamos medidas técnicas e administrativas para proteger seus dados contra acesso não autorizado,
          uso indevido, alteração ou destruição.
        </p>

        <h3>5. Seus Direitos</h3>
        <p>Você pode:</p>
        <ul>
          <li>Solicitar a exclusão da sua conta e dados;</li>
          <li>Corrigir ou atualizar informações pessoais;</li>
          <li>Consultar quais dados mantemos sobre você.</li>
        </ul>

        <h3>6. Cookies e Tecnologias Semelhantes</h3>
        <p>
          Utilizamos cookies para lembrar suas preferências, analisar interações e melhorar a performance do sistema.
          Ao continuar usando a Paradise, você concorda com o uso de cookies.
        </p>

        <h3>7. Alterações nesta Política</h3>
        <p>
          Podemos atualizar esta Política de tempos em tempos. Se houver mudanças relevantes, você será notificado.
          O uso contínuo da Paradise indica sua concordância com os novos termos.
        </p>

        <p><strong>Última atualização:</strong> 25 de julho de 2025</p>
          </div>
        )}
        {abaAtiva === 'Termos de uso' && (
          <div className="termos-info">
           <h2>Termos de Uso</h2>
        <p>
          Bem-vindo à <strong>Paradise</strong>, uma rede social inteligente oferecida pela <strong>Olicorp Innovations</strong>.
          Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma, você concorda com os termos abaixo.
        </p>

        <h3>1. Cadastro e Conta</h3>
        <p>
          Para usar a Paradise, você deve fornecer informações verdadeiras no momento do cadastro. Cada usuário é responsável
          por manter a segurança da sua conta. Não é permitido criar perfis falsos, duplicados ou de terceiros sem autorização.
        </p>

        <h3>2. Uso da Plataforma</h3>
        <p>
          A Paradise é uma rede social que recomenda conteúdos com base em interações como curtidas, comentários,
          seguidores e tempo de visualização. Esperamos que os usuários utilizem a plataforma de forma ética, respeitosa e legal.
          Conteúdos ofensivos, discriminatórios ou que infrinjam direitos de terceiros serão removidos e podem gerar suspensão.
        </p>

        <h3>3. Dados e Recomendação por Inteligência Artificial</h3>
        <p>
          Para oferecer uma experiência personalizada, a Paradise utiliza algoritmos de aprendizado de máquina (IA) que analisam
          seu comportamento dentro da rede — como tempo de visualização de posts, cliques, curtidas, seguidores em comum e hashtags.
          Esses dados são usados exclusivamente para melhorar seu feed e as recomendações de conteúdo.
        </p>

        <h3>4. Direitos Autorais</h3>
        <p>
          Você mantém a propriedade sobre o conteúdo que publica (textos, imagens, vídeos), mas nos concede uma licença não exclusiva
          para exibir, armazenar e compartilhar esse conteúdo dentro da Paradise, conforme as funcionalidades da plataforma.
        </p>

        <h3>5. Suspensão ou Encerramento</h3>
        <p>
          A Olicorp Innovations pode suspender ou remover contas que violem estes Termos de Uso, bem como conteúdos que infrinjam
          leis ou políticas da plataforma, sem aviso prévio.
        </p>

        <h3>6. Atualizações dos Termos</h3>
        <p>
          Este documento pode ser atualizado periodicamente. Recomendamos que você revise os termos regularmente. O uso contínuo
          da plataforma após mudanças significativas implica sua aceitação.
        </p>

        <p><strong>Última atualização:</strong> 25 de julho de 2025</p>
        </div>
        )}
        {modalExcluirAberto && (
  <div className="modal-overlay" style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '320px', boxShadow: '0 0 10px rgba(0,0,0,0.25)'
    }}>
      <h3>Confirmar Exclusão</h3>
      <p>Digite sua senha para confirmar a exclusão definitiva da conta.</p>
      <input
        type="password"
        placeholder="Senha atual"
        value={senhaExcluir}
        onChange={(e) => setSenhaExcluir(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
      />
      {mensagemExcluir && (
        <p style={{ color: mensagemExcluir.startsWith('✅') ? 'green' : 'red', marginBottom: '10px' }}>
          {mensagemExcluir}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={() => {
            setModalExcluirAberto(false);
            setSenhaExcluir('');
            setMensagemExcluir('');
          }}
          style={{ padding: '8px 12px', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          style={{ padding: '8px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
          onClick={async () => {
            setMensagemExcluir('');
            if (!senhaExcluir) {
              setMensagemExcluir('Por favor, digite sua senha.');
              return;
            }
            try {
              const response = await fetch(
                `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/excluir-conta-logado/${usuario.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    accept: '*/*',
                  },
                  body: JSON.stringify({ senha: senhaExcluir }),
                }
              );
              const data = await response.json();
              if (response.ok) {
                setMensagemExcluir('✅ ' + data.message);
                // Limpar dados e redirecionar
                localStorage.removeItem('usuario');
                // Opcional: fechar modal e redirecionar para login
                setTimeout(() => {
                  setModalExcluirAberto(false);
                  window.location.href = '/login'; // Redireciona para a página de login
                }, 1500);
              } else {
                setMensagemExcluir('❌ ' + (data.erro || 'Erro ao excluir a conta.'));
              }
            } catch (error) {
              console.error(error);
              setMensagemExcluir('❌ Erro de conexão com o servidor.');
            }
          }}
        >
          Confirmar Exclusão
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>  
  );
};

export default Configuracoes;
