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

  // Estados do modal de visualização
  const [modalAberto, setModalAberto] = useState(false);
  const [storyAtual, setStoryAtual] = useState(null);
  const [indiceStory, setIndiceStory] = useState(0);

  // Estado para criação de novo story
  const [abrirCriar, setAbrirCriar] = useState(false);

  // Abre o CriarStoryModal
  const criarNovoStory = () => setAbrirCriar(true);

  // Callback chamado quando um story é criado com sucesso
  const handleNovoStory = () => {
    carregarStories(); // recarrega lista após criação
  };

  // Função para buscar e agrupar stories
const carregarStories = async () => {
  setCarregando(true);
  try {
    // 🔁 Novo endpoint: Stories dos usuários seguidos
    const usuarioId = usuarioLogado?.id || JSON.parse(localStorage.getItem("usuario"))?.id;
    const resStories = await fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/feed-usuarioseguindos/${usuarioId}/stories`
    );
    if (!resStories.ok) throw new Error("Erro ao buscar stories");
    const dataStories = await resStories.json();

    const agrupados = agruparPorUsuario(dataStories);

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

    setStories(agrupados);
    setUsuarios(usuariosMap);
  } catch (err) {
    console.error("Erro ao carregar stories:", err);
  } finally {
    setCarregando(false);
  }
};


  // useEffect inicial para buscar usuário logado e stories
  useEffect(() => {
    (async () => {
      // Busca dados do usuário logado
      const usuarioArmazenado = JSON.parse(localStorage.getItem("usuario"));
      if (!usuarioArmazenado?.id) {
        console.error("Usuário não encontrado no localStorage");
        setCarregando(false);
        return;
      }
      const resU = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioArmazenado.id}`
      );
      const dadosU = await resU.json();
      setUsuarioLogado(dadosU);

      // Depois, carrega os stories
      await carregarStories();
    })();
  }, []);

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

  // IDs e busca do próprio usuário
  const usuarioLogadoId = usuarioLogado?.id;
  const grupoUsuarioLogado = stories.find(
    (g) => String(g.usuarioId) === String(usuarioLogadoId)
  );

  return (
    <div className="story-wrapper">
      {carregando ? (
        // Loading state
        <div className="story-empty"><p>Carregando stories...</p></div>
      ) : (
        <div className="story-container">
          {/* Bolinha unificada do usuário logado para criar ou ver stories */}
          {usuarioLogado && (
            <div
              className="story-item"
              onClick={() => {
                // Se tiver stories, abre o modal. Se não, abre o modal de criação.
                if (grupoUsuarioLogado) {
                  abrirModal(grupoUsuarioLogado);
                } else {
                  criarNovoStory();
                }
              }}
              title={usuarioLogado.nome_usuario || "Seu story"}
              style={{ position: "relative" }} // importante para posicionar o botão +
            >
              <img
                src={usuarioLogado.imagem}
                alt={usuarioLogado.nome_usuario || "Seu story"}
                className="story-imagem"
              />
              {/* Botão de criar sempre visível */}
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
            if (String(grupo.usuarioId) === String(usuarioLogadoId)) return null;
            const usuario = usuarios[grupo.usuarioId];
            return (
              <div
                key={idx}
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

      {/* Modal de visualização */}
      {modalAberto && storyAtual && (
        <StoryModal
  grupo={storyAtual}
  indiceStory={indiceStory}
  setIndiceStory={setIndiceStory}
  fechar={fecharModal}
  usuarios={usuarios}
  usuarioLogadoId={usuarioLogadoId}
  grupos={stories} // novo
  irParaProximoGrupo={(proximoGrupo) => {
    setStoryAtual(proximoGrupo);
    setIndiceStory(0);
  }} // novo
/>

      )}

      {/* Modal de criação de novo story */}
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
