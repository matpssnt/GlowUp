import { applyVisualValidation, friendlyMessages } from "../utils/formValidation.js";

export default function renderFormProf(container) {

    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';
    formulario.id = 'formProf';

    // Container para nome
    const nomeContainer = document.createElement('div');
    nomeContainer.className = 'mb-3';
    const nomeLabel = document.createElement('label');
    nomeLabel.textContent = 'Nome do Estabelecimento *';
    nomeLabel.className = 'form-label';
    nomeLabel.setAttribute('for', 'nomeProf');
    const nome = document.createElement('input');
    nome.type = 'text';
    nome.id = 'nomeProf';
    nome.name = 'nome';
    nome.placeholder = "Nome do Estabelecimento";
    nome.className = 'form-control';
    nome.required = true;
    nomeContainer.appendChild(nomeLabel);
    nomeContainer.appendChild(nome);
    formulario.appendChild(nomeContainer);

    // Container para email
    const emailContainer = document.createElement('div');
    emailContainer.className = 'mb-3';
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'E-mail *';
    emailLabel.className = 'form-label';
    emailLabel.setAttribute('for', 'emailProf');
    const email = document.createElement('input');
    email.type = 'email';
    email.id = 'emailProf';
    email.name = 'email';
    email.placeholder = "Seu e-mail";
    email.className = 'form-control';
    email.required = true;
    emailContainer.appendChild(emailLabel);
    emailContainer.appendChild(email);
    formulario.appendChild(emailContainer);

    // Container para senha
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'mb-3';
    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Senha *';
    passwordLabel.className = 'form-label';
    passwordLabel.setAttribute('for', 'senhaProf');
    const password = document.createElement('input');
    password.type = 'password';
    password.id = 'senhaProf';
    password.name = 'senha';
    password.placeholder = "Sua senha (mínimo 6 caracteres)";
    password.className = 'form-control';
    password.required = true;
    passwordContainer.appendChild(passwordLabel);
    passwordContainer.appendChild(password);
    formulario.appendChild(passwordContainer);

    // Container para confirmação de senha
    const passwordConfirmContainer = document.createElement('div');
    passwordConfirmContainer.className = 'mb-3';
    const passwordConfirmLabel = document.createElement('label');
    passwordConfirmLabel.textContent = 'Confirmar senha *';
    passwordConfirmLabel.className = 'form-label';
    passwordConfirmLabel.setAttribute('for', 'senhaConfirmProf');
    const passwordConfirm = document.createElement('input');
    passwordConfirm.type = 'password';
    passwordConfirm.id = 'senhaConfirmProf';
    passwordConfirm.name = 'senhaConfirm';
    passwordConfirm.placeholder = "Confirme sua senha";
    passwordConfirm.className = 'form-control';
    passwordConfirm.required = true;
    passwordConfirmContainer.appendChild(passwordConfirmLabel);
    passwordConfirmContainer.appendChild(passwordConfirm);
    formulario.appendChild(passwordConfirmContainer);

    // BOTÃO
    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.className = 'btn btn-primary mt-2';
    formulario.appendChild(btnSubmit);

    // Aplica validação visual aos campos
    applyVisualValidation(nome, ['required'], {
        helpText: 'Digite o nome do seu estabelecimento',
        customMessage: friendlyMessages.required
    });

    applyVisualValidation(email, ['required', 'email'], {
        helpText: 'Digite um e-mail válido',
        customMessage: friendlyMessages.email
    });

    applyVisualValidation(password, ['required', ['minLength', 6]], {
        helpText: 'A senha deve ter no mínimo 6 caracteres',
        customMessage: friendlyMessages.password
    });

    // Validação customizada para confirmação de senha (igual ao commit original)
    passwordConfirm.addEventListener('blur', () => {
        if (passwordConfirm.value !== password.value) {
            passwordConfirm.classList.add('is-invalid');
            passwordConfirm.classList.remove('is-valid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = friendlyMessages.passwordMatch;
            passwordConfirm.parentElement.appendChild(errorDiv);
        } else if (passwordConfirm.value.length > 0) {
            passwordConfirm.classList.remove('is-invalid');
            passwordConfirm.classList.add('is-valid');
            const existingError = passwordConfirm.parentElement.querySelector('.invalid-feedback');
            if (existingError) existingError.remove();
        }
    });

    password.addEventListener('input', () => {
        if (passwordConfirm.value && passwordConfirm.value !== password.value) {
            passwordConfirm.classList.add('is-invalid');
            passwordConfirm.classList.remove('is-valid');
        }
    });

    // SUBMIT
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        let invalido = false;

        // validação manual extra (conforme commit original)
        if (password.value.length < 6) {
            invalido = true;
            password.classList.add("is-invalid");
        }

        if (passwordConfirm.value !== password.value) {
            invalido = true;
            passwordConfirm.classList.add("is-invalid");
        }

        if (invalido) return;

        // Desabilita o botão durante a requisição
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Cadastrando...';

        try {
            // Importa e usa a API (igual ao commit original)
            const ApiService = (await import('../utils/api.js')).default;
            const api = new ApiService();

            let idCadastro = null;
            let idProfissional = null;

            // Cria cadastro
            const responseCadastro = await api.cadastrarProfissional(
                nome.value.trim(),
                email.value.trim(),
                password.value
            );

            idCadastro = responseCadastro.idCadastro || responseCadastro.id;

            if (!idCadastro) {
                throw new Error('Não foi possível obter o ID do cadastro criado.');
            }

            // Cria profissional
            const profissionalData = {
                nome: nome.value.trim(),
                email: email.value.trim(),
                descricao: 'Cadastro em andamento',
                acessibilidade: 0,
                isJuridica: 0,
                id_cadastro_fk: idCadastro
            };

            const responseProf = await api.criarProfissional(profissionalData);

            // Pega o ID (melhoria em relação ao loop do commit original)
            idProfissional = responseProf.idProfissional || responseProf.id;

            // Se não retornou o ID, tenta o fallback do commit original (opcional)
            if (!idProfissional) {
                const profCriado = await api.buscarProfissionalPorCadastro(idCadastro);
                if (profCriado && profCriado.id) {
                    idProfissional = profCriado.id;
                }
            }

            // Salva no localStorage para o próximo passo do cadastro (exatamente como original)
            const dadosBasicos = {
                nome: nome.value,
                email: email.value,
                senha: password.value,
                tipo: 'profissional',
                idCadastro: idCadastro,
                idProfissional: idProfissional
            };
            localStorage.setItem('dadosBasicos', JSON.stringify(dadosBasicos));

            // Notifica sucesso
            const { notify } = await import('../components/Notification.js');
            notify.success('Cadastro inicial realizado! Complete seus dados na próxima etapa...');

            // Redireciona (estilo original)
            setTimeout(() => {
                window.location.href = 'cont-register';
            }, 1000);
        } catch (error) {
            const { notify } = await import('../components/Notification.js');
            let mensagemErro = error.message || 'Erro ao cadastrar. Por favor, tente novamente.';
            if (mensagemErro.includes('email')) {
                mensagemErro = 'Este e-mail já está em uso.';
            }
            notify.error(mensagemErro);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Cadastrar';
        }
    });

    container.appendChild(formulario);
}
