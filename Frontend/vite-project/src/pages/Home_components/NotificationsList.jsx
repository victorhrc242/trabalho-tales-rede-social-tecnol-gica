import { FaBell } from 'react-icons/fa';

function NotificationsList({ notificacoes, irParaPerfil }) {
  return (
    <div className="notificacoes-box">
      <h4><FaBell /> Notificações</h4>
      <ul>
        {notificacoes.length === 0 ? (
          <li>Não há notificações</li>
        ) : (
          notificacoes.map((notificacao) => {
            const remetente = notificacao.remetente || {};
            return (
              <li key={notificacao.id} className="notificacao-item">
                <img
                  src={remetente?.imagem || 'https://via.placeholder.com/40'}
                  alt="Foto de perfil"
                  className="avatar-busca"
                  onClick={() => remetente.id && irParaPerfil(remetente.id)}
                  style={{ cursor: 'pointer' }}
                />
                <div
                  className="info-notificacao"
                  onClick={() => remetente.id && irParaPerfil(remetente.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <p>
                    <strong>{remetente.nome_usuario || remetente.nome || 'Alguém'}</strong> {notificacao.mensagem}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export default NotificationsList;