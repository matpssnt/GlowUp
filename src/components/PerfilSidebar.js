import authState from '../utils/AuthState.js';

export default function PerfilSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'bg-white rounded shadow-sm sidebar';

    const userType = authState.getUserType();
    const currentPath = window.location.pathname;
    const isPerfilPage = currentPath.includes('/perfil');
    const isMinhaAgendaPage = currentPath.includes('/minhaAgenda');
    const isDashboardPage = currentPath.includes('/dashboard');
    const estiloAtivo = 'd-flex align-items-center p-2 rounded bg-light text-dark text-decoration-none';
    const estiloInativo = 'd-flex align-items-center p-2 rounded text-dark text-decoration-none';
    
    const menuAgendamentos = userType === 'cliente' ? `
        <li class="mb-2">
            <a href="minhaAgenda" class="${isMinhaAgendaPage ? estiloAtivo : estiloInativo}">
                <i class="bi bi-calendar me-2"></i>
                <span>Minha Agenda</span>
            </a>
        </li>
    ` : '';
    
    const menuDashboard = userType === 'profissional' ? `
        <li class="mb-2">
            <a href="dashboard" class="${isDashboardPage ? estiloAtivo : estiloInativo}">
                <i class="bi bi-speedometer2 me-2"></i>
                <span>Dashboard</span>
            </a>
        </li>
    ` : '';

    sidebar.innerHTML = `
        <div class="mb-4">
            <a href="home" class="text-decoration-none text-dark d-flex align-items-center mb-3">
                <i class="bi bi-arrow-left me-2"></i>
                <span>Voltar</span>
            </a>
        </div>
        <ul class="list-unstyled">
            <li class="mb-2">
                <a href="perfil" class="${isPerfilPage ? estiloAtivo : estiloInativo}">
                    <i class="bi bi-pencil me-2"></i>
                    <span>Editar perfil</span>
                </a>
            </li>
            ${menuAgendamentos}
            ${menuDashboard}
            <li class="mb-2">
                <a href="#" class="d-flex align-items-center p-2 rounded text-dark text-decoration-none">
                    <i class="bi bi-bell me-2"></i>
                    <span>Notificações</span>
                </a>
            </li>
            <li class="mb-2">
                <a href="#" class="d-flex align-items-center p-2 rounded text-dark text-decoration-none">
                    <i class="bi bi-question-circle me-2"></i>
                    <span>Help</span>
                </a>
            </li>
        </ul>
    `;

    return sidebar;
}

