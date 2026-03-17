import { applyVisualValidation, friendlyMessages } from "../utils/formValidation.js";

export default function renderFormProf(container) {

    const formulario = document.createElement('form');
    formulario.className = 'register-form register-form-grid';
    formulario.id = 'formProf';

    // ── Linha 1 ────────────────────────────────────────────────
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

    row1.append(nomeContainer, emailContainer);
    formulario.appendChild(row1);

    // ── Linha 2 (senhas + toggle) ──────────────────────────────
    const row2 = document.createElement('div');
    row2.className = 'register-form-row';

    // Senha
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'register-field position-relative'; // ← importante!

    passwordContainer.innerHTML = `
        <label for="senhaProf" class="form-label">Senha *</label>
        <input type="password" id="senhaProf" name="senha" placeholder="Mínimo 6 caracteres" class="form-control" required>
    `;
    const password = passwordContainer.querySelector('#senhaProf');

   // Ícone olho senha
    const togglePassword = document.createElement('img');
    togglePassword.src = '/GlowUp/public/assets/images/olho-aberto.png';
    togglePassword.style.position = 'absolute';
    togglePassword.style.right = '10px';
    togglePassword.style.top = '49px';
    togglePassword.style.cursor = 'pointer';
    togglePassword.style.width = '20px';

    passwordContainer.appendChild(togglePassword);

    // Confirmar senha
    const passwordConfirmContainer = document.createElement('div');
    passwordConfirmContainer.className = 'register-field position-relative'; // ← importante!

    passwordConfirmContainer.innerHTML = `
        <label for="senhaConfirmProf" class="form-label">Confirmar senha *</label>
        <input type="password" id="senhaConfirmProf" name="senhaConfirm" placeholder="Confirme sua senha" class="form-control" required>
    `;
    const passwordConfirm = passwordConfirmContainer.querySelector('#senhaConfirmProf');

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

    row2.appendChild(passwordContainer);
    row2.appendChild(passwordConfirmContainer);
    formulario.appendChild(row2);

    // ── Botão submit ───────────────────────────────────────────
    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.className = 'btn btn-primary register-submit-btn';
    formulario.appendChild(btnSubmit);

    // ── Validações visuais ─────────────────────────────────────
    applyVisualValidation(nome, ['required'], {
        helpText: 'Digite o nome do seu estabelecimento',
        customMessage: friendlyMessages.required
    });

    applyVisualValidation(email, ['required', 'email'], {
        helpText: 'Digite um e-mail válido',
        customMessage: friendlyMessages.email
    });

    // ── Validação customizada confirmação de senha ─────────────
    function setPasswordConfirmError(message) {
        let errorDiv = passwordConfirm.parentElement.querySelector('.invalid-feedback');
        passwordConfirm.classList.add('is-invalid');
        passwordConfirm.classList.remove('is-valid');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            passwordConfirm.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    function clearPasswordConfirmError() {
        passwordConfirm.classList.remove('is-invalid');
        passwordConfirm.classList.add('is-valid');
        const errorDiv = passwordConfirm.parentElement.querySelector('.invalid-feedback');
        if (errorDiv) errorDiv.remove();
    }

    passwordConfirm.addEventListener('blur', () => {
        if (passwordConfirm.value && passwordConfirm.value !== password.value) {
            setPasswordConfirmError(friendlyMessages.passwordMatch);
        } else if (passwordConfirm.value) {
            clearPasswordConfirmError();
        }
    });

    password.addEventListener('input', () => {
        if (passwordConfirm.value) {
            passwordConfirm.value === password.value
                ? clearPasswordConfirmError()
                : setPasswordConfirmError(friendlyMessages.passwordMatch);
        }
    });

    passwordConfirm.addEventListener('input', () => {
        passwordConfirm.value === password.value
            ? clearPasswordConfirmError()
            : (passwordConfirm.value && setPasswordConfirmError(friendlyMessages.passwordMatch));
    });

    // ── Submit ─────────────────────────────────────────────────
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        let invalido = false;

        if (password.value.length < 6) {
            invalido = true;
            password.classList.add('is-invalid');
        }

        if (passwordConfirm.value !== password.value) {
            invalido = true;
            passwordConfirm.classList.add('is-invalid');
        }

        if (invalido) return;

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Cadastrando...';

        try {
            const ApiService = (await import('../utils/api.js')).default;
            const api = new ApiService();

            const responseCadastro = await api.cadastrarProfissional(
                nome.value.trim(),
                email.value.trim(),
                password.value
            );

            const idCadastro = responseCadastro.idCadastro || responseCadastro.id;
            if (!idCadastro) throw new Error('Não foi possível obter o ID do cadastro.');

            const profissionalData = {
                nome: nome.value.trim(),
                email: email.value.trim(),
                descricao: 'Cadastro em andamento',
                acessibilidade: 0,
                isJuridica: 0,
                id_cadastro_fk: Number(idCadastro)
            };

            const responseProf = await api.criarProfissional(profissionalData);
            let idProfissional = responseProf.idProfissional || responseProf.id;

            if (!idProfissional) {
                const profCriado = await api.buscarProfissionalPorCadastro(idCadastro);
                idProfissional = profCriado?.id;
            }

            const dadosBasicos = {
                nome: nome.value,
                email: email.value,
                senha: password.value,
                tipo: 'profissional',
                idCadastro,
                idProfissional
            };
            localStorage.setItem('dadosBasicos', JSON.stringify(dadosBasicos));

            const { notify } = await import('../components/Notification.js');
            notify.success('Cadastro inicial realizado! Complete seus dados na próxima etapa...');

            setTimeout(() => window.location.href = 'cont-register', 1200);
        } catch (error) {
            const { notify } = await import('../components/Notification.js');
            let msg = error.message || 'Erro ao cadastrar. Tente novamente.';
            if (msg.toLowerCase().includes('email')) msg = 'Este e-mail já está em uso.';
            notify.error(msg);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Cadastrar';
        }
    });

    container.appendChild(formulario);
}