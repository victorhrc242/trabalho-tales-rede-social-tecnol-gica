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
  grupos,
  irParaProximoGrupo,
}) {

  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);
  const tempoRestanteRef = useRef(4000);
  const videoRef = useRef(null);
  const [bgColor, setBgColor] = useState("rgba(0, 0, 0, 0.8)");
  const [resposta, setResposta] = useState("");
  const [estaDigitando, setEstaDigitando] = useState(false);
  const story = grupo.stories[indiceStory];
  const usuario = usuarios[grupo.usuarioId];

  // Cor de fundo baseada na imagem
  useEffect(() => {
    if (!story) return;

    if (story.tipo !== "imagem") {
      setBgColor("rgba(0,0,0,0.8)");
      return;
    }

    const fac = new FastAverageColor();
    fac
      .getColorAsync(story.conteudoUrl)
      .then((color) => setBgColor(color.rgba))
      .catch(() => setBgColor("rgba(0,0,0,0.8)"));

    return () => fac.destroy();
  }, [story]);

  // Registrar visualização
  useEffect(() => {
    if (!story?.id || !usuarioLogadoId) return;

    fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/story/${story.id}/visualizacao?usuarioId=${usuarioLogadoId}&tempoEmSegundos=2`,
      { method: "POST" }
    ).catch((err) => console.error("Erro ao registrar visualização:", err));
  }, [story, usuarioLogadoId]);

  // Avança pro próximo story
 const proximo = () => {
  if (estaDigitando) return;
  clearTimeout(timeoutRef.current);

  if (indiceStory < grupo.stories.length - 1) {
    setIndiceStory(indiceStory + 1);
  } else {
    // Estamos no último story do grupo
    const indiceAtualDoGrupo = grupos.findIndex((g) => g.usuarioId === grupo.usuarioId);
    const proximoGrupo = grupos[indiceAtualDoGrupo + 1];

    if (proximoGrupo) {
      irParaProximoGrupo(proximoGrupo);
    } else {
      fechar(); // se não houver próximo grupo, fecha
    }
  }
};



  // Volta ao anterior
  const anterior = () => {
  clearTimeout(timeoutRef.current);

  if (indiceStory > 0) {
    setIndiceStory(indiceStory - 1);
  } else {
    // Estamos no primeiro story do grupo atual
    const indiceAtualDoGrupo = grupos.findIndex(g => g.usuarioId === grupo.usuarioId);
    const proximoGrupo = grupos[indiceAtualDoGrupo + 1]; // Agora +1 vai para o mais recente
    
    if (proximoGrupo) {
      irParaProximoGrupo(proximoGrupo);
      setIndiceStory(proximoGrupo.stories.length - 1);
    }
  }
};


  // Lógica de avanço automático controlado
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    startTimeRef.current = Date.now();
    tempoRestanteRef.current = 4000;

    if (!estaDigitando) {
      timeoutRef.current = setTimeout(proximo, tempoRestanteRef.current);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [indiceStory]);

  // Ao focar no campo, pausa o avanço
  const handleFocus = () => {
  setEstaDigitando(true);
  clearTimeout(timeoutRef.current);

  const decorrido = Date.now() - startTimeRef.current;
  tempoRestanteRef.current = Math.max(4000 - decorrido, 500);

  // ⏸️ Pausa o vídeo se estiver presente
  if (videoRef.current && !videoRef.current.paused) {
    videoRef.current.pause();
  }
};

  // Ao desfocar, retoma com o tempo restante
  const handleBlur = () => {
  setEstaDigitando(false);
  startTimeRef.current = Date.now();
  clearTimeout(timeoutRef.current);

  timeoutRef.current = setTimeout(proximo, tempoRestanteRef.current);

  // ▶️ Continua o vídeo se estiver presente
  if (videoRef.current && videoRef.current.paused) {
    videoRef.current.play().catch((err) => {
      // erro ao tentar reproduzir (ex: autoplay bloqueado)
      console.warn("Não foi possível continuar o vídeo:", err);
    });
  }
};

  // Enviar resposta
  const enviarResposta = async () => {
    if (!resposta.trim()) return;
    clearTimeout(timeoutRef.current);

    const payload = {
      idRemetente: usuarioLogadoId,
      idDestinatario: grupo.usuarioId,
      conteudo: resposta,
      storyId: story.id,
    };

    try {
      const res = await fetch(
        "https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Mensagens/enviar-com-story",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Erro ao enviar mensagem");

      setResposta("");
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
      alert("Erro ao enviar resposta do story.");
    }
  };

  return (
    <>
      <button className="btn-fechar-story" onClick={fechar} aria-label="Fechar modal">
        &times;
      </button>

      <div className="modal-overlay" onClick={proximo}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ backgroundColor: bgColor, transition: "background-color 0.5s" }}
        >
          {/* Barra de progresso */}
          <div className="progress-bar-container acima-header">
            {grupo.stories.map((_, idx) => (
              <div
  key={idx}
  className={`progress-segment ${
    idx < indiceStory
      ? "preenchido"
      : idx === indiceStory
      ? `animando ${estaDigitando ? "pausado" : ""}`
      : ""
  }`}
/>

            ))}
          </div>

          {/* Cabeçalho com usuário */}
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

          {/* Conteúdo do story */}
          {story.tipo === "imagem" ? (
            <img
              src={story.conteudoUrl}
              alt="Story"
              className="modal-story fixo"
              draggable={false}
            />
          ) : (
            <video
  ref={videoRef}
  src={story.conteudoUrl}
  className="modal-story fixo"
  autoPlay
  muted
  playsInline
  onEnded={proximo}
/>

          )}

          {/* Interação do usuário */}
          <div className="story-interacao">
            <textarea
              className="input-resposta-story"
              placeholder="Enviar uma mensagem..."
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviarResposta();
                }
              }}
            />
          </div>

          {/* Navegação por clique lateral */}
          <div className="nav-zona esquerda" onClick={anterior} />
          <div className="nav-zona direita" onClick={proximo} />
        </div>
      </div>
    </>
  );
}

export default StoryModal;
