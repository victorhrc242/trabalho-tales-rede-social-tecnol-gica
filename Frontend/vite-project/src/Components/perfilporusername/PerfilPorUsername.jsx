import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PerfilPorUsername = () => {
  const { username } = useParams(); // pega o "nome" da URL
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const buscarPerfil = async () => {
      try {
        const response = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/buscar-por-nome/${username}`
        );
        setPerfil(response.data);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        navigate('/'); // Redireciona se não encontrar
      } finally {
        setLoading(false);
      }
    };

    buscarPerfil();
  }, [username, navigate]);

  if (loading) return <p>Carregando perfil...</p>;

  if (!perfil) return <p>Perfil não encontrado.</p>;

  return (
    <div className="perfil-container">
      <h2>@{perfil.nome_usuario}</h2>
      <img
        src={perfil.imagem}
        alt={`Foto de perfil de ${perfil.nome}`}
        width={150}
        style={{ borderRadius: '50%' }}
      />
      <h3>{perfil.nome}</h3>
      <p>{perfil.email}</p>
      <p><strong>Biografia:</strong> {perfil.biografia}</p>
    </div>
  );
};

export default PerfilPorUsername;
