import authState from '../utils/AuthState.js';
import ApiService from '../utils/api.js';
import PerfilSidebar from '../components/PerfilSidebar.js';
import NavBar from '../components/NavBar.js';
import Footer from '../components/Footer.js';
import ConfirmModal from '../components/ConfirmModal.js';
import concluirModal from "../components/ConcluirModal.js";
import { notify } from '../components/Notification.js';

export default function renderDashboardPage() {

    // AUTH
    if (!authState.isAuth()) {
        window.location.href = '/login';
        return;
    }

    if (authState.getUserType() !== 'profissional') {
        window.location.href = '/home';
        return;
    }

    // ROOT
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

    // LAYOUT
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content-wrapper';
    mainWrapper.appendChild(PerfilSidebar());

    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';
    mainWrapper.appendChild(contentArea);

    root.appendChild(mainWrapper);

    // HEADER
    const header = document.createElement('div');
    header.className =
        'd-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4';

    header.innerHTML = `
        <div>
            <h2 class="fw-bold mb-1">Dashboard</h2>
            <p class="text-muted mb-0">Gerencie seus agendamentos</p>
        </div>
        <div class="filter-group d-flex gap-2 align-items-center">
            <button class="btn btn-sm btn-filter" data-filter="Agendado">Agendados</button>
            <button class="btn btn-sm btn-filter" data-filter="Concluido">Concluídos</button>
            <button class="btn btn-sm btn-filter" data-filter="Cancelado">Cancelados</button>
            <button class="btn btn-sm btn-success" id="btnAbrirFiltroData">
                Filtrar data
            </button>
        </div>
    `;
    contentArea.appendChild(header);

    // MODAIS
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

    // Modal de calendário / filtro por período
    const calendarModal = document.createElement('div');
    calendarModal.className = 'modal fade';
    calendarModal.id = 'modalCalendario';
    calendarModal.tabIndex = -1;
    calendarModal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Agendamentos por período</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3 mb-3">
                        <div class="col-12 col-md-5">
                            <label class="form-label small text-muted mb-1">Data inicial</label>
                            <input type="date" id="filtroDataInicio" class="form-control">
                        </div>
                        <div class="col-12 col-md-5">
                            <label class="form-label small text-muted mb-1">Data final</label>
                            <input type="date" id="filtroDataFim" class="form-control">
                        </div>
                        <div class="col-12 col-md-2 d-flex align-items-end gap-2">
                            <button type="button" class="btn btn-outline-secondary w-100" id="btnLimparFiltro">
                                Limpar
                            </button>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end mb-3">
                        <button type="button" class="btn btn-primary" id="btnAplicarFiltro">
                            Aplicar filtro
                        </button>
                    </div>

                    <div id="calendarResults" class="table-responsive">
                        <p class="text-muted small mb-0">
                            Selecione um intervalo de datas para visualizar os agendamentos desse período.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.append(confirmCancelar, confirmConcluir, calendarModal);

    // CONTAINERS
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

    // ESTADO
    let todosAgendamentos = [];
    let filtroAtual = 'Agendado';
    // filtro de período aplicado na lista principal (datas em Date)
    let filtroPeriodo = null;
    let modalCalendarioInstancia = null;

    // paginação
    let paginaAtual = 1;
    const itensPorPagina = 10;

    // UI HELPERS
    function criarCardResumo(titulo, valor, icone, cor = 'primary') {
        const div = document.createElement('div');
        div.className = 'col-md-3 col-sm-6';

        div.innerHTML = `
            <div class="dashboard-card h-100 p-4 d-flex justify-content-between align-items-center"
                 ${titulo === 'Hoje' ? 'data-card-hoje="true"' : ''}>
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

    // API
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

    // FILTROS
    function aplicarFiltro(status) {
        filtroAtual = status;
        paginaAtual = 1;

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

        // Filtro por status
        const f = filtroAtual.toLowerCase();
        lista = lista.filter(a =>
            (a.status || '').toLowerCase().includes(f)
        );

        // Filtro por período (se houver)
        if (filtroPeriodo && filtroPeriodo.inicio && filtroPeriodo.fim) {
            lista = lista.filter(a => {
                if (!a.data_hora) return false;
                const d = new Date(a.data_hora.replace(' ', 'T'));
                return d >= filtroPeriodo.inicio && d <= filtroPeriodo.fim;
            });
        }

        lista.sort((a, b) => {
            const dataA = a.data_hora ? new Date(a.data_hora.replace(' ', 'T')) : new Date(0);
            const dataB = b.data_hora ? new Date(b.data_hora.replace(' ', 'T')) : new Date(0);
            return dataA - dataB;
        });

        if (!lista.length) {
            let mensagem = `Nenhum agendamento ${filtroAtual.toLowerCase()} encontrado.`;
            if (filtroPeriodo && filtroPeriodo.inicio && filtroPeriodo.fim) {
                mensagem = 'Não existem agendamentos neste período com esse status.';
            }
            agendamentosContainer.innerHTML =
                `<div class="content-card text-center p-5">
                    ${mensagem}
                </div>`;
            return;
        }

        const totalItems = lista.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / itensPorPagina));
        if (paginaAtual > totalPages) paginaAtual = totalPages;

        const startIndex = (paginaAtual - 1) * itensPorPagina;
        const pageItems = lista.slice(startIndex, startIndex + itensPorPagina);

        pageItems.forEach(a =>
            agendamentosContainer.appendChild(criarCardAgendamento(a))
        );

        if (totalPages > 1) {
            agendamentosContainer.appendChild(criarPaginacao(totalPages));
        }
    }

    function criarPaginacao(totalPages) {
        const nav = document.createElement('nav');
        nav.className = 'd-flex justify-content-center mt-3 dashboard-pagination';

        const ul = document.createElement('ul');
        ul.className = 'pagination mb-0';

        const criarItem = (label, page, disabled = false, active = false) => {
            const li = document.createElement('li');
            li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'page-link';
            btn.textContent = label;
            btn.disabled = disabled;
            if (!disabled) {
                btn.onclick = () => {
                    paginaAtual = page;
                    renderizarLista();
                };
            }
            li.appendChild(btn);
            return li;
        };

        ul.appendChild(criarItem('Anterior', paginaAtual - 1, paginaAtual === 1));

        for (let i = 1; i <= totalPages; i++) {
            ul.appendChild(criarItem(String(i), i, false, i === paginaAtual));
        }

        ul.appendChild(criarItem('Próximo', paginaAtual + 1, paginaAtual === totalPages));

        nav.appendChild(ul);
        return nav;
    }

    function aplicarFiltroPeriodo(dataInicioStr, dataFimStr) {
        if (!dataInicioStr || !dataFimStr) {
            notify.warning?.('Selecione a data inicial e a data final para aplicar o filtro.') ||
                alert('Selecione a data inicial e a data final para aplicar o filtro.');
            return;
        }

        const dataInicio = new Date(`${dataInicioStr}T00:00:00`);
        const dataFim = new Date(`${dataFimStr}T23:59:59`);

        if (dataFim < dataInicio) {
            notify.warning?.('A data final não pode ser anterior à data inicial.') ||
                alert('A data final não pode ser anterior à data inicial.');
            return;
        }

        filtroPeriodo = { inicio: dataInicio, fim: dataFim };
        paginaAtual = 1;
        renderizarLista();

        if (!modalCalendarioInstancia) {
            modalCalendarioInstancia = new bootstrap.Modal(calendarModal);
        }
        modalCalendarioInstancia.hide();
    }

    // CARREGAMENTO
    async function carregarDados() {
        try {
            const api = new ApiService();
            const user = authState.getUser();

            todosAgendamentos =
                await api.listarAgendamentos(user.profissional_id);
            paginaAtual = 1;

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
            );

            renderizarLista();

        } catch (e) {
            agendamentosContainer.innerHTML =
                `<div class="alert alert-danger">${e.message}</div>`;
        }
    }

    // EVENTOS
    header.querySelectorAll('.btn-filter')
        .forEach(btn =>
            btn.onclick = () => aplicarFiltro(btn.dataset.filter)
        );

    // Eventos do modal de calendário
    const inputDataInicio = calendarModal.querySelector('#filtroDataInicio');
    const inputDataFim = calendarModal.querySelector('#filtroDataFim');
    const btnLimparFiltro = calendarModal.querySelector('#btnLimparFiltro');
    const btnAplicarFiltro = calendarModal.querySelector('#btnAplicarFiltro');

    if (btnLimparFiltro) {
        btnLimparFiltro.onclick = () => {
            if (inputDataInicio) inputDataInicio.value = '';
            if (inputDataFim) inputDataFim.value = '';
            filtroPeriodo = null;
            paginaAtual = 1;
            renderizarLista();
        };
    }

    if (btnAplicarFiltro) {
        btnAplicarFiltro.onclick = () => {
            const inicio = inputDataInicio?.value || '';
            const fim = inputDataFim?.value || '';
            aplicarFiltroPeriodo(inicio, fim);
        };
    }

    const btnAbrirFiltroData = header.querySelector('#btnAbrirFiltroData');
    if (btnAbrirFiltroData) {
        btnAbrirFiltroData.onclick = () => {
            if (!modalCalendarioInstancia) {
                modalCalendarioInstancia = new bootstrap.Modal(calendarModal);
            }
            modalCalendarioInstancia.show();
        };
    }

    carregarDados();
}