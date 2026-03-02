// src/pages/perfilProfissional.js
import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import PerfilBanner from "../components/PerfilBanner.js";
import authState from "../utils/AuthState.js";
import ApiService from "../utils/api.js";

export default async function renderPerfilProfissionalPage() {
    if (!authState.isAuth() || authState.getUserType() !== 'profissional') {
        window.location.href = '/login';
        return;
    }

    const root = document.getElementById('root');
    root.innerHTML = '';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.minHeight = '100vh';
    root.style.backgroundColor = '#f5f5f5';

    // NavBar
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    nav.appendChild(NavBar());

    // Main container
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content-wrapper';
    mainWrapper.style.display = 'flex';
    mainWrapper.style.gap = '20px';
    mainWrapper.style.padding = '20px';

    // Sidebar
    mainWrapper.appendChild(PerfilSidebar());

    // Conteúdo da página
    const content = document.createElement('div');
    content.className = 'content-area';

    // Busca informações adicionais na API usando o ID do profissional salvo no estado
    const api = new ApiService();
    let profissionalData = authState.getUser() || {};
    const profId = profissionalData.profissional_id || profissionalData.id;

    if (profId) {
        try {
            const profFromApi = await api.buscarProfissional(profId);
            if (profFromApi && profFromApi.id) {
                profissionalData = profFromApi;
            }
        } catch (err) {
            console.error('Erro ao buscar profissional na API', err);
        }
    }

    // buscar endereço e telefone separados (seguem padrão de agendamento.js)
    let endereco = null;
    try {
        if (profissionalData.id) {
            endereco = await api.buscarEnderecoPorProfissional(profissionalData.id);
        }
    } catch (err) {
        console.error('Erro ao buscar endereço do profissional', err);
    }

    let telefone = null;
    try {
        if (profissionalData.id) {
            telefone = await api.buscarTelefonePorProfissional(profissionalData.id);
        }
    } catch (err) {
        console.error('Erro ao buscar telefone do profissional', err);
    }

    content.appendChild(PerfilBanner(profissionalData, endereco, telefone)); // Renderiza banner do profissional
    mainWrapper.appendChild(content);

    root.appendChild(mainWrapper);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());
}