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

    // Gera horários padrão de 8h às 18h
    function gerarHorariosPadrao() {
        const horarios = [];
        for (let hora = 8; hora <= 18; hora++) {
            horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        }
        return horarios;
    }

    // Gera horários baseado na escala
    function gerarHorariosDaEscala(escala) {
        const horarios = [];
        if (!escala || !escala.inicio || !escala.fim) {
            return horarios;
        }

        const inicio = new Date(`2000-01-01T${escala.inicio}`);
        const fim = new Date(`2000-01-01T${escala.fim}`);
        
        // Gera horários de hora em hora
        let horaAtual = new Date(inicio);
        while (horaAtual < fim) {
            const horas = horaAtual.getHours().toString().padStart(2, '0');
            const minutos = horaAtual.getMinutes().toString().padStart(2, '0');
            horarios.push(`${horas}:${minutos}`);
            
            // Adiciona 1 hora
            horaAtual.setHours(horaAtual.getHours() + 1);
        }
        
        return horarios;
    }

    // Obtém dia da semana da data
    function obterDiaSemana(data) {
        const date = new Date(data + 'T00:00:00');
        const diaNumero = date.getDay();
        const diasCompletos = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const diasAbreviados = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
        const diasIngles = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        return {
            completo: diasCompletos[diaNumero],
            abreviado: diasAbreviados[diaNumero],
            ingles: diasIngles[diaNumero],
            numero: diaNumero
        };
    }

    // Busca horários disponíveis da escala do profissional
    async function buscarHorariosDisponiveis(data) {
        try {
            if (!profissional || !profissional.id) {
                return gerarHorariosPadrao();
            }

            // Busca escalas do profissional
            const escalas = await api.buscarEscalasProfissional(profissional.id);
            
            if (!Array.isArray(escalas) || escalas.length === 0) {
                return gerarHorariosPadrao();
            }

            // Obtém dia da semana da data selecionada
            const diaSemana = obterDiaSemana(data);
            
            // Busca escala para o dia da semana
            const escalaDoDia = escalas.find(e => {
                const diaEscala = e.dia_semana?.toLowerCase().trim();
                return diaEscala === diaSemana.completo || 
                       diaEscala === diaSemana.abreviado ||
                       diaEscala === diaSemana.ingles ||
                       diaEscala === diaSemana.completo.substring(0, 3) ||
                       diaEscala === diaSemana.completo.substring(0, 4);
            });

            if (escalaDoDia) {
                return gerarHorariosDaEscala(escalaDoDia);
            }

            // Se não encontrou escala para o dia, retorna padrão
            return gerarHorariosPadrao();
        } catch (error) {
            console.error('Erro ao buscar horários:', error);
            return gerarHorariosPadrao();
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
                                min="${new Date().toISOString().split('T')[0]}"
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

    // Elementos do modal
    const dataInput = modal.querySelector('#dataAgendamento');
    const horariosContainer = modal.querySelector('#horariosContainer');
    const observacoesInput = modal.querySelector('#observacoesAgendamento');
    const contadorObservacoes = modal.querySelector('#contadorObservacoes');
    const dataFormatada = modal.querySelector('#dataFormatada');
    const btnConfirmar = modal.querySelector('#btnConfirmarAgendamento');
    const form = modal.querySelector('#formAgendamento');

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

    // Seleção de data
    dataInput.addEventListener('change', async (e) => {
        const data = e.target.value;
        
        if (!data) {
            horariosContainer.innerHTML = '<div class="text-muted">Selecione uma data primeiro</div>';
            return;
        }

        if (!validarData(data)) {
            notify.warning('Não é possível agendar em datas passadas');
            e.target.value = '';
            horariosContainer.innerHTML = '<div class="text-muted">Selecione uma data primeiro</div>';
            return;
        }

        dataSelecionada = data;
        dataFormatada.textContent = formatarData(data);

        horariosContainer.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>';
        horariosDisponiveis = await buscarHorariosDisponiveis(data);

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
            
            // Listener direto no botão (mais confiável)
            btnHorario.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                selecionarHorario(this);
            });
            
            // Também adiciona mousedown para garantir captura
            btnHorario.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                selecionarHorario(this);
            });
            
            horariosContainer.appendChild(btnHorario);
        });
    });

    // Confirma agendamento
    btnConfirmar.addEventListener('click', async () => {
        const form = modal.querySelector('#formAgendamento');
        
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
            const clienteId = authState.getCadastroId();
            if (!clienteId) {
                throw new Error('ID do cliente não encontrado. Faça login novamente.');
            }

            const dataHora = `${dataSelecionada} ${horarioSelecionado.dataset.horario}:00`;

            const dadosAgendamento = {
                id_cliente_fk: clienteId,
                id_profissional_fk: profissional.id,
                id_servico_fk: servico.id,
                data_hora: dataHora,
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

    return modal;
}

