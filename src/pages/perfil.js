import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import PerfilForm from "../components/PerfilForm.js";
import authState from "../utils/AuthState.js";

export default function renderPerfilPage() {
    // Verifica se está autenticado
    if (!authState.isAuth()) {
        window.location.href = '/login';
        return;
    }

    if (authState.getUserType() === 'profissional') {
        window.location.href = '/';
        return;
    }

    const root = document.getElementById('root');
    root.innerHTML = '';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.minHeight = '100vh';
    root.style.width = '100%';
    root.style.maxWidth = '100vw';
    root.style.overflowX = 'hidden';
    root.style.boxSizing = 'border-box';
    root.style.backgroundColor = '#f5f5f5';

    // NavBar
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    const navbar = NavBar();
    nav.appendChild(navbar);

    // Container principal (usa classes do dashboard para responsividade)
    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-content-wrapper';

    // Sidebar
    const sidebar = PerfilSidebar();

    // Formulário de perfil
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-area';
    const content = PerfilForm();
    contentWrapper.appendChild(content);

    // Monta o layout
    mainContainer.appendChild(sidebar);
    mainContainer.appendChild(contentWrapper);
    root.appendChild(mainContainer);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = 'auto';
    const footer = Footer();
    footerContainer.appendChild(footer);
}

