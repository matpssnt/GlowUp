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
    email.placeholder = "Seu e-mail";
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
                // Prepara dados do usuário para salvar no estado
                const userData = {
                    tipoUsuario: response.tipoUsuario || 'cliente',
                    nome: response.nome || emailValue,
                    email: emailValue
                };
                
                // Salva no estado global
                authState.setUser(userData, response.token);
                
                // Redireciona para a página home
                // Usa window.location para garantir que o router processe a rota corretamente
                const currentPath = window.location.pathname;
                const basePath = currentPath.split('/').slice(0, 2).join('/'); // Pega /GlowUp
                window.location.href = basePath + '/home';
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
