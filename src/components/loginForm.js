import ApiService from '../utils/api.js';
import authState from '../utils/AuthState.js';

export default function loginForm() {

    const divRoot = document.getElementById('root');
    divRoot.innerHTML = '';

    // Cria o container do card
    const container = document.createElement('div');
    container.className = 'card-base card-login shadow-lg rounded-card card-login-default';
    divRoot.appendChild(container);

    // Adiciona o título
    const titulo = document.createElement('h1');
    titulo.textContent = 'Entrar';
    titulo.className = 'login-title page-title-default';
    container.appendChild(titulo);

    // Cria o formulário
    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';

    // Cria a div para mensagens de erro
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger d-none mb-3';
    errorAlert.setAttribute('role', 'alert');
    formulario.appendChild(errorAlert);

    // Cria o campo de email
    const email = document.createElement('input');
    email.type = 'email';
    email.placeholder = "Seu login";
    email.className = 'form-control mb-3';
    email.required = true;
    formulario.appendChild(email);

    // Cria o campo de senha
    const password = document.createElement('input');
    password.type = 'password';
    password.placeholder = "Sua senha";
    password.className = 'form-control mb-3';
    password.required = true;
    formulario.appendChild(password);


    // Cria o botão de submit
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = "Entrar";
    btn.className = 'btn btn-primary';
    formulario.appendChild(btn);
    container.appendChild(formulario);

    // Instância do ApiService
    const apiService = new ApiService();

    // Função para mostrar erro
    const showError = (message) => {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
    };

    // Função para esconder erro
    const hideError = () => {
        errorAlert.classList.add('d-none');
    };

    // Event listener para o submit do formulário
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const emailValue = email.value.trim();
        const senhaValue = password.value.trim();

        // Validação básica
        if (!emailValue || !senhaValue) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        // Desabilita o botão e mostra "Entrando..."
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Entrando...';

        try {
            // O método login tenta automaticamente como cliente primeiro, depois como profissional
            const response = await apiService.login(emailValue, senhaValue);

            // Verifica se o token foi retornado
            if (response && response.token) {
                // Decodifica o payload do JWT para obter os dados do usuário
                // O backend retorna no JWT: { id: <cadastro_id>, nome, email, cliente_id: <clientes.id> }
                let jwtPayload = null;
                try {
                    const tokenParts = response.token.split('.');
                    if (tokenParts.length === 3) {
                        const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
                        const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
                        jwtPayload = JSON.parse(atob(padded));
                    }
                } catch (e) {
                    // Ignora erro de decodificação
                }

                const sub = jwtPayload?.sub || {};

                // Prepara dados do usuário para salvar no estado
                // sub.id = ID do cadastro (cadastros.id)
                // sub.cliente_id = ID real da tabela clientes (clientes.id) - FK usada em agendamentos
                // sub.profissional_id = ID real da tabela profissionais
                const userData = {
                    tipoUsuario: jwtPayload?.tipoUsuario || response.tipoUsuario || 'cliente',
                    nome: sub.nome || emailValue,
                    email: sub.email || emailValue,
                    id: sub.id || null,
                    clienteId: sub.cliente_id || null,
                    profissionalId: sub.profissional_id || null
                };

                authState.setUser(userData, response.token);

                // Redireciona conforme tipo de usuário
                const currentPath = window.location.pathname;
                const basePath = currentPath.split('/').slice(0, 2).join('/'); // Pega /GlowUp

                if (userData.tipoUsuario === 'profissional') {
                    window.location.href = basePath + '/dashboard';
                } else {
                    window.location.href = basePath + '/home';
                }
            } else {
                showError('Erro ao fazer login. Tente novamente.');
            }
        } catch (error) {
            // Mostra mensagem de erro 
            let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
            if (error.message) {
                errorMessage = error.message;
            }
            showError(errorMessage);
        } finally {
            // Reabilita o botão
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });

    return container;
}
