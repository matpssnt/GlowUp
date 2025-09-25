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

    // Cria o campo de email
    const email = document.createElement('input');
    email.type = 'email';
    email.placeholder = "Seu e-mail";
    email.className = 'form-control mb-3'; // Usa a classe global de form-control
    formulario.appendChild(email);

    // Cria o campo de senha
    const password = document.createElement('input');
    password.type = 'password';
    password.placeholder = "Sua senha";
    password.className = 'form-control mb-3'; 
    formulario.appendChild(password);

    // Cria o botão de submit
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = "Entrar";
    btn.className = 'btn btn-primary'; // Usa a classe global de botão primário
    formulario.appendChild(btn);
    container.appendChild(formulario);

    return container; 
}
