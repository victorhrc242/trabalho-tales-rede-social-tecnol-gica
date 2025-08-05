// components/CriarStoryModal.jsx
import React, { useState } from "react";
import "../../css/story.css";

function CriarStoryModal({ fechar, usuarioLogadoId, onStoryCriado }) {
  const [arquivo, setArquivo] = useState(null);
  const [tipo, setTipo] = useState("imagem");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleArquivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivo(file);
      setPreview(URL.createObjectURL(file));
      if (file.type.startsWith("video/")) setTipo("video");
      else setTipo("imagem");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!arquivo) {
      setErro("Selecione uma imagem ou vídeo antes de enviar.");
      return;
    }
    setErro(null);
    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append("usuarioId", usuarioLogadoId);
      formData.append("tipo", tipo);
      formData.append("arquivo", arquivo);

      const res = await fetch(
        "https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/criar",
        { method: "POST", body: formData }
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Erro ao criar story");
      }
      const novoStory = await res.json();
      onStoryCriado(novoStory);
      fechar();
    } catch (err) {
      console.error(err);
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="create-story-overlay" onClick={fechar}>
      <div className="create-story-container" onClick={(e) => e.stopPropagation()}>
        <form className="create-story-form" onSubmit={handleSubmit}>

          <div className="create-story-header">
            <h2>Criar Novo Story</h2>
          </div>

          {/* Dropzone com preview dentro */}
          <label className="create-story-dropzone">
            {preview ? (
              tipo === "imagem" ? (
                <img src={preview} alt="Prévia" className="create-story-preview-media" />
              ) : (
                <video
                  src={preview}
                  controls
                  className="create-story-preview-media"
                />
              )
            ) : (
              <p>
                Arraste uma imagem ou vídeo aqui
                <br />
                ou clique para selecionar
              </p>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleArquivoChange}
              disabled={enviando}
            />
          </label>

          {erro && <p className="create-story-error">{erro}</p>}

          <div className="create-story-footer">
            <button
              className="create-story-submit"
              type="submit"
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CriarStoryModal;
