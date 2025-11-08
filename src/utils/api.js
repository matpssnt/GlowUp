export default class ApiService {
    constructor() {
        this.baseUrl = '/GlowUp/api';
    }
    
    async request(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const url = `${this.baseUrl}${endpoint}`;
            console.log(`[API] ${method} ${url}`, data);
            
            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : null,
            });

            const responseData = await response.json().catch(() => ({ message: 'Erro na requisição' }));

            console.log(`[API] Resposta ${response.status}:`, responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Erro na requisição');
            }

            return responseData;
        } catch (error) {
            console.error('Erro na API:', error.message);
            throw error;
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
} 