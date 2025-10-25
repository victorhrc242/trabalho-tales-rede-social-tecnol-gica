// Modais/TrocarConta.jsx
import React, { useEffect, useState } from 'react';
import '../configuracaoes/trocarConta.css';

function TrocarConta({ fechar }) {
  const [usuariosSalvos, setUsuariosSalvos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [trocandoConta, setTrocandoConta] = useState(false);

  useEffect(() => {
    const buscarUsuarios = async () => {
      try {
        const salvos = JSON.parse(localStorage.getItem('usuariosRecentes')) || [];
        setCarregando(true);
        
        const usuariosAtualizados = await Promise.all(
          salvos.map(async (user) => {
            if (!user?.id) return null;
            
            try {
              const res = await fetch(
                `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${user.id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (!res.ok) {
                console.warn(`Usuário ${user.id} não encontrado, usando dados locais`);
                return user;
              }
              
              const dadosAtualizados = await res.json();
              return {
                ...user,
                ...dadosAtualizados
              };
              
            } catch (err) {
              console.warn(`Erro ao buscar usuário ${user.id}:`, err);
              return user;
            }
          })
        );
        
        const usuariosValidos = usuariosAtualizados.filter(u => u != null);
        localStorage.setItem('usuariosRecentes', JSON.stringify(usuariosValidos));
        setUsuariosSalvos(usuariosValidos);
        
      } catch (err) {
        console.error('Erro geral ao buscar contas:', err);
        const salvos = JSON.parse(localStorage.getItem('usuariosRecentes')) || [];
        setUsuariosSalvos(salvos);
      } finally {
        setCarregando(false);
      }
    };

    buscarUsuarios();

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const selecionarUsuario = async (usuario) => {
    setTrocandoConta(true);
    try {
      // Limpa dados temporários da sessão
      sessionStorage.clear();
      
      // Atualiza o usuário no localStorage
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redireciona para a home
      window.location.href = '/home';
    } catch (error) {
      console.error('Erro ao trocar de conta:', error);
    } finally {
      setTrocandoConta(false);
    }
  };

  const irLogin = () => {
    window.location.href = '/?adicionarConta=true';
  };

  const removerTudo = () => {
    localStorage.removeItem('usuariosRecentes');
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.clear();
    window.location.href = '/';
  };

  const fecharModal = () => {
    if (typeof fechar === 'function') fechar();
  };

  return (
    <div className="modal-overlay-trocar">
      <div className="modal-trocar-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="titulo-trocar">Trocar de Conta</h2>

        {carregando ? (
          <div className="carregando-contas">
            <div className="spinner"></div>
            <p>Carregando contas...</p>
          </div>
        ) : usuariosSalvos.length === 0 ? (
          <p className="mensagem-vazia">Nenhuma conta salva neste dispositivo.</p>
        ) : (
          <ul className="lista-usuarios">
            {usuariosSalvos.map((user, i) => (
              <li 
                key={i} 
                className="item-usuario" 
                onClick={() => !trocandoConta && selecionarUsuario(user)}
              >
                <img
                  src={user.imagem || '/imagens/avatar-padrao.png'}
                  alt={user.nome_usuario || user.nome}
                  className="avatar-usuario"
                  onError={(e) => {
                    e.target.src = '/imagens/avatar-padrao.png';
                  }}
                />
                <span className="nome-usuario">{user.nome_usuario || user.nome}</span>
                {trocandoConta && user.id === usuariosSalvos[i]?.id && (
                  <div className="loading-troca"></div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="acoes-conta">
          <button 
            className="botao-conta adicionar-conta" 
            onClick={irLogin}
            disabled={trocandoConta}
          >
            Adicionar nova conta
          </button>
          <button 
            className="botao-conta sair-contas" 
            onClick={removerTudo}
            disabled={trocandoConta}
          >
            Sair de todas as contas
          </button>
        </div>

        <button 
          className="fechar-modal" 
          onClick={fecharModal}
          disabled={trocandoConta}
        >
          ×
        </button>

        {trocandoConta && (
          <div className="overlay-carregando">
            <div className="spinner-grande"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrocarConta;