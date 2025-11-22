export default class ApiService {
    constructor() {
        this.baseUrl = '/GlowUp/api';
        // Modo debug - desative em produção (localStorage.getItem('apiDebug') !== 'false')
        this.debug = localStorage.getItem('apiDebug') !== 'false';
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
        try {
            return await this.request('/cadastro', 'POST', data);
        } catch (error) {
            // Se o erro for sobre CPF, o cadastro pode ter sido criado mesmo assim
            // Retorna um objeto especial para indicar que precisamos verificar
            if (error.message && error.message.includes('CPF')) {
                return {
                    erro: true,
                    erroCPF: true,
                    message: error.message,
                    email: email // Para buscar o cadastro depois
                };
            }
            throw error;
        }
    }
    
    async buscarCadastroPorEmail(email) {
        // Busca todos os cadastros e filtra por email
        // Nota: Isso só funciona se o backend permitir
        const cadastros = await this.listarCadastros();
        if (Array.isArray(cadastros)) {
            return cadastros.find(c => c.email === email) || null;
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

    // Métodos para Serviços
    async listarServicos() {
        return await this.request('/services', 'GET');
    }

    async buscarServico(id) {
        return await this.request(`/services/${id}`, 'GET');
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
        // Atualiza status para 'Cancelado'
        return await this.atualizarAgendamento(id, { status: 'Cancelado' });
    }
} 