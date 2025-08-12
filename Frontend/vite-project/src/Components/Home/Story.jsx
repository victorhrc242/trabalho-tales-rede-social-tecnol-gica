// components/Story.jsx
import React, { useEffect, useState } from "react";
import "../../css/story.css";
import StoryModal from "./StoryModal.jsx";
import CriarStoryModal from "./CriarStoryModal.jsx";

// Função que agrupa os stories por ID do usuário
function agruparPorUsuario(stories) {
  const grupos = {};
  stories.forEach((story) => {
    if (!grupos[story.usuarioId]) grupos[story.usuarioId] = [];
    grupos[story.usuarioId].push(story);
  });
  // Retorna um array de objetos com `usuarioId` e lista de `stories`
  return Object.entries(grupos).map(([usuarioId, stories]) => ({ usuarioId, stories }));
}

function Story() {
  // Estados principais
  const [stories, setStories] = useState([]);               // Stories agrupados por usuário
  const [usuarios, setUsuarios] = useState({});             // Mapa de informações dos usuários
  const [usuarioLogado, setUsuarioLogado] = useState(null); // Info do usuário logado
  const [carregando, setCarregando] = useState(true);       // Flag de carregamento
  const gruposOrdenados = [...stories].reverse();           // Inverte a ordem dos grupos

  // Estados do modal de visualização
  const [modalAberto, setModalAberto] = useState(false);
  const [storyAtual, setStoryAtual] = useState(null);
  const [indiceStory, setIndiceStory] = useState(0);

  // Estado para criação de novo story
  const [abrirCriar, setAbrirCriar] = useState(false);

  // Estado para visualizadores de cada story
  const [visualizadoresPorStory, setVisualizadoresPorStory] = useState({});

  // Abre o CriarStoryModal
  const criarNovoStory = () => setAbrirCriar(true);

  // Callback chamado quando um story é criado com sucesso
  const handleNovoStory = () => {
    carregarStories(); // recarrega lista após criação
  };

  // Função para buscar visualizadores de um story e atualizar estado
  async function buscarVisualizadores(storyId) {
    try {
      const res = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/story/${storyId}/visualizadores`
      );
      if (!res.ok) throw new Error("Erro ao buscar visualizadores");
      const data = await res.json();

      setVisualizadoresPorStory((prev) => ({
        ...prev,
        [storyId]: data, // data é array de ids dos usuários que viram o story
      }));
    } catch (err) {
      console.error("Erro ao buscar visualizadores do story:", err);
    }
  }

  // Função para buscar e agrupar stories e usuários
  const carregarStories = async () => {
    setCarregando(true);
    try {
      // ID do usuário logado (pega do estado ou localStorage)
      const usuarioId = usuarioLogado?.id || JSON.parse(localStorage.getItem("usuario"))?.id;
      if (!usuarioId) throw new Error("Usuário logado não encontrado");

      // Busca stories dos usuários seguidos
      const resStories = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/feed-usuarioseguindos/${usuarioId}/stories`
      );
      if (!resStories.ok) throw new Error("Erro ao buscar stories");
      const dataStories = await resStories.json();

      // Agrupa stories por usuário
      const agrupados = agruparPorUsuario(dataStories);

      // Busca dados dos usuários dos stories
      const usuariosMap = {};
      await Promise.all(
        agrupados.map(async (grupo) => {
          if (!usuariosMap[grupo.usuarioId]) {
            const resU = await fetch(
              `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${grupo.usuarioId}`
            );
            usuariosMap[grupo.usuarioId] = await resU.json();
          }
        })
      );

      // Atualiza estado
      setStories(agrupados);
      setUsuarios(usuariosMap);

      // **Removemos daqui as chamadas a buscarVisualizadores**

    } catch (err) {
      console.error("Erro ao carregar stories:", err);
    } finally {
      setCarregando(false);
    }
  };

  // useEffect inicial para buscar usuário logado e carregar stories
  useEffect(() => {
    (async () => {
      try {
        const usuarioArmazenado = JSON.parse(localStorage.getItem("usuario"));
        if (!usuarioArmazenado?.id) {
          console.error("Usuário não encontrado no localStorage");
          setCarregando(false);
          return;
        }
        const resU = await fetch(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioArmazenado.id}`
        );
        if (!resU.ok) throw new Error("Erro ao buscar dados do usuário logado");
        const dadosU = await resU.json();
        setUsuarioLogado(dadosU);

        // Após setar usuário, carrega stories
        await carregarStories();
      } catch (err) {
        console.error(err);
        setCarregando(false);
      }
    })();
  }, []);

  // Novo useEffect para buscar visualizadores sempre que stories mudarem
  useEffect(() => {
    if (stories.length === 0) return;

    const buscarTodosVisualizadores = async () => {
      const promises = [];
      stories.forEach((grupo) => {
        grupo.stories.forEach((story) => {
          promises.push(buscarVisualizadores(story.id));
        });
      });
      await Promise.all(promises);
    };

    buscarTodosVisualizadores();
  }, [stories]);

  // Abre o modal de visualização
  const abrirModal = (grupo) => {
    setStoryAtual(grupo);
    setIndiceStory(0);
    setModalAberto(true);
  };

  // Fecha o modal de visualização
  const fecharModal = () => {
    setModalAberto(false);
    setStoryAtual(null);
    setIndiceStory(0);
  };

  // ID do usuário logado (string lowercase para comparação segura)
  const usuarioLogadoId = usuarioLogado?.id?.toLowerCase();

  // Grupo do usuário logado
  const grupoUsuarioLogado = stories.find(
    (g) => String(g.usuarioId).toLowerCase() === usuarioLogadoId
  );

  // Só para debug no console, pode remover depois
  // console.log("VisualizadoresPorStory:", JSON.stringify(visualizadoresPorStory, null, 2));

  return (
    <div className="story-wrapper">
      {carregando ? (
        <div className="story-empty">
          <p>Carregando stories...</p>
        </div>
      ) : (
        <div className="story-container">
          {/* Bolinha do usuário logado para criar ou ver stories */}
          {usuarioLogado && (
            <div
              className="story-item"
              onClick={() => {
                if (grupoUsuarioLogado) {
                  abrirModal(grupoUsuarioLogado);
                } else {
                  criarNovoStory();
                }
              }}
              title={usuarioLogado.nome_usuario || "Seu story"}
              style={{ position: "relative" }}
            >
              <img
                src={usuarioLogado.imagem}
                alt={usuarioLogado.nome_usuario || "Seu story"}
                className="story-imagem"
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
              <small className="story-nome">{grupoUsuarioLogado ? "Seu story" : "Criar"}</small>
            </div>
          )}

          {/* Stories dos outros usuários */}
          {stories.map((grupo, idx) => {
            if (String(grupo.usuarioId).toLowerCase() === usuarioLogadoId) return null;
            const usuario = usuarios[grupo.usuarioId];

            // Verifica se o usuário logado já viu TODOS os stories do grupo
            const todosVistos = grupo.stories.every((story) => {
              const vistos = visualizadoresPorStory[story.id] || [];
              return vistos.some((v) => v.toLowerCase() === usuarioLogadoId);
            });

            return (
              <div
                key={idx}
                className={`story-item ${todosVistos ? "story-visto" : ""}`}
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

      {/* Modal de visualização */}
      {modalAberto && storyAtual && (
        <StoryModal
          grupo={storyAtual}
          indiceStory={indiceStory}
          setIndiceStory={setIndiceStory}
          fechar={fecharModal}
          usuarios={usuarios}
          usuarioLogadoId={usuarioLogadoId}
          grupos={gruposOrdenados}
          irParaProximoGrupo={(proximoGrupo) => {
            setStoryAtual(proximoGrupo);
            setIndiceStory(0);
          }}
        />
      )}

      {/* Modal de criação */}
      {abrirCriar && usuarioLogadoId && (
        <CriarStoryModal
          fechar={() => setAbrirCriar(false)}
          usuarioLogadoId={usuarioLogadoId}
          onStoryCriado={handleNovoStory}
        />
      )}
    </div>
  );
}

export default Story;
