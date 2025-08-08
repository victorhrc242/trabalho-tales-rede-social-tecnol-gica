import React from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function visualizacaoexploreselecionado({
  post,
  comentarios,
  comentarioTexto,
  setComentarioTexto,
  comentar,
  fechar,
}) {
  return (
    <div className="comentario-mobile-feed">
      <div className="header">
        <button onClick={fechar}>← Voltar</button>
        <span>{post?.autorNome || "Usuário"}</span>
      </div>

      <div className="post-content">
        {post?.imagem && <img src={post.imagem} alt="" />}
        {post?.video && <video src={post.video} controls />}
      </div>

      <div className="acoes">
        <Heart size={20} />
        <MessageCircle size={20} />
        <Share2 size={20} />
      </div>

      <div className="comentarios-lista">
        {(comentarios || []).map((c) => (
          <div key={c.id} className="comentario-item">
            <img src={c.autorImagem || "https://via.placeholder.com/40"} alt="" />
            <span><b>{c.autorNome}:</b> {c.conteudo}</span>
          </div>
        ))}
      </div>

      <div className="input-comentario">
        <input
          type="text"
          placeholder="Escreva um comentário..."
          value={comentarioTexto}
          onChange={(e) => setComentarioTexto(e.target.value)}
        />
        <button onClick={comentar}>Enviar</button>
      </div>
    </div>
  );
}
