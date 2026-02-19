import { notify } from './Notification.js';
import { handleError } from '../utils/errorHandler.js';
import { validateForm } from '../utils/validation.js';
import ApiService from '../utils/api.js';
import authState from '../utils/AuthState.js';

export default function AgendamentoModal(servico, profissional) {
    // Verifica se está logado
    if (!authState.isAuth() || authState.getUserType() !== 'cliente') {
        notify.warning('Você precisa estar logado como cliente para agendar');
        return null;
    }

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'agendamentoModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'agendamentoModalLabel');
    modal.setAttribute('aria-hidden', 'true');

    const api = new ApiService();
    let horariosDisponiveis = [];
    let dataSelecionada = null;

    const formatDateYmd = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const addMonths = (dateObj, months) => {
        const d = new Date(dateObj);
        d.setMonth(d.getMonth() + months);
        return d;
    };

    const availabilityCache = new Map();

    // Busca horários disponíveis APENAS pelo backend (/horarios-disponiveis)
    async function buscarHorariosDisponiveis(data) {
        try {
            if (servico && servico.id && data) {
                const response = await api.listarHorariosDisponiveis(data, servico.id);
                // A API retorna um objeto com a propriedade 'horarios'
                if (response && response.horarios && Array.isArray(response.horarios)) {
                    return response.horarios.map(h => (String(h).length === 5 ? `${h}:00` : String(h)));
                }
                return [];
            }

            return [];
        } catch (error) {
            console.error('Erro ao buscar horários:', error);
            return [];
        }
    }

    // Valida se a data não é passada
    function validarData(data) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataSelecionada = new Date(data);
        dataSelecionada.setHours(0, 0, 0, 0);
        return dataSelecionada >= hoje;
    }

    // Formata data para exibição
    function formatarData(data) {
        if (!data) return '';
        const date = new Date(data + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="agendamentoModalLabel">
                        <i class="bi bi-calendar-check me-2"></i>
                        Agendar ${servico.nome || 'Serviço'}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <form id="formAgendamento">
                        <!-- Informações do serviço -->
                        <div class="mb-4 p-3 bg-light rounded">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <strong>Profissional:</strong>
                                <span>${profissional.nome || profissional.razao_social || 'Profissional'}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <strong>Serviço:</strong>
                                <span>${servico.nome || 'Serviço'}</span>
                            </div>
                            ${servico.preco ? `
                                <div class="d-flex justify-content-between align-items-center">
                                    <strong>Valor:</strong>
                                    <span class="text-success fw-bold">R$ ${parseFloat(servico.preco).toFixed(2).replace('.', ',')}</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Seleção de data -->
                        <div class="mb-3">
                            <label for="dataAgendamento" class="form-label">
                                <i class="bi bi-calendar-event me-2"></i>Selecione a data *
                            </label>
                            <input 
                                type="text" 
                                id="dataAgendamento" 
                                class="form-control" 
                                required
                                placeholder="Clique para selecionar uma data"
                                readonly
                            >
                            <small class="form-text text-muted" id="dataFormatada"></small>
                        </div>

                        <!-- Seleção de horário -->
                        <div class="mb-3">
                            <label class="form-label">
                                <i class="bi bi-clock me-2"></i>Selecione o horário *
                            </label>
                            <div id="horariosContainer" class="d-flex flex-wrap gap-2">
                                <div class="text-muted">Selecione uma data primeiro</div>
                            </div>
                        </div>

                        <!-- Observações -->
                        <div class="mb-3">
                            <label for="observacoesAgendamento" class="form-label">
                                <i class="bi bi-chat-left-text me-2"></i>Observações (opcional)
                            </label>
                            <textarea 
                                id="observacoesAgendamento" 
                                class="form-control" 
                                rows="3"
                                placeholder="Ex: Preferência por corte na tesoura, sem máquina..."
                                maxlength="500"
                            ></textarea>
                            <small class="form-text text-muted">
                                <span id="contadorObservacoes">0</span>/500 caracteres
                            </small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-2"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" id="btnConfirmarAgendamento">
                        <i class="bi bi-check-circle me-2"></i>Confirmar Agendamento
                    </button>
                </div>
            </div>
        </div>
    `;

    // Adiciona o modal ao DOM PRIMEIRO
    document.body.appendChild(modal);

    // Espera um pouco para o DOM processar o modal
    setTimeout(() => {
        // Elementos do modal - AGORA o modal está no DOM
        const dataInput = modal.querySelector('#dataAgendamento');
        const horariosContainer = modal.querySelector('#horariosContainer');
        const observacoesInput = modal.querySelector('#observacoesAgendamento');
        const contadorObservacoes = modal.querySelector('#contadorObservacoes');
        const dataFormatada = modal.querySelector('#dataFormatada');
        const btnConfirmar = modal.querySelector('#btnConfirmarAgendamento');
        const form = modal.querySelector('#formAgendamento');


        async function garantirFlatpickr() {
            if (window.flatpickr) return;

            if (!document.querySelector('link[href*="flatpickr"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
                document.head.appendChild(link);
            }

            await new Promise((resolve, reject) => {
                const existing = document.querySelector('script[src*="flatpickr"]');
                if (existing && window.flatpickr) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
                script.onload = async () => {
                    // Carrega o locale em português após carregar o flatpickr
                    if (!document.querySelector('script[src*="pt.js"]')) {
                        const localeScript = document.createElement('script');
                        localeScript.src = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/pt.js';
                        localeScript.onload = resolve;
                        localeScript.onerror = resolve; // Resolve mesmo se o locale falhar
                        document.head.appendChild(localeScript);
                    } else {
                        resolve();
                    }
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        async function carregarDisponibilidadeDoPeriodo(minDate, maxDate) {
            const dates = [];
            const cursor = new Date(minDate);
            cursor.setHours(0, 0, 0, 0);
            const end = new Date(maxDate);
            end.setHours(0, 0, 0, 0);

            while (cursor <= end) {
                dates.push(formatDateYmd(cursor));
                cursor.setDate(cursor.getDate() + 1);
            }

            await Promise.all(
                dates.map(async (ymd) => {
                    try {
                        const horarios = await buscarHorariosDisponiveis(ymd);
                        availabilityCache.set(ymd, Array.isArray(horarios) ? horarios : []);
                    } catch {
                        availabilityCache.set(ymd, []);
                    }
                })
            );
        }

        function getMonthRange(dateObj) {
            const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
            end.setHours(0, 0, 0, 0);
            return { start, end };
        }

        async function carregarDisponibilidadeDoMes(instance, baseDate, minDate, maxDate) {
            const { start, end } = getMonthRange(baseDate);

            const s = start < minDate ? minDate : start;
            const e = end > maxDate ? maxDate : end;
            if (s > e) return;

            await carregarDisponibilidadeDoPeriodo(s, e);
            if (instance && typeof instance.redraw === 'function') {
                instance.redraw();
            }
        }

        // Previne submit do form ao pressionar Enter
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            return false;
        });

        // Contador de caracteres
        observacoesInput.addEventListener('input', (e) => {
            contadorObservacoes.textContent = e.target.value.length;
        });

        // Função auxiliar para selecionar horário (reutilizável)
        function selecionarHorario(btnHorario) {
            // Remove active de todos
            horariosContainer.querySelectorAll('.horario-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            });

            // Adiciona active no clicado
            btnHorario.classList.add('active');
            btnHorario.style.backgroundColor = '#3b5a40';
            btnHorario.style.borderColor = '#3b5a40';
            btnHorario.style.color = 'white';
        }

        function renderizarHorariosDoDia(data) {
            const horarios = availabilityCache.has(data) ? availabilityCache.get(data) : horariosDisponiveis;
            horariosDisponiveis = Array.isArray(horarios) ? horarios : [];

            if (horariosDisponiveis.length === 0) {
                horariosContainer.innerHTML = '<div class="alert alert-warning">Nenhum horário disponível para esta data</div>';
                return;
            }

            horariosContainer.innerHTML = '';
            horariosDisponiveis.forEach(horario => {
                const btnHorario = document.createElement('button');
                btnHorario.type = 'button';
                btnHorario.className = 'btn btn-outline-primary horario-btn';
                btnHorario.textContent = horario;
                btnHorario.dataset.horario = horario;
                btnHorario.style.cursor = 'pointer';
                btnHorario.setAttribute('tabindex', '0');

                btnHorario.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    selecionarHorario(this);
                });

                btnHorario.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    selecionarHorario(this);
                });

                horariosContainer.appendChild(btnHorario);
            });
        }
        async function inicializarCalendario() {
            try {
                dataInput.disabled = true;
                horariosContainer.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>';

                await garantirFlatpickr();

                if (!window.flatpickr) {
                    // Fallback nativo
                    dataInput.type = 'date';
                    const hoje = new Date();
                    dataInput.min = formatDateYmd(hoje);
                    dataInput.disabled = false;
                    horariosContainer.innerHTML = '<div class="text-muted">Selecione uma data primeiro</div>';
                    return;
                }

                if (!document.getElementById('flatpickr-modal-zindex')) {
                    const style = document.createElement('style');
                    style.id = 'flatpickr-modal-zindex';
                    style.textContent = `
                        .flatpickr-calendar { 
                            z-index: 99999 !important; 
                            box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
                            border: 1px solid #ddd !important;
                        }
                        .flatpickr-day { 
                            color: #333 !important; 
                            font-weight: 500 !important;
                        }
                        .flatpickr-day.flatpickr-disabled, 
                        .flatpickr-day.flatpickr-disabled:hover {
                            color: #ccc !important;
                        }
                        .flatpickr-current-month, .flatpickr-month {
                            padding: 5px 0 !important;
                        }
                        .flatpickr-weekday {
                            color: #666 !important;
                            font-weight: bold !important;
                        }
                        #dataAgendamento { cursor: pointer !important; background: #fff !important; }
                    `;
                    document.head.appendChild(style);
                }

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const max = addMonths(hoje, 2);

                dataInput.disabled = false;

                const fp = window.flatpickr(dataInput, {
                    dateFormat: 'Y-m-d',
                    minDate: hoje,
                    maxDate: max,
                    disableMobile: true,
                    clickOpens: true,
                    locale: 'pt',
                    // Removido restrições de enable momentaneamente para os números aparecerem claramente
                    // O sistema já valida os horários ao selecionar a data
                    onChange: (selectedDates, dateStr) => {
                        if (!dateStr) return;
                        dataSelecionada = dateStr;
                        dataFormatada.textContent = formatarData(dateStr);
                        renderizarHorariosDoDia(dateStr);
                    },
                    onMonthChange: (selectedDates, dateStr, instance) => {
                        const base = instance.currentMonth != null && instance.currentYear != null
                            ? new Date(instance.currentYear, instance.currentMonth, 1)
                            : new Date();
                        carregarDisponibilidadeDoMes(instance, base, hoje, max);
                    },
                    onYearChange: (selectedDates, dateStr, instance) => {
                        const base = instance.currentMonth != null && instance.currentYear != null
                            ? new Date(instance.currentYear, instance.currentMonth, 1)
                            : new Date();
                        carregarDisponibilidadeDoMes(instance, base, hoje, max);
                    }
                });

                // Força abertura ao clicar se o clickOpens falhar
                dataInput.addEventListener('click', () => fp.open());

                horariosContainer.innerHTML = '<div class="text-muted">Selecione uma data primeiro</div>';
                carregarDisponibilidadeDoMes(fp, hoje, hoje, max);
            } catch (error) {
                // console.error('Erro ao inicializar calendário:', error);
                dataInput.disabled = false;
                dataInput.type = 'date';
            }
        }

        // Confirma agendamento
        btnConfirmar.addEventListener('click', async () => {
            if (!dataSelecionada) {
                notify.warning('Selecione uma data');
                dataInput.focus();
                return;
            }

            const horarioSelecionado = horariosContainer.querySelector('.horario-btn.active');
            if (!horarioSelecionado) {
                notify.warning('Selecione um horário');
                return;
            }

            const rules = {
                dataAgendamento: ['required']
            };
            const { isValid } = validateForm(form, rules);
            if (!isValid) {
                notify.warning('Preencha todos os campos obrigatórios');
                return;
            }

            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Agendando...';

            try {
                // Pega o ID do cliente diretamente do authState (já foi salvo no login)
                const user = authState.getUser();
                // clienteId é o ID da tabela 'clientes' (clientes.id) - necessário como FK em agendamentos
                // NÃO usar user.id que é o ID da tabela 'cadastros'
                let clienteId = user?.clienteId;

                // Se não tiver clienteId, busca diretamente na tabela clientes (fallback)
                if (!clienteId) {
                    try {
                        const clientes = await api.request('/client', 'GET');
                        if (Array.isArray(clientes)) {
                            const cadastroId = user?.id;
                            const cliente = clientes.find(c => c.id_cadastro_fk == cadastroId);
                            clienteId = cliente?.id;
                        }
                    } catch (e) {
                        // Fallback final: tenta listar cadastros e buscar o cliente_id
                    }
                }

                // Fallback final por email
                if (!clienteId) {
                    try {
                        const cadastros = await api.listarCadastros();
                        if (Array.isArray(cadastros)) {
                            const userEmail = user?.email;
                            const cadastro = cadastros.find(c => c.email === userEmail && c.isProfissional === 0);
                            // Nota: cadastros.id ≠ clientes.id. Precisamos buscar na tabela clientes.
                            if (cadastro) {
                                const clientes2 = await api.request('/client', 'GET');
                                if (Array.isArray(clientes2)) {
                                    const cli = clientes2.find(c => c.id_cadastro_fk == cadastro.id);
                                    clienteId = cli?.id;
                                }
                            }
                        }
                    } catch (e) {
                        // Ignora
                    }
                }

                if (!clienteId) {
                    throw new Error('ID do cliente não encontrado. Faça login novamente.');
                }

                const horarioStr = String(horarioSelecionado.dataset.horario || '').trim();
                const horarioFinal = horarioStr.length === 5 ? `${horarioStr}:00` : horarioStr;
                const dataHora = `${dataSelecionada} ${horarioFinal}`;

                const dadosAgendamento = {
                    id_cliente_fk: clienteId,
                    id_servico_fk: servico.id,
                    data_hora: dataHora
                };

                await api.criarAgendamento(dadosAgendamento);
                notify.success('Agendamento realizado com sucesso!');

                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }

                setTimeout(() => {
                    if (window.location.pathname.includes('agendamento')) {
                        window.location.reload();
                    } else {
                        window.location.href = '/minhaAgenda';
                    }
                }, 1000);

            } catch (error) {
                handleError(error, 'AgendamentoModal - confirmar');
                btnConfirmar.disabled = false;
                btnConfirmar.innerHTML = '<i class="bi bi-check-circle me-2"></i>Confirmar Agendamento';
            }
        });

        // Remove modal do DOM ao fechar
        modal.addEventListener('hidden.bs.modal', () => {
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        });

        // Inicializa o modal Bootstrap
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // Inicializa o calendário
        // console.log('Modal adicionado ao DOM, inicializando calendário...');
        inicializarCalendario();

    }, 100);

    return modal;
}
