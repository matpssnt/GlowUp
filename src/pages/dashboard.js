import authState from '../utils/AuthState.js';
import ApiService from '../utils/api.js';
import PerfilSidebar from '../components/PerfilSidebar.js';
import NavBar from '../components/NavBar.js';
import Footer from '../components/Footer.js';
import { notify } from '../components/Notification.js';
import Loading from '../components/Loading.js';

export default function renderDashboardPage() {
    // Verifica se está autenticado
    if (!authState.isAuth()) {
        window.location.href = '/login';
        return;
    }

    // Verifica se é profissional
    if (authState.getUserType() !== 'profissional') {
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
            <h2 class="fw-bold mb-1">Dashboard</h2>
            <p class="text-muted mb-0">Gerencie seus agendamentos</p>
        </div>
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

        // Verifica se usuário pode alterar status
        const userType = authState.getUserType();
        const podeAcao = userType === 'profissional' && (status === 'agendado' || status === 'pendente' || status === 'confirmado');

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
                ${userType === 'profissional' ? `
                    <button class="btn btn-outline-custom btn-sm btn-concluir text-success border-success-subtle">
                        <i class="bi bi-check2-all me-1"></i>Concluir
                    </button>
                ` : ''}
                <button class="btn btn-outline-custom btn-sm btn-cancelar text-danger border-danger-subtle">
                    <i class="bi bi-x-lg me-1"></i>Cancelar
                </button>
            </div>
            ` : ''}
        `;

        // Event Listeners
        const btnCancelar = card.querySelector('.btn-cancelar');
        const btnConcluir = card.querySelector('.btn-concluir');

        if (btnCancelar) btnCancelar.onclick = () => {
            if (confirm('Cancelar este agendamento?')) cancelarAgendamento(agendamento.id);
        };
        if (btnConcluir) btnConcluir.onclick = () => concluirAgendamento(agendamento.id);

        return card;
    }

    // --- Lógica de Dados ---
    async function concluirAgendamento(id) {
        try {
            const api = new ApiService();
            await api.atualizarAgendamento(id, { status: 'Concluído' });
            notify.success('Agendamento concluído!');
            carregarDados();
        } catch (error) {
            notify.error('Erro ao concluir: ' + error.message);
        }
    }

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
            const profissionalId = authState.getUser()?.id || authState.getCadastroId();

            // 1. Buscar dados do profissional
            let profissional = null;
            try {
                profissional = await api.buscarProfissionalPorCadastro(profissionalId);
            } catch (e) {
            }

            if (!profissional || !profissional.id) {
                agendamentosContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <h5>⚠️ Perfil Incompleto</h5>
                        <p>Nenhum perfil de profissional encontrado para o cadastro ID ${profissionalId}.</p>
                        <small>Verifique se você completou seu cadastro como profissional.</small>
                    </div>
                `;
                return;
            }

            // 2. Buscar todos os agendamentos
            const todosAgendamentos = await api.listarAgendamentos();

            // 3. Filtrar agendamentos do profissional - LOGICA CORRIGIDA
            const agendamentosProfissional = Array.isArray(todosAgendamentos)
                ? todosAgendamentos.filter(a => {

                    // Método 1: Usar profissional_nome (se vier do JOIN)
                    if (a.profissional_nome && profissional.nome &&
                        a.profissional_nome.toLowerCase() === profissional.nome.toLowerCase()) {
                        return true;
                    }

                    // Método 2: Usar objeto servico aninhado
                    if (a.servico && a.servico.id_profissional_fk == profissional.id) {
                        return true;
                    }

                    // Método 3: Buscar serviço por id_servico_fk (fallback)
                    if (a.id_servico_fk) {

                        // Aqui vamos buscar o serviço separadamente
                        // Por enquanto, vamos testar se o serviço pertence ao profissional
                        return false; // Temporariamente false até implementarmos a busca
                    }

                    return false;
                })
                : [];


            // 4. Cálculos das estatísticas
            const agora = new Date();
            const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);

            const hojeAgendamentos = agendamentosProfissional.filter(a => {
                if (!a.data_hora) return false;
                const d = new Date(a.data_hora);
                const dZero = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
                return dZero.getTime() === hoje.getTime();
            });

            const cancelados = agendamentosProfissional.filter(a => {
                const status = (a.status || '').toLowerCase();
                return status.includes('cancel');
            });

            const concluidos = agendamentosProfissional.filter(a => {
                const status = (a.status || '').toLowerCase();
                return status.includes('conclu') || status.includes('concluid');
            });

            // 5. Renderizar cards de resumo
            resumoContainer.innerHTML = '';
            resumoContainer.appendChild(criarCardResumo('Cancelados', cancelados.length, 'bi-x-circle', 'danger'));
            resumoContainer.appendChild(criarCardResumo('Concluídos', concluidos.length, 'bi-check2-all', 'info'));
            resumoContainer.appendChild(criarCardResumo('Hoje', hojeAgendamentos.length, 'bi-calendar-date', 'accent'));

            // 6. Renderizar lista de próximos agendamentos
            const futuros = agendamentosProfissional.filter(a => {
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
                title.textContent = 'Próximos Agendamentos';
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
