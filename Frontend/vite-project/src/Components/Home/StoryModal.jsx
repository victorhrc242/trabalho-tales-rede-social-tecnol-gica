import React, { useEffect, useRef, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import "../../css/story.css";

function StoryModal({
  grupo,          
  indiceStory,      
  setIndiceStory,    
  fechar,           
  usuarios,          
  usuarioLogadoId,   
}) {
  const timeoutRef = useRef(null); // Referência para o timeout do avanço automático do story

  const [bgColor, setBgColor] = useState("rgba(0, 0, 0, 0.8)"); // Cor de fundo dinâmica do modal
  const [resposta, setResposta] = useState(""); // Estado para controlar o texto da resposta do usuário

  // Story atual a ser exibido, com base no índice selecionado
  const story = grupo.stories[indiceStory];

  // Dados do usuário dono do story
  const usuario = usuarios[grupo.usuarioId];


  // Hook para extrair a cor dominante da imagem do story usando FastAverageColor
  useEffect(() => {
    if (!story) return;

    // Cor de Fundo para vídeos
    if (story.tipo !== "imagem") {
      setBgColor("rgba(0,0,0,0.8)");
      return;
    }

    const fac = new FastAverageColor();

    // Busca a cor dominante da imagem async e atualiza o estado da cor de fundo
    fac
      .getColorAsync(story.conteudoUrl)
      .then((color) => {
        setBgColor(color.rgba);
      })
      .catch(() => {
        // Cor padrão se tiver erro
        setBgColor("rgba(0,0,0,0.8)");
      });

    return () => fac.destroy();
  }, [story]);

  // Registra a visualização do story e manda para api
  useEffect(() => {
    if (!story?.id || !usuarioLogadoId) return;

    const tempoEmSegundos = 2; // Tempo que o usuário visualizou o story

    // Chamada POST para registrar a visualização no backend
    fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/story/${story.id}/visualizacao?usuarioId=${usuarioLogadoId}&tempoEmSegundos=${tempoEmSegundos}`,
      { method: "POST" }
    ).catch((err) => console.error("Erro ao registrar visualização:", err));
  }, [story, usuarioLogadoId]);

  // Função para avançar para o próximo story
  const proximo = () => {
    if (indiceStory < grupo.stories.length - 1) {
      setIndiceStory(indiceStory + 1);
    } else {
      fechar(); 
    }
  };

  // Função para voltar para o story anterior
  const anterior = () => {
    if (indiceStory > 0) setIndiceStory(indiceStory - 1);
  };

  // Avança automaticamente para o próximo story a cada 4 segundos
  useEffect(() => {
    timeoutRef.current = setTimeout(proximo, 4000);

  
    return () => clearTimeout(timeoutRef.current);
  }, [indiceStory]);

  // Atualiza o estado resposta conforme o usuário digita na textarea
  const handleRespostaChange = (e) => setResposta(e.target.value);

  // Envia a resposta quando usuário confirma (Enter)
  const enviarResposta = () => {
    if (!resposta.trim()) return; // Ignora respostas vazias

    // Aqui você pode enviar a resposta para a API do backend
    console.log("Resposta enviada:", resposta);

    setResposta(""); // Limpa o campo após enviar
  };

  return (
    <>
      {/* Botão para fechar o modal */}
      <button
        className="btn-fechar-story"
        onClick={fechar}
        aria-label="Fechar modal"
      >
        &times;
      </button>

      <div className="modal-overlay" onClick={proximo}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ backgroundColor: bgColor, transition: "background-color 0.5s" }}
        >
          {/* Barra de progresso dos stories */}
          <div className="progress-bar-container acima-header">
            {grupo.stories.map((_, idx) => (
              <div
                key={idx}
                className={`progress-segment ${
                  idx < indiceStory
                    ? "preenchido" 
                    : idx === indiceStory
                    ? "animando"   
                    : ""
                }`}
              />
            ))}
          </div>

          {/* Header com imagem e nome do usuário dono do story */}
          <div className="modal-header-usuario abaixo-barra">
            <img
              src={usuario?.imagem}
              alt={usuario?.nome_usuario || "Usuário"}
              className="modal-usuario-imagem"
              draggable={false}
            />
            <span className="modal-usuario-nome">
              {usuario?.nome_usuario || "Usuário"}
            </span>
          </div>

          {/* Exibe imagem ou vídeo conforme o tipo do story */}
          {story.tipo === "imagem" ? (
            <img
              src={story.conteudoUrl}
              alt="Story"
              className="modal-story fixo"
              draggable={false}
            />
          ) : (
            <video
              src={story.conteudoUrl}
              className="modal-story fixo"
              autoPlay
              muted
              playsInline
              onEnded={proximo} // Avança automático ao terminar vídeo
            />
          )}

          {/* Área de interação: textarea para o usuário enviar resposta */}
          <div className="story-interacao">
            <textarea
              className="input-resposta-story"
              placeholder="Enviar uma mensagem..."
              value={resposta}
              onChange={handleRespostaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviarResposta();
                }
              }}
            />
          </div>

          {/* Áreas invisíveis para navegação ao clicar nas laterais */}
          <div className="nav-zona esquerda" onClick={anterior} />
          <div className="nav-zona direita" onClick={proximo} />
        </div>
      </div>
    </>
  );
}

export default StoryModal;
