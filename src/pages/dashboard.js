import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";
import { notify } from "../components/Notification.js";
import { handleError } from "../utils/errorHandler.js";

// Carrega o CSS específico
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'src/css/dashboard.css';
document.head.appendChild(link);

export default function renderDashboardPage() {
    // Verifica se está autenticado
    if (!authState.isAuth()) {
        window.location.href = '/login';
        return;
    }

    // Verifica se é profissional
    const userType = authState.getUserType();
    if (userType !== 'profissional') {
        window.location.href = '/home';
        return;
    }

    const root = document.getElementById('root');
    root.innerHTML = '';
    // Limpa estilos inline antigos e usa classes
    root.style = '';
    root.className = 'dashboard-wrapper';

    // NavBar
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    nav.appendChild(NavBar());

    // Main Layout (Flex Container)
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content-wrapper';

    // Sidebar
    mainWrapper.appendChild(PerfilSidebar());

    // Content Area
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'mb-4';
    header.innerHTML = `
        <h1 class="h3 fw-bold text-dark mb-1">
            <i class="bi bi-speedometer2 me-2 text-primary"></i>Dashboard
        </h1>
        <p class="text-muted">Visão geral do seu negócio e agenda.</p>
    `;
    contentArea.appendChild(header);

    // --- Stats Row ---
    const resumoContainer = document.createElement('div');
    resumoContainer.className = 'row g-3 mb-4';
    resumoContainer.id = 'resumoCards';
    contentArea.appendChild(resumoContainer);

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

    function criarCardResumo(titulo, valor, icone, cor = 'primary') {
        // Mapeia classes Bootstrap cores para variáveis
        // Mas vamos usar o estilo limpo do CSS criado
        const card = document.createElement('div');
        card.className = 'col-md-3 col-sm-6';
        card.innerHTML = `
            <div class="dashboard-card h-100 p-4 d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-value">${valor}</div>
                    <div class="stat-label">${titulo}</div>
                </div>
                <div class="stat-icon-wrapper" style="color: var(--${cor}-color, var(--primary-color))">
                    <i class="bi ${icone}"></i>
                </div>
            </div>
        `;
        return card;
    }

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

        const nomeCliente = agendamento.cliente?.nome || agendamento.nome_cliente || 'Cliente';
        const nomeServico = agendamento.servico?.nome || agendamento.nome_servico || 'Serviço';
        const podeAcao = status === 'agendado' || status === 'pendente';

        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center gap-3">
                     <div class="stat-icon-wrapper bg-light rounded-circle" style="width: 50px; height: 50px;">
                        <span class="fw-bold fs-5">${dataFormatada.split('/')[0]}</span>
                    </div>
                    <div>
                        <h5 class="fw-bold mb-0 text-dark">${nomeCliente}</h5>
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

            ${podeAcao ? `
            <div class="d-flex justify-content-end gap-2 border-top pt-3">
                <button class="btn btn-outline-custom btn-sm btn-cancelar text-danger border-danger-subtle">
                    <i class="bi bi-x-lg me-1"></i>Cancelar
                </button>
                <button class="btn btn-primary-custom btn-sm btn-confirmar py-1 px-3">
                    <i class="bi bi-check-lg me-1"></i>Confirmar
                </button>
            </div>
            ` : ''}
        `;

        // Event Listeners
        const btnConfirmar = card.querySelector('.btn-confirmar');
        const btnCancelar = card.querySelector('.btn-cancelar');

        if (btnConfirmar) btnConfirmar.onclick = () => confirmarAgendamento(agendamento.id);
        if (btnCancelar) btnCancelar.onclick = () => {
            if (confirm('Cancelar este agendamento?')) cancelarAgendamento(agendamento.id);
        };

        return card;
    }

    // --- Lógica de Dados ---
    async function confirmarAgendamento(id) {
        try {
            const api = new ApiService();
            await api.atualizarAgendamento(id, { status: 'Confirmado' });
            notify.success('Confirmado!');
            carregarDados();
        } catch (error) {
            handleError(error, 'Dashboard');
        }
    }

    async function cancelarAgendamento(id) {
        try {
            const api = new ApiService();
            await api.cancelarAgendamento(id);
            notify.success('Cancelado!');
            carregarDados();
        } catch (error) {
            handleError(error, 'Dashboard');
        }
    }

    async function carregarDados() {
        try {
            const api = new ApiService();
            const profissionalId = authState.getUser()?.id || authState.getCadastroId();

            let profissional = null;
            try { profissional = await api.buscarProfissionalPorCadastro(profissionalId); }
            catch (e) { console.error('Busca prof', e); }

            if (!profissional || !profissional.id) {
                agendamentosContainer.innerHTML = '<div class="alert alert-warning">Perfil incompleto.</div>';
                return;
            }

            const todosAgendamentos = await api.listarAgendamentos();
            const agendamentosProfissional = Array.isArray(todosAgendamentos)
                ? todosAgendamentos.filter(a => String(a.id_profissional_fk) === String(profissional.id))
                : [];

            // Cálculos Resumo
            const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

            const hojeAgendamentos = agendamentosProfissional.filter(a => {
                if (!a.data_hora) return false;
                const d = new Date(a.data_hora); d.setHours(0, 0, 0, 0);
                return d.getTime() === hoje.getTime();
            });

            const pendentes = agendamentosProfissional.filter(a => (a.status || '').toLowerCase() === 'pendente');
            const confirmados = agendamentosProfissional.filter(a => (a.status || '').toLowerCase().includes('confir'));

            // Render Resumo
            resumoContainer.innerHTML = '';
            resumoContainer.appendChild(criarCardResumo('Total', agendamentosProfissional.length, 'bi-calendar-range', 'primary'));
            resumoContainer.appendChild(criarCardResumo('Hoje', hojeAgendamentos.length, 'bi-calendar-date', 'accent'));
            resumoContainer.appendChild(criarCardResumo('Confirmados', confirmados.length, 'bi-check-circle', 'success'));
            resumoContainer.appendChild(criarCardResumo('Pendentes', pendentes.length, 'bi-hourglass-split', 'warning'));

            // Render Lista (Próximos)
            // Filtra futuros e ordena
            const futuros = agendamentosProfissional.filter(a => {
                const d = a.data_hora ? new Date(a.data_hora) : new Date(0);
                // Inclui hoje
                return d >= hoje && (a.status || '').toLowerCase() !== 'cancelado';
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
                title.textContent = 'Próximos Agendamentos';
                agendamentosContainer.appendChild(title);

                futuros.forEach(ag => agendamentosContainer.appendChild(criarCardAgendamento(ag)));
            }

        } catch (error) {
            handleError(error, 'Dashboard Load');
        }
    }

    carregarDados();
}