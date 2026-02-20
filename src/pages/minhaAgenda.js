import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";
import { notify } from "../components/Notification.js";

export default function renderMinhaAgendaPage() {
    // Verifica se está autenticado
    if (!authState.isAuth()) {
        window.location.href = '/login';
        return;
    }

    // Verifica se é cliente
    const userType = authState.getUserType();
    if (userType !== 'cliente') {
        window.location.href = '/home';
        return;
    }

    const root = document.getElementById('root');
    root.innerHTML = '';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.minHeight = '100vh';
    root.style.width = '100%';
    root.style.boxSizing = 'border-box';
    root.style.backgroundColor = '#f5f5f5';

    // NavBar
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    const navbar = NavBar();
    nav.appendChild(navbar);

    // Main Wrapper
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content-wrapper';

    // Sidebar
    const sidebar = PerfilSidebar();
    mainWrapper.appendChild(sidebar);

    // Content Area
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-4';
    header.innerHTML = `
        <div>
            <h2 class="fw-bold mb-1">Minha Agenda</h2>
            <p class="text-muted mb-0">Acompanhe seus agendamentos</p>
        </div>
    `;
    contentArea.appendChild(header);

    // --- Agendamentos Section ---
    const agendamentosContainer = document.createElement('div');
    agendamentosContainer.id = 'agendamentosContainer';
    // Conteúdo inicial de loading
    agendamentosContainer.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"></div></div>';

    contentArea.appendChild(agendamentosContainer);

    // Monta Layout Final
    mainWrapper.appendChild(contentArea);
    root.appendChild(mainWrapper);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());

    // --- Helpers de Renderização ---

    function criarCardAgendamento(agendamento) {
        const card = document.createElement('div');
        card.className = 'content-card mb-3 p-4';

        const dataHora = agendamento.data_hora ? new Date(agendamento.data_hora) : null;
        const dataFormatada = dataHora && !isNaN(dataHora.getTime())
            ? dataHora.toLocaleDateString('pt-BR')
            : '--/--';
        const horaFormatada = dataHora && !isNaN(dataHora.getTime())
            ? dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : '--:--';

        const status = (agendamento.status || 'agendado').toLowerCase();
        let badgeClass = 'badge-primary';
        if (status === 'cancelado') badgeClass = 'badge-danger';
        if (status.includes('conclui')) badgeClass = 'badge-success';
        if (status === 'pendente') badgeClass = 'badge-warning';

        const nomeProfissional = agendamento.profissional_nome || 'Profissional';
        const nomeServico = agendamento.servico_nome || 'Serviço';

        // Cliente só pode cancelar agendamentos não finalizados
        const podeCancelar = status === 'agendado' || status === 'pendente' || status === 'confirmado';

        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center gap-3">
                     <div class="stat-icon-wrapper bg-light rounded-circle" style="width: 50px; height: 50px;">
                        <span class="fw-bold fs-5">${dataFormatada.split('/')[0]}</span>
                    </div>
                    <div>
                        <h5 class="fw-bold mb-0 text-dark">${nomeProfissional}</h5>
                        <div class="text-muted small"><i class="bi bi-scissors me-1"></i>${nomeServico}</div>
                    </div>
                </div>
                <span class="badge-custom ${badgeClass}">${status}</span>
            </div>
            
            <div class="row g-2 mb-3 ps-sm-5 ms-sm-2">
                <div class="col-auto me-4">
                    <small class="text-muted d-block text-uppercase" style="font-size:0.7rem">Data</small>
                    <span class="fw-medium text-dark">${dataFormatada}</span>
                </div>
                <div class="col-auto">
                    <small class="text-muted d-block text-uppercase" style="font-size:0.7rem">Horário</small>
                    <span class="fw-medium text-dark">${horaFormatada}</span>
                </div>
                 ${agendamento.observacoes ? `
                <div class="col-12 mt-2">
                     <small class="text-muted d-block text-uppercase" style="font-size:0.7rem">Observação</small>
                     <span class="text-dark small">${agendamento.observacoes}</span>
                </div>` : ''}
            </div>

            ${podeCancelar ? `
            <div class="d-flex justify-content-end gap-2 border-top pt-3">
                <button class="btn btn-outline-custom btn-sm btn-cancelar text-danger border-danger-subtle">
                    <i class="bi bi-x-lg me-1"></i>Cancelar
                </button>
            </div>
            ` : ''}
        `;

        // Event Listeners
        const btnCancelar = card.querySelector('.btn-cancelar');

        if (btnCancelar) btnCancelar.onclick = () => {
            if (confirm('Cancelar este agendamento?')) cancelarAgendamento(agendamento.id);
        };

        return card;
    }

    // --- Lógica de Dados ---
    async function cancelarAgendamento(id) {
        try {
            const api = new ApiService();
            await api.cancelarAgendamento(id);
            notify.success('Agendamento cancelado!');
            carregarDados();
        } catch (error) {
            notify.error('Erro ao cancelar: ' + error.message);
        }
    }

    async function carregarDados() {
        try {
            const api = new ApiService();
            const user = authState.getUser();
            const clienteId = user?.clienteId || authState.getCadastroId();

            // 1. Buscar todos os agendamentos
            const todosAgendamentos = await api.listarAgendamentos();

            // 2. Filtrar agendamentos do cliente
            const agendamentosCliente = Array.isArray(todosAgendamentos)
                ? todosAgendamentos.filter(a => {
                    // Filtra por ID do cliente (FK correta)
                    return a.id_cliente_fk == clienteId || a.id_cliente == clienteId;
                })
                : [];

            // 3. Renderizar lista de próximos agendamentos
            const agora = new Date();
            const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);

            const futuros = agendamentosCliente.filter(a => {
                if (!a.data_hora) return false;
                const d = new Date(a.data_hora);
                const status = (a.status || '').toLowerCase();
                return d >= hoje && status !== 'cancelado';
            }).sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

            agendamentosContainer.innerHTML = '';
            if (futuros.length === 0) {
                agendamentosContainer.innerHTML = `
                    <div class="content-card text-center p-5">
                        <i class="bi bi-calendar-x text-muted mb-3" style="font-size: 2rem"></i>
                        <p class="text-muted">Nenhum agendamento futuro encontrado.</p>
                    </div>`;
            } else {
                const title = document.createElement('h5');
                title.className = 'mb-3 fw-bold text-dark';
                title.textContent = 'Meus Agendamentos';
                agendamentosContainer.appendChild(title);

                futuros.forEach((ag, index) => {
                    agendamentosContainer.appendChild(criarCardAgendamento(ag));
                });
            }

        } catch (error) {
            agendamentosContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h5>❌ Erro ao carregar dados</h5>
                    <p>${error.message}</p>
                    <small>Verifique o console para mais detalhes.</small>
                </div>
            `;
        }
    }

    carregarDados();
}

