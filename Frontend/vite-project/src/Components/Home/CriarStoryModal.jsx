import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "../../css/story.css";

// Conecção com Banco
const supabase = createClient(
  'https://vffnyarjcfuagqsgovkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg'
);

// Componente principal para criar um novo Story
function CriarStoryModal({ fechar, usuarioLogadoId, onStoryCriado }) {
  // Estados que controlam o comportamento do componente
  const [arquivo, setArquivo] = useState(null);            
  const [tipo, setTipo] = useState("");                  
  const [preview, setPreview] = useState(null);          
  const [enviando, setEnviando] = useState(false);        
  const [erro, setErro] = useState(null);                  
  const [statusEnvio, setStatusEnvio] = useState("");      

  // Efeito para gerar um preview ao selecionar um novo arquivo
  useEffect(() => {
    if (!arquivo) {
      setPreview(null);  
      setTipo("");
      return;
    }

    // Cria URL de preview do arquivo selecionado
    setPreview(URL.createObjectURL(arquivo));
    setTipo(arquivo.type.startsWith("video/") ? "video" : "imagem");

    // Cleanup: remove a URL de preview da memória quando o componente desmontar ou o preview mudar
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [arquivo]);

  // Função que faz o upload do arquivo para o Supabase Storage
  const uploadArquivo = async (file) => {
    const folder = tipo === "video" ? "videos" : "posts";      
    const fileName = `${Date.now()}_${file.name}`;             
    const caminho = `${folder}/${fileName}`;                  

    // Faz o upload para o Supabase
    const { error } = await supabase.storage
      .from("post-usuarios")
      .upload(caminho, file);

    if (error) throw error; 

    // Retorna a URL pública do arquivo enviado
    return `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/post-usuarios/${caminho}`;
  };

  // Função que trata o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    // Verifica se um arquivo foi selecionado
    if (!arquivo) {
      setErro("Selecione uma imagem ou vídeo antes de enviar.");
      return;
    }

    // Limpa mensagens anteriores e inicia processo de envio
    setErro(null);
    setEnviando(true);
    setStatusEnvio("postando");

    try {
      // Faz upload do arquivo e obtém a URL pública
      const conteudoUrl = await uploadArquivo(arquivo);

      // Cria o objeto com os dados do novo story
      const storyPayload = {
        usuarioId: usuarioLogadoId,
        conteudoUrl,
        tipo,
      };

      // Faz uma requisição POST para a API do backend para salvar o story
      const res = await fetch(
        "https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/criar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storyPayload),
        }
      );

      // Se der erro na API, lança erro
      if (!res.ok) {
        const erroResp = await res.json();
        throw new Error(erroResp.erro || "Erro ao criar story");
      }

      // Se tudo deu certo, retorna o novo story criado
      const novoStory = await res.json();

      // Chama função callback para informar o story criado (se foi passada)
      if (onStoryCriado) onStoryCriado(novoStory);

      // Atualiza status de envio para sucesso
      setStatusEnvio("sucesso");

      // Limpa estado após sucesso
      setArquivo(null);
      setPreview(null);
      setTipo("");
      setErro(null);

      // Fecha o modal
      fechar();
    } catch (err) {
      // Mostra o erro na tela
      setErro(err.message);
      console.error(err);
      setStatusEnvio("");
    } finally {
      // Habilita novamente o botão
      setEnviando(false);
    }
  };

  // Renderização do componente
  return (
    <div className="create-story-overlay" onClick={fechar}>
      <div className="create-story-container" onClick={(e) => e.stopPropagation()}>
        <form className="create-story-form" onSubmit={handleSubmit}>
         
          <div className="create-story-header">
            <h2>Criar Novo Story</h2>
          </div>

          {/* Área de upload */}
          <label className="create-story-dropzone">
            {preview ? (
              tipo === "imagem" ? (
                <img src={preview} alt="Prévia" className="create-story-preview-media" />
              ) : (
                <video src={preview} controls className="create-story-preview-media" />
              )
            ) : (
              <p>
                Arraste uma imagem ou vídeo aqui
                <br />
                ou clique para selecionar
              </p>
            )}
            {/* Input de arquivo (oculto visualmente) */}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setArquivo(e.target.files[0])}
              disabled={enviando}
            />
          </label>

          {/* Mensagem de erro (se houver) */}
          {erro && <p className="create-story-error">{erro}</p>}

          {/* Rodapé com botões de ação */}
          <div className="create-story-footer">
            <button
              className="create-story-submit"
              type="submit"
              disabled={enviando || !arquivo}
            >
              {enviando ? "Enviando..." : "Publicar"}
            </button>
            <button
              type="button"
              onClick={fechar}
              disabled={enviando}
              style={{ marginLeft: "10px" }}
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Mensagem flutuante de envio */}
        {statusEnvio === "postando" && (
          <p className="create-story-status-message postando">Postando...</p>
        )}
      </div>
    </div>
  );
}

export default CriarStoryModal;
