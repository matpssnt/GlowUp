import authState from '../utils/AuthState.js';

export default function PerfilSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'bg-white rounded shadow-sm';
    sidebar.style.width = '250px';
    sidebar.style.height = 'fit-content';
    sidebar.style.padding = '20px';
    sidebar.style.position = 'sticky';
    sidebar.style.top = '20px';

    const userType = authState.getUserType();
    const currentPath = window.location.pathname;
    const isPerfilPage = currentPath.includes('/perfil');
    const isAgendamentosPage = currentPath.includes('/agendamentos');
    const estiloAtivo = 'd-flex align-items-center p-2 rounded bg-light text-dark text-decoration-none';
    const estiloInativo = 'd-flex align-items-center p-2 rounded text-dark text-decoration-none';
    
    const menuAgendamentos = userType === 'cliente' ? `
        <li class="mb-2">
            <a href="agendamentos" class="${isAgendamentosPage ? estiloAtivo : estiloInativo}">
                <i class="bi bi-calendar me-2"></i>
                <span>Meus Agendamentos</span>
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

