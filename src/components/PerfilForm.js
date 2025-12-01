import authState from '../utils/AuthState.js';
import ApiService from '../utils/api.js';
 
export default function PerfilForm() {
    const content = document.createElement('div');
    content.className = 'bg-white rounded shadow-sm flex-grow-1';
    content.style.padding = '30px';
 
    const api = new ApiService();
    let cadastroCompleto = null;
 
    const user = authState.getUser();
    const nomeCompleto = user?.nome || 'Usuário';
    const partesNome = nomeCompleto.split(' ');
    const nome = partesNome[0] || 'Usuário';
    const sobrenome = partesNome.slice(1).join(' ') || '';
 
    // Função para carregar dados completos do usuário
    async function carregarDadosCompletos() {
        try {
            const cadastroId = authState.getCadastroId() || authState.getUser()?.id;
            if (!cadastroId) return;
           
            const cadastro = await api.buscarCadastro(cadastroId);
            if (!cadastro) return;
           
            cadastroCompleto = cadastro;
           
            // Atualiza campos do formulário
            const nomeInput = content.querySelector('#nome');
            const sobrenomeInput = content.querySelector('#sobrenome');
            const emailInput = content.querySelector('#email');
           
            if (nomeInput && sobrenomeInput && cadastro.nome) {
                const partesNome = cadastro.nome.split(' ');
                nomeInput.value = partesNome[0] || '';
                sobrenomeInput.value = partesNome.slice(1).join(' ') || '';
            }
           
            if (emailInput && cadastro.email) {
                emailInput.value = cadastro.email;
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
 
    content.innerHTML = `
    <link rel="stylesheet" href="css/perfil.css">
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
                    <input type="password" class="form-control" id="senha" placeholder="Deixe em branco para manter a senha atual">
                    </span>
                </div>
                <small class="form-text text-muted">Deixe em branco para manter a senha atual</small>
            </div>
 
            <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" id="btnCancelar">Cancelar</button>
                <button type="submit" class="btn btn-dark" id="btnSalvar" style=" background-color: #75b16e;">Salvar alterações</button>
            </div>
        </form>
    `;
 
    // Event listeners
    const form = content.querySelector('#perfilForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
       
        // Desabilita botão durante requisição
        const btnSalvar = content.querySelector('#btnSalvar');
        const textoOriginal = btnSalvar.textContent;
        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Salvando...';
       
        try {
            // Se não tiver cadastro completo ainda, tenta carregar
            if (!cadastroCompleto) {
                await carregarDadosCompletos();
            }
           
            // Verifica se tem ID do cadastro
            const cadastroId = cadastroCompleto?.id || authState.getCadastroId();
            if (!cadastroId) {
                throw new Error('ID do cadastro não encontrado. Faça login novamente.');
            }
           
            // Coleta dados do formulário
            const nomeCompleto = `${content.querySelector('#nome').value.trim()} ${content.querySelector('#sobrenome').value.trim()}`.trim();
            const email = content.querySelector('#email').value.trim();
            const senha = content.querySelector('#senha').value.trim();
           
            // Validações básicas
            if (!nomeCompleto || !email) {
                throw new Error('Nome e email são obrigatórios.');
            }
           
            // Busca tipo de usuário do authState
            const userType = authState.getUserType();
            const isProfissional = userType === 'profissional' ? 1 : 0;
           
            // Chama API para atualizar (senha é opcional - se vazia, mantém a atual)
            await api.atualizarCadastro(
                cadastroId,
                nomeCompleto,
                email,
                senha || '', // Envia string vazia se não preenchida
                isProfissional
            );
           
            // Atualiza authState e recarrega dados
            authState.setUser({ ...authState.getUser(), id: cadastroId, nome: nomeCompleto, email }, authState.getToken());
            await carregarDadosCompletos();
           
            // Mostra mensagem de sucesso
            const alertas = content.querySelectorAll('.alert');
            alertas.forEach(a => a.remove());
           
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success alert-dismissible fade show mt-3';
            successAlert.innerHTML = `
                <strong>Sucesso!</strong> Alterações salvas com sucesso!
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            form.insertAdjacentElement('afterend', successAlert);
            setTimeout(() => successAlert.remove(), 3000);
           
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
            console.error('Erro ao salvar perfil:', error);
        } finally {
            // Reabilita botão
            btnSalvar.disabled = false;
            btnSalvar.textContent = textoOriginal;
        }
    });
   
    // Carrega dados completos do usuário quando o formulário é criado
    carregarDadosCompletos();
 
    const btnCancelar = content.querySelector('#btnCancelar');
    btnCancelar.addEventListener('click', () => {
        window.location.href = '/home';
    });
 
    return content;
}
 
 