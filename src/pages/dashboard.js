import authState from '../utils/AuthState.js';
import ApiService from '../utils/api.js';
import PerfilSidebar from '../components/PerfilSidebar.js';
import NavBar from '../components/NavBar.js';
import Footer from '../components/Footer.js';
import ConfirmModal from '../components/ConfirmModal.js';
import concluirModal from "../components/ConcluirModal.js";
import { notify } from '../components/Notification.js';

export default function renderDashboardPage() {

    // ================= AUTH =================
    if (!authState.isAuth()) {
        window.location.href = '/login';
        return;
    }

    if (authState.getUserType() !== 'profissional') {
        window.location.href = '/home';
        return;
    }

    // ================= ROOT =================
    const root = document.getElementById('root');
    root.innerHTML = '';
    Object.assign(root.style, {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    });

    // NAVBAR
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    nav.appendChild(NavBar());

    // ================= LAYOUT =================
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content-wrapper';
    mainWrapper.appendChild(PerfilSidebar());

    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';
    mainWrapper.appendChild(contentArea);

    root.appendChild(mainWrapper);

    // ================= HEADER =================
    const header = document.createElement('div');
    header.className =
        'd-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4';

    header.innerHTML = `
        <div>
            <h2 class="fw-bold mb-1">Dashboard</h2>
            <p class="text-muted mb-0">Gerencie seus agendamentos</p>
        </div>
        <div class="filter-group d-flex gap-2">
            <button class="btn btn-sm btn-filter" data-filter="Agendado">Agendados</button>
            <button class="btn btn-sm btn-filter" data-filter="Concluido">Concluídos</button>
            <button class="btn btn-sm btn-filter" data-filter="Cancelado">Cancelados</button>
        </div>
    `;
    contentArea.appendChild(header);

    // ================= MODAIS =================
    let idParaCancelar = null;
    let idParaConcluir = null;

    const confirmCancelar = ConfirmModal(
        'modalCancelar',
        'Confirmar Cancelamento',
        'Deseja cancelar este agendamento?',
        () => idParaCancelar && executarCancelamento(idParaCancelar)
    );

    const confirmConcluir = concluirModal(
        'modalConcluir',
        'Confirmar Conclusão',
        'Deseja concluir este agendamento?',
        () => idParaConcluir && executarConclusao(idParaConcluir)
    );

    document.body.append(confirmCancelar, confirmConcluir);

    // ================= CONTAINERS =================
    const resumoContainer = document.createElement('div');
    resumoContainer.className = 'row g-3 mb-4';

    const agendamentosContainer = document.createElement('div');
    agendamentosContainer.innerHTML =
        `<div class="text-center p-5">
            <div class="spinner-border text-primary"></div>
        </div>`;

    contentArea.append(resumoContainer, agendamentosContainer);

    // FOOTER
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());

    // ================= ESTADO =================
    let todosAgendamentos = [];
    let filtroAtual = 'Agendado';

    // ================= UI HELPERS =================
    function criarCardResumo(titulo, valor, icone, cor = 'primary') {
        const div = document.createElement('div');
        div.className = 'col-md-3 col-sm-6';

        div.innerHTML = `
            <div class="dashboard-card h-100 p-4 d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-value">${valor}</div>
                    <div class="stat-label">${titulo}</div>
                </div>
                <div class="stat-icon-wrapper" style="color:var(--${cor}-color)">
                    <i class="bi ${icone}"></i>
                </div>
            </div>
        `;
        return div;
    }

    function criarCardAgendamento(agendamento) {

        const card = document.createElement('div');
        card.className = 'content-card mb-3 p-4';

        const dataHora = agendamento.data_hora
            ? new Date(agendamento.data_hora.replace(' ', 'T'))
            : null;

        const data = dataHora?.toLocaleDateString('pt-BR') ?? '--/--';
        const hora = dataHora?.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }) ?? '--:--';

        const status = (agendamento.status || 'Agendado').toLowerCase();

        const podeAcao = ['agendado', 'pendente', 'confirmado'].includes(status);

        card.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <h5 class="fw-bold">${agendamento.cliente_nome || 'Cliente'}</h5>
                <span class="badge-custom">${agendamento.status}</span>
            </div>

            <div class="mb-3">
                <strong>${data}</strong>
                <span class="ms-2">${hora}</span>
            </div>

            ${podeAcao ? `
            <div class="d-flex justify-content-end gap-2 border-top pt-3">
                <button class="btn btn-sm btn-success btn-concluir">Concluir</button>
                <button class="btn btn-sm btn-danger btn-cancelar">Cancelar</button>
            </div>` : ''}
        `;

        const btnCancelar = card.querySelector('.btn-cancelar');
        const btnConcluir = card.querySelector('.btn-concluir');

        if (btnCancelar)
            btnCancelar.onclick = () => {
                idParaCancelar = agendamento.id;
                new bootstrap.Modal(confirmCancelar).show();
            };

        if (btnConcluir)
            btnConcluir.onclick = () => {
                idParaConcluir = agendamento.id;
                new bootstrap.Modal(confirmConcluir).show();
            };

        return card;
    }

    // ================= API =================
    async function executarCancelamento(id) {
        try {
            await new ApiService().cancelarAgendamento(id);
            notify.success('Agendamento cancelado!');
            carregarDados();
        } catch (e) {
            notify.error(e.message);
        }
    }

    async function executarConclusao(id) {
        try {
            await new ApiService().atualizarAgendamento(id, { status: 'Concluído' });
            notify.success('Agendamento concluído!');
            carregarDados();
        } catch (e) {
            notify.error(e.message);
        }
    }

    // ================= FILTROS =================
    function aplicarFiltro(status) {
        filtroAtual = status;

        header.querySelectorAll('.btn-filter')
            .forEach(btn =>
                btn.classList.toggle(
                    'active',
                    btn.dataset.filter === status
                )
            );

        renderizarLista();
    }

    function renderizarLista() {
        agendamentosContainer.innerHTML = '';

        let lista = todosAgendamentos;

        const f = filtroAtual.toLowerCase();
        lista = lista.filter(a =>
            (a.status || '').toLowerCase().includes(f)
        );
    
        lista.sort((a, b) => {
            const dataA = a.data_hora ? new Date(a.data_hora.replace(' ', 'T')) : new Date(0);
            const dataB = b.data_hora ? new Date(b.data_hora.replace(' ', 'T')) : new Date(0);
            return dataA - dataB;
        })


        if (!lista.length) {
            agendamentosContainer.innerHTML =
                `<div class="content-card text-center p-5">
                    Nenhum agendamento ${filtroAtual.toLowerCase()} encontrado.
                </div>`;
            return;
        }

        lista.forEach(a =>
            agendamentosContainer.appendChild(criarCardAgendamento(a))
        );
    }

    // ================= CARREGAMENTO =================
    async function carregarDados() {
        try {
            const api = new ApiService();
            const user = authState.getUser();

            todosAgendamentos =
                await api.listarAgendamentos(user.profissional_id);

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const hojeCount = todosAgendamentos.filter(a => {
                if (!a.data_hora) return false;
                const d = new Date(a.data_hora.replace(' ', 'T'));
                d.setHours(0, 0, 0, 0);
                return d.getTime() === hoje.getTime();
            }).length;

            const cancelados =
                todosAgendamentos.filter(a =>
                    (a.status || '').toLowerCase().includes('cancela')
                ).length;

            const concluidos =
                todosAgendamentos.filter(a =>
                    (a.status || '').toLowerCase().includes('conclu')
                ).length;

            resumoContainer.innerHTML = '';
            resumoContainer.append(
                criarCardResumo('Cancelados', cancelados, 'bi-x-circle', 'danger'),
                criarCardResumo('Concluídos', concluidos, 'bi-check2-all', 'success'),
                criarCardResumo('Hoje', hojeCount, 'bi-calendar-date', 'accent'),
                // criarCardResumo('Total', todosAgendamentos.length, 'bi-calendar', 'primary') // Card Total de agendamentos
            );

            renderizarLista();

        } catch (e) {
            agendamentosContainer.innerHTML =
                `<div class="alert alert-danger">${e.message}</div>`;
        }
    }

    // ================= EVENTOS =================
    header.querySelectorAll('.btn-filter')
        .forEach(btn =>
            btn.onclick = () => aplicarFiltro(btn.dataset.filter)
        );

    carregarDados();
}