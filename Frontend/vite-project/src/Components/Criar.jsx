// CriarPostModal.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  'https://vffnyarjcfuagqsgovkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg'
);

 function Criar({ usuarioLogado, onClose }) {
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagem, setImagem] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tags, setTags] = useState('');
  const [erro, setErro] = useState('');
  const [filtroSelecionado, setFiltroSelecionado] = useState('none');
  const [etapa, setEtapa] = useState(1);

  useEffect(() => {
    if (imagemArquivo) {
      const url = URL.createObjectURL(imagemArquivo);
      setImagem(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imagemArquivo]);

  const uploadImagem = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('post-usuarios')
      .upload(`posts/${fileName}`, file);

    if (error) throw error;

    return `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/post-usuarios/posts/${fileName}`;
  };

  const handleCriarPost = async (e) => {
    e.preventDefault();

    if (!imagemArquivo) {
      setErro('Selecione uma imagem para o post.');
      return;
    }

    try {
      const imagemUrl = await uploadImagem(imagemArquivo);
      const novoPost = {
        autorId: usuarioLogado.id,
        conteudo,
        imagem: imagemUrl,
        tags: tags.split(',').map((tag) => tag.trim()),
        filtro: filtroSelecionado,
      };

      const response = await fetch('https://devisocial.up.railway.app/api/Feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost),
      });

      if (response.ok) {
        setImagem('');
        setImagemArquivo(null);
        setConteudo('');
        setTags('');
        setErro('');
        setFiltroSelecionado('none');
        setEtapa(1);
        onClose(); // Fecha modal
      } else {
        const erroResp = await response.json();
        setErro(erroResp.erro || 'Erro ao criar o post');
      }
    } catch (err) {
      setErro('Erro ao enviar imagem ou conectar ao servidor.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-CriarPost ${etapa === 2 ? 'modal-CriarPost-etapa2' : ''}`} onClick={(e) => e.stopPropagation()}>
        <form className="form-criar-post" onSubmit={handleCriarPost}>
          <h2>Criar Novo Post</h2>

          {etapa === 1 && (
            <>
              {!imagemArquivo && (
                <div className="area-upload"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImagemArquivo(e.dataTransfer.files[0]);
                  }}>
                  <p>Arraste uma imagem aqui ou clique para selecionar</p>
                  <input type="file" accept="image/*" onChange={(e) => setImagemArquivo(e.target.files[0])} />
                </div>
              )}
              {imagem && (
                <div className="preview-imagem2">
                  <img src={imagem} alt="Pré-visualização" className={`imagem-preview ${filtroSelecionado}`} />
                </div>
              )}
              {imagemArquivo && (
                <button type="button" onClick={() => setEtapa(2)}>Próximo</button>
              )}
            </>
          )}

          {etapa === 2 && (
            <>
              <textarea
                placeholder="Escreva uma legenda..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tags separadas por vírgula"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <select value={filtroSelecionado} onChange={(e) => setFiltroSelecionado(e.target.value)}>
                <option value="none">Sem Filtro</option>
                <option value="grayscale">Preto e Branco</option>
                <option value="sepia">Sépia</option>
                {/* outros filtros aqui */}
              </select>
              <div className="botoes-post">
                <button type="submit">Publicar</button>
                <button type="button" onClick={() => setEtapa(1)}>Voltar</button>
              </div>
            </>
          )}
          {erro && <p className="erro">{erro}</p>}
        </form>
      </div>
    </div>
  );
}
export default Criar;