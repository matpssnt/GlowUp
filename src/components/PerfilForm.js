import authState from '../utils/AuthState.js';

export default function PerfilForm() {
    const content = document.createElement('div');
    content.className = 'bg-white rounded shadow-sm flex-grow-1';
    content.style.padding = '30px';

    const user = authState.getUser();
    const nomeCompleto = user?.nome || 'Usuário';
    const partesNome = nomeCompleto.split(' ');
    const nome = partesNome[0] || 'Usuário';
    const sobrenome = partesNome.slice(1).join(' ') || '';

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

    return content;
}

