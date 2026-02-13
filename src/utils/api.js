export default class ApiService {
    constructor() {
        this.baseUrl = '/GlowUp/api';
        this.debug = false;
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
        console.error(...args);
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

    // Métodos de Autenticação
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

    // Métodos para Cadastro
    async cadastrarCliente(nome, email, senha) {
        const data = { nome, email, senha, isProfissional: 0 };
        return await this.request('/cadastro', 'POST', data);
    }

    async cadastrarProfissional(nome, email, senha) {
        const data = { nome, email, senha, isProfissional: 1 };
        return await this.request('/cadastro', 'POST', data);
    }

    async buscarCadastro(id) {
        return await this.request(`/cadastro/${id}`, 'GET');
    }

    async listarCadastros() {
        return await this.request('/cadastro', 'GET');
    }

    // Métodos para Profissional
    async listarProfissionais() {
        return await this.request('/profissional', 'GET');
    }

    async buscarProfissional(id) {
        return await this.request(`/profissional/${id}`, 'GET');
    }

    async buscarProfissionalPorCadastro(idCadastro) {
        // Busca todos os profissionais e filtra por id_cadastro_fk
        try {
            const profissionais = await this.request('/profissional', 'GET');
            if (Array.isArray(profissionais)) {
                return profissionais.find(p => p.id_cadastro_fk == idCadastro) || null;
            }
        } catch (error) {
            console.error('Erro ao buscar profissional por cadastro:', error);
        }
        return null;
    }

    async criarProfissional(dados) {
        return await this.request('/profissional', 'POST', dados);
    }

    async atualizarProfissional(id, dados) {
        const data = { id, ...dados };
        return await this.request('/profissional', 'PUT', data);
    }

    // Métodos para Endereço
    async criarEndereco(dados) {
        return await this.request('/endereco', 'POST', dados);
    }

    async atualizarEndereco(id, dados) {
        const data = { id, ...dados };
        return await this.request('/endereco', 'PUT', data);
    }

    async buscarEndereco(id) {
        return await this.request(`/endereco/${id}`, 'GET');
    }

    async listarEnderecos() {
        return await this.request('/endereco', 'GET');
    }

    async buscarEnderecoPorProfissional(idProfissional) {
        // Busca todos os endereços e filtra por profissional
        try {
            const enderecos = await this.request('/endereco', 'GET');
            if (Array.isArray(enderecos)) {
                return enderecos.find(e => e.id_profissional_fk == idProfissional) || null;
            }
        } catch (error) {
            console.error('Erro ao buscar endereço por profissional:', error);
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
            // Se não for profissional, continua
        }

        // Se não encontrou como profissional, busca todos os endereços
        // e tenta encontrar por id_cadastro_fk ou id_cliente_fk
        try {
            const enderecos = await this.request('/endereco', 'GET');
            if (Array.isArray(enderecos)) {
                return enderecos.find(e =>
                    e.id_cadastro_fk == idCadastro ||
                    e.id_cliente_fk == idCadastro
                ) || null;
            }
        } catch (error) {
            console.error('Erro ao buscar endereço por cadastro:', error);
        }

        return null;
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
        const data = { id, ...dados };
        return await this.request('/agendamento', 'PUT', data);
    }

    async cancelarAgendamento(id) {
        return await this.request(`/agendamento?id=${id}`, 'DELETE');
    }

    async listarHorariosDisponiveis(data, idServicoFk) {
        const qs = `?data=${encodeURIComponent(data)}&id_servico_fk=${encodeURIComponent(idServicoFk)}`;
        return await this.request(`/horarios-disponiveis${qs}`, 'GET');
    }

    // Métodos para Segurança
    async trocarSenha(cadastroId, senhaAntiga, senhaNova) {
        return await this.request('/seguranca/trocar-senha', 'POST', {
            id_cadastro: cadastroId,
            senha_antiga: senhaAntiga,
            senha_nova: senhaNova
        });
    }
}
