import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import CriarStoryModal from '../Components/Home/CriarStoryModal';
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
  const [criarStoryModal, setCriarStoryModal] = useState(false);
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
  //Sugestões de tgas
  const [sugestoesTags, setSugestoesTags] = useState([]);


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


  // sugestões de tags
  const buscarTags = async (texto) => {
  const ultimaPalavra = texto.split(',').pop().trim();
  if (ultimaPalavra.length < 1) {
    setSugestoesTags([]);
    return;
  }

  try {
    const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/tags?busca=${ultimaPalavra}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setSugestoesTags(data);
      }
    } else {
      setSugestoesTags([]);
    }
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    setSugestoesTags([]);
  }
};
useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    buscarTags(tags);
  }, 500); // 500ms debounce

  return () => clearTimeout(delayDebounceFn);
}, [tags]);
const handleCriarStory = async () => {
  if (enviando) return;
  if (!imagemArquivo && !videoArquivo) {
    setErro('Adicione uma imagem ou vídeo.');
    return;
  }

  setEnviando(true);
  setMostrarMiniModal(true);

  try {
    let conteudoUrl = '';
    let tipo = '';

    if (imagemArquivo) {
      conteudoUrl = await uploadImagem(imagemArquivo);
      tipo = 'imagem';
    } else if (videoArquivo) {
      conteudoUrl = await uploadVideo(videoArquivo);
      tipo = 'video';
    }

    const storyPayload = {
      usuarioId: usuarioLogado.id,
      conteudoUrl,
      tipo,
    };

    const response = await fetch('https://localhost:7051/api/Stories/criar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyPayload),
    });

    if (!response.ok) {
      const erroResp = await response.json();
      setErro(erroResp.erro || 'Erro ao criar story');
      return;
    }

    setImagemArquivo(null);
    setVideoArquivo(null);
    setImagem('');
    setVideoUrl('');
    setErro('');
    setTimeout(() => setMostrarMiniModal(false), 3000);
  } catch (error) {
    console.error(error);
    setErro('Erro ao criar story');
    setMostrarMiniModal(false);
  } finally {
    setEnviando(false);
  }
};


  return (
    <>
    {criarStoryModal && (
  <CriarStoryModal fecharModal={() => setCriarStoryModal(false)} />
)}
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
    {/* Botão Criar Story antes da área de upload */}
    <button
  type="button"
  className="btn-criar-story"
  onClick={() => {
    setModalAberto(false); // Fecha o modal atual
    setTimeout(() => {
      setCriarStoryModal(true); // Abre o CriarStoryModal
    }, 200); // Delay curto para garantir desmontagem
  }}
  style={{ marginBottom: '15px' }}
>
  Criar Story
</button>

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
        >
          Trocar mídia
        </button>
        <button
          type="button"
          className='proxima'
          onClick={() => setEtapa(2)}
        >
          Próximo
        </button>
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
           {/* Campo de tags com sugestões */}
              <div className="sugestoes-tags-wrapper">
                <input
                  type="text"
                  placeholder="Tags separadas por vírgula"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  onFocus={() => buscarTags(tags)}
                />

                {/* Sugestões tipo "chip" horizontal */}
            {tags && sugestoesTags.length > 0 && (
              <div className="sugestoes-chip-container">
                {sugestoesTags
                  .filter(tag => {
                    const ultima = tags.split(',').pop().trim().toLowerCase();
                    return tag.toLowerCase().startsWith(ultima);
                  })
                  .map((tag, index) => (
                    <div
                      key={index}
                      className="chip-sugestao"
                      onClick={() => {
                        const tagsArray = tags.split(',').map(t => t.trim());
                        tagsArray.pop(); // remove a palavra incompleta
                        if (!tagsArray.includes(tag)) {
                          tagsArray.push(tag);
                          setTags(tagsArray.join(', ') + ', ');
                        }
                        setSugestoesTags([]);
                      }}
                    >
                      {tag}
                    </div>
                  ))}
              </div>
            )}
              </div>

                  <div className="botoes-acoes">
                    <button className='button-confirme' type="submit" disabled={enviando}>
                      {enviando ? 'Postando...' : 'Publicar'}
                    </button>
                    <button
  onClick={handleCriarStory}
  className="botao-confirmar"
>
  Publicar como Story
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
