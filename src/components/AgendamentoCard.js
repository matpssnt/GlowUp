export default function AgendamentoCard(agendamento) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    // Formata data/hora
    const dataHora = agendamento.data_hora ? new Date(agendamento.data_hora) : null;
    const dataFormatada = dataHora && !isNaN(dataHora.getTime()) 
        ? dataHora.toLocaleDateString('pt-BR') 
        : 'Data não informada';
    const horaFormatada = dataHora && !isNaN(dataHora.getTime())
        ? dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : 'Hora não informada';
    
    // Status badge
    const status = (agendamento.status || 'agendado').toLowerCase();
    const badgeClass = status === 'cancelado' ? 'bg-danger' 
        : (status.includes('conclu')) ? 'bg-success' 
        : (status === 'pendente') ? 'bg-warning' 
        : 'bg-primary';
    const statusBadge = `<span class="badge ${badgeClass}">${agendamento.status || 'Agendado'}</span>`;
    
    // Nome e descrição do serviço
    const nomeServico = agendamento.servico?.nome || agendamento.nome_servico || 'Serviço';
    const descricaoServico = agendamento.servico?.descricao || agendamento.descricao_servico || '';
    const podeCancelar = status === 'agendado' || status === 'pendente';
    const agendamentoId = agendamento.id || agendamento.idAgendamento;
    
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0">${nomeServico}</h5>
                ${statusBadge}
            </div>
            <p class="card-text mb-2">
                <i class="bi bi-calendar-event me-2"></i>
                <strong>Data:</strong> ${dataFormatada}
            </p>
            <p class="card-text mb-2">
                <i class="bi bi-clock me-2"></i>
                <strong>Hora:</strong> ${horaFormatada}
            </p>
            ${descricaoServico ? `<p class="card-text text-muted">${descricaoServico}</p>` : ''}
            ${podeCancelar ? `
                <button class="btn btn-outline-danger btn-sm mt-2" data-agendamento-id="${agendamentoId}">
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                </button>
            ` : ''}
        </div>
    `;
    
    // Evento de cancelar
    const btnCancelar = card.querySelector('button[data-agendamento-id]');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            /* Usa confirm nativo para confirmação rápida
            (pode ser substituído por modal customizado no futuro)*/
            if (confirm('Deseja realmente cancelar este agendamento?')) {
                btnCancelar.dispatchEvent(new CustomEvent('cancelarAgendamento', {
                    detail: { id: agendamentoId },
                    bubbles: true
                }));
            }
        });
    }
    
    return card;
}

