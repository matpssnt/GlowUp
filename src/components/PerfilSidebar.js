import authState from '../utils/AuthState.js';

export default function PerfilSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar'; // Usa classe CSS do dashboard.css

    const userType = authState.getUserType();
    const currentPath = window.location.pathname;

    // Helper para classe ativa
    // Verifica se a URL atual contém o caminho alvo
    const getLinkClass = (path) => {
        const isActive = currentPath.includes(path);
        return `sidebar-link ${isActive ? 'active' : ''}`;
    };

    const menuAgendamentos = userType === 'cliente' ? `
        <a href="minhaAgenda" class="${getLinkClass('minhaAgenda')}">
            <i class="bi bi-calendar"></i>
            <span>Minha Agenda</span>
        </a>
    ` : '';

    // Menu Profissional Expandido
    const menuProfissional = userType === 'profissional' ? `
        <a href="dashboard" class="${getLinkClass('dashboard')}">
            <i class="bi bi-speedometer2"></i>
            <span>Dashboard</span>
        </a>
        <a href="servicos" class="${getLinkClass('servicos')}">
            <i class="bi bi-scissors"></i>
            <span>Meus Serviços</span>
        </a>
    ` : '';

    sidebar.innerHTML = `
        <div class="mb-4">
            <a href="home" class="text-decoration-none text-dark d-flex align-items-center mb-3 px-3">
                <i class="bi bi-arrow-left me-2"></i>
                <span style="font-weight: 600">Voltar para Home</span>
            </a>
        </div>
        
        <div class="d-flex flex-column">
            <h6 class="text-uppercase text-muted ms-3 mb-3" style="font-size: 0.75rem; letter-spacing: 1px;">Gestão</h6>
            
            <a href="perfil" class="${getLinkClass('perfil')}">
                <i class="bi bi-person"></i>
                <span>Meu Perfil</span>
            </a>
            
            ${menuAgendamentos}
            ${menuProfissional}
            
            <div class="my-3 border-top mx-3"></div>
            
            <h6 class="text-uppercase text-muted ms-3 mb-3" style="font-size: 0.75rem; letter-spacing: 1px;">Suporte</h6>
            
            <a href="#" class="sidebar-link">
                <i class="bi bi-bell"></i>
                <span>Notificações</span>
            </a>
            <a href="#" class="sidebar-link">
                <i class="bi bi-question-circle"></i>
                <span>Ajuda</span>
            </a>
        </div>
    `;

    return sidebar;
}
