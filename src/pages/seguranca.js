import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";
import { notify } from "../components/Notification.js";
import { handleError } from "../utils/errorHandler.js";

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'src/css/dashboard.css';
document.head.appendChild(link);

export default function renderSegurancaPage() {
    if (!authState.isAuth()) { window.location.href = '/login'; return; }

    const root = document.getElementById('root');
    root.innerHTML = '';
    root.style = '';
    root.className = 'dashboard-wrapper';

    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    nav.appendChild(NavBar());

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content-wrapper';
    mainWrapper.appendChild(PerfilSidebar());

    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';

    const card = document.createElement('div');
    card.className = 'content-card';
    card.innerHTML = `
        <div class="card-header-custom">
            <h5 class="card-title-custom">Privacidade e Segurança</h5>
        </div>
        <div class="p-4">
            <form id="formTrocarSenha" class="row g-3" autocomplete="off">
                <div class="col-12">
                    <label class="form-label">Senha antiga</label>
                    <input type="password" class="form-control" name="senha_antiga" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Nova senha</label>
                    <input type="password" class="form-control" name="senha_nova" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Confirme a nova senha</label>
                    <input type="password" class="form-control" name="senha_confirmacao" required>
                </div>
                <div class="col-12 d-flex justify-content-end gap-2 mt-3">
                    <button type="submit" class="btn btn-primary-custom">Salvar</button>
                </div>
            </form>
        </div>
    `;

    contentArea.appendChild(card);
    mainWrapper.appendChild(contentArea);
    root.appendChild(mainWrapper);

    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());

    const api = new ApiService();
    const form = card.querySelector('#formTrocarSenha');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const senhaAntiga = form.senha_antiga.value;
        const senhaNova = form.senha_nova.value;
        const confirmacao = form.senha_confirmacao.value;

        if (senhaNova !== confirmacao) {
            notify.warning('As senhas não coincidem');
            return;
        }

        const cadastroId = authState.getCadastroId() || authState.getUser()?.id;
        if (!cadastroId) {
            notify.error('ID do cadastro não encontrado. Faça login novamente.');
            return;
        }

        try {
            await api.trocarSenha(cadastroId, senhaAntiga, senhaNova);
            notify.success('Senha atualizada com sucesso!');
            form.reset();
        } catch (error) {
            handleError(error, 'Segurança');
        }
    });
}
