export class HorarioCalculator {
    constructor() {
        this.INTERVALO_MINIMO = 15; // Intervalo mínimo em minutos
    }

    /**
     * Converte string de horário (HH:MM) para minutos desde meia-noite
     * @param {string} horario - Horário no formato "HH:MM"
     * @returns {number} Minutos desde 00:00
     */

    horarioParaMinutos(horario) {
        if (!horario || typeof horario !== 'string') {
            throw new Error('Horário inválido. Use formato "HH:MM"');
        }

        const [horas, minutos] = horario.split(':').map(Number);
        
        if (isNaN(horas) || isNaN(minutos)) {
            throw new Error('Horário inválido. Use formato "HH:MM"');
        }

        return (horas * 60) + minutos;
    }

    /**
     * Converte minutos desde meia-noite para string de horário (HH:MM)
     * @param {number} minutos - Minutos desde 00:00
     * @returns {string} Horário no formato "HH:MM"
     */
    minutosParaHorario(minutos) {
        if (typeof minutos !== 'number' || minutos < 0 || minutos > 1440) {
            throw new Error('Minutos inválidos. Use valor entre 0 e 1440');
        }

        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        
        return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    /**
     * Calcula horários disponíveis para agendamento
     * @param {Object} options - Opções de cálculo
     * @param {string} options.abertura - Horário de abertura "HH:MM"
     * @param {string} options.fechamento - Horário de fechamento "HH:MM"
     * @param {number} options.duracaoServico - Duração do serviço em minutos
     * @param {Array} options.agendamentosExistentes - Array de agendamentos existentes
     * @returns {Array} Array de horários disponíveis no formato "HH:MM"
     */
    calcularHorariosDisponiveis(options) {
        const {
            abertura,
            fechamento,
            duracaoServico,
            agendamentosExistentes = []
        } = options;

        // Validações básicas
        if (!abertura || !fechamento || !duracaoServico) {
            throw new Error('Parâmetros obrigatórios: abertura, fechamento, duracaoServico');
        }

        const aberturaMin = this.horarioParaMinutos(abertura);
        const fechamentoMin = this.horarioParaMinutos(fechamento);

        if (aberturaMin >= fechamentoMin) {
            throw new Error('Horário de abertura deve ser anterior ao de fechamento');
        }

        if (duracaoServico <= 0) {
            throw new Error('Duração do serviço deve ser maior que zero');
        }

        // Cria intervalos ocupados baseados nos agendamentos existentes
        const intervalosOcupados = this.criarIntervalosOcupados(agendamentosExistentes);

        // Cria intervalos livres
        const intervalosLivres = this.criarIntervalosLivres(aberturaMin, fechamentoMin, intervalosOcupados);

        // Filtra horários onde o serviço cabe completamente
        const horariosDisponiveis = [];
        
        for (const intervalo of intervalosLivres) {
            const horariosNesteIntervalo = this.gerarHorariosNoIntervalo(
                intervalo.inicio,
                intervalo.fim,
                duracaoServico
            );
            
            horariosDisponiveis.push(...horariosNesteIntervalo);
        }

        // Remove duplicados e ordena
        return [...new Set(horariosDisponiveis)].sort();
    }

    /**
     * Cria array de intervalos ocupados baseados nos agendamentos existentes
     * @param {Array} agendamentos - Array de agendamentos
     * @returns {Array} Array de intervalos ocupados {inicio, fim}
     */
    
    criarIntervalosOcupados(agendamentos) {
        const intervalos = [];

        for (const agendamento of agendamentos) {
            try {
                const inicio = this.horarioParaMinutos(agendamento.data_hora_inicio);
                const duracao = agendamento.duracao_servico || agendamento.duracao || 60; // Default 60min
                const fim = inicio + duracao;

                intervalos.push({ inicio, fim });
            } catch (error) {
                // Ignora agendamentos com horários inválidos
                continue;
            }
        }

        // Ordena intervalos por horário de início
        intervalos.sort((a, b) => a.inicio - b.inicio);

        // Mescla intervalos sobrepostos
        return this.mesclarIntervalosSobrepostos(intervalos);
    }

    /**
     * Mescla intervalos sobrepostos em um único intervalo
     * @param {Array} intervalos - Array de intervalos
     * @returns {Array} Array de intervalos mesclados
     */
    mesclarIntervalosSobrepostos(intervalos) {
        if (intervalos.length === 0) return [];

        const mesclados = [intervalos[0]];

        for (let i = 1; i < intervalos.length; i++) {
            const atual = intervalos[i];
            const ultimo = mesclados[mesclados.length - 1];

            if (atual.inicio <= ultimo.fim) {
                // Intervalos se sobrepõem, mescla
                ultimo.fim = Math.max(ultimo.fim, atual.fim);
            } else {
                // Não se sobrepõem, adiciona novo intervalo
                mesclados.push(atual);
            }
        }

        return mesclados;
    }

    /**
     * Cria intervalos livres baseados nos horários de trabalho e intervalos ocupados
     * @param {number} aberturaMin - Minutos de abertura
     * @param {number} fechamentoMin - Minutos de fechamento
     * @param {Array} intervalosOcupados - Array de intervalos ocupados
     * @returns {Array} Array de intervalos livres {inicio, fim}
     */
    criarIntervalosLivres(aberturaMin, fechamentoMin, intervalosOcupados) {
        const livres = [];

        if (intervalosOcupados.length === 0) {
            // Nenhum agendamento, todo o horário está livre
            livres.push({ inicio: aberturaMin, fim: fechamentoMin });
            return livres;
        }

        // Intervalo antes do primeiro agendamento
        const primeiroOcupado = intervalosOcupados[0];
        if (primeiroOcupado.inicio > aberturaMin) {
            livres.push({ inicio: aberturaMin, fim: primeiroOcupado.inicio });
        }

        // Intervalos entre agendamentos
        for (let i = 0; i < intervalosOcupados.length - 1; i++) {
            const atual = intervalosOcupados[i];
            const proximo = intervalosOcupados[i + 1];

            if (atual.fim < proximo.inicio) {
                livres.push({ inicio: atual.fim, fim: proximo.inicio });
            }
        }

        // Intervalo após o último agendamento
        const ultimoOcupado = intervalosOcupados[intervalosOcupados.length - 1];
        if (ultimoOcupado.fim < fechamentoMin) {
            livres.push({ inicio: ultimoOcupado.fim, fim: fechamentoMin });
        }

        return livres;
    }

    /**
     * Gera horários disponíveis dentro de um intervalo livre
     * @param {number} inicioIntervalo - Início do intervalo em minutos
     * @param {number} fimIntervalo - Fim do intervalo em minutos
     * @param {number} duracaoServico - Duração do serviço em minutos
     * @returns {Array} Array de horários no formato "HH:MM"
     */
    gerarHorariosNoIntervalo(inicioIntervalo, fimIntervalo, duracaoServico) {
        const horarios = [];

        // Arredonda para o próximo múltiplo do intervalo mínimo
        let horarioAtual = Math.ceil(inicioIntervalo / this.INTERVALO_MINIMO) * this.INTERVALO_MINIMO;

        while (horarioAtual + duracaoServico <= fimIntervalo) {
            horarios.push(this.minutosParaHorario(horarioAtual));
            horarioAtual += this.INTERVALO_MINIMO;
        }

        return horarios;
    }

    /**
     * Verifica se um horário específico está disponível
     * @param {string} horarioVerificar - Horário a verificar "HH:MM"
     * @param {Object} options - Mesmos parâmetros do calcularHorariosDisponiveis
     * @returns {boolean} True se disponível, false caso contrário
     */
    isHorarioDisponivel(horarioVerificar, options) {
        try {
            const disponiveis = this.calcularHorariosDisponiveis(options);
            return disponiveis.includes(horarioVerificar);
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtém o próximo horário disponível após um horário específico
     * @param {string} horarioReferencia - Horário de referência "HH:MM"
     * @param {Object} options - Mesmos parâmetros do calcularHorariosDisponiveis
     * @returns {string|null} Próximo horário disponível ou null
     */
    getProximoHorarioDisponivel(horarioReferencia, options) {
        try {
            const disponiveis = this.calcularHorariosDisponiveis(options);
            const refMinutos = this.horarioParaMinutos(horarioReferencia);

            for (const horario of disponiveis) {
                const minutos = this.horarioParaMinutos(horario);
                if (minutos > refMinutos) {
                    return horario;
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Formata array de horários para exibição
     * @param {Array} horarios - Array de horários "HH:MM"
     * @param {Object} options - Opções de formatação
     * @returns {Array} Array de horários formatados
     */
    formatarHorariosParaExibicao(horarios, options = {}) {
        const {
            grupoPorHora = false,
            formato24h = true
        } = options;

        if (!grupoPorHora) {
            return horarios;
        }

        // Agrupa por hora
        const agrupados = {};
        
        for (const horario of horarios) {
            const [hora] = horario.split(':');
            if (!agrupados[hora]) {
                agrupados[hora] = [];
            }
            agrupados[hora].push(horario);
        }

        // Converte para array formatado
        const resultado = [];
        
        for (const hora of Object.keys(agrupados).sort()) {
            if (formato24h) {
                resultado.push(`${hora}h`);
            } else {
                const hora12 = parseInt(hora) > 12 ? parseInt(hora) - 12 : hora;
                const periodo = parseInt(hora) >= 12 ? 'PM' : 'AM';
                resultado.push(`${hora12}${periodo}`);
            }
        }

        return resultado;
    }
}

// Exporta instância única para uso em toda aplicação
export default new HorarioCalculator();
