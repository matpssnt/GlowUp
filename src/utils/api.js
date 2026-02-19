export default class ApiService {
    constructor() {
        this.baseUrl = '/GlowUp/api';
        this.debug = false;
        // this.debug = localStorage.getItem('apiDebug') !== 'false';
    }

    /**
     * Verifica se há conexão com a internet
     */
    checkOnline() {
        return navigator.onLine;
    }

    /**
     * Método auxiliar para logging condicional (apenas em modo debug)
     */
    log(...args) {
        if (this.debug) {
            console.log(...args);
        }
    }

    /**
     * Método auxiliar para error logging (sempre ativo)
     */
    logError(...args) {
        // console.error(...args);
    }

    async request(endpoint, method = 'GET', data = null) {
        // Verifica se está online
        if (!this.checkOnline()) {
            throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
        }

        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const url = `${this.baseUrl}${endpoint}`;
            this.log(`[API] ${method} ${url}`, data);

            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : null,
            });

            let responseData;
            try {
                const text = await response.text();
                this.log(`[API] Resposta bruta (${response.status}):`, text);
                responseData = text ? JSON.parse(text) : {};
            } catch (parseError) {
                this.logError('Erro ao fazer parse da resposta:', parseError);
                responseData = { message: 'Erro ao processar resposta do servidor' };
            }

            this.log(`[API] Resposta processada (${response.status}):`, responseData);

            if (!response.ok) {
                const errorMessage = responseData.message || responseData.error || `Erro ${response.status}: ${response.statusText}`;
                this.logError(`[API] Erro ${response.status}:`, errorMessage);

                // Mensagens de erro mais amigáveis para o usuário
                let userFriendlyMessage = errorMessage;
                if (response.status === 401) {
                    userFriendlyMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
                } else if (response.status === 403) {
                    userFriendlyMessage = 'Você não tem permissão para realizar esta ação.';
                } else if (response.status === 404) {
                    userFriendlyMessage = 'Recurso não encontrado.';
                } else if (response.status >= 500) {
                    userFriendlyMessage = 'Erro no servidor. Por favor, tente novamente mais tarde.';
                }

                throw new Error(userFriendlyMessage);
            }

            return responseData;
        } catch (error) {
            // Se for erro de rede (fetch falhou)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                this.logError('[API] Erro de rede:', error);
                throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
            }

            // Se for erro de offline
            if (error.message.includes('Sem conexão')) {
                throw error;
            }

            this.logError('[API] Erro completo:', error);
            if (error.message) {
                throw error;
            }
            throw new Error('Erro na comunicação com o servidor. Tente novamente.');
        }
    }

    async loginCliente(email, senha) {
        return await this.request('/login/cliente', 'POST', { email, senha });
    }

    async loginProfissional(email, senha) {
        return await this.request('/login/funcionario', 'POST', { email, senha });
    }

    async login(email, senha) {
        // Tenta primeiro como cliente
        try {
            const response = await this.loginCliente(email, senha);
            return { ...response, tipoUsuario: 'cliente' };
        } catch (clienteError) {
            // Se falhar como cliente, tenta como profissional
            try {
                const response = await this.loginProfissional(email, senha);
                return { ...response, tipoUsuario: 'profissional' };
            } catch (profError) {
                // Se ambos falharem
                throw new Error('Credenciais inválidas. Verifique seu email e senha.');
            }
        }
    }

    async cadastrarCliente(nome, email, senha) {
        const data = {
            nome,
            email,
            senha,
            isProfissional: 0
        };
        return await this.request('/cadastro', 'POST', data);
    }

    async cadastrarProfissional(nome, email, senha) {
        const data = {
            nome,
            email,
            senha,
            isProfissional: 1
        };
        return await this.request('/cadastro', 'POST', data);
    }

    async buscarCadastroPorEmail(email) {
        // Busca todos os cadastros e filtra por email
        // Nota: Isso só funciona se o backend permitir
        try {
            const cadastros = await this.listarCadastros();
            if (Array.isArray(cadastros)) {
                return cadastros.find(c => c.email === email) || null;
            }
        } catch (error) {
            // console.error('Erro ao buscar cadastro por email:', error);
        }
        return null;
    }

    async buscarOuCriarCadastroPorEmail(email, maxTentativas = 3) {
        // Tenta buscar o cadastro várias vezes (útil após criação)
        for (let i = 0; i < maxTentativas; i++) {
            const cadastro = await this.buscarCadastroPorEmail(email);
            if (cadastro) {
                return cadastro;
            }
            // Aguarda antes de tentar novamente
            if (i < maxTentativas - 1) {
                await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
            }
        }
        return null;
    }

    async atualizarCadastro(id, nome, email, senha, isProfissional) {
        const data = {
            id,
            nome,
            email,
            senha,
            isProfissional
        };
        return await this.request('/cadastro', 'PUT', data);
    }

    async buscarCadastro(id) {
        return await this.request(`/cadastro/${id}`, 'GET');
    }

    async listarCadastros() {
        return await this.request('/cadastro', 'GET');
    }

    async deletarCadastro(id) {
        return await this.request('/cadastro', 'DELETE', { id });
    }

    // Métodos para Endereço
    async criarEndereco(dados) {
        return await this.request('/endereco', 'POST', dados);
    }

    async atualizarEndereco(id, dados) {
        const data = {
            id,
            ...dados
        };
        return await this.request('/endereco', 'PUT', data);
    }

    // Métodos para Telefone
    async criarTelefone(ddd, digitos) {
        return await this.request('/telefone', 'POST', { ddd, digitos });
    }

    async atualizarTelefone(id, ddd, digitos) {
        return await this.request('/telefone', 'PUT', { id, ddd, digitos });
    }

    async buscarTelefone(id) {
        return await this.request(`/telefone/${id}`, 'GET');
    }

    async listarTelefones() {
        return await this.request('/telefone', 'GET');
    }

    // Métodos para Profissional
    async listarProfissionais() {
        return await this.request('/profissional', 'GET');
    }

    async buscarProfissional(id) {
        return await this.request(`/profissional/${id}`, 'GET');
    }

    async buscarProfissionalPorCadastro(idCadastro) {
        try {
            return await this.request(`/profissional/cadastro/${idCadastro}`, 'GET');
        } catch (error) {
            // Se for 404 (profissional não encontrado), retorna null em vez de lançar erro
            if (error.message.includes('Recurso não encontrado')) {
                return null;
            }
            // Para outros erros, lança normalmente
            throw error;
        }
    }

    async criarProfissional(dados) {
        return await this.request('/profissional', 'POST', dados);
    }

    async atualizarProfissional(id, dados) {
        const data = {
            id,
            ...dados
        };
        return await this.request('/profissional', 'PUT', data);
    }

    async buscarEndereco(id) {
        return await this.request(`/endereco/${id}`, 'GET');
    }

    async buscarEnderecoPorProfissional(idProfissional) {
        // Busca todos os endereços e filtra por profissional
        const enderecos = await this.request('/endereco', 'GET');
        if (Array.isArray(enderecos)) {
            return enderecos.find(e => e.id_profissional_fk == idProfissional) || null;
        }
        return null;
    }

    async buscarEnderecoPorCadastro(idCadastro) {
        // Busca endereço por cadastro (pode ser profissional ou cliente)
        // Primeiro tenta buscar como profissional
        try {
            const profissional = await this.buscarProfissionalPorCadastro(idCadastro);
            if (profissional && profissional.id) {
                return await this.buscarEnderecoPorProfissional(profissional.id);
            }
        } catch (error) {
            // Se não for profissional (404) ou der outro erro, continua silenciosamente
            // 404 é esperado quando o usuário não é profissional
            if (!error.message.includes('Recurso não encontrado')) {
                // Usuário não é profissional ou erro ao buscar (removido console.log)
            }
        }

        // Se não encontrou como profissional, busca todos os endereços
        // e tenta encontrar por id_cadastro_fk ou id_cliente_fk (se existir no backend)
        try {
            const enderecos = await this.request('/endereco', 'GET');
            if (Array.isArray(enderecos)) {
                return enderecos.find(e =>
                    e.id_cadastro_fk == idCadastro ||
                    e.id_cliente_fk == idCadastro
                ) || null;
            }
        } catch (error) {
            // console.error('Erro ao buscar endereço por cadastro:', error);
        }

        return null;
    }

    async buscarTelefonePorProfissional(idProfissional) {
        try {
            // Busca relação tel_prof
            const telProfs = await this.request('/telProf', 'GET');
            if (Array.isArray(telProfs)) {
                const relacao = telProfs.find(tp => tp.id_profissional_fk == idProfissional);
                if (relacao && relacao.id_telefone_fk) {
                    // Busca o telefone
                    return await this.buscarTelefone(relacao.id_telefone_fk);
                }
            }
            return null;
        } catch (error) {
            // console.error('Erro ao buscar telefone do profissional:', error);
            return null;
        }
    }

    async listarTelProfs() {
        return await this.request('/telProf', 'GET');
    }

    // Métodos para Serviços
    async listarServicos() {
        return await this.request('/services', 'GET');
    }

    async buscarServico(id) {
        return await this.request(`/services/${id}`, 'GET');
    }

    async criarServico(dados) {
        return await this.request('/services', 'POST', dados);
    }

    async atualizarServico(id, dados) {
        const data = { id, ...dados };
        return await this.request('/services', 'PUT', data);
    }

    async deletarServico(id) {
        return await this.request(`/services?id=${id}`, 'DELETE');
    }

    // Métodos para Categorias
    async listarCategorias() {
        return await this.request('/categoria', 'GET');
    }

    // Métodos para Agendamento
    async listarAgendamentos() {
        return await this.request('/agendamento', 'GET');
    }

    async buscarAgendamento(id) {
        return await this.request(`/agendamento/${id}`, 'GET');
    }

    async criarAgendamento(dados) {
        return await this.request('/agendamento', 'POST', dados);
    }

    async atualizarAgendamento(id, dados) {
        const data = {
            id,
            ...dados
        };
        return await this.request('/agendamento', 'PUT', data);
    }

    async cancelarAgendamento(id) {
        // Usa DELETE com query param para garantir compatibilidade
        return await this.request(`/agendamento?id=${id}`, 'DELETE');
    }

    async listarHorariosDisponiveis(data, idServicoFk) {
        const qs = `?data=${encodeURIComponent(data)}&id_servico_fk=${encodeURIComponent(idServicoFk)}`;
        return await this.request(`/horarios-disponiveis${qs}`, 'GET');
    }

    async trocarSenha(cadastroId, senhaAntiga, senhaNova) {
        return await this.request('/seguranca/trocar-senha', 'POST', {
            id_cadastro: cadastroId,
            senha_antiga: senhaAntiga,
            senha_nova: senhaNova
        });
    }

    // Métodos para Escala
    async listarEscalas() {
        return await this.request('/escala', 'GET');
    }

    async buscarEscala(id) {
        return await this.request(`/escala/${id}`, 'GET');
    }

    async buscarEscalasProfissional(idProfissional) {
        // Busca todas as escalas e filtra por profissional
        const escalas = await this.listarEscalas();
        if (Array.isArray(escalas)) {
            return escalas.filter(e => e.id_profissional_fk == idProfissional);
        }
        return [];
    }

    async criarEscala(dados) {
        return await this.request('/escala', 'POST', dados);
    }

    async atualizarEscala(id, dados) {
        const data = { id, ...dados };
        return await this.request('/escala', 'PUT', data);
    }

    async deletarEscala(id) {
        return await this.request('/escala', 'DELETE', { id });
    }



}