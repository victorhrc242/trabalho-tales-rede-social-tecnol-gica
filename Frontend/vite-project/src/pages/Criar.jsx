import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Criar() {
  const navigate = useNavigate();
  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [tags, setTags] = useState('');
  const [erro, setErro] = useState('');

  const handleCriar = async (e) => {
    e.preventDefault();

    if (!usuario) {
      navigate('/');
      return;
    }

    const novoPost = {
      autorId: usuario.id,
      conteudo,
      imagem,
      tags: tags.split(',').map(tag => tag.trim())
    };

    try {
      const response = await fetch('https://devisocial.up.railway.app/api/Feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost)
      });

      if (response.ok) {
        navigate('/home');
      } else {
        const erroResp = await response.json();
        setErro(erroResp.erro || 'Erro ao criar o post');
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setErro('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="criar-post-container">
      <h2>Criar Novo Post</h2>
      {erro && <p className="erro">{erro}</p>}
      <form onSubmit={handleCriar} className="formulario-post">
        <textarea
          placeholder="Escreva algo..."
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="URL da imagem (opcional)"
          value={imagem}
          onChange={(e) => setImagem(e.target.value)}
        />
        {imagem && (
          <div className="preview-imagem">
            <img src={imagem} alt="Pré-visualização" />
          </div>
        )}
        <input
          type="text"
          placeholder="Tags separadas por vírgula"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div className="botoes-form">
          <button className='button-confirme' type="submit">Publicar</button>
          <button className='button-cancel' type="button" onClick={() => navigate('/home')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default Criar;
