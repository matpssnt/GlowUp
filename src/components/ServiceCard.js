import AgendamentoModal from './AgendamentoModal.js';
import authState from '../utils/AuthState.js';

export default function ServiceCard(servico, profissional = null) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.width = "18rem";

  card.innerHTML = `
    <img src="${servico.imagem || 'public/assets/images/botox.jpg'}" class="card-img-top" alt="${servico.nome}" style="height: 200px; object-fit: cover;">
    <div class="card-body">
      <h5 class="card-title">${servico.nome || 'Serviço'}</h5>
      <p class="card-text">${servico.descricao || ''}</p>
      ${servico.preco ? `<p class="text-success fw-bold mb-2">R$ ${parseFloat(servico.preco).toFixed(2).replace('.', ',')}</p>` : ''}
      <button class="btn btn-primary btn-agendar" data-servico-id="${servico.id || ''}">
        <i class="bi bi-calendar-check me-2"></i>Agendar
      </button>
    </div>
  `;

  // Event listener para abrir modal
  const btnAgendar = card.querySelector('.btn-agendar');
  btnAgendar.addEventListener('click', () => {
    // Verifica se tem profissional (necessário para agendar)
    if (!profissional || !profissional.id) {
      // Tenta buscar profissional da URL ou contexto
      const urlParams = new URLSearchParams(window.location.search);
      const profissionalId = urlParams.get('profissional');
      
      if (!profissionalId) {
        // Importa notificação dinamicamente
        import('../components/Notification.js').then(({ notify }) => {
          notify.error('Erro: Profissional não identificado');
        });
        return;
      }
      
      // Se não tiver profissional passado, precisa buscar
      // Por enquanto, usa dados básicos
      profissional = { id: profissionalId };
    }

    // Cria e mostra modal
    const modal = AgendamentoModal(servico, profissional);
    if (modal) {
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  });

  return card;
}
