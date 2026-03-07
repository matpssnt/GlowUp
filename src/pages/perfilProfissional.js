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

    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    nav.appendChild(NavBar());

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

    // Busca informações na API usando o ID do profissional salvo no estado
    const api = new ApiService();
    if (typeof api.uploadBanner !== 'function') {
        api.uploadBanner = async function(idProfissional, file) {
            const formData = new FormData();
            formData.append('foto', file);
            return await this.request(`/profissional/${idProfissional}/banner`, 'POST', formData, true);
        };
        console.warn('Fallback: api.uploadBanner definido dinamicamente');
    }
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

    // Renderiza banner do profissional (permiteEdicao = true para editar descrição)
    const bannerElement = PerfilBanner(profissionalData, endereco, telefone, true);
    content.appendChild(bannerElement);

    // foto de perfil
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    bannerElement.appendChild(fileInput);

    const fotoContainer = bannerElement.querySelector('.foto-perfil');
    if (fotoContainer) {
        fotoContainer.style.position = 'relative';
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'edit-photo-btn';
        editBtn.innerHTML = '<i class="bi bi-camera"></i>';
        fotoContainer.appendChild(editBtn);
        editBtn.addEventListener('click', () => fileInput.click());
        fotoContainer.addEventListener('click', () => fileInput.click());
    }

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        const confirmar = window.confirm('Deseja realmente alterar sua foto de perfil?');
        if (!confirmar) { fileInput.value = ''; return; }
        // validações
        const tiposValidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!tiposValidos.includes(file.type)) { notify.error(`Tipo de arquivo inválido: ${file.type}. Use PNG, JPG ou WebP.`); return; }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) { notify.error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo 5MB.`); return; }
        try {
            const formData = new FormData();
            formData.append('foto', file);
            const resp = await api.request(`/profissional/${profissionalData.id}/foto`, 'POST', formData, true);
            const novaUrl = resp.url || resp.photo_url || resp.foto_perfil || '';
            if (novaUrl) {
                profissionalData.foto_perfil = novaUrl;
                authState.setUser({ ...authState.getUser(), foto_perfil: novaUrl }, authState.getToken());
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

    //banner
    const bannerInput = document.createElement('input');
    bannerInput.type = 'file';
    bannerInput.accept = 'image/*';
    bannerInput.style.display = 'none';

    const bannerCard = bannerElement.querySelector('.perfil-banner-card') || bannerElement;
    bannerCard.appendChild(bannerInput);

    // cria botão de edição do banner dentro do cartão
    const bannerBtn = document.createElement('button');
    bannerBtn.type = 'button';
    bannerBtn.className = 'edit-banner-btn';
    bannerBtn.title = 'Alterar banner';
    // ícone de edicao no banner
    bannerBtn.innerHTML = '<i class="bi bi-pencil-fill"></i>';
    bannerCard.style.position = 'relative';
    bannerCard.appendChild(bannerBtn);

    // permitir clique na imagem também
    const bannerImg = bannerCard.querySelector('.banner-img');
    if (bannerImg) {
        bannerImg.style.cursor = 'pointer';
        bannerImg.addEventListener('click', () => bannerInput.click());
    }
    bannerBtn.addEventListener('click', () => bannerInput.click());

    bannerInput.addEventListener('change', async () => {
        const file = bannerInput.files[0];
        if (!file) return;
        const confirmar = window.confirm('Deseja realmente alterar o banner?');
        if (!confirmar) { bannerInput.value = ''; return; }
        const tiposValidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!tiposValidos.includes(file.type)) { notify.error(`Tipo de arquivo inválido: ${file.type}`); return; }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) { notify.error('Imagem muito grande (máx 5MB)'); return; }
        try {
            if (typeof api.uploadBanner !== 'function') {
                console.error('API service instance:', api);
                throw new Error('uploadBanner method não disponível (talvez você precise recarregar a página para atualizar o script).');
            }
            const formData = new FormData();
            formData.append('foto', file);
            const resp = await api.uploadBanner(profissionalData.id, file);
            const novaUrl = resp.url || resp.banner_url || resp.foto_banner || '';
            if (novaUrl) {
                profissionalData.foto_banner = novaUrl;
                authState.setUser({ ...authState.getUser(), foto_banner: novaUrl }, authState.getToken());
                // atualizar na tela
                let bannerSrc = novaUrl;
                if (!bannerSrc.match(/^https?:\/\//) && !bannerSrc.startsWith('/')) {
                    const base = window.location.pathname.split('/').slice(0, 2).join('/');
                    bannerSrc = base + '/' + bannerSrc;
                }
                if (bannerImg) bannerImg.src = bannerSrc;
                notify.success('Banner atualizado com sucesso!');
            } else {
                if (resp && resp.message) {
                    notify.error('Falha no upload: ' + resp.message);
                } else {
                    notify.error('Falha ao atualizar banner. Veja console para detalhes.');
                }
            }
        } catch (err) {
            notify.error('Erro ao enviar banner: ' + (err.message || err));
            console.error('Erro upload banner:', err);
        }
    });

    // Edição da descrição
    const editDescricaoBtn = bannerElement.querySelector('.edit-descricao-btn');
    const descricaoContainer = bannerElement.querySelector('.description');
    if (editDescricaoBtn && descricaoContainer) {
        editDescricaoBtn.addEventListener('click', () => {
            const descricaoTexto = descricaoContainer.querySelector('.descricao-texto');
            const textareaWrapper = descricaoContainer.querySelector('.descricao-edit-wrapper');
            if (textareaWrapper) return; // já está em modo edição

            const textoAtual = profissionalData.descricao || '';
            const wrap = document.createElement('div');
            wrap.className = 'descricao-edit-wrapper';
            const textarea = document.createElement('textarea');
            textarea.className = 'form-control mb-2';
            textarea.rows = 4;
            textarea.maxLength = 255;
            textarea.placeholder = 'Descreva seu estabelecimento...';
            textarea.value = textoAtual;
            const botoesDiv = document.createElement('div');
            botoesDiv.className = 'd-flex gap-2';
            const btnSalvar = document.createElement('button');
            btnSalvar.type = 'button';
            btnSalvar.className = 'btn btn-sm btn-success btn-salvar-descricao';
            btnSalvar.textContent = 'Salvar';
            const btnCancelar = document.createElement('button');
            btnCancelar.type = 'button';
            btnCancelar.className = 'btn btn-sm btn-outline-secondary btn-cancelar-descricao';
            btnCancelar.textContent = 'Cancelar';
            botoesDiv.appendChild(btnSalvar);
            botoesDiv.appendChild(btnCancelar);
            wrap.appendChild(textarea);
            wrap.appendChild(botoesDiv);
            descricaoTexto.style.display = 'none';
            descricaoContainer.appendChild(wrap);

            const sairModoEdicao = () => {
                wrap.remove();
                descricaoTexto.style.display = '';
            };

            btnCancelar.addEventListener('click', sairModoEdicao);

            btnSalvar.addEventListener('click', async () => {
                const novaDescricao = textarea.value.trim();
                const dadosProf = {
                    nome: profissionalData.nome,
                    email: profissionalData.email,
                    descricao: novaDescricao || profissionalData.descricao || '',
                    acessibilidade: profissionalData.acessibilidade ?? 0,
                    isJuridica: profissionalData.isJuridica ?? 0,
                    id_cadastro_fk: profissionalData.id_cadastro_fk
                };
                if (profissionalData.isJuridica == 1) {
                    dadosProf.cnpj = profissionalData.cnpj || '';
                } else {
                    dadosProf.cpf = profissionalData.cpf || '';
                }
                try {
                    btnSalvar.disabled = true;
                    btnSalvar.textContent = 'Salvando...';
                    await api.atualizarProfissional(profissionalData.id, dadosProf);
                    profissionalData.descricao = novaDescricao;
                    descricaoTexto.textContent = novaDescricao || 'Especialista em estética e beleza';
                    sairModoEdicao();
                    notify.success('Descrição atualizada com sucesso!');
                } catch (err) {
                    notify.error('Erro ao salvar: ' + (err.message || err));
                    btnSalvar.disabled = false;
                    btnSalvar.textContent = 'Salvar';
                }
            });
        });
    }

    mainWrapper.appendChild(content);

    root.appendChild(mainWrapper);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());
}