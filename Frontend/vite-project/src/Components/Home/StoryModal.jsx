// components/StoryModal.jsx
import React, { useEffect, useRef } from "react";
import "../../css/story.css";

function StoryModal({
  grupo,
  indiceStory,
  setIndiceStory,
  fechar,
  usuarios,
  usuarioLogadoId,
}) {
  const timeoutRef = useRef(null);

  const story = grupo.stories[indiceStory];
  const usuario = usuarios[grupo.usuarioId];

  useEffect(() => {
    if (!story?.id || !usuarioLogadoId) return;

    const tempoEmSegundos = 2;

    fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/story/${story.id}/visualizacao?usuarioId=${usuarioLogadoId}&tempoEmSegundos=${tempoEmSegundos}`,
      { method: "POST" }
    ).catch((err) => console.error("Erro ao registrar visualização:", err));
  }, [story, usuarioLogadoId]);

  const proximo = () => {
    if (indiceStory < grupo.stories.length - 1) {
      setIndiceStory(indiceStory + 1);
    } else {
      fechar();
    }
  };

  const anterior = () => {
    if (indiceStory > 0) setIndiceStory(indiceStory - 1);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(proximo, 4000);
    return () => clearTimeout(timeoutRef.current);
  }, [indiceStory]);

  return (
    <>
      {/* Botão X fixo no canto superior direito da tela */}
      <button className="btn-fechar-story" onClick={fechar} aria-label="Fechar modal">
        &times;
      </button>

      <div className="modal-overlay" onClick={proximo}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                style={idx === indiceStory ? { animationDuration: "4s" } : {}}
              />
            ))}
          </div>

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
              onEnded={proximo}
            />
          )}

          <div className="nav-zona esquerda" onClick={anterior} />
          <div className="nav-zona direita" onClick={proximo} />
        </div>
      </div>
    </>
  );
}

export default StoryModal;
