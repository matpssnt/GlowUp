// Serviço de Gerenciamento de Estado de Autenticação
// Gerencia o estado global do usuário logado

class AuthState {
    constructor() {
        this.listeners = [];
        this.loadState();
    }

    // Carrega o estado do localStorage
    loadState() {
        try {
            const token = localStorage.getItem('authToken');
            const userStr = localStorage.getItem('userData');
            
            this.isAuthenticated = !!token;
            this.token = token || null;
            this.user = userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Erro ao carregar estado:', error);
            this.isAuthenticated = false;
            this.token = null;
            this.user = null;
        }
    }

    // Salva os dados do usuário autenticado
    setUser(userData, token) {
        this.user = userData;
        this.token = token;
        this.isAuthenticated = true;
        
        // Salva no localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Notifica listeners
        this.notifyListeners();
    }

    // Remove os dados do usuário (logout)
    clearUser() {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        
        // Remove do localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Notifica listeners
        this.notifyListeners();
    }

    // Retorna os dados do usuário
    getUser() {
        return this.user;
    }

    // Retorna o token
    getToken() {
        return this.token;
    }

    // Verifica se está autenticado
    isAuth() {
        return this.isAuthenticated;
    }

    // Retorna o tipo de usuário (cliente ou profissional)
    getUserType() {
        return this.user?.tipoUsuario || null;
    }

    // Registra um listener para mudanças de estado
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Retorna função para remover o listener
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Notifica todos os listeners sobre mudanças
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener({
                    isAuthenticated: this.isAuthenticated,
                    user: this.user,
                    token: this.token
                });
            } catch (error) {
                console.error('Erro ao notificar listener:', error);
            }
        });
    }
}
const authState = new AuthState();

export default authState;

