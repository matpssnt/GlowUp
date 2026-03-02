// src/pages/perfilProfissional.js
import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import PerfilBanner from "../components/PerfilBanner.js";
import { notify } from "../components/Notification.js";
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

    // Renderiza banner do profissional
    const bannerElement = PerfilBanner(profissionalData, endereco, telefone);
    content.appendChild(bannerElement);

    // permite ao profissional alterar a foto diretamente no banner
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    bannerElement.appendChild(fileInput);

    // botão de edição circular sobre a foto
    const fotoContainer = bannerElement.querySelector('.foto-perfil');
    if (fotoContainer) {
        fotoContainer.style.position = 'relative';
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'edit-photo-btn';
        editBtn.innerHTML = '<i class="bi bi-camera"></i>';
        fotoContainer.appendChild(editBtn);

        // clique no ícone ou em qualquer lugar da foto abre o seletor
        editBtn.addEventListener('click', () => fileInput.click());
        fotoContainer.addEventListener('click', () => fileInput.click());
    }

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // confirmação antes de prosseguir
        const confirmar = window.confirm('Deseja realmente alterar sua foto de perfil?');
        if (!confirmar) {
            // limpa input para não reaparecer no próximo click
            fileInput.value = '';
            return;
        }

        // validações básicas de tipo e tamanho
        const tiposValidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!tiposValidos.includes(file.type)) {
            notify.error(`Tipo de arquivo inválido: ${file.type}. Use PNG, JPG ou WebP.`);
            return;
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            notify.error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo 5MB.`);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('foto', file);
            const resp = await api.request(`/profissional/${profissionalData.id}/foto`, 'POST', formData, true);
            const novaUrl = resp.url || resp.photo_url || resp.foto_perfil || '';
            if (novaUrl) {
                profissionalData.foto_perfil = novaUrl;
                authState.setUser({ ...authState.getUser(), foto_perfil: novaUrl }, authState.getToken());
                // atualiza src da imagem exibida
                const imgEl = bannerElement.querySelector('.foto-perfil img');
                let newSrc = novaUrl;
                if (!newSrc.match(/^https?:\/\//) && !newSrc.startsWith('/')) {
                    const base = window.location.pathname.split('/').slice(0, 2).join('/');
                    newSrc = base + '/' + newSrc;
                }
                if (imgEl) imgEl.src = newSrc;
                notify.success('Foto atualizada com sucesso!');
            }
        } catch (err) {
            notify.error('Erro ao enviar foto: ' + (err.message || err));
            console.error('Erro upload foto perfil:', err);
        }
    });

    mainWrapper.appendChild(content);

    root.appendChild(mainWrapper);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());
}