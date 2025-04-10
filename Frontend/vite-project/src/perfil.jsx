import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Perfil = ({ userId }) => {
  const [usuario, setUsuario] = useState(null);
  const [posts, setPosts] = useState([]);
  const [seguidoresInfo, setSeguidoresInfo] = useState({ seguidores: 0, seguindo: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Buscar dados do usuário
        const usuarioResponse = await axios.get(`https://localhost:7051/api/auth/usuario/${userId}`);
        setUsuario(usuarioResponse.data);

        // Buscar posts do usuário
        const postsResponse = await axios.get(`https://localhost:7051/api/Feed/posts/usuario/${userId}`);
        setPosts(postsResponse.data);

        // Buscar seguidores
        const seguidoresRes = await axios.get(`https://localhost:7051/api/Amizades/seguidores/${userId}`);
        // Buscar seguindo
        const seguindoRes = await axios.get(`https://localhost:7051/api/Amizades/seguindo/${userId}`);

        // Armazenar a contagem
        setSeguidoresInfo({
          seguidores: seguidoresRes.data.length,
          seguindo: seguindoRes.data.length
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        setLoading(false);
      }
    };

    carregarDados();
  }, [userId]);

  if (loading) return <div>Carregando perfil...</div>;
  if (!usuario) return <div>Usuário não encontrado.</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <img
          src={usuario.fotoPerfil || "https://via.placeholder.com/100"}
          alt="Foto de perfil"
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />
        <div>
          <h2>{usuario.nome}</h2>
          <p style={{ color: "#555" }}>{usuario.email}</p>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <strong>Biografia:</strong>
        <p>{usuario.biografia}</p>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "2rem" }}>
        <div><strong>Seguidores:</strong> {seguidoresInfo.seguidores}</div>
        <div><strong>Seguindo:</strong> {seguidoresInfo.seguindo}</div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Posts</h3>
        {posts.length === 0 ? (
          <p>Esse usuário ainda não postou nada.</p>
        ) : (
          posts.map((post, index) => (
            <div key={index} style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}>
              <p>{post.conteudo}</p>
              <small>{new Date(post.dataPostagem).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Perfil;
