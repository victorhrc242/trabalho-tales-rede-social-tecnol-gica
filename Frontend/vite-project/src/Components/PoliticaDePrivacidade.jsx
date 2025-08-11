import React from 'react';

const PoliticaDePrivacidade = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlays">
      <div className="modal-contents" role="dialog" aria-modal="true">
        <h2>Política de Privacidade</h2>

        <p>
          A <strong>Olicorp Innovations</strong> valoriza a sua privacidade. Esta Política de Privacidade descreve como
          coletamos, usamos e protegemos suas informações ao utilizar a rede social <strong>Paradise</strong>.
        </p>

        <h3>1. Informações Coletadas</h3>
        <p>Ao utilizar a Paradise, podemos coletar os seguintes dados:</p>
        <ul>
          <li>Informações fornecidas no cadastro (nome, e-mail, senha, etc.);</li>
          <li>Interações na plataforma (curtidas, comentários, seguidores, visualizações);</li>
          <li>Tempo de visualização e engajamento com postagens e vídeos;</li>
          <li>Dados de dispositivo e IP para segurança e personalização.</li>
        </ul>

        <h3>2. Uso das Informações</h3>
        <p>
          Os dados coletados são utilizados para:
        </p>
        <ul>
          <li>Personalizar o feed e recomendações com base nos seus interesses;</li>
          <li>Melhorar a experiência do usuário com algoritmos de inteligência artificial;</li>
          <li>Garantir a segurança da plataforma e dos usuários;</li>
          <li>Entrar em contato em caso de problemas, atualizações ou notificações importantes.</li>
        </ul>

        <h3>3. Compartilhamento de Dados</h3>
        <p>
          Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto quando exigido por lei
          ou para o funcionamento seguro da plataforma (ex: serviços de autenticação e hospedagem).
        </p>

        <h3>4. Segurança da Informação</h3>
        <p>
          Adotamos medidas técnicas e administrativas para proteger seus dados contra acesso não autorizado,
          uso indevido, alteração ou destruição.
        </p>

        <h3>5. Seus Direitos</h3>
        <p>Você pode:</p>
        <ul>
          <li>Solicitar a exclusão da sua conta e dados;</li>
          <li>Corrigir ou atualizar informações pessoais;</li>
          <li>Consultar quais dados mantemos sobre você.</li>
        </ul>

        <h3>6. Cookies e Tecnologias Semelhantes</h3>
        <p>
          Utilizamos cookies para lembrar suas preferências, analisar interações e melhorar a performance do sistema.
          Ao continuar usando a Paradise, você concorda com o uso de cookies.
        </p>

        <h3>7. Alterações nesta Política</h3>
        <p>
          Podemos atualizar esta Política de tempos em tempos. Se houver mudanças relevantes, você será notificado.
          O uso contínuo da Paradise indica sua concordância com os novos termos.
        </p>

        <p><strong>Última atualização:</strong> 25 de julho de 2025</p>

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default PoliticaDePrivacidade;
