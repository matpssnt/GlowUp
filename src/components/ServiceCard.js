import AgendamentoModal from './AgendamentoModal.js';

export default function ServiceCard(servico, profissional = null) {
  const card = document.createElement("div");
  card.className = "service-card-modern";

  const preco = servico.preco ? parseFloat(servico.preco).toFixed(2).replace('.', ',') : null;
  const duracao = servico.duracao || servico.tempo_estimado || null;

  // Formata duração legível (aceita HH:MM:SS ou minutos)
  let duracaoTexto = '';
  if (duracao) {
    let horas = 0, minutos = 0;

    if (String(duracao).includes(':')) {
      const parts = String(duracao).split(':');
      horas = parseInt(parts[0]) || 0;
      minutos = parseInt(parts[1]) || 0;
    } else {
      const totalMinutos = parseInt(duracao) || 0;
      horas = Math.floor(totalMinutos / 60);
      minutos = totalMinutos % 60;
    }

    if (horas > 0) {
      duracaoTexto = minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
    } else {
      duracaoTexto = `${minutos} min`;
    }
  } else {
    duracaoTexto = ''; // Não mostra tempo se não houver duração definida
  }

  card.innerHTML = `
    <div class="service-card-img-wrapper">
      <img src="${servico.imagem || 'public/assets/images/botox.jpg'}" 
           alt="${servico.nome}" 
           class="service-card-img"
           onerror="this.src='public/assets/images/Florence-estetica.jpg'">
      <div class="service-card-img-overlay"></div>
    </div>
    <div class="service-card-content">
      <h4 class="service-card-title">${servico.nome || 'Serviço'}</h4>
      <p class="service-card-desc">${servico.descricao || 'Nenhuma descrição disponível.'}</p>
      
      <div class="service-card-details">
        ${preco ? `
          <div class="service-card-price">
            <span class="service-price-currency">R$</span>
            <span class="service-price-value">${preco}</span>
          </div>
        ` : ''}
        ${duracaoTexto ? `
          <div class="service-card-duration">
            <i class="fas fa-clock"></i> ${duracaoTexto}
          </div>
        ` : ''}
      </div>

      <button class="service-card-btn btn-agendar" data-servico-id="${servico.id || ''}">
        <i class="fas fa-calendar-check"></i> Agendar
      </button>
    </div>
  `;

  // Event listener para abrir modal
  const btnAgendar = card.querySelector('.btn-agendar');
  btnAgendar.addEventListener('click', () => {
    if (!profissional || !profissional.id) {
      const urlParams = new URLSearchParams(window.location.search);
      const profissionalId = urlParams.get('profissional');

      if (!profissionalId) {
        import('../components/Notification.js').then(({ notify }) => {
          notify.error('Erro: Profissional não identificado');
        });
        return;
      }

      profissional = { id: profissionalId };
    }

    const modal = AgendamentoModal(servico, profissional);
  });

  return card;
}
