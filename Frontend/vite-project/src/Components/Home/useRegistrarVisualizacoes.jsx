import { useEffect, useRef } from 'react';

function useRegistrarVisualizacoes(posts, usuario) {
  const visualizados = useRef(new Set());
  const visualizacaoTimers = useRef({});
  const observer = useRef(null);

  // Função fora do useEffect
  const registrarVisualizacao = async (postId) => {
    try {
      await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/post/${postId}/visualizacao?usuarioId=${usuario.id}&tempoEmSegundos=2`,
        { method: 'POST' }
      );
    } catch (err) {
      console.error('❌ Erro ao registrar visualização:', err);
    }
  };

  useEffect(() => {
    if (!usuario?.id) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.getAttribute('data-postid');

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!visualizados.current.has(postId)) {
              // Começa o temporizador
              visualizacaoTimers.current[postId] = setTimeout(() => {
                registrarVisualizacao(postId);
                visualizados.current.add(postId);
              }, 2000);
            }
          } else {
            // Saiu da tela, cancela o timer se existir
            clearTimeout(visualizacaoTimers.current[postId]);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observa os elementos no DOM
    const elementos = document.querySelectorAll('[data-postid]');
    elementos.forEach((el) => observer.current.observe(el));

    return () => {
      elementos.forEach((el) => observer.current.unobserve(el));
      observer.current.disconnect();
    };
  }, [posts, usuario?.id]);
}

export default useRegistrarVisualizacoes;
