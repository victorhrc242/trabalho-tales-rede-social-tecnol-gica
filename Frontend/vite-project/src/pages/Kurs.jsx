import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FeedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarVideos = async () => {
      try {
        const response = await axios.get('http://localhost:5124/api/Feed/Videos');
        setVideos(response.data);
      } catch (err) {
        console.error('Erro ao carregar vídeos:', err);
        setErro('Erro ao carregar vídeos');
      } finally {
        setCarregando(false);
      }
    };

    carregarVideos();
  }, []);

  if (carregando) return <p>Carregando vídeos...</p>;
  if (erro) return <p>{erro}</p>;
  if (videos.length === 0) return <p>Nenhum vídeo encontrado.</p>;

  return (
    <div>
      <h2>Feed de Vídeos</h2>
      {videos.map(video => (
        <div key={video.id} style={{ marginBottom: '30px' }}>
          <h4>{video.nomeAutor}</h4>
          <p>{video.conteudo}</p>
          <video
            width="480"
            controls
            src={video.video}
            style={{ display: 'block', marginTop: '10px' }}
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
          <p><strong>Tags:</strong> {video.tags?.join(', ')}</p>
          <p><strong>Curtidas:</strong> {video.curtidas} | <strong>Comentários:</strong> {video.comentarios}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default FeedVideos;
