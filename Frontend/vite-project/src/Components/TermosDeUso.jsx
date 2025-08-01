import React from 'react';

const TermosDeUso = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true">
        <h2>Termos de Uso</h2>
        <p>
          Bem-vindo à <strong>Paradise</strong>, uma rede social inteligente oferecida pela <strong>Olicorp Innovations</strong>.
          Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma, você concorda com os termos abaixo.
        </p>

        <h3>1. Cadastro e Conta</h3>
        <p>
          Para usar a Paradise, você deve fornecer informações verdadeiras no momento do cadastro. Cada usuário é responsável
          por manter a segurança da sua conta. Não é permitido criar perfis falsos, duplicados ou de terceiros sem autorização.
        </p>

        <h3>2. Uso da Plataforma</h3>
        <p>
          A Paradise é uma rede social que recomenda conteúdos com base em interações como curtidas, comentários,
          seguidores e tempo de visualização. Esperamos que os usuários utilizem a plataforma de forma ética, respeitosa e legal.
          Conteúdos ofensivos, discriminatórios ou que infrinjam direitos de terceiros serão removidos e podem gerar suspensão.
        </p>

        <h3>3. Dados e Recomendação por Inteligência Artificial</h3>
        <p>
          Para oferecer uma experiência personalizada, a Paradise utiliza algoritmos de aprendizado de máquina (IA) que analisam
          seu comportamento dentro da rede — como tempo de visualização de posts, cliques, curtidas, seguidores em comum e hashtags.
          Esses dados são usados exclusivamente para melhorar seu feed e as recomendações de conteúdo.
        </p>

        <h3>4. Direitos Autorais</h3>
        <p>
          Você mantém a propriedade sobre o conteúdo que publica (textos, imagens, vídeos), mas nos concede uma licença não exclusiva
          para exibir, armazenar e compartilhar esse conteúdo dentro da Paradise, conforme as funcionalidades da plataforma.
        </p>

        <h3>5. Suspensão ou Encerramento</h3>
        <p>
          A Olicorp Innovations pode suspender ou remover contas que violem estes Termos de Uso, bem como conteúdos que infrinjam
          leis ou políticas da plataforma, sem aviso prévio.
        </p>

        <h3>6. Atualizações dos Termos</h3>
        <p>
          Este documento pode ser atualizado periodicamente. Recomendamos que você revise os termos regularmente. O uso contínuo
          da plataforma após mudanças significativas implica sua aceitação.
        </p>

        <p><strong>Última atualização:</strong> 25 de julho de 2025</p>

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default TermosDeUso;
