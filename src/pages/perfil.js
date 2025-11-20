import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import authState from "../utils/AuthState.js";

export default function renderPerfilPage() {
    // Verifica se está autenticado
    if (!authState.isAuth()) {
        window.location.href = '/login';
        return;
    }

    const root = document.getElementById('root');
    root.innerHTML = '';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.minHeight = '100vh';
    root.style.width = '100%';
    root.style.boxSizing = 'border-box';
    root.style.backgroundColor = '#f5f5f5';

    // NavBar
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    const navbar = NavBar();
    nav.appendChild(navbar);

    // Container principal
    const mainContainer = document.createElement('div');
    mainContainer.className = 'd-flex';
    mainContainer.style.minHeight = 'calc(100vh - 200px)';
    mainContainer.style.padding = '20px';
    mainContainer.style.gap = '20px';

    // Sidebar esquerda
    const sidebar = document.createElement('div');
    sidebar.className = 'bg-white rounded shadow-sm';
    sidebar.style.width = '250px';
    sidebar.style.height = 'fit-content';
    sidebar.style.padding = '20px';
    sidebar.style.position = 'sticky';
    sidebar.style.top = '20px';

    const user = authState.getUser();
    const nomeCompleto = user?.nome || 'Usuário';
    const partesNome = nomeCompleto.split(' ');
    const nome = partesNome[0] || 'Usuário';
    const sobrenome = partesNome.slice(1).join(' ') || '';

    sidebar.innerHTML = `
        <div class="mb-4">
            <a href="home" class="text-decoration-none text-dark d-flex align-items-center mb-3">
                <i class="bi bi-arrow-left me-2"></i>
                <span>Voltar</span>
            </a>
        </div>
        <ul class="list-unstyled">
            <li class="mb-2">
                <a href="perfil" class="d-flex align-items-center p-2 rounded bg-light text-dark text-decoration-none">
                    <i class="bi bi-pencil me-2"></i>
                    <span>Editar perfil</span>
                </a>
            </li>
            <li class="mb-2">
                <a href="#" class="d-flex align-items-center p-2 rounded text-dark text-decoration-none">
                    <i class="bi bi-calendar me-2"></i>
                    <span>Agendas</span>
                </a>
            </li>
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

    // Conteúdo principal (formulário)
    const content = document.createElement('div');
    content.className = 'bg-white rounded shadow-sm flex-grow-1';
    content.style.padding = '30px';

    content.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Editar perfil</h2>
            <i class="bi bi-person-circle" style="font-size: 3rem; color: #ccc;"></i>
        </div>
        
        <form id="perfilForm">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="nome" class="form-label">Nome</label>
                    <input type="text" class="form-control" id="nome" value="${nome}" required>
                </div>
                <div class="col-md-6">
                    <label for="sobrenome" class="form-label">Sobrenome</label>
                    <input type="text" class="form-control" id="sobrenome" value="${sobrenome}" required>
                </div>
            </div>

            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <div class="input-group">
                    <input type="email" class="form-control" id="email" value="${user?.email || ''}" required>
                    <span class="input-group-text bg-success text-white">
                        <i class="bi bi-check-circle"></i>
                    </span>
                </div>
            </div>

            <div class="mb-3">
                <label for="endereco" class="form-label">Endereço</label>
                <input type="text" class="form-control" id="endereco" placeholder="Rua, número, bairro" value="">
            </div>

            <div class="mb-3">
                <label for="telefone" class="form-label">Número para contato</label>
                <input type="tel" class="form-control" id="telefone" placeholder="(00) 0000-0000" value="">
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="cidade" class="form-label">Cidade</label>
                    <select class="form-select" id="cidade">
                        <option value="">Selecione...</option>
                        <option value="Sorocaba" selected>Sorocaba</option>
                        <option value="São Paulo">São Paulo</option>
                        <option value="Campinas">Campinas</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="estado" class="form-label">Estado</label>
                    <select class="form-select" id="estado">
                        <option value="">Selecione...</option>
                        <option value="SP" selected>São Paulo</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="MG">Minas Gerais</option>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label for="senha" class="form-label">Senha</label>
                <div class="input-group">
                    <input type="password" class="form-control" id="senha" value="Senac123" required>
                    <span class="input-group-text bg-success text-white">
                        <i class="bi bi-check-circle"></i>
                    </span>
                </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" id="btnCancelar">Cancelar</button>
                <button type="submit" class="btn btn-dark" id="btnSalvar">Salvar alterações</button>
            </div>
        </form>
    `;

    // Event listeners
    const form = content.querySelector('#perfilForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Aqui você pode integrar com a API depois
        alert('Alterações salvas com sucesso!');
    });

    const btnCancelar = content.querySelector('#btnCancelar');
    btnCancelar.addEventListener('click', () => {
        window.location.href = '/home';
    });

    mainContainer.appendChild(sidebar);
    mainContainer.appendChild(content);
    root.appendChild(mainContainer);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = 'auto';
    const footer = Footer();
    footerContainer.appendChild(footer);
}

