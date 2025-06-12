import React from 'react';
import '../css/comentario.css';

function Comentario({

  post,
  comentarios,
  comentarioTexto,
  setComentarioTexto,
  comentar,
  fechar,
  curtirPost,         // nova prop
  usuarioCurtidas     // nova prop opcional (boolean ou número)

}) {
  return (
    <div className="modal-overlay">
      <div className="comentarios-modal">
       <div className="imagem-container">
  {post.video ? (
    <video
      src={post.video}
      className="imagem-post"
      controls
      autoPlay
      muted
      loop
    />
  ) : (
    <img
      src={post.imagem}
      alt="Imagem do post"
      className="imagem-post"
    />
  )}
</div>

        <div className="comentarios-container">
          
          <div className="comentarios-header">
  <strong>{post.autorNome}</strong>
</div>

<div className="post-conteudo" style={{ margin: '10px 0' }}>
  <p>{post.conteudo}</p>
  {post.tags && post.tags.length > 0 && (
    <p style={{ color: '#555' }}>
      {post.tags.map((tag, idx) => (
        <span key={idx} style={{ marginRight: '5px' }}>
          #{tag.trim()}
        </span>
      ))}
    </p>
  )}
</div>
          



          {/* Esse ate então é o penultimo codigo funconal então eu edeixei ele coentado aqui para o uso dele caso o codigo atual não funcione   */}
          
          {/* <div className="botoes-post" style={{ marginBottom: '10px' }}>
  <button className="botao-acao" onClick={() => curtirPost(post.id)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill={post.curtidas > 0 ? 'red' : 'none'}
      stroke={post.curtidas > 0 ? 'red' : 'black'}
      strokeWidth="2"
      viewBox="0 0 24 24"
      style={{ marginRight: '5px' }}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42
        4.42 3 7.5 3c1.74 0 3.41 0.81
        4.5 2.09C13.09 3.81 14.76 3
        16.5 3 19.58 3 22 5.42 22 8.5c0
        3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
      {post.curtidas > 0 ? `(${post.curtidas})` : ''}
  </button>
</div> */}

<div className="comentarios-lista">
  {comentarios.map((c, i) => (
    <div
      key={i}
      className="comentario-item"
    >
      <img
        src={c.autorImagem || 'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'}
        alt={`Foto de perfil de ${c.autorNome}`}
      />
      <div className="comentario-conteudo">
        <span className="comentario-autor">{c.autorNome}</span>
        <span className="comentario-texto">{c.conteudo}</span>
      </div>
    </div>
  ))}
</div>

{/* ❤️ BOTÃO DE CURTIR (agora aqui) */}

<div className="botoes-post-comentario">
  <button className="botao-acao" onClick={() => curtirPost(post.id)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill={post.curtidas > 0 ? 'red' : 'none'}
      stroke={post.curtidas > 0 ? 'red' : 'black'}
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42
        4.42 3 7.5 3c1.74 0 3.41 0.81
        4.5 2.09C13.09 3.81 14.76 3
        16.5 3 19.58 3 22 5.42 22 8.5c0
        3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
    {post.curtidas > 0 ? ` (${post.curtidas})` : ''}
  </button>
</div>

{/* Input de comentário continua aqui */}


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
