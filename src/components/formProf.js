import { applyVisualValidation, friendlyMessages } from "../utils/formValidation.js";

export default function renderFormProf(container) {

    const formulario = document.createElement('form');
    formulario.className = 'register-form register-form-grid';
    formulario.id = 'formProf';

    const row1 = document.createElement('div');
    row1.className = 'register-form-row';
    const nomeContainer = document.createElement('div');
    nomeContainer.className = 'register-field';
    nomeContainer.innerHTML = `
        <label for="nomeProf" class="form-label">Nome do Estabelecimento *</label>
        <input type="text" id="nomeProf" name="nome" placeholder="Nome do Estabelecimento" class="form-control" required>
    `;
    const nome = nomeContainer.querySelector('#nomeProf');
    const emailContainer = document.createElement('div');
    emailContainer.className = 'register-field';
    emailContainer.innerHTML = `
        <label for="emailProf" class="form-label">E-mail *</label>
        <input type="email" id="emailProf" name="email" placeholder="Seu e-mail" class="form-control" required>
    `;  
    const email = emailContainer.querySelector('#emailProf');
    row1.appendChild(nomeContainer);
    row1.appendChild(emailContainer);
    formulario.appendChild(row1);

    const row2 = document.createElement('div');
    row2.className = 'register-form-row';

    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'register-field';
    passwordContainer.innerHTML = `
        <label for="senhaProf" class="form-label">Senha *</label>
        <input type="password" id="senhaProf" name="senha" placeholder="Mínimo 6 caracteres" class="form-control" required>
    `;
    const password = passwordContainer.querySelector('#senhaProf');

    const passwordConfirmContainer = document.createElement('div');
    passwordConfirmContainer.className = 'register-field';
    passwordConfirmContainer.innerHTML = `
        <label for="senhaConfirmProf" class="form-label">Confirmar senha *</label>
        <input type="password" id="senhaConfirmProf" name="senhaConfirm" placeholder="Confirme sua senha" class="form-control" required>
    `;

     // Ícone olho senha
    const togglePassword = document.createElement('img');
    togglePassword.src = '/GlowUp/public/assets/images/olho-aberto.png';
    togglePassword.style.position = 'absolute';
    togglePassword.style.right = '10px';
    togglePassword.style.top = '49px';
    togglePassword.style.cursor = 'pointer';
    togglePassword.style.width = '20px';

    passwordContainer.appendChild(togglePassword);

     // Ícone confirmar senha
    const togglePasswordConfirm = document.createElement('img');
    togglePasswordConfirm.src = '/GlowUp/public/assets/images/olho-aberto.png';
    togglePasswordConfirm.style.position = 'absolute';
    togglePasswordConfirm.style.right = '10px';
    togglePasswordConfirm.style.top = '49px';
    togglePasswordConfirm.style.cursor = 'pointer';
    togglePasswordConfirm.style.width = '20px';

    passwordConfirmContainer.appendChild(togglePasswordConfirm);

     // EVENTOS DO OLHO
    togglePassword.addEventListener('click', () => {

        const isPassword = password.type === 'password';

        password.type = isPassword ? 'text' : 'password';

        togglePassword.src = isPassword
            ? '/GlowUp/public/assets/images/esconder.png'
            : '/GlowUp/public/assets/images/olho-aberto.png';

    });

    togglePasswordConfirm.addEventListener('click', () => {

        const isPassword = passwordConfirm.type === 'password';

        passwordConfirm.type = isPassword ? 'text' : 'password';

        togglePasswordConfirm.src = isPassword
            ? '/GlowUp/public/assets/images/esconder.png'
            : '/GlowUp/public/assets/images/olho-aberto.png';

    });

    const passwordConfirm = passwordConfirmContainer.querySelector('#senhaConfirmProf');
    row2.appendChild(passwordContainer);
    row2.appendChild(passwordConfirmContainer);
    formulario.appendChild(row2);

    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.className = 'btn btn-primary register-submit-btn';
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

    // Validação customizada para confirmação de senha (reutiliza/atualiza erro sem acumular)
    function setPasswordConfirmError(input, message) {
        let errorDiv = input.parentElement.querySelector('.invalid-feedback');
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            input.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    function clearPasswordConfirmError(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        const errorDiv = input.parentElement.querySelector('.invalid-feedback');
        if (errorDiv) errorDiv.remove();
    }

    passwordConfirm.addEventListener('blur', () => {
        if (passwordConfirm.value && passwordConfirm.value !== password.value) {
            setPasswordConfirmError(passwordConfirm, friendlyMessages.passwordMatch);
        } else if (passwordConfirm.value.length > 0) {
            clearPasswordConfirmError(passwordConfirm);
        }
    });

    password.addEventListener('input', () => {
        if (passwordConfirm.value) {
            if (passwordConfirm.value !== password.value) {
                setPasswordConfirmError(passwordConfirm, friendlyMessages.passwordMatch);
            } else {
                clearPasswordConfirmError(passwordConfirm);
            }
        }
    });

    passwordConfirm.addEventListener('input', () => {
        if (passwordConfirm.value === password.value) {
            clearPasswordConfirmError(passwordConfirm);
        } else if (passwordConfirm.value.length > 0) {
            setPasswordConfirmError(passwordConfirm, friendlyMessages.passwordMatch);
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

            // Cria profissional (descrição será preenchida na próxima etapa)
            const descricaoValue = 'Cadastro em andamento';
            const profissionalData = {
                nome: nome.value.trim(),
                email: email.value.trim(),
                descricao: descricaoValue,
                acessibilidade: parseInt(0),
                isJuridica: parseInt(0),
                id_cadastro_fk: parseInt(idCadastro)
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
