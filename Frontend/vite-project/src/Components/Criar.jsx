import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../css/Criar.css';

// Conecção com Banco
const supabase = createClient(
  'https://vffnyarjcfuagqsgovkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg'
);

// Componente principal de criação de post
function Criar({ usuarioLogado, onClose }) {
  // Estados de controle
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagem, setImagem] = useState('');
  const [videoArquivo, setVideoArquivo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tags, setTags] = useState('');
  const [erro, setErro] = useState('');
  const [etapa, setEtapa] = useState(1); // Etapa 1 = Upload, Etapa 2 = Conteúdo

  // Estados do mini modal e controle visual do modal principal
  const [enviando, setEnviando] = useState(false);
  const [mostrarMiniModal, setMostrarMiniModal] = useState(false);
  const [modalAberto, setModalAberto] = useState(true);

  // Criação de URL de preview para imagem/vídeo
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

  // Upload de imagem para Supabase
  const uploadImagem = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('post-usuarios')
      .upload(`posts/${fileName}`, file);
    if (error) throw error;
    return `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/post-usuarios/posts/${fileName}`;
  };

  // Upload de vídeo para Supabase
  const uploadVideo = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('post-usuarios')
      .upload(`videos/${fileName}`, file);
    if (error) throw error;
    return `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/post-usuarios/videos/${fileName}`;
  };

  // Manipulação do envio do post
  const handleCriarPost = async (e) => {
    e.preventDefault();
    if (enviando) return;

    if (!imagemArquivo && !videoArquivo) {
      setErro('Adicione uma imagem ou vídeo para o post.');
      return;
    }

    setEnviando(true);
    setMostrarMiniModal(true);
    setModalAberto(false); // Fecha apenas o modal principal visualmente

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
        setEtapa(1);
        setImagemArquivo(null);
        setVideoArquivo(null);
        setImagem('');
        setVideoUrl('');
        setConteudo('');
        setTags('');
        setErro('');

        // Oculta o mini modal após 4 segundos
        setTimeout(() => setMostrarMiniModal(false), 4000);
      } else {
        const erroResp = await response.json();
        setErro(erroResp.erro || 'Erro ao criar o post');
        setMostrarMiniModal(false);
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setErro('Erro ao enviar imagem ou vídeo.');
      setMostrarMiniModal(false);
    } finally {
      setEnviando(false);
    }
  };

  // Renderização
  return (
    <>
      {/* Modal principal */}
      {modalAberto && (
        <div className="modal-overlay" onClick={onClose}>
          <div
            className={`modal-CriarPost ${etapa === 2 ? 'modal-CriarPost-etapa2' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <form className="form-criar-post" onSubmit={handleCriarPost}>
              <h2>Criar Novo Post</h2>

              {/* Etapa 1: Upload */}
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
                      <img src={imagem} alt="Pré-visualização" className="imagem-preview" />
                    </div>
                  )}

                  {videoUrl && (
                    <div className="preview-video">
                      <video controls src={videoUrl} style={{ maxWidth: '100%', borderRadius: '10px' }} />
                    </div>
                  )}

                  {(imagemArquivo || videoArquivo) && (
                    <div className="botoes-etapa1">
                      <button
                        type="button"
                        className='trocar'
                        onClick={() => {
                          setImagemArquivo(null);
                          setVideoArquivo(null);
                          setImagem('');
                          setVideoUrl('');
                        }}
                      >Trocar mídia</button>
                      <button type="button" className='proxima' onClick={() => setEtapa(2)}>Próximo</button>
                    </div>
                  )}
                </>
              )}

              {/* Etapa 2: Conteúdo */}
              {etapa === 2 && (
                <>
                  <textarea
                    placeholder="Escreva algo..."
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tags separadas por vírgula"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <div className="botoes-acoes">
                    <button className='button-confirme' type="submit" disabled={enviando}>
                      {enviando ? 'Postando...' : 'Publicar'}
                    </button>
                    <button
                    className='button-cancel'
                    type="button"
                    onClick={() => {
                      setEtapa(1);
                      onClose();
                    }}
                  >Cancelar</button>
                  </div>
                </>
              )}

              {erro && <p className="erro">{erro}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Mini Modal flutuante */}
      {mostrarMiniModal && (
        <div className="mini-modal-postando">
          {imagem && <img src={imagem} alt="Miniatura" className="miniatura-post" />}
          {videoUrl && (
            <video src={videoUrl} className="miniatura-post" muted autoPlay loop />
          )}
          <span>Postando...</span>
        </div>
      )}
    </>
  );
}

export default Criar;
