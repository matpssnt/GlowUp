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

export default function renderConfiguracoesLojaPage() {
    if (!authState.isAuth()) { window.location.href = '/login'; return; }
    if (authState.getUserType() !== 'profissional') { window.location.href = '/home'; return; }

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

    const header = document.createElement('div');
    header.className = 'mb-3';
    header.innerHTML = `
        <h1 class="h3 fw-bold text-dark mb-1">Configurações da Loja</h1>
        <p class="text-muted">Configure nome, contato e endereço do estabelecimento.</p>
    `;

    const cardEscala = document.createElement('div');
    cardEscala.className = 'content-card mt-4';
    cardEscala.innerHTML = `
        <div class="card-header-custom">
            <h5 class="card-title-custom">Escala semanal (abertura e fechamento)</h5>
        </div>
        <div class="p-4">
            <form id="formEscala" class="row g-3">
                <div class="col-12">
                    <div class="table-responsive">
                        <table class="table align-middle">
                            <thead>
                                <tr>
                                    <th style="width: 30%">Dia</th>
                                    <th style="width: 25%">Abre</th>
                                    <th style="width: 25%">Fecha</th>
                                    <th style="width: 20%"></th>
                                </tr>
                            </thead>
                            <tbody id="escalaRows"></tbody>
                        </table>
                    </div>
                </div>
                <div class="col-12 d-flex justify-content-end gap-2">
                    <button type="submit" class="btn btn-primary-custom" id="btnSalvarEscala">Salvar escala</button>
                </div>
            </form>
        </div>
    `;

    const card = document.createElement('div');
    card.className = 'content-card';
    card.innerHTML = `
        <div class="card-header-custom">
            <h5 class="card-title-custom">Dados do estabelecimento</h5>
        </div>
        <div class="p-4">
            <form id="formLoja" class="row g-3">
                <div class="col-12">
                    <label class="form-label">Nome do estabelecimento</label>
                    <input class="form-control" name="nome" required>
                </div>

                <div class="col-md-4">
                    <label class="form-label">DDD</label>
                    <input class="form-control" name="ddd" placeholder="11">
                </div>
                <div class="col-md-8">
                    <label class="form-label">Número para contato</label>
                    <input class="form-control" name="digitos" placeholder="99999-9999">
                </div>

                <div class="col-md-6">
                    <label class="form-label">CEP</label>
                    <input class="form-control" name="cep">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Estado</label>
                    <input class="form-control" name="estado">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Cidade</label>
                    <input class="form-control" name="cidade">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Bairro</label>
                    <input class="form-control" name="bairro">
                </div>
                <div class="col-md-8">
                    <label class="form-label">Rua</label>
                    <input class="form-control" name="rua">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Número</label>
                    <input class="form-control" name="numero">
                </div>
                <div class="col-12">
                    <label class="form-label">Complemento</label>
                    <input class="form-control" name="complemento">
                </div>

                <div class="col-12 d-flex justify-content-end gap-2 mt-3">
                    <button type="submit" class="btn btn-primary-custom">Salvar</button>
                </div>
            </form>
        </div>
    `;

    contentArea.appendChild(header);
    contentArea.appendChild(card);
    contentArea.appendChild(cardEscala);
    mainWrapper.appendChild(contentArea);
    root.appendChild(mainWrapper);

    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());

    const api = new ApiService();
    const form = card.querySelector('#formLoja');
    const formEscala = cardEscala.querySelector('#formEscala');
    const escalaRows = cardEscala.querySelector('#escalaRows');
    const btnSalvarEscala = cardEscala.querySelector('#btnSalvarEscala');

    let profissional = null;
    let endereco = null;
    let telefone = null;
    let telProfRel = null;
    let escalas = [];

    async function carregar() {
        try {
            const cadastroId = authState.getCadastroId() || authState.getUser()?.id;
            profissional = await api.buscarProfissionalPorCadastro(cadastroId);

            if (!profissional || !profissional.id) {
                notify.warning('Perfil profissional não encontrado.');
                return;
            }

            endereco = await api.buscarEnderecoPorProfissional(profissional.id);
            telefone = await api.buscarTelefonePorProfissional(profissional.id);

            escalas = await api.buscarEscalasProfissional(profissional.id);
            renderEscala();

            // Preenche form
            form.nome.value = profissional.nome || '';
            form.ddd.value = telefone?.ddd || '';
            form.digitos.value = telefone?.digitos || '';

            form.cep.value = endereco?.cep || '';
            form.estado.value = endereco?.estado || '';
            form.cidade.value = endereco?.cidade || '';
            form.bairro.value = endereco?.bairro || '';
            form.rua.value = endereco?.rua || '';
            form.numero.value = endereco?.numero || '';
            form.complemento.value = endereco?.complemento || '';
        } catch (error) {
            handleError(error, 'Configurações da Loja');
        }
    }

    function extrairHora(valor) {
        if (!valor) return '';
        const s = String(valor);
        if (s.includes(' ')) return s.split(' ')[1].substring(0, 8);
        if (s.includes('T')) return s.split('T')[1].substring(0, 8);
        return s.substring(0, 8);
    }

    function renderEscala() {

    const dias = [
        { id: 0, label: 'Domingo' },
        { id: 1, label: 'Segunda' },
        { id: 2, label: 'Terça' },
        { id: 3, label: 'Quarta' },
        { id: 4, label: 'Quinta' },
        { id: 5, label: 'Sexta' },
        { id: 6, label: 'Sábado' }
    ];

    escalaRows.innerHTML = '';

    dias.forEach(d => {
        const existente = Array.isArray(escalas)
            ? escalas.find(e => String(e.dia_semana) === String(d.id))
            : null;

        const tr = document.createElement('tr');
        tr.dataset.dia = d.id;

        if (existente && existente.id) {
            tr.dataset.escalaId = existente.id;
        }

        const inicio = extrairHora(existente?.inicio);
        const fim = extrairHora(existente?.fim);

        tr.innerHTML = `
            <td><strong>${d.label}</strong></td>
            <td>
                <input type="time" step="60" class="form-control" name="inicio_${d.id}" value="${inicio}">
            </td>
            <td>
                <input type="time" step="60" class="form-control" name="fim_${d.id}" value="${fim}">
            </td>
            <td class="text-end">
                <button type="button" class="btn btn-outline-danger btn-sm" data-action="limpar">Limpar</button>
            </td>
        `;

        const inputInicio = tr.querySelector(`input[name="inicio_${d.id}"]`);
        const inputFim = tr.querySelector(`input[name="fim_${d.id}"]`);
        const btnLimpar = tr.querySelector('[data-action="limpar"]');

        // 🔒 Ajusta o mínimo do fechamento ao carregar
        if (inicio) {
            inputFim.min = inicio;
        }

        // 🔥 Se vier inválido do banco (fim menor ou igual início), limpa
        if (inicio && fim && fim <= inicio) {
            inputFim.value = '';
        }

        // 🔁 Quando alterar a abertura
        inputInicio.addEventListener('change', () => {
            if (inputInicio.value) {
                inputFim.min = inputInicio.value;

                if (inputFim.value && inputFim.value <= inputInicio.value) {
                    inputFim.value = '';
                }
            } else {
                inputFim.min = '';
            }
        });

        // 🧹 Botão limpar
        btnLimpar.addEventListener('click', () => {
            inputInicio.value = '';
            inputFim.value = '';
            inputFim.min = '';
        });

        escalaRows.appendChild(tr);
    });
}


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!profissional || !profissional.id) {
            notify.error('Profissional não carregado');
            return;
        }

        try {
            // Atualiza profissional (somente nome/descricao/email já existem, mas endpoint exige mais campos hoje)
            // Sem alterar banco, vamos manter o nome do profissional como está no cadastro e aqui apenas atualizar endereço/telefone.

            // Endereço
            const enderecoPayload = {
                rua: form.rua.value,
                numero: form.numero.value,
                cep: form.cep.value,
                bairro: form.bairro.value,
                cidade: form.cidade.value,
                estado: form.estado.value,
                complemento: form.complemento.value,
                id_profissional_fk: profissional.id
            };

            if (endereco && endereco.id) {
                await api.atualizarEndereco(endereco.id, enderecoPayload);
            } else {
                await api.criarEndereco(enderecoPayload);
            }

            // Telefone: criar/atualizar telefone e relação tel_prof
            const ddd = String(form.ddd.value || '').trim();
            const digitos = String(form.digitos.value || '').trim();

            if (ddd && digitos) {
                if (telefone && telefone.id) {
                    await api.atualizarTelefone(telefone.id, ddd, digitos);
                } else {
                    // cria telefone
                    const resp = await api.criarTelefone(ddd, digitos);
                    const idTelefone = resp?.id;
                    if (idTelefone) {
                        await api.request('/telProf', 'POST', { id_profissional_fk: profissional.id, id_telefone_fk: idTelefone });
                    }
                }
            }

            notify.success('Configurações salvas!');
            await carregar();
        } catch (error) {
            handleError(error, 'Salvar Config Loja');
        }
    });

    formEscala.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!profissional || !profissional.id) {
            notify.error('Profissional não carregado');
            return;
        }

        btnSalvarEscala.disabled = true;

        try {
            const rows = Array.from(escalaRows.querySelectorAll('tr'));

            for (const row of rows) {
                const dia = Number(row.dataset.dia);
                const escalaId = row.dataset.escalaId ? Number(row.dataset.escalaId) : null;
                const inicio = row.querySelector(`input[name="inicio_${dia}"]`).value;
                const fim = row.querySelector(`input[name="fim_${dia}"]`).value;

                if (!inicio || !fim) {
                    if (escalaId) {
                        await api.deletarEscala(escalaId);
                    }
                    continue;
                }

                if (inicio >= fim) {
                    notify.warning('A hora de abertura deve ser menor que a de fechamento');
                    return;
                }

                const payload = {
                    dia_semana: dia,
                    hora_inicio: inicio,
                    hora_fim: fim,
                    id_profissional_fk: profissional.id
                };

                if (escalaId) {
                    await api.atualizarEscala(escalaId, payload);
                } else {
                    await api.criarEscala(payload);
                }
            }

            notify.success('Escala salva!');
            escalas = await api.buscarEscalasProfissional(profissional.id);
            renderEscala();
        } catch (error) {
            handleError(error, 'Salvar Escala');
        } finally {
            btnSalvarEscala.disabled = false;
        }
    });

    carregar();
}
