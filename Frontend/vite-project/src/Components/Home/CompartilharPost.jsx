// CompartilharPost.jsx
import React, { useEffect, useState } from 'react';
import './modal.css';

function CompartilharPost({ post, usuario, onClose }) {
  const [seguindo, setSeguindo] = useState([]);
  const [destinatarioId, setDestinatarioId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const buscarUsuariosSeguindo = async () => {
      try {
        const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${usuario.id}`);
        const data = await res.json();

        if (data.sucesso && Array.isArray(data.seguindo)) {
          const detalhes = await Promise.all(data.seguindo.map(async ({ usuario2 }) => {
            const resUser = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuario2}`);
            const userData = await resUser.json();
            return {
              id: usuario2,
              nome: userData.nome,
              imagem: userData.imagem
            };
          }));
          setSeguindo(detalhes);
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes dos usuários seguindo:', err);
      }
    };

    buscarUsuariosSeguindo();
  }, [usuario.id]);

  const enviarMensagem = async () => {
    try {
      const corpo = {
        idRemetente: usuario.id,
        idDestinatario: destinatarioId,
        conteudo: mensagem,
        postCompartilhadoId: post.id
      };

      const response = await fetch("https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Mensagens/enviar-com-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
      });

      const data = await response.json();
      if (data.sucesso) {
        setToast("Mensagem enviada!");
        setTimeout(() => {
          setToast(null);
          onClose();
        }, 2000);
      } else {
        setToast("Erro: " + data.mensagem);
      }
    } catch (erro) {
      setToast("Erro ao enviar: " + erro.message);
    }
  };

  return (
    <div className="modal-overlay-story" onClick={onClose}>
      <div className="modal-content-story" onClick={(e) => e.stopPropagation()}>
        <h3>Compartilhar</h3>

        {toast && <div className="toast sucesso">{toast}</div>}

        <ul className="lista-usuarios-horizontal">
          {seguindo.map((usuario) => (
            <li
              key={usuario.id}
              onClick={() => setDestinatarioId(usuario.id)}
              style={{ backgroundColor: destinatarioId === usuario.id ? '#ddd' : undefined }}
            >
              <img src={usuario.imagem} alt="avatar" />
              <span style={{ fontSize: 12 }}>{usuario.nome}</span>
            </li>
          ))}
        </ul>

        {destinatarioId && (
          <>
            <textarea
              className="textarea-mensagem"
              placeholder="Escreva uma mensagem..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
            <button className="botao-enviar-dm-story" onClick={enviarMensagem}>Enviar</button>
          </>
        )}
      </div>
    </div>
  );
}

export default CompartilharPost;
