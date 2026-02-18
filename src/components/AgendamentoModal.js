import { notify } from './Notification.js';
import { handleError } from '../utils/errorHandler.js';
import { validateForm } from '../utils/validation.js';
import ApiService from '../utils/api.js';
import authState from '../utils/AuthState.js';

// Instancia a API
const api = new ApiService();

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

    let dataSelecionada = null;
    let horariosDisponiveis = [];

    const formatDateYmd = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const addMonths = (dateObj, months) => {
        const d = new Date(dateObj);
        d.setMonth(d.getMonth() + months);
        return d;
    };

    const availabilityCache = new Map();

    // Filtra horários que já estão agendados
    async function filtrarHorariosDisponiveis(horarios, data, idProfissional) {
        try {
            const agendamentos = await api.listarAgendamentos();
            
            const horariosFiltrados = horarios.filter(horario => {
                const dataHora = `${data} ${horario}`;
                const conflito = agendamentos.find(ag => {
                    return ag.id_profissional_fk == idProfissional && 
                           ag.data_hora === dataHora &&
                           ag.status !== 'Cancelado';
                });
                
                return !conflito; // Mantém apenas horários sem conflito
            });
            
            return horariosFiltrados;
        } catch (error) {
            return horarios; // Retorna originais se falhar
        }
    }

    // Verifica se já existe agendamento no mesmo horário
    async function verificarConflitoHorario(data, hora, idProfissional) {
        try {
            const dataHora = `${data} ${hora}`;
            const agendamentos = await api.listarAgendamentos();
            
            const conflito = agendamentos.find(ag => {
                return ag.id_profissional_fk == idProfissional && 
                       ag.data_hora === dataHora &&
                       ag.status !== 'Cancelado';
            });
            
            return conflito || null;
        } catch (error) {
            return null;
        }
    }

    // Busca horários disponíveis - método otimizado
    async function buscarHorariosDisponiveis(data) {
        try {
            if (profissional && profissional.id && servico && servico.id && data) {
                // Tenta primeiro o método antigo (mais estável)
                try {
                    const horariosAntigos = await api.listarHorariosDisponiveis(data, servico.id);
                    
                    if (Array.isArray(horariosAntigos) && horariosAntigos.length > 0) {
                        // Filtra horários já agendados
                        const horariosFiltrados = await filtrarHorariosDisponiveis(
                            horariosAntigos.map(h => {
                                let horario = String(h).trim();
                                // Remove data se vier com formato completo
                                if (horario.includes(' ')) {
                                    const partes = horario.split(' ');
                                    horario = partes[partes.length - 1];
                                }
                                // Garante formato HH:MM:SS
                                if (horario.length === 5) {
                                    horario += ':00';
                                }
                                return horario;
                            }),
                            data,
                            profissional.id
                        );
                        
                        return horariosFiltrados;
                    }
                } catch (errorAntigo) {
                    // Se o antigo falhar, tenta o novo
                }

                // Se o antigo falhar, tenta o novo
                try {
                    const horarios = await api.calcularHorariosDisponiveis(
                        data, 
                        profissional.id, 
                        servico.duracao || servico.tempo || 60
                    );
                    
                    if (Array.isArray(horarios) && horarios.length > 0) {
                        return horarios;
                    }
                } catch (errorNovo) {
                    // Se ambos falharem, retorna array vazio
                }
                
                return [];
            }

            return [];
        } catch (error) {
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
                                type="date" 
                                id="dataAgendamento" 
                                class="form-control" 
                                required
                                placeholder="Selecione uma data"
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
                                <i class="bi bi-chat-text me-2"></i>Observações (opcional)
                            </label>
                            <textarea 
                                class="form-control" 
                                id="observacoesAgendamento" 
                                rows="3" 
                                maxlength="500"
                                placeholder="Alguma informação adicional para o profissional?"
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
                
                // Remove data se vier com formato completo, mantendo apenas HH:MM:SS
                let horarioLimpo = String(horario).trim();
                if (horarioLimpo.includes(' ')) {
                    // Se vier como "2026-02-26 11:50:00", extrai apenas a hora
                    const partes = horarioLimpo.split(' ');
                    horarioLimpo = partes[partes.length - 1]; // Pega a última parte (hora)
                }
                
                // Garante formato HH:MM:SS
                if (horarioLimpo.length === 5) {
                    horarioLimpo += ':00';
                }
                
                btnHorario.textContent = horarioLimpo;
                btnHorario.dataset.horario = horarioLimpo;
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
                // Configura data mínima como hoje
                const hoje = new Date();
                const hojeStr = formatDateYmd(hoje);
                dataInput.min = hojeStr;
                
                // Configura data máxima (3 meses à frente)
                const maxDate = addMonths(hoje, 3);
                const maxDateStr = formatDateYmd(maxDate);
                dataInput.max = maxDateStr;
                
                dataInput.disabled = false;
                horariosContainer.innerHTML = '<div class="text-muted">Selecione uma data primeiro</div>';
                
                // Adiciona evento de change para carregar horários
                dataInput.addEventListener('change', async (e) => {
                    const dataSelecionada = e.target.value;
                    if (dataSelecionada && validarData(dataSelecionada)) {
                        dataFormatada.textContent = formatarData(dataSelecionada);
                        
                        // Busca horários disponíveis
                        try {
                            const horarios = await buscarHorariosDisponiveis(dataSelecionada);
                            availabilityCache.set(dataSelecionada, horarios);
                            renderizarHorariosDoDia(dataSelecionada);
                        } catch (error) {
                            horariosContainer.innerHTML = '<div class="alert alert-danger">Erro ao carregar horários. Tente novamente.</div>';
                        }
                    } else {
                        horariosContainer.innerHTML = '<div class="text-muted">Selecione uma data válida</div>';
                    }
                });
                
            } catch (error) {
                dataInput.disabled = false;
                horariosContainer.innerHTML = '<div class="text-muted">Selecione uma data primeiro</div>';
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

        // Confirma agendamento
        btnConfirmar.addEventListener('click', async () => {
            if (!dataInput.value) {
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
                const clienteId = authState.getCadastroId();
                if (!clienteId) {
                    throw new Error('ID do cliente não encontrado. Faça login novamente.');
                }

                const horarioStr = String(horarioSelecionado.dataset.horario || '').trim();
                const horarioFinal = horarioStr.length === 5 ? `${horarioStr}:00` : horarioStr;
                const dataHora = `${dataInput.value} ${horarioFinal}`;

                // Verifica conflito antes de criar agendamento
                const conflito = await verificarConflitoHorario(dataInput.value, horarioFinal, profissional.id);
                
                if (conflito) {
                    throw new Error(`Este horário já está agendado para o profissional ${profissional.nome}. Por favor, escolha outro horário.`);
                }

                // Verifica expediente do profissional
                try {
                    const escalas = await api.buscarEscalasProfissional(profissional.id);
                    
                    const escalaDia = escalas.find(e => {
                        // Melhor tratamento de data
                        try {
                            const dataEscala = new Date(e.data_escala);
                            const dataSelecionada = new Date(dataInput.value + 'T00:00:00');
                            
                            // Compara apenas dia, mês e ano
                            return dataEscala.getDate() === dataSelecionada.getDate() &&
                                   dataEscala.getMonth() === dataSelecionada.getMonth() &&
                                   dataEscala.getFullYear() === dataSelecionada.getFullYear();
                        } catch (dateError) {
                            return false;
                        }
                    });
                    
                    if (escalaDia) {
                        // Verifica se horário está dentro do expediente
                        const [hora] = horarioFinal.split(':');
                        const horaNum = parseInt(hora);
                        const [aberturaHora] = escalaDia.horario_abertura.split(':');
                        const [fechamentoHora] = escalaDia.horario_fechamento.split(':');
                        const aberturaNum = parseInt(aberturaHora);
                        const fechamentoNum = parseInt(fechamentoHora);
                        
                        if (horaNum < aberturaNum || horaNum >= fechamentoNum) {
                            throw new Error(`Horário ${horarioFinal} está fora do expediente (${escalaDia.horario_abertura} - ${escalaDia.horario_fechamento}).`);
                        }
                    }
                } catch (escalaError) {
                    // Continua mesmo se falhar verificação de expediente
                }

                const dadosAgendamento = {
                    id_cliente_fk: clienteId,
                    id_profissional_fk: profissional.id,
                    id_servico_fk: servico.id,
                    data_hora: dataHora, // Backend espera este campo
                    observacoes: observacoesInput.value.trim() || null,
                    status: 'Agendado'
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
        inicializarCalendario();

    }, 100);

    return modal;
}
