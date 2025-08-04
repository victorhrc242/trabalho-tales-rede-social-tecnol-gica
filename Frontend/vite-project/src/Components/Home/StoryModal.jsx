// components/StoryModal.jsx
import React, { useEffect, useRef } from "react";
import "../../css/story.css";

function StoryModal({ grupo, indiceStory, setIndiceStory, fechar, usuarios }) {
  const timeoutRef = useRef(null);

  const proximo = () => {
    if (indiceStory < grupo.stories.length - 1) {
      setIndiceStory(indiceStory + 1);
    } else {
      fechar();
    }
  };

  const anterior = () => {
    if (indiceStory > 0) {
      setIndiceStory(indiceStory - 1);
    }
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      proximo();
    }, 4000);

    return () => clearTimeout(timeoutRef.current);
  }, [indiceStory]);

  const story = grupo.stories[indiceStory];
  const usuario = usuarios[grupo.usuarioId];

  return (
    <div className="modal-overlay" onClick={fechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Header do usuário */}
        <div className="modal-header-usuario">
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

        {/* Barra de progresso */}
        <div className="progress-bar-container">
          {grupo.stories.map((_, idx) => (
            <div
              key={idx}
              className={`progress-segment ${
                idx < indiceStory ? "preenchido" : idx === indiceStory ? "animando" : ""
              }`}
              style={idx === indiceStory ? { animationDuration: "4s" } : {}}
            />
          ))}
        </div>

        {/* Imagem ou vídeo */}
        {story.tipo === "imagem" ? (
          <img
            src={story.conteudoUrl}
            alt="Story"
            className="modal-story"
            draggable={false}
          />
        ) : (
          <video
            src={story.conteudoUrl}
            className="modal-story"
            autoPlay
            muted
            playsInline
            onEnded={proximo}
          />
        )}

        {/* Navegação */}
        <div className="nav-zona esquerda" onClick={anterior} />
        <div className="nav-zona direita" onClick={proximo} />
      </div>
    </div>
  );
}

export default StoryModal;
