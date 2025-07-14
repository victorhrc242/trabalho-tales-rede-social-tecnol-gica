// Components/Modais/TrocarContaModal.jsx
import React, { useEffect, useState } from 'react';
import '../configuraçãoes/trocarConta.css';

function TrocarContaModal() {
  const [usuariosSalvos, setUsuariosSalvos] = useState([]);

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('usuariosRecentes')) || [];
    setUsuariosSalvos(salvos);

    // Bloqueia scroll da página em segundo plano
    document.body.style.overflow = 'hidden';

    // Ao desmontar, restaura o scroll
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const selecionarUsuario = (usuario) => {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    window.location.reload(); // ou atualizar globalmente se usar contexto
  };

  const irLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/';
  };

  const removerTudo = () => {
    localStorage.removeItem('usuariosRecentes');
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // 👉 Fecha o modal voltando para a página anterior
  const fecharModal = () => {
    window.history.back(); // retorna para a última rota
  };

  return (
    <div className="modal-overlay-trocar" onClick={fecharModal}>
      <div className="modal-trocar-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="titulo-trocar">Trocar de Conta</h2>
        {usuariosSalvos.length === 0 ? (
          <p className="mensagem-vazia">Nenhuma conta salva neste dispositivo.</p>
        ) : (
          <ul className="lista-usuarios">
            {usuariosSalvos.map((user, i) => (
              <li key={i} className="item-usuario" onClick={() => selecionarUsuario(user)}>
                <img
                  src={user.imagem || 'https://via.placeholder.com/100'}
                  alt={user.nome_usuario}
                  className="avatar-usuario"
                />
                <span className="nome-usuario">{user.nome_usuario || user.nome}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="acoes-conta">
          <button className="botao-conta adicionar-conta" onClick={irLogin}>
            Adicionar nova conta
          </button>
          <button className="botao-conta sair-contas" onClick={removerTudo}>
            Sair de todas as contas
          </button>
        </div>
        {/* Botão X que volta para a página anterior */}
        <button className="fechar-modal" onClick={fecharModal}>×</button>
      </div>
    </div>
  );
}

export default TrocarContaModal;
