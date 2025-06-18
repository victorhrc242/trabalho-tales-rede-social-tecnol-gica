import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../css/Criar.css';

const supabase = createClient(
  'https://vffnyarjcfuagqsgovkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg'

);

function Criar({ usuarioLogado, onClose }) {
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagem, setImagem] = useState('');
  const [videoArquivo, setVideoArquivo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tags, setTags] = useState('');
  const [erro, setErro] = useState('');
  const [etapa, setEtapa] = useState(1);

  // Cria URL para preview e limpa na desmontagem / troca
  useEffect(() => {
    let imgUrl = null;
    let vidUrl = null;

    if (imagemArquivo) {
      imgUrl = URL.createObjectURL(imagemArquivo);
      setImagem(imgUrl);
    } else {
      setImagem('');
    }

    if (videoArquivo) {
      vidUrl = URL.createObjectURL(videoArquivo);
      setVideoUrl(vidUrl);
    } else {
      setVideoUrl('');
    }

    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
      if (vidUrl) URL.revokeObjectURL(vidUrl);
    };
  }, [imagemArquivo, videoArquivo]);

  const uploadImagem = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('post-usuarios')
      .upload(`posts/${fileName}`, file);
    if (error) throw error;
    return `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/post-usuarios/posts/${fileName}`;
  };

  const uploadVideo = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('post-usuarios')
      .upload(`videos/${fileName}`, file);
    if (error) throw error;
    return `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/post-usuarios/videos/${fileName}`;
  };

  const handleCriarPost = async (e) => {
    e.preventDefault();

    if (!imagemArquivo && !videoArquivo) {
      setErro('Adicione uma imagem ou vídeo para o post.');
      return;
    }

    try {
      let imagemUrl = '';
      let videoUrlSupabase = '';

      if (imagemArquivo) {
        imagemUrl = await uploadImagem(imagemArquivo);
      }

      if (videoArquivo) {
        videoUrlSupabase = await uploadVideo(videoArquivo);
      }

      const novoPost = {
        autorId: usuarioLogado.id,
        conteudo,
        imagem: imagemUrl,
        video: videoUrlSupabase,
        tags: tags.split(',').map(tag => tag.trim()),
      };

      const response = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost),
      });

      if (response.ok) {
        // fechar modal via onClose passado por props
        onClose();

        // resetar estados
        setEtapa(1);
        setImagemArquivo(null);
        setVideoArquivo(null);
        setImagem('');
        setVideoUrl('');
        setConteudo('');
        setTags('');
        setErro('');
      } else {
        const erroResp = await response.json();
        setErro(erroResp.erro || 'Erro ao criar o post');
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setErro('Erro ao enviar imagem ou vídeo.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-CriarPost ${etapa === 2 ? 'modal-CriarPost-etapa2' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <form className="form-criar-post" onSubmit={handleCriarPost}>
          <h2>Criar Novo Post</h2>

          {etapa === 1 && (
            <>
              {!imagemArquivo && !videoArquivo && (
  <label
    className="area-upload"
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImagemArquivo(file);
      } else if (file.type.startsWith('video/')) {
        setVideoArquivo(file);
      }
    }}
  >
    <p>Arraste uma imagem ou vídeo aqui<br />ou clique para selecionar</p>
    <input
      type="file"
      accept="image/*,video/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file.type.startsWith('image/')) {
          setImagemArquivo(file);
        } else if (file.type.startsWith('video/')) {
          setVideoArquivo(file);
        }
      }}
    />
  </label>
              )}

              {imagem && (
                <div className="preview-imagem2">
                  <img
                    src={imagem}
                    alt="Pré-visualização"
                    className={`imagem-preview ${filtroSelecionado}`}
                  />
                </div>
              )}

              {videoUrl && (
                <div className="preview-video">
                  <video
                    controls
                    src={videoUrl}
                    style={{ maxWidth: '100%', borderRadius: '10px' }}
                  />
                </div>
              )}

              {(imagemArquivo || videoArquivo) && (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagemArquivo(null);
                      setVideoArquivo(null);
                      setImagem('');
                      setVideoUrl('');
                    }}
                  >
                    Trocar mídia
                  </button>
                  <button type="button" onClick={() => setEtapa(2)}>
                    Próximo
                  </button>
                </div>
              )}
            </>
          )}

          {etapa === 2 && (
            <>
              <textarea placeholder="Escreva algo..." value={conteudo} onChange={(e) => setConteudo(e.target.value)} required />
              <input type="text" placeholder="Tags separadas por vírgula" value={tags} onChange={(e) => setTags(e.target.value)} />
              <div className="botoes-acoes">
                <button className='button-confirme' type="submit">Publicar</button>
                <button className='button-cancel' type="button" onClick={() => {
                  onClose();
                  setEtapa(1);
                }}>Cancelar</button>
              </div>
            </>
          )}

          {erro && <p className="erro">{erro}</p>}
        </form>
      </div>
    </div>
  );
}

export default Criar;
