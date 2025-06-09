import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../css/Perfil.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Comentario from '../Components/Comentario';

const Perfil = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [usuario, setUsuario] = useState(null);
  const [posts, setPosts] = useState([]);
  const [seguidoresInfo, setSeguidoresInfo] = useState({ seguidores: 0, seguindo: 0 });
  const [loading, setLoading] = useState(true);
  const [modalPost, setModalPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState('');
  const [biografia, setBiografia] = useState('');
  const [imagem, setImagem] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    if (!userId) return navigate('/');
  console.log(userId)
    const carregarDados = async () => {
      try {
        // Buscar dados do usuário
        const { data: userData } = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${userId}`
        );
      
        setUsuario(userData);
        setNome(userData.nome_usuario);
        setBiografia(userData.biografia);
        setImagem(userData.FotoPerfil);
        // Buscar posts do usuário
        const { data: postsData } = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/posts/usuario/${userId}`
        );
        setPosts(postsData);

        // Buscar seguidores e seguindo
        const seguidoresRes = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguidores/${userId}`
        );
        const seguindoRes = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${userId}`
        );

        const seguidoresTotal = seguidoresRes.data?.seguidores?.length || 0;
        const seguindoTotal = seguindoRes.data?.seguindo?.length || 0;

        setSeguidoresInfo({
          seguidores: seguidoresTotal,
          seguindo: seguindoTotal
        });
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [userId, navigate]);

  const editarPerfil = async () => {
    try {
      // Crie um objeto para o payload apenas com os campos que foram alterados
      const payload = {};

      if (nome !== usuario.nome_usuario) {
        payload.nome_usuario = nome;
      }

      if (biografia !== usuario.biografia) {
        payload.biografia = biografia;
      }

      if (imagem !== usuario.FotoPerfil) {
        payload.imagem = imagem;
      }

      // Verifique se há dados para atualizar
      if (Object.keys(payload).length === 0) {
        alert("Não há dados para atualizar.");
        return;
      }

      // Envie a requisição de atualização apenas com os campos modificados
      const response = await axios.put(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/editarusuarios/${userId}`,
        payload
      );

      // Atualiza o estado com os dados editados
      setUsuario(response.data[0]);
      setIsEditing(false); // Fecha o modo de edição
    } catch (err) {
      console.error('Erro ao editar perfil:', err);
    }
  };
// ola chat vc ira mecher aqui mas cuidado pois vc tera que buscar no endpoint que busca o id do usuario e com o id ldo usuario vc ira usalo no endpoint e ira retornar os dados do usuario e isso vai pegar o nome e com esse nome que ira pegar vc ira colocar no lugar da quele nome que esta passando qsl?
 // Função para buscar comentários de um post
const fetchComentarios = async (postId) => {
  try {
    const response = await axios.get(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${postId}?comAutor=true`
    );

    const comentariosArray = response.data?.comentarios || [];

    // Para cada comentário, buscar o nome atualizado do autor pelo ID
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
          // Caso falhe na requisição, manter o nome antigo
          return comentario;
        }
      })
    );

    setComentarios(comentariosComNomeAtualizado);
  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
  }
};


  // Abre o modal com os comentários do post
  const abrirModalPost = async (post) => {
    setModalPost(post);
    setComentarios([]);
    await fetchComentarios(post.id);
  };

  // Fecha o modal
  const fecharModalPost = () => {
    setModalPost(null);
    setComentarios([]);
  };

  // Enviar um novo comentário
  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;

    const payload = {
      postId: modalPost.id,
      autorId: usuario.id,
      conteudo: novoComentario
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

  

  if (loading) return <div className="loading">Carregando perfil...</div>;
  if (!usuario) return <div className="erro">Usuário não encontrado.</div>;

  return (
    <div className="perfil-container">
      <div className="perfil-header">
       <div
  className="foto-perfil"
  onClick={() => {
    // Força um "refresh" da rota atual
    navigate(0); // Isso recarrega a página inteira
  }}
  style={{ cursor: 'pointer' }}
>
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
        <div className="perfil-info">
          <h1>{usuario.nome_usuario}</h1>
          {usuario.id === userId && !isEditing && (
            <div className="botoes-perfil">
              <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
            </div>
          )}
          {isEditing && (
            <div className="editar-formulario">
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome"
              />
              <textarea
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                placeholder="Biografia"
              />
              <input
                type="text"
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
                placeholder="Imagem URL"
              />
              <button onClick={editarPerfil}>Salvar</button>
              <button onClick={() => setIsEditing(false)}>Cancelar</button>
            </div>
          )}
          {!isEditing && (
            <div className="infor-pessoais">
              <p><strong>Biografia:</strong> {usuario.biografia || 'Sem biografia'}</p><br/>
              <p><strong>Seguidores:</strong> {seguidoresInfo.seguidores}</p><br/>
              <p><strong>Seguindo:</strong> {seguidoresInfo.seguindo}</p>
            </div>
          )}
        </div>
      </div>

      <div className="perfil-posts">
        {posts.map((post) => (
          <div
            key={post.id}
            className="post"
            onClick={() => abrirModalPost(post)}
            style={{ cursor: 'pointer' }}
          >
            {post.imagem && <img src={post.imagem} alt="Imagem do post" />}
            <hr />
          </div>
        ))}
      </div>

     {modalPost && (
  <Comentario
    post={{
      imagem: modalPost.imagem,
      autorNome: usuario.nome_usuario
    }}
    comentarios={comentarios}
    comentarioTexto={novoComentario}
    setComentarioTexto={setNovoComentario}
    comentar={enviarComentario}
    fechar={fecharModalPost}
  />
)}
    </div>
  );
};

export default Perfil;
