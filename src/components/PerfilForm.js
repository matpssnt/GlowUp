import authState from '../utils/AuthState.js';
import ApiService from '../utils/api.js';
import { notify } from './Notification.js';
import Loading from './Loading.js';
import { addMaskToInput } from '../utils/validation.js';

export default function PerfilForm() {
    const content = document.createElement('div');
    content.className = 'bg-white rounded shadow-sm flex-grow-1';
    content.style.padding = '30px';

    const api = new ApiService();
    let cadastroCompleto = null;
    let enderecoData = null;
    let telefoneData = null;

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
           
            // Carrega cadastro
            const cadastro = await api.buscarCadastro(cadastroId);
            if (!cadastro) return;
            cadastroCompleto = cadastro;
           
            // Carrega endereço (tenta buscar por cadastro)
            try {
                enderecoData = await api.buscarEnderecoPorCadastro(cadastroId);
            } catch (error) {
                console.warn('Erro ao carregar endereço:', error);
            }
           
            // Carrega telefone se for profissional
            const userType = authState.getUserType();
            if (userType === 'profissional') {
                try {
                    const profissional = await api.buscarProfissionalPorCadastro(cadastroId);
                    if (profissional && profissional.id) {
                        telefoneData = await api.buscarTelefonePorProfissional(profissional.id);
                    }
                } catch (error) {
                    console.warn('Erro ao carregar telefone:', error);
                }
            }
           
            // Atualiza campos do formulário
            const nomeInput = content.querySelector('#nome');
            const sobrenomeInput = content.querySelector('#sobrenome');
            const emailInput = content.querySelector('#email');
            const telefoneInput = content.querySelector('#telefone');
           
            if (nomeInput && sobrenomeInput && cadastro.nome) {
                const partesNome = cadastro.nome.split(' ');
                nomeInput.value = partesNome[0] || '';
                sobrenomeInput.value = partesNome.slice(1).join(' ') || '';
            }
           
            if (emailInput && cadastro.email) {
                emailInput.value = cadastro.email;
            }
           
            // Preenche telefone se disponível
            if (telefoneInput && telefoneData) {
                const telefoneFormatado = telefoneData.ddd && telefoneData.digitos 
                    ? `(${telefoneData.ddd}) ${telefoneData.digitos}`
                    : '';
                telefoneInput.value = telefoneFormatado;
            }
        } catch (error) {
            // console.error('Erro ao carregar dados:', error);
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
                <label for="telefone" class="form-label">Número para contato</label>
                <input type="tel" class="form-control" id="telefone" placeholder="(00) 00000-0000" value="">
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
       
        // Desabilita botão durante requisição e mostra loading
        const btnSalvar = content.querySelector('#btnSalvar');
        const textoOriginal = btnSalvar.textContent;
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Salvando...';
       
        // Adiciona loading no formulário
        const loadingElement = Loading({ 
            size: 'small', 
            variant: 'spinner', 
            context: 'inline',
            message: 'Salvando alterações...'
        });
        form.insertAdjacentElement('afterend', loadingElement);
       
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
            const telefone = content.querySelector('#telefone').value.replace(/\D/g, '');
           
            // Validações básicas
            if (!nomeCompleto || !email) {
                throw new Error('Nome e email são obrigatórios.');
            }
           
            // Busca tipo de usuário do authState
            const userType = authState.getUserType();
            const isProfissional = userType === 'profissional' ? 1 : 0;
           
            await api.atualizarCadastro(
                cadastroId,
                nomeCompleto,
                email,
                senha || '', // Envia string vazia se não preenchida
                isProfissional
            );
           
            // Atualiza authState
            authState.setUser({ ...authState.getUser(), id: cadastroId, nome: nomeCompleto, email }, authState.getToken());
            
            // Recarrega dados
            await carregarDadosCompletos();
           
            // Remove loading
            if (loadingElement && loadingElement.parentElement) {
                loadingElement.remove();
            }
           
            // Mostra mensagem de sucesso
            notify.success('Alterações salvas com sucesso!');
           
        } catch (error) {
            // Remove loading em caso de erro
            if (loadingElement && loadingElement.parentElement) {
                loadingElement.remove();
            }
            
            notify.error('Erro ao salvar: ' + error.message);
            // console.error('Erro ao salvar perfil:', error);
        } finally {
            // Reabilita botão
            btnSalvar.disabled = false;
            btnSalvar.textContent = textoOriginal;
        }
    });
   
    // Adiciona máscaras
    const telefoneInput = content.querySelector('#telefone');
    if (telefoneInput) {
        addMaskToInput(telefoneInput, 'telefone');
    }

    // Carrega dados completos do usuário quando o formulário é criado
    carregarDadosCompletos();

    const btnCancelar = content.querySelector('#btnCancelar');
    btnCancelar.addEventListener('click', () => {
        window.location.href = '/home';
    });

    return content;
}
 
 