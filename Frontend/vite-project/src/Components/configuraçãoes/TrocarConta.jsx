// Modais/TrocarConta.jsx
import React, { useEffect, useState } from 'react';
import '../configuraçãoes/trocarConta.css';

function TrocarConta({ fechar }) {
  const [usuariosSalvos, setUsuariosSalvos] = useState([]);

  useEffect(() => {
    // Recupera contas recentes salvas no localStorage
    const salvos = JSON.parse(localStorage.getItem('usuariosRecentes')) || [];
    setUsuariosSalvos(salvos);

    // Bloqueia o scroll do body quando o modal está aberto
    document.body.style.overflow = 'hidden';

    return () => {
      // Restaura o scroll quando o modal for fechado
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Define a conta selecionada como ativa
  const selecionarUsuario = (usuario) => {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    window.location.reload(); // Recarrega a página com o novo usuário
  };

  // Redireciona para a página de login
  const irLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/';
  };

  // Remove todas as contas e retorna ao login
  const removerTudo = () => {
    localStorage.removeItem('usuariosRecentes');
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Fecha o modal chamando a função passada por props
  const fecharModal = () => {
    if (fechar && typeof fechar === 'function') {
      fechar(); // ✅ Fecha corretamente o modal como componente
    }
  };

  return (
    // Fundo escurecido com blur (não fecha mais ao clicar fora)
    <div className="modal-overlay-trocar">
      {/* Container principal do modal que impede propagação de clique */}
      <div className="modal-trocar-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="titulo-trocar">Trocar de Conta</h2>

        {/* Lista de usuários ou mensagem de vazio */}
        {usuariosSalvos.length === 0 ? (
          <p className="mensagem-vazia">Nenhuma conta salva neste dispositivo.</p>
        ) : (
          <ul className="lista-usuarios">
            {usuariosSalvos.map((user, i) => (
              <li key={i} className="item-usuario" onClick={() => selecionarUsuario(user)}>
                <img
                  src={user.imagem || 'https://via.placeholder.com/100x100.png?text=Foto'}
                  alt={user.nome_usuario}
                  className="avatar-usuario"
                />
                <span className="nome-usuario">{user.nome_usuario || user.nome}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Botões de ação */}
        <div className="acoes-conta">
          <button className="botao-conta adicionar-conta" onClick={irLogin}>
            Adicionar nova conta
          </button>
          <button className="botao-conta sair-contas" onClick={removerTudo}>
            Sair de todas as contas
          </button>
        </div>

        {/* Botão "X" para fechar o modal */}
        <button className="fechar-modal" onClick={fecharModal}>×</button>
      </div>
    </div>
  );
}

export default TrocarConta;
