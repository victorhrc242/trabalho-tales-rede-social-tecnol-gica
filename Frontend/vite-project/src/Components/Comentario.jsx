import React from 'react';
import '../css/home.css';

function Comentario({
  post,
  comentarios,
  comentarioTexto,
  setComentarioTexto,
  comentar,
  fechar
}) {
  return (
    <div className="modal-overlay">
      <div className="comentarios-modal">
        <div className="imagem-container">
          <img
            src={post.imagem}
            alt="Imagem do post"
            className="imagem-post"
          />
        </div>
        <div className="comentarios-container">
          <div className="comentarios-header">
            <strong>{post.autorNome || post.autor?.nome || 'Autor'}</strong>
          </div>

          <div className="comentarios-lista">
            {comentarios.map((c, i) => (
              <div
                key={i}
                className="comentario-item"
                style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
              >
                <img
                  src={
                    c.autorImagem ||
                    c.autor?.imagem ||
                    'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'
                  }
                  alt={`Foto de perfil de ${c.autorNome || c.autor?.nome || 'Usuário'}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '10px',
                  }}
                />
                <span>
                  <strong>{c.autorNome || c.autor?.nome || 'Anônimo'}</strong>: {c.conteudo}
                </span>
              </div>
            ))}
          </div>

          <div className="comentarios-form">
            <input
              type="text"
              placeholder="Adicione um comentário..."
              value={comentarioTexto}
              onChange={(e) => setComentarioTexto(e.target.value)}
            />
            <button onClick={comentar}>Enviar</button>
          </div>

          <button className="fechar-modal" onClick={fechar}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default Comentario;
