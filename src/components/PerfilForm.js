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
    const userType = authState.getUserType();
    const isProfissional = userType === 'profissional';

    const nomeCompleto = user?.nome || 'Usuário';
    const partesNome = nomeCompleto.split(' ');
    const nome = partesNome[0] || 'Usuário';
    const sobrenome = partesNome.slice(1).join(' ') || '';

    // Função para carregar dados completos do usuário
    async function carregarDadosCompletos() {
        try {
            const cadastroId = authState.getCadastroId() || authState.getUser()?.id;
            if (!cadastroId) return;

            // Carrega cadastro básico (comum a todos)
            const cadastro = await api.buscarCadastro(cadastroId);
            if (!cadastro) return;
            cadastroCompleto = cadastro;

            // Só carrega endereço e telefone se for profissional
            if (isProfissional) {
                try {
                    enderecoData = await api.buscarEnderecoPorCadastro(cadastroId);
                } catch (error) {
                    console.warn('Erro ao carregar endereço:', error);
                }

                try {
                    const profissional = await api.buscarProfissionalPorCadastro(cadastroId);
                    if (profissional && profissional.id) {
                        telefoneData = await api.buscarTelefonePorProfissional(profissional.id);
                    }
                } catch (error) {
                    console.warn('Erro ao carregar telefone:', error);
                }
            }

            // Preenche campos comuns (sempre existem)
            const nomeInput = content.querySelector('#nome');
            const sobrenomeInput = content.querySelector('#sobrenome');
            const emailInput = content.querySelector('#email');

            if (nomeInput && sobrenomeInput && cadastro.nome) {
                const partes = cadastro.nome.split(' ');
                nomeInput.value = partes[0] || '';
                sobrenomeInput.value = partes.slice(1).join(' ') || '';
            }

            if (emailInput && cadastro.email) {
                emailInput.value = cadastro.email;
            }

            // Preenche apenas se for profissional e os campos existirem
            if (isProfissional) {
                const cepInput = content.querySelector('#cep');
                const cidadeInput = content.querySelector('#cidade');
                const bairroInput = content.querySelector('#bairro');
                const ruaInput = content.querySelector('#rua');
                const numeroInput = content.querySelector('#numero');
                const complementoInput = content.querySelector('#complemento');
                const estadoInput = content.querySelector('#estado');
                const telefoneInput = content.querySelector('#telefone');

                if (enderecoData) {
                    if (cidadeInput) cidadeInput.value = enderecoData.cidade || '';
                    if (bairroInput) bairroInput.value = enderecoData.bairro || '';
                    if (ruaInput) ruaInput.value = enderecoData.rua || '';
                    if (numeroInput) numeroInput.value = enderecoData.numero || '';
                    if (cepInput) cepInput.value = enderecoData.cep || '';
                    if (complementoInput) complementoInput.value = enderecoData.complemento || '';
                    if (estadoInput) estadoInput.value = enderecoData.estado || '';
                }

                if (telefoneInput && telefoneData) {
                    const telefoneFormatado = telefoneData.ddd && telefoneData.digitos
                        ? `(${telefoneData.ddd}) ${telefoneData.digitos}`
                        : '';
                    telefoneInput.value = telefoneFormatado;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados completos:', error);
        }
    }

    // HTML condicional: endereço e telefone só para profissionais
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
                <input type="email" class="form-control" id="email" value="${user?.email || ''}" required>
            </div>

            ${isProfissional ? `
                <div class="mb-4">
                    <h5 class="mb-3">Endereço</h5>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="cep" class="form-label">CEP</label>
                            <input type="text" class="form-control" id="cep" placeholder="00000-000" value="">
                        </div>
                    </div>
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
                        <div class="col-md-6">
                            <label for="numero" class="form-label">Número</label>
                            <input type="text" class="form-control" id="numero" placeholder="Número" value="">
                        </div>
                        <div class="col-md-6">
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
                    <input type="tel" class="form-control" id="telefone" placeholder="(00) 00000-0000" value="">
                </div>
            ` : `
            `}

            <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" id="btnCancelar">Cancelar</button>
                <button type="submit" class="btn btn-dark" id="btnSalvar" style="background-color: #75b16e;">Salvar alterações</button>
            </div>
        </form>
    `;

    // Event listeners
    const form = content.querySelector('#perfilForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSalvar = content.querySelector('#btnSalvar');
        const textoOriginal = btnSalvar.textContent;
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Salvando...';

        const loadingElement = Loading({
            size: 'small',
            variant: 'spinner',
            context: 'inline',
            message: 'Salvando alterações...'
        });
        form.insertAdjacentElement('afterend', loadingElement);

        try {
            if (!cadastroCompleto) {
                await carregarDadosCompletos();
            }

            const cadastroId = cadastroCompleto?.id || authState.getCadastroId();
            if (!cadastroId) {
                throw new Error('ID do cadastro não encontrado. Faça login novamente.');
            }

            const nomeCompleto = `${content.querySelector('#nome')?.value.trim() || ''} ${content.querySelector('#sobrenome')?.value.trim() || ''}`.trim();
            const email = content.querySelector('#email')?.value.trim() || '';

            // Campos condicionais
            let telefone = '';
            let cidade = '', bairro = '', rua = '', numero = '', cep = '', complemento = '', estado = '';

            if (isProfissional) {
                telefone = content.querySelector('#telefone')?.value.replace(/\D/g, '') || '';
                cidade = content.querySelector('#cidade')?.value.trim() || '';
                bairro = content.querySelector('#bairro')?.value.trim() || '';
                rua = content.querySelector('#rua')?.value.trim() || '';
                numero = content.querySelector('#numero')?.value.trim() || '';
                cep = content.querySelector('#cep')?.value.replace(/\D/g, '') || '';
                complemento = content.querySelector('#complemento')?.value.trim() || '';
                estado = content.querySelector('#estado')?.value.trim() || '';
            }

            if (!nomeCompleto || !email) {
                throw new Error('Nome e email são obrigatórios.');
            }

            const isProfissionalFlag = isProfissional ? 1 : 0;

            await api.atualizarCadastro(
                cadastroId,
                nomeCompleto,
                email,
                '', // senha (deixando vazio por enquanto – se quiser adicionar campo senha, ajuste aqui)
                isProfissionalFlag
            );

            // Atualiza authState
            authState.setUser({ ...authState.getUser(), id: cadastroId, nome: nomeCompleto, email }, authState.getToken());

            // Recarrega dados
            await carregarDadosCompletos();

            notify.success('Alterações salvas com sucesso!');
        } catch (error) {
            notify.error('Erro ao salvar: ' + (error.message || 'Tente novamente'));
            console.error('Erro ao salvar perfil:', error);
        } finally {
            if (loadingElement && loadingElement.parentElement) {
                loadingElement.remove();
            }
            btnSalvar.disabled = false;
            btnSalvar.textContent = textoOriginal;
        }
    });

    // Máscaras e busca de CEP (só se os campos existirem)
    const telefoneInput = content.querySelector('#telefone');
    if (telefoneInput) {
        addMaskToInput(telefoneInput, 'telefone');
    }

    const cepInput = content.querySelector('#cep');
    if (cepInput) {
        addMaskToInput(cepInput, 'cep');

        let timeoutId = null;

        const buscarCep = async () => {
            const cepValue = cepInput.value.trim().replace(/\D/g, '');
            if (cepValue.length !== 8) return;

            try {
                const campos = {
                    city: 'cidade',
                    neighborhood: 'bairro',
                    street: 'rua',
                    state: 'estado'
                };

                await CepAPI.buscarEPreencher(cepValue, campos, {
                    success: (dados) => {
                        cepInput.value = CepAPI.formatarCep(cepValue);
                        const campoNumero = content.querySelector('#numero');
                        if (campoNumero) campoNumero.focus();
                    },
                    error: (err) => notify.error('Erro ao buscar CEP: ' + err.message)
                });
            } catch (error) {
                notify.error('Erro na busca do CEP: ' + error.message);
            }
        };

        cepInput.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 8) valor = valor.substring(0, 8);
            if (valor.length > 5) valor = valor.replace(/(\d{5})(\d{3})/, '$1-$2');
            e.target.value = valor;

            clearTimeout(timeoutId);
            if (valor.length === 8) {
                timeoutId = setTimeout(buscarCep, 800);
            }
        });

        cepInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarCep();
            }
        });

        cepInput.addEventListener('paste', () => {
            setTimeout(() => {
                const valor = cepInput.value.replace(/\D/g, '');
                if (valor.length === 8) buscarCep();
            }, 100);
        });
    }

    // Carrega dados ao montar
    carregarDadosCompletos();

    // Botão Cancelar
    const btnCancelar = content.querySelector('#btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = '/home';
        });
    }

    return content;
}