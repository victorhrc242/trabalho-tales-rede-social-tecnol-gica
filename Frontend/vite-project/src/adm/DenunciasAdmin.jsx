import React, { useEffect, useState } from 'react';

function DenunciasAdmin() {
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(localStorage.getItem('adminLogado') === 'true');
  const [senha, setSenha] = useState('');

  const senhaCorreta = '40028922ligueagoraeganhejaenãodeixeparadepois'; // 🔒 Altere isso para algo mais seguro depois

  const fazerLogin = () => {
    if (senha === senhaCorreta) {
      localStorage.setItem('adminLogado', 'true');
      setLogado(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  const sair = () => {
    localStorage.removeItem('adminLogado');
    setLogado(false);
    setDenuncias([]);
  };

  useEffect(() => {
    if (!logado) return;

    fetch('https://localhost:7051/api/denuncias/listar-denuncias')
      .then(res => res.json())
      .then(data => {
        setDenuncias(data);
        setCarregando(false);
      })
      .catch(error => {
        console.error("Erro ao buscar denúncias:", error);
        setCarregando(false);
      });
  }, [logado]);

  const deletarDenuncia = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar esta denúncia?")) return;

    try {
      const res = await fetch(`https://localhost:7051/api/denuncias/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.mensagem);
        setDenuncias(prev => prev.filter(d => d.id !== id));
      } else {
        alert(data.erro || "Erro ao deletar denúncia.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Falha na conexão com o servidor.");
    }
  };

  if (!logado) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Login do Administrador</h2>
        <input
          type="password"
          placeholder="Digite a senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={fazerLogin}>Entrar</button>
      </div>
    );
  }

  if (carregando) return <p>Carregando denúncias...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Painel de Denúncias</h2>
      <button onClick={sair} style={{ float: 'right', marginBottom: '10px' }}>
        Sair
      </button>

      {denuncias.length === 0 ? (
        <p>Nenhuma denúncia registrada.</p>
      ) : (
        denuncias.map((denuncia) => (
          <div key={denuncia.id} style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px'
          }}>
            <p><strong>Post:</strong> {denuncia.postId}</p>
            <p><strong>Usuário:</strong> {denuncia.usuarioId}</p>
            <p><strong>Descrição:</strong> {denuncia.descricao}</p>
            <p><strong>Data:</strong> {new Date(denuncia.dataDenuncia).toLocaleString()}</p>
            <button onClick={() => deletarDenuncia(denuncia.id)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '8px', cursor: 'pointer' }}>
              Deletar Denúncia
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default DenunciasAdmin;
