import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";
import { notify } from "../components/Notification.js";
import { handleError } from "../utils/errorHandler.js";

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

    // Container principal com sidebar e conteúdo
    const mainContainer = document.createElement('div');
    mainContainer.className = 'd-flex';
    mainContainer.style.minHeight = 'calc(100vh - 200px)';
    mainContainer.style.padding = '20px';
    mainContainer.style.gap = '20px';

    // Sidebar
    const sidebar = PerfilSidebar();

    // Container de conteúdo
    const contentContainer = document.createElement('div');
    contentContainer.className = 'flex-grow-1 dashboard-container';
    contentContainer.style.flex = '1';

    // Título
    const titulo = document.createElement('h1');
    titulo.className = 'mb-4';
    titulo.innerHTML = '<i class="bi bi-speedometer2 me-2"></i>Dashboard';

    // Container para cards de resumo
    const resumoContainer = document.createElement('div');
    resumoContainer.className = 'row g-3 mb-4';
    resumoContainer.id = 'resumoCards';

    // Container para agendamentos
    const agendamentosContainer = document.createElement('div');
    agendamentosContainer.id = 'agendamentosContainer';

    // Monta estrutura
    contentContainer.appendChild(titulo);
    contentContainer.appendChild(resumoContainer);
    contentContainer.appendChild(agendamentosContainer);

    // Monta layout
    mainContainer.appendChild(sidebar);
    mainContainer.appendChild(contentContainer);
    root.appendChild(mainContainer);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = 'auto';
    const footer = Footer();
    footerContainer.appendChild(footer);

    // Função para criar card de resumo
    function criarCardResumo(titulo, valor, icone, cor = 'primary') {
        const card = document.createElement('div');
        card.className = 'col-md-3 col-sm-6';
        card.innerHTML = `
            <div class="card border-0 shadow-sm h-100 dashboard-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-muted mb-2">${titulo}</h6>
                            <h3 class="mb-0">${valor}</h3>
                        </div>
                        <div class="bg-${cor} bg-opacity-10 rounded-circle p-3">
                            <i class="bi ${icone} text-${cor}" style="font-size: 2rem;"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    // Função para criar card de agendamento
    function criarCardAgendamento(agendamento) {
        const card = document.createElement('div');
        card.className = 'card mb-3 shadow-sm agendamento-card';
        
        const dataHora = agendamento.data_hora ? new Date(agendamento.data_hora) : null;
        const dataFormatada = dataHora && !isNaN(dataHora.getTime()) 
            ? dataHora.toLocaleDateString('pt-BR') 
            : 'Data não informada';
        const horaFormatada = dataHora && !isNaN(dataHora.getTime())
            ? dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : 'Hora não informada';

        const status = (agendamento.status || 'agendado').toLowerCase();
        const badgeClass = status === 'cancelado' ? 'bg-danger' 
            : (status.includes('conclu')) ? 'bg-success' 
            : (status === 'pendente') ? 'bg-warning' 
            : 'bg-primary';

        const nomeCliente = agendamento.cliente?.nome || agendamento.nome_cliente || 'Cliente';
        const nomeServico = agendamento.servico?.nome || agendamento.nome_servico || 'Serviço';
        const podeAcao = status === 'agendado' || status === 'pendente';

        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="card-title mb-1">
                            <i class="bi bi-person me-2"></i>${nomeCliente}
                        </h5>
                        <p class="text-muted mb-0">
                            <i class="bi bi-scissors me-2"></i>${nomeServico}
                        </p>
                    </div>
                    <span class="badge ${badgeClass}">${agendamento.status || 'Agendado'}</span>
                </div>
                <div class="row mt-3">
                    <div class="col-md-6">
                        <p class="mb-1">
                            <i class="bi bi-calendar-event me-2"></i>
                            <strong>Data:</strong> ${dataFormatada}
                        </p>
                        <p class="mb-0">
                            <i class="bi bi-clock me-2"></i>
                            <strong>Hora:</strong> ${horaFormatada}
                        </p>
                    </div>
                    ${agendamento.observacoes ? `
                        <div class="col-md-6">
                            <p class="mb-0">
                                <i class="bi bi-chat-left-text me-2"></i>
                                <strong>Obs:</strong> ${agendamento.observacoes}
                            </p>
                        </div>
                    ` : ''}
                </div>
                ${podeAcao ? `
                    <div class="mt-3 d-flex gap-2">
                        <button class="btn btn-success btn-sm btn-confirmar" data-id="${agendamento.id}">
                            <i class="bi bi-check-circle me-1"></i>Confirmar
                        </button>
                        <button class="btn btn-outline-danger btn-sm btn-cancelar" data-id="${agendamento.id}">
                            <i class="bi bi-x-circle me-1"></i>Cancelar
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        // Event listeners
        const btnConfirmar = card.querySelector('.btn-confirmar');
        const btnCancelar = card.querySelector('.btn-cancelar');

        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', () => {
                confirmarAgendamento(agendamento.id);
            });
        }

        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                if (confirm('Deseja realmente cancelar este agendamento?')) {
                    cancelarAgendamento(agendamento.id);
                }
            });
        }

        return card;
    }

    // Função para confirmar agendamento
    async function confirmarAgendamento(id) {
        try {
            const api = new ApiService();
            await api.atualizarAgendamento(id, { status: 'Confirmado' });
            notify.success('Agendamento confirmado com sucesso!');
            carregarDados();
        } catch (error) {
            handleError(error, 'Dashboard - confirmarAgendamento');
        }
    }

    // Função para cancelar agendamento
    async function cancelarAgendamento(id) {
        try {
            const api = new ApiService();
            await api.cancelarAgendamento(id);
            notify.success('Agendamento cancelado com sucesso!');
            carregarDados();
        } catch (error) {
            handleError(error, 'Dashboard - cancelarAgendamento');
        }
    }

    // Função para carregar dados do dashboard
    async function carregarDados() {
        try {
            const api = new ApiService();
            const profissionalId = authState.getUser()?.id || authState.getCadastroId();
            
            // Busca profissional
            let profissional = null;
            try {
                profissional = await api.buscarProfissionalPorCadastro(profissionalId);
            } catch (error) {
                console.error('Erro ao buscar profissional:', error);
            }

            if (!profissional || !profissional.id) {
                agendamentosContainer.innerHTML = `
                    <div class="alert alert-warning">
                        Profissional não encontrado. Complete seu cadastro.
                    </div>
                `;
                return;
            }

            // Busca agendamentos
            const todosAgendamentos = await api.listarAgendamentos();
            const agendamentosProfissional = Array.isArray(todosAgendamentos)
                ? todosAgendamentos.filter(a => a.id_profissional_fk === profissional.id)
                : [];

            // Calcula resumo
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            const agendamentosHoje = agendamentosProfissional.filter(a => {
                if (!a.data_hora) return false;
                const data = new Date(a.data_hora);
                data.setHours(0, 0, 0, 0);
                return data.getTime() === hoje.getTime();
            });

            const pendentes = agendamentosProfissional.filter(a => 
                (a.status || '').toLowerCase() === 'pendente' || 
                (a.status || '').toLowerCase() === 'agendado'
            );

            const cancelados = agendamentosProfissional.filter(a => 
                (a.status || '').toLowerCase() === 'cancelado'
            );

            // Renderiza cards de resumo
            resumoContainer.innerHTML = '';
            resumoContainer.appendChild(criarCardResumo('Total', agendamentosProfissional.length, 'bi-calendar-check', 'primary'));
            resumoContainer.appendChild(criarCardResumo('Hoje', agendamentosHoje.length, 'bi-calendar-day', 'info'));
            resumoContainer.appendChild(criarCardResumo('Pendentes', pendentes.length, 'bi-clock-history', 'warning'));
            resumoContainer.appendChild(criarCardResumo('Cancelados', cancelados.length, 'bi-x-circle', 'danger'));

            // Renderiza agendamentos de hoje
            if (agendamentosHoje.length > 0) {
                const secaoHoje = document.createElement('div');
                secaoHoje.className = 'mb-4';
                secaoHoje.innerHTML = `
                    <h4 class="mb-3">
                        <i class="bi bi-calendar-day me-2"></i>Agendamentos de Hoje
                    </h4>
                `;
                agendamentosContainer.appendChild(secaoHoje);

                agendamentosHoje.forEach(agendamento => {
                    const card = criarCardAgendamento(agendamento);
                    secaoHoje.appendChild(card);
                });
            }

            // Renderiza próximos agendamentos (próximos 7 dias)
            const proximos7Dias = new Date();
            proximos7Dias.setDate(proximos7Dias.getDate() + 7);
            
            const proximosAgendamentos = agendamentosProfissional
                .filter(a => {
                    if (!a.data_hora) return false;
                    const data = new Date(a.data_hora);
                    return data > hoje && data <= proximos7Dias && 
                           (a.status || '').toLowerCase() !== 'cancelado';
                })
                .sort((a, b) => {
                    const dataA = new Date(a.data_hora);
                    const dataB = new Date(b.data_hora);
                    return dataA - dataB;
                })
                .slice(0, 10); // Limita a 10 próximos

            if (proximosAgendamentos.length > 0) {
                const secaoProximos = document.createElement('div');
                secaoProximos.className = 'mb-4';
                secaoProximos.innerHTML = `
                    <h4 class="mb-3">
                        <i class="bi bi-calendar3 me-2"></i>Próximos Agendamentos
                    </h4>
                `;
                agendamentosContainer.appendChild(secaoProximos);

                proximosAgendamentos.forEach(agendamento => {
                    const card = criarCardAgendamento(agendamento);
                    secaoProximos.appendChild(card);
                });
            }

            // Se não houver agendamentos
            if (agendamentosHoje.length === 0 && proximosAgendamentos.length === 0) {
                agendamentosContainer.innerHTML = `
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        Nenhum agendamento encontrado.
                    </div>
                `;
            }

        } catch (error) {
            handleError(error, 'Dashboard - carregarDados');
            agendamentosContainer.innerHTML = `
                <div class="alert alert-danger">
                    Erro ao carregar dados do dashboard.
                </div>
            `;
        }
    }

    // Carrega dados
    carregarDados();
}

