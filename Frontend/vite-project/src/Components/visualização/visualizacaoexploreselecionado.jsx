import React from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function VisualizacaoExploreSelecionado({
  post,
  comentarios,
  comentarioTexto,
  setComentarioTexto,
  comentar,
  fechar,
  curtirPost,
  foiCurtido,
  totalCurtidas,
  handleCurtir,
}) {

  
  return (
    <div className="comentario-mobile-feed" style={{ maxWidth: 500, margin: '0 auto', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
      
      {/* Header com voltar e nome do autor */}
      <div className="header" style={{ display: 'flex', alignItems: 'center', padding: 10, borderBottom: '1px solid #eee' }}>
        <button onClick={fechar} style={{ marginRight: 10 }}>←</button>
        <img
          src={post?.autorImagem || "https://via.placeholder.com/40"}
          alt="Foto do autor"
          style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
        />
        <span style={{ fontWeight: 'bold' }}>{post?.autorNome || "Usuário"}</span>
      </div>

      {/* Imagem ou vídeo do post */}
      <div className="post-content" style={{ width: '100%', maxHeight: 400, overflow: 'hidden', backgroundColor: '#000' }}>
        {post?.imagem && <img src={post.imagem} alt="" style={{ width: '100%', objectFit: 'cover' }} />}
        {post?.video && <video src={post.video} controls style={{ width: '100%' }} />}
      </div>

      {/* Botões de ação */}
      <div className="acoes" style={{ display: 'flex', gap: 16, padding: 10 }}>
        <button onClick={handleCurtir} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Heart
            size={24}
            color={foiCurtido ? 'red' : 'black'}
            fill={foiCurtido ? 'red' : 'none'}
          />
        </button>
        <MessageCircle size={24} />
        <Share2 size={24} />
      </div>

      {/* Curtidas e texto do post */}
      <div style={{ padding: '0 10px' }}>
        {totalCurtidas > 0 && (
          <p style={{ fontWeight: 'bold', margin: '4px 0' }}>
            {totalCurtidas} curtida{totalCurtidas > 1 ? 's' : ''}
          </p>
        )}
        {post?.conteudo && (
          <p style={{ margin: '4px 0' }}>
            <b>{post.autorNome}</b> {post.conteudo} {post.tags?.map((tag) => `#${tag.trim()}`).join(' ')}
          </p>
        )}
        <p style={{ color: '#999', fontSize: 12 }}>{new Date(post.dataPostagem).toLocaleString()}</p>
      </div>

      {/* Lista de comentários */}
      <div className="comentarios-lista" style={{ padding: 10 }}>
        {(comentarios || []).map((c) => (
          <div key={c.id} className="comentario-item" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <img
              src={c.autorImagem || "https://via.placeholder.com/40"}
              alt=""
              style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 8 }}
            />
            <span><b>{c.autorNome}:</b> {c.conteudo}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
