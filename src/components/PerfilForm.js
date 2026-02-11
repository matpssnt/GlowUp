import authState from '../utils/AuthState.js';
import ApiService from '../utils/api.js';
import { notify } from './Notification.js';
import Loading from './Loading.js';
import { addMaskToInput } from '../utils/validation.js';
import CepAPI from '../utils/cepAPI.js';
 
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
            const cidadeInput = content.querySelector('#cidade');
            const bairroInput = content.querySelector('#bairro');
            const ruaInput = content.querySelector('#rua');
            const numeroInput = content.querySelector('#numero');
            const cepInput = content.querySelector('#cep');
            const complementoInput = content.querySelector('#complemento');
            const estadoInput = content.querySelector('#estado');
           
            if (nomeInput && sobrenomeInput && cadastro.nome) {
                const partesNome = cadastro.nome.split(' ');
                nomeInput.value = partesNome[0] || '';
                sobrenomeInput.value = partesNome.slice(1).join(' ') || '';
            }
           
            if (emailInput && cadastro.email) {
                emailInput.value = cadastro.email;
            }
           
            // Preenche endereço separado se disponível
            if (enderecoData) {
                if (cidadeInput && enderecoData.cidade) {
                    cidadeInput.value = enderecoData.cidade || '';
                }
                if (bairroInput && enderecoData.bairro) {
                    bairroInput.value = enderecoData.bairro || '';
                }
                if (ruaInput && enderecoData.rua) {
                    ruaInput.value = enderecoData.rua || '';
                }
                if (numeroInput && enderecoData.numero) {
                    numeroInput.value = enderecoData.numero || '';
                }
                if (cepInput && enderecoData.cep) {
                    cepInput.value = enderecoData.cep || '';
                }
                if (complementoInput && enderecoData.complemento) {
                    complementoInput.value = enderecoData.complemento || '';
                }
                if (estadoInput && enderecoData.estado) {
                    estadoInput.value = enderecoData.estado || '';
                }
            }
           
            // Preenche telefone se disponível
            if (telefoneInput && telefoneData) {
                const telefoneFormatado = telefoneData.ddd && telefoneData.digitos 
                    ? `(${telefoneData.ddd}) ${telefoneData.digitos}`
                    : '';
                telefoneInput.value = telefoneFormatado;
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
 
            <div class="mb-4">
                <h5 class="mb-3">Endereço</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="cidade" class="form-label">Cidade</label>
                        <input type="text" class="form-control" id="cidade" placeholder="Nome da cidade" value="">
                    </div>
                    <div class="col-md-6">
                        <label for="bairro" class="form-label">Bairro</label>
                        <input type="text" class="form-control" id="bairro" placeholder="Nome do bairro" value="">
                    </div>
                </div>

                <div class="mb-3">
                    <label for="rua" class="form-label">Rua</label>
                    <input type="text" class="form-control" id="rua" placeholder="Nome da rua" value="">
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="numero" class="form-label">Número</label>
                        <input type="text" class="form-control" id="numero" placeholder="Número" value="">
                    </div>
                    <div class="col-md-4">
                        <label for="cep" class="form-label">CEP</label>
                        <input type="text" class="form-control" id="cep" placeholder="00000-000" value="">
                    </div>
                    <div class="col-md-4">
                        <label for="complemento" class="form-label">Complemento</label>
                        <input type="text" class="form-control" id="complemento" placeholder="Apartamento, casa, etc." value="">
                    </div>
                </div>

                <div class="mb-3">
                    <label for="estado" class="form-label">Estado</label>
                    <input type="text" class="form-control" id="estado" placeholder="Estado" readonly style="background-color: #f8f9fa;" value="">
                </div>
            </div>

            <div class="mb-3">
                <label for="telefone" class="form-label">Número para contato</label>
                <input type="tel" class="form-control" id="telefone" placeholder="(00) 00000-0000 ou (00) 0000-0000" value="">
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
            const cidade = content.querySelector('#cidade').value.trim();
            const bairro = content.querySelector('#bairro').value.trim();
            const rua = content.querySelector('#rua').value.trim();
            const numero = content.querySelector('#numero').value.trim();
            const cep = content.querySelector('#cep').value.replace(/\D/g, '');
            const complemento = content.querySelector('#complemento').value.trim();
            const estado = content.querySelector('#estado').value.trim();
           
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
            console.error('Erro ao salvar perfil:', error);
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
    
    // Configura busca de CEP (igual ao formContRegister)
    const cepInput = content.querySelector('#cep');
    if (cepInput) {
        addMaskToInput(cepInput, 'cep');
        
        // Adiciona funcionalidade de busca automática de CEP
        let timeoutId = null;
        
        const buscarCep = async () => {
            const cep = cepInput.value.trim();
            
            if (!cep || cep.replace(/\D/g, '').length < 8) {
                return;
            }
            
            try {
                const campos = {
                    city: 'cidade',
                    neighborhood: 'bairro',
                    street: 'rua',
                    state: 'estado'
                };
                
                await CepAPI.buscarEPreencher(cep, campos, {
                    success: (dados) => {
                        cepInput.value = CepAPI.formatarCep(cep);
                        // Foca no próximo campo (número)
                        const campoNumero = content.querySelector('#numero');
                        if (campoNumero) {
                            campoNumero.focus();
                        }
                    },
                    error: (error) => {
                        notify.error('Erro ao buscar CEP: ' + error.message);
                    }
                });
            } catch (error) {
                notify.error('Erro na busca do CEP: ' + error.message);
            }
        };
        
        // Event listener para busca automática (após parar de digitar)
        cepInput.addEventListener('input', (e) => {
            // Remove caracteres não numéricos
            let valor = e.target.value.replace(/\D/g, '');
            
            // Limita a 8 dígitos
            if (valor.length > 8) {
                valor = valor.substring(0, 8);
            }
            
            // Formata enquanto digita
            if (valor.length > 5) {
                valor = valor.replace(/(\d{5})(\d{3})/, '$1-$2');
            }
            
            e.target.value = valor;
            
            // Cancela timeout anterior
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            // Busca automaticamente quando CEP estiver completo
            if (valor.replace(/\D/g, '').length === 8) {
                timeoutId = setTimeout(buscarCep, 800); // Aguarda parar de digitar
            }
        });
        
        // Event listener para Enter no campo CEP
        cepInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarCep();
            }
        });
        
        // Event listener para paste
        cepInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                const valor = e.target.value.replace(/\D/g, '');
                if (valor.length === 8) {
                    buscarCep();
                }
            }, 100);
        });
    }

    // Carrega dados completos do usuário quando o formulário é criado
    carregarDadosCompletos();

    const btnCancelar = content.querySelector('#btnCancelar');
    btnCancelar.addEventListener('click', () => {
        window.location.href = '/home';
    });

    return content;
}
 
 