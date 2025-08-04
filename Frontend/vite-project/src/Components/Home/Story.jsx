import React, { useEffect, useState } from "react";
import "../../css/story.css";
import StoryModal from "./StoryModal.jsx";

function agruparPorUsuario(stories) {
  const grupos = {};
  stories.forEach((story) => {
    if (!grupos[story.usuarioId]) grupos[story.usuarioId] = [];
    grupos[story.usuarioId].push(story);
  });
  return Object.entries(grupos).map(([usuarioId, stories]) => ({ usuarioId, stories }));
}

function Story() {
  const [stories, setStories] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [storyAtual, setStoryAtual] = useState(null);
  const [indiceStory, setIndiceStory] = useState(0);

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);

      try {
        // Pega o ID do usuário do localStorage
        const usuarioArmazenado = JSON.parse(localStorage.getItem("usuario"));
        if (!usuarioArmazenado?.id) {
          console.error("Usuário não encontrado no localStorage");
          setCarregando(false);
          return;
        }
        const usuarioId = usuarioArmazenado.id;

        // Tenta pegar dados do usuário logado do localStorage (imagem em cache)
        let imagemCache = localStorage.getItem(`imagemUsuario_${usuarioId}`);

        let dadosUsuario;

        if (imagemCache) {
          // Se tem imagem no cache, cria um objeto básico para o usuário logado
          dadosUsuario = { ...usuarioArmazenado, imagem: imagemCache };
        } else {
          // Busca os dados completos do usuário logado
          const resUsuario = await fetch(`https://localhost:7051/api/auth/usuario/${usuarioId}`);
          if (!resUsuario.ok) throw new Error("Erro ao buscar dados do usuário logado");
          dadosUsuario = await resUsuario.json();

          // Salva a imagem no cache localStorage
          if (dadosUsuario.imagem) {
            localStorage.setItem(`imagemUsuario_${usuarioId}`, dadosUsuario.imagem);
          }
        }

        setUsuarioLogado(dadosUsuario);

        // Busca todos os stories
        const resStories = await fetch("https://localhost:7051/api/Stories/todos");
        if (!resStories.ok) throw new Error("Erro ao buscar stories");
        const dataStories = await resStories.json();

        // Agrupa stories por usuário
        const agrupados = agruparPorUsuario(dataStories);

        // Monta o mapa de usuários (incluindo o usuário logado)
        const usuariosMap = {};
        await Promise.all(
          agrupados.map(async (grupo) => {
            if (grupo.usuarioId === usuarioId) {
              usuariosMap[grupo.usuarioId] = dadosUsuario;
            } else if (!usuariosMap[grupo.usuarioId]) {
              const resOutroUsuario = await fetch(`https://localhost:7051/api/auth/usuario/${grupo.usuarioId}`);
              const usuarioDados = await resOutroUsuario.json();
              usuariosMap[grupo.usuarioId] = usuarioDados;
            }
          })
        );

        setStories(agrupados);
        setUsuarios(usuariosMap);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const abrirModal = (grupo) => {
    setStoryAtual(grupo);
    setIndiceStory(0);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setStoryAtual(null);
    setIndiceStory(0);
  };

  const criarNovoStory = () => {
    alert("Abrir modal ou página para criar novo story");
  };

  const usuarioLogadoId = usuarioLogado?.id;
  const grupoUsuarioLogado = stories.find(
    (g) => String(g.usuarioId) === String(usuarioLogadoId)
  );

  return (
    <div className="story-wrapper">
      {carregando ? (
        <div className="story-empty">
          <p>Carregando stories...</p>
        </div>
      ) : (
        <div className="story-container">
          {/* Bolota para criar novo story sempre visível */}
          {usuarioLogado && (
            <div className="story-item criar-story-wrapper">
              <div
                className="story-item"
                onClick={(e) => {
                  e.stopPropagation();
                  criarNovoStory();
                }}
                title="Criar novo story"
                style={{ position: "relative" }}
              >
                <img
                  src={usuarioLogado.imagem || "/caminho/para/imagem-padrao.png"}
                  alt="Criar novo story"
                  className="story-imagem story-criar"
                />
                <button
                  className="btn-criar-story-pequeno"
                  onClick={(e) => {
                    e.stopPropagation();
                    criarNovoStory();
                  }}
                  title="Criar novo story"
                >
                  +
                </button>
              </div>
              <small className="story-nome">Criar</small>
            </div>
          )}

          {/* Bolota do próprio usuário com stories */}
          {grupoUsuarioLogado && usuarioLogado && (
            <div
              className="story-item"
              onClick={() => abrirModal(grupoUsuarioLogado)}
              title={usuarioLogado.nome_usuario || "Seu story"}
            >
              <img
                src={usuarioLogado.imagem}
                alt={usuarioLogado.nome_usuario || "Seu story"}
                className="story-imagem"
              />
              <small className="story-nome">Seu story</small>
            </div>
          )}

          {/* Bolotas dos outros usuários */}
          {stories.map((grupo, index) => {
            if (String(grupo.usuarioId) === String(usuarioLogadoId)) return null;
            const usuario = usuarios[grupo.usuarioId];
            return (
              <div
                key={index}
                className="story-item"
                onClick={() => abrirModal(grupo)}
                title={usuario?.nome_usuario || "Usuário"}
              >
                <img
                  src={usuario?.imagem || grupo.stories[0].conteudoUrl}
                  alt={usuario?.nome_usuario || "Usuário"}
                  className="story-imagem"
                />
                <small className="story-nome">{usuario?.nome_usuario || "Usuário"}</small>
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && storyAtual && (
        <StoryModal
          grupo={storyAtual}
          indiceStory={indiceStory}
          setIndiceStory={setIndiceStory}
          fechar={fecharModal}
          usuarios={usuarios}
        />
      )}
    </div>
  );
}

export default Story;
