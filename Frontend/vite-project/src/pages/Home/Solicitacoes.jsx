import React, { useEffect } from "react";

function Solicitacoes({ usuarioId, solicitacoes, setSolicitacoes, irParaPerfil }) {

  async function fetchSolicitacoes() {
    try {
      const response = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/pendentes/${usuarioId}`
      );
      const data = await response.json();

      if (data?.sucesso && Array.isArray(data.pendentes)) {
        const solicitacoesComRemetente = await Promise.all(
          data.pendentes.map(async s => {
            try {
              const resp = await fetch(
                `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${s.usuarioRemetenteId}`
              );
              const remetente = await resp.json();

              return {
                solicitacaoId: s.solicitacaoId, // necessário para aceitar/recusar
                usuarioId: s.usuarioRemetenteId,
                nome: remetente.nome || remetente.nome_usuario,
                nome_usuario: remetente.nome_usuario,
                imagem: remetente.imagem || 'https://via.placeholder.com/40',
              };
            } catch {
              return {
                solicitacaoId: s.solicitacaoId,
                usuarioId: s.usuarioRemetenteId,
                nome: 'Desconhecido',
                imagem: 'https://via.placeholder.com/40',
              };
            }
          })
        );

        setSolicitacoes(solicitacoesComRemetente);
      }
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err);
    }
  }

  async function aceitarSolicitacao(solicitacaoId) {
    try {
      const res = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/aceitar/${solicitacaoId}`,
        { method: 'PUT' }
      );
      if (res.ok) {
        setSolicitacoes(prev => prev.filter(s => s.solicitacaoId !== solicitacaoId));
      } else {
        const erro = await res.json();
        console.error('Erro ao aceitar:', erro.erro);
      }
    } catch (err) {
      console.error('Erro ao aceitar solicitação:', err);
    }
  }

  async function recusarSolicitacao(solicitacaoId) {
    try {
      const res = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/recusar/${solicitacaoId}`,
        { method: 'PUT' }
      );
      if (res.ok) {
        setSolicitacoes(prev => prev.filter(s => s.solicitacaoId !== solicitacaoId));
      } else {
        const erro = await res.json();
        console.error('Erro ao recusar:', erro.erro);
      }
    } catch (err) {
      console.error('Erro ao recusar solicitação:', err);
    }
  }

  useEffect(() => {
    if (usuarioId) {
      fetchSolicitacoes();
    }
  }, [usuarioId]);

  return (
    <div className="solicitacao-box">
      <h4>Solicitações</h4>
      <ul className="lista-solicitacoes">
        {solicitacoes.length === 0 ? (
          <li>Não há solicitações</li>
        ) : (
          solicitacoes.map(s => (
            <li key={s.solicitacaoId} className="solicitacao-item">
              <img
                src={s.imagem}
                alt="avatar"
                className="avatar-busca"
                onClick={() => irParaPerfil(s.usuarioId)}
              />
              <div className="info-notificacao">
                <p>
                  <strong onClick={() => irParaPerfil(s.usuarioId)} style={{ cursor: 'pointer' }}>
                    {s.nome_usuario || s.nome}
                  </strong>{' '}
                  quer te seguir.
                </p>
                <div className="botoes-solicitacao">
                  <button onClick={() => aceitarSolicitacao(s.solicitacaoId)}>Aceitar</button>
                  <button onClick={() => recusarSolicitacao(s.solicitacaoId)}>Recusar</button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Solicitacoes;
