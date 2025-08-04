// components/StoryModal.jsx
import React, { useEffect, useRef } from "react";
import "../../css/story.css";

function StoryModal({
  grupo,
  indiceStory,
  setIndiceStory,
  fechar,
  usuarios,
  usuarioLogadoId,        // ← receba o prop
}) {
  const timeoutRef = useRef(null);

  // story atual
  const story = grupo.stories[indiceStory];
  const usuario = usuarios[grupo.usuarioId];

  // registra a visualização assim que este story entra em foco
  useEffect(() => {
    if (!story?.id || !usuarioLogadoId) return;

    // ajusta quantos segundos você quer informar
    const tempoEmSegundos = 2;

    fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/story/${story.id}/visualizacao?usuarioId=${usuarioLogadoId}&tempoEmSegundos=${tempoEmSegundos}`,
      { method: "POST" }
    ).catch((err) => console.error("Erro ao registrar visualização:", err));
  }, [story, usuarioLogadoId]);

  // função que avança ao próximo ou fecha
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

  // avanço automático
  useEffect(() => {
    timeoutRef.current = setTimeout(proximo, 4000);
    return () => clearTimeout(timeoutRef.current);
  }, [indiceStory]);

  return (
    <div className="modal-overlay" onClick={proximo}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Barra de progresso */}
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

        {/* Cabeçalho */}
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

        {/* Conteúdo */}
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

        {/* Navegação manual */}
        <div className="nav-zona esquerda" onClick={anterior} />
        <div className="nav-zona direita" onClick={proximo} />
      </div>
    </div>
  );
}

export default StoryModal;
