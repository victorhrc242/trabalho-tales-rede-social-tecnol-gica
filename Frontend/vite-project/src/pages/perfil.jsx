import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../css/Perfil.css';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Comentario from '../Components/Comentario.jsx'; // ajuste o caminho se necessário

//https://trabalho-tales-rede-social-tecnol-gica.onrender.com/swagger/index.html
const supabaseUrl = 'https://vffnyarjcfuagqsgovkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Perfil = ({ usuarioLogado }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: idDaUrl } = useParams();

  // Pega o ID do usuário logado, preferindo a prop, senão pega do localStorage
  const usuarioArmazenado = JSON.parse(localStorage.getItem('usuario'));
  const usuarioLogadoId = usuarioLogado?.id || usuarioArmazenado?.id;

  // ID do perfil que está sendo visualizado (vem da URL ou do estado da rota)
  const userId = location.state?.userId || idDaUrl;

  const [usuario, setUsuario] = useState(null);
  const [posts, setPosts] = useState([]);
  const [seguidoresInfo, setSeguidoresInfo] = useState({ seguidores: 0, seguindo: 0 });
  const [loading, setLoading] = useState(true);
  const [modalPost, setModalPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [estaSeguindo, setEstaSeguindo] = useState(false);
  const [imagemArquivo, setImagemArquivo] = useState(null);
const [showEditarModalMobile, setShowEditarModalMobile] = useState(false);
  const [nome, setNome] = useState('');
  const [biografia, setBiografia] = useState('');
  const [imagem, setImagem] = useState('');
  const inputRef = useRef();

  // Verifica se o perfil visualizado é o próprio usuário logado
  const isPerfilProprio = usuarioLogadoId && userId && usuarioLogadoId.toString() === userId.toString();

  const seguirUsuario = async () => {
    try {
      await axios.post(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/solicitar-e-aceitar-automaticamente',
        {
          usuario1: usuarioLogadoId,
          usuario2: userId,
        }
      );
      setEstaSeguindo(true);
    } catch (err) {
      console.error('Erro ao seguir usuário:', err);
      alert('Erro ao seguir usuário. Tente novamente.');
    }
  };
  
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const carregarDados = async () => {
      try {
        // Carregar dados do usuário do perfil visualizado
        const { data: userData } = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${userId}`
        );
        setUsuario(userData);
        setNome(userData.nome || '');
        setBiografia(userData.biografia || '');
        setImagem(userData.imagem || '');

        // Carregar posts do usuário
        const { data: postsData } = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/posts/usuario/${userId}`
        );
        setPosts(postsData);

        // Carregar seguidores e seguindo
        const seguidoresRes = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguidores/${userId}`
        );
        const seguindoRes = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${userId}`
        );
        setSeguidoresInfo({
          seguidores: seguidoresRes.data?.seguidores?.length || 0,
          seguindo: seguindoRes.data?.seguindo?.length || 0,
        });

        // Verificar se o usuário logado está seguindo o perfil visualizado
        if (userId && usuarioLogadoId && userId !== usuarioLogadoId) {
          try {
            const { data } = await axios.get(
              `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/segue?usuario1=${usuarioLogadoId}&usuario2=${userId}`
            );

            setEstaSeguindo(data.estaSeguindo);

            // Se não estiver seguindo, seguir automaticamente (se quiser esse comportamento)
            if (!data.estaSeguindo) {
              await axios.post(
                'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/solicitar-e-aceitar-automaticamente',
                {
                  usuario1: usuarioLogadoId,
                  usuario2: userId,
                }
              );
              setEstaSeguindo(true);
              console.log('Usuário começou a seguir automaticamente.');
            }
          } catch (err) {
            console.error('Erro ao verificar ou seguir o usuário automaticamente:', err);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [userId, navigate, usuarioLogadoId]);

  const uploadImagem = async (file) => {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('imagens-usuarios')
    .upload(`perfil/${fileName}`, file);

  if (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }

  const urlPublica = `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/imagens-usuarios/perfil/${fileName}`;
  return urlPublica;
};

  const editarPerfil = async () => {
    try {
      const payload = {};

      if (nome !== usuario.nome) payload.nome = nome;
if (biografia !== usuario.biografia) payload.biografia = biografia;
if (imagemArquivo) {
  const novaUrlImagem = await uploadImagem(imagemArquivo);
  payload.imagem = novaUrlImagem;
  setImagem(novaUrlImagem);
} else if (imagem !== usuario.imagem) {
  payload.imagem = imagem;
}

      if (Object.keys(payload).length === 0) {
        alert('Não há dados para atualizar.');
        return;
      }

      const response = await axios.put(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/editarusuarios/${userId}`,
        payload
      );

      setUsuario(response.data[0] || response.data);
      setIsEditing(false);
      setShowEditarModalMobile(false);
    } catch (err) {
      console.error('Erro ao editar perfil:', err);
      alert('Erro ao editar perfil. Verifique os dados e tente novamente.');  
    }
  };

  const fetchComentarios = async (postId) => {
    try {
      const response = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${postId}?comAutor=true`
      );

      const comentariosArray = response.data?.comentarios || [];

      const comentariosComNomeAtualizado = await Promise.all(
        comentariosArray.map(async (comentario) => {
          if (!comentario.autor?.id) return comentario;
          try {
            const userResp = await axios.get(
              `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autor.id}`
            );
            return {
              ...comentario,
              autor: {
                ...comentario.autor,
                nome: userResp.data.nome_usuario || comentario.autor.nome,
              },
            };
          } catch {
            return comentario;
          }
        })
      );

      setComentarios(comentariosComNomeAtualizado);
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
    }
  };

  const abrirModalPost = async (post) => {
    setModalPost(post);
    setComentarios([]);
    await fetchComentarios(post.id);
  };

  const fecharModalPost = () => {
    setModalPost(null);
    setComentarios([]);
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;

    const payload = {
      postId: modalPost.id,
      autorId: usuarioLogadoId,
      conteudo: novoComentario,
    };

    try {
      await axios.post(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/',
        payload
      );
      setNovoComentario('');
      inputRef.current?.focus();
      await fetchComentarios(modalPost.id);
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    }
  };

  const excluirComentario = async (comentarioId) => {
    try {
      await axios.delete(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${comentarioId}`
      );
      await fetchComentarios(modalPost.id);
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
    }
  };

  if (loading) return <div className="loading">Carregando perfil...</div>;
  if (!usuario) return <div className="erro">Usuário não encontrado.</div>;
 return (
  <div className="perfil-container">
<div className="perfil-header">
  <div className="foto-perfil-bloco">
    <div className="foto-perfil">
      <img
        src={usuario.imagem || 'https://via.placeholder.com/150'}
        alt={`Foto de perfil de ${usuario.nome_usuario}`}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
    </div>
    {/* VERSÃO MOBILE */}
    <div className="nome-e-editar nome-e-editar-mobile">
      <h1 className="nome-mobile">{usuario.nome_usuario}</h1>
      {isPerfilProprio && !isEditing && (
        <button
          className="btn-editar-perfil"
          onClick={() => setShowEditarModalMobile(true)}
        >
          Editar Perfil
        </button>
      )}
    </div>
  </div>

  {/* VERSÃO DESKTOP - movida para ao lado da imagem */}
  <div className="perfil-info-desktop">
    <div className="topo-nome-botao">
      <h1 className="nome-desktop">{usuario.nome_usuario}</h1>
      {isPerfilProprio && !isEditing && (
        <button
          className="btn-editar-perfil"
          onClick={() => setIsEditing(true)}
        >
          Editar Perfil
        </button>
      )}
    </div>
    <div className="infor-pessoais-desktop">
      <p><strong>Seguidores:</strong> {seguidoresInfo.seguidores}</p>
      <p><strong>Seguindo:</strong> {seguidoresInfo.seguindo}</p>
    </div>
  </div>

  <div className="perfil-info">
    {!isEditing && (
      <div className="infor-pessoais">
        <p><strong>Seguidores:</strong> {seguidoresInfo.seguidores}</p>
        <p><strong>Seguindo:</strong> {seguidoresInfo.seguindo}</p>
      </div>
    )}

        {isPerfilProprio ? (
  <>
    {/* MODAL DE EDIÇÃO - DESKTOP */}
    {isEditing && (
      <div className="modal-overlay" onClick={() => setIsEditing(false)}>
        <div className="modal-editar-desktop" onClick={(e) => e.stopPropagation()}>
          <div className="editar-header">
            <h2>Editar Perfil</h2>
            <button className="btn-fechar" onClick={() => setIsEditing(false)}>×</button>
          </div>
          <div className="editar-conteudo">
             <div className="editar-foto-container-desktop">
  <div className="foto-wrapper">
    <label className="editar-foto-label">
      <img
        src={usuario.imagem || 'https://via.placeholder.com/150'}
        alt={`Foto de perfil de ${usuario.nome_usuario}`}
        className="foto-perfil-preview"
      />
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file && file.type.startsWith('image/')) {
            setImagemArquivo(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagem(reader.result);
            reader.readAsDataURL(file);
          }
        }}
      />
    </label>
  </div>
  <div className="botao-wrapper">
    <button
      className="botoes-perfil"
      onClick={() => document.querySelector('.modal-editar-desktop .editar-foto-label input').click()}
    >
      Alterar foto de perfil
    </button>
  </div>
</div>
            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
            />
            <label>Biografia</label>
            <textarea
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              placeholder="Biografia"
            />
            <div className="editar-botoes">
              <button onClick={editarPerfil}>Salvar</button>
              <button className='cancelar' onClick={() => setIsEditing(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
        ) : (
          <div className="botoes-perfil">
            {estaSeguindo ? (
              <button disabled>Seguindo</button>
            ) : (
              <button onClick={seguirUsuario}>Seguir</button>
            )}
            <Link to="/mensagen">
              <button>Enviar Mensagem</button>
            </Link>
          </div>
        )}
      </div>
    </div>
    
{showEditarModalMobile && (
  <div className="modal-editar-mobile">
    <div className="editar-topo">
      <h2>Editar Perfil</h2>
      <button onClick={() => setShowEditarModalMobile(false)}>×</button>
    </div>

    <div className="editar-foto-container">
      <label className="editar-foto-label">
        <img
        src={usuario.imagem || 'https://via.placeholder.com/150'}
        alt={`Foto de perfil de ${usuario.nome_usuario}`}
        style={{
          width: '100%',
          height: '100px',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
              setImagemArquivo(file);
              const reader = new FileReader();
              reader.onloadend = () => setImagem(reader.result); // preview + enviar depois
              reader.readAsDataURL(file);
            }
          }}
        />
      </label>
      <button
        className="btn-alterar-foto"
        onClick={() => document.querySelector('.editar-foto-label input').click()}
      >
        Alterar foto de perfil
      </button>
    </div>

    <div className="editar-campos">
      <h5>Nome</h5>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome"
      />
      <h5>Biografia</h5>
      <textarea
        value={biografia}
        onChange={(e) => setBiografia(e.target.value)}
        placeholder="Biografia"
      />
    </div>
    <div className="editar-botoes">
      <button className='btn-confirmar' onClick={editarPerfil}>Salvar</button>
      <button className='btn-cancelar' onClick={() => setShowEditarModalMobile(false)}>Cancelar</button>
    </div>
  </div>
)}
      <div className="explore-grid">
        {posts.map((post) => (
          <div
            key={post.id}
            className="grid-item"
            onClick={() => abrirModalPost(post)}
            style={{ cursor: 'pointer' }}
          >
            {post.imagem && (
              <img
                src={post.imagem}
                alt="Imagem do post"
                style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
          </div>
        ))}
      </div>

    {modalPost && (
      <div className="modal-overlay" onClick={fecharModalPost}>
        <div className="modal-post-container" onClick={e => e.stopPropagation()}>
          <div className="modal-post-imagem-container">
            {modalPost.imagem && (
              <img src={modalPost.imagem} alt="Imagem do post" />
            )}
          </div>
          <div className="modal-post-conteudo">
            <div className="modal-post-header">
              <h3>{usuario.nome_usuario}</h3>
              <button className="fechar-btn" onClick={fecharModalPost}>×</button>
            </div>

            <div className="modal-post-comentarios">
              {comentarios.length === 0 && <p>Sem comentários ainda.</p>}
              {Array.isArray(comentarios) && comentarios.map((c, idx) => (
                <div key={idx} className="comentario-item">
                  <strong>{c.autor?.nome_usuario || 'Anônimo'}</strong>: {c.conteudo}
                </div>
              ))}
            </div>

            <div className="modal-comentar-box">
              <input
                ref={inputRef}
                type="text"
                value={novoComentario}
                onChange={e => setNovoComentario(e.target.value)}
                placeholder="Adicione um comentário..."
                onKeyDown={e => e.key === 'Enter' && enviarComentario()}
              />
              <button onClick={enviarComentario}>Enviar</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)};
export default Perfil;
