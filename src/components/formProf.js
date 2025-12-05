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
    
    // Validação customizada para confirmação de senha
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

        // senha curta
        if (password.value.length < 6) {
            invalido = true;
            password.classList.add("is-invalid");
            if (!password.parentElement.querySelector('.invalid-feedback')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = friendlyMessages.password;
                password.parentElement.appendChild(errorDiv);
            }
        }

        // senhas diferentes
        if (passwordConfirm.value !== password.value) {
            invalido = true;
            passwordConfirm.classList.add("is-invalid");
            if (!passwordConfirm.parentElement.querySelector('.invalid-feedback')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = friendlyMessages.passwordMatch;
                passwordConfirm.parentElement.appendChild(errorDiv);
            }
        }

        if (invalido) {
            return; // não continua
        }

        // Desabilita o botão durante a requisição
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Cadastrando...';

        try {
            console.log('Iniciando cadastro de profissional - Etapa 1');
            
            // Importa e usa a API
            const ApiService = (await import('../utils/api.js')).default;
            const api = new ApiService();

            console.log('Criando cadastro básico...');
            let idCadastro = null;
            let idProfissional = null;
            
            // Cria cadastro de profissional (sem criar profissional ainda)
            let responseCadastro;
            try {
                responseCadastro = await api.cadastrarProfissional(
                    nome.value.trim(),
                    email.value.trim(),
                    password.value
                );
                console.log('Resposta do cadastro:', responseCadastro);
                
                // Pega o ID do cadastro
                if (responseCadastro.idCadastro || responseCadastro.id) {
                    idCadastro = responseCadastro.idCadastro || responseCadastro.id;
                    console.log('Cadastro criado com sucesso, ID:', idCadastro);
                } else {
                    throw new Error('Não foi possível obter o ID do cadastro criado.');
                }
            } catch (error) {
                console.error('Erro ao criar cadastro:', error);
                throw error;
            }
            
            // Se ainda não temos o ID do cadastro, houve um problema real
            if (!idCadastro) {
                throw new Error('Não foi possível criar ou encontrar o cadastro. Por favor, verifique se o email já está em uso e tente novamente.');
            }
            
            console.log('ID do cadastro confirmado:', idCadastro);
            
            // Cria profissional
            console.log('Criando profissional...');
            
            const profissionalData = {
                nome: nome.value.trim(),
                email: email.value.trim(),
                descricao: 'Cadastro em andamento', // Descrição temporária 
                acessibilidade: 0,
                isJuridica: 0,
                id_cadastro_fk: idCadastro
                // CPF não é enviado aqui, pois, será preenchido na etapa 2
            };
            
            console.log('Dados do profissional a criar:', profissionalData);
            
            try {
                const responseProf = await api.criarProfissional(profissionalData);
                console.log('Resposta da criação do profissional:', responseProf);
                
                // Aguarda um pouco para o banco processar
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Busca o profissional criado
                let tentativas = 0;
                const maxTentativas = 5;
                
                while (tentativas < maxTentativas && !idProfissional) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 300 * (tentativas + 1)));
                        const profCriado = await api.buscarProfissionalPorCadastro(idCadastro);
                        if (profCriado && profCriado.id) {
                            idProfissional = profCriado.id;
                            console.log(`ID do profissional encontrado na tentativa ${tentativas + 1}:`, idProfissional);
                            break;
                        }
                    } catch (e) {
                        console.log(`Tentativa ${tentativas + 1} falhou:`, e.message);
                    }
                    tentativas++;
                }
                
                // Se ainda não encontrou, tenta listar todos e buscar pelo id_cadastro_fk
                if (!idProfissional) {
                    console.log('Tentando buscar profissional listando todos...');
                    try {
                        const todosProfissionais = await api.listarProfissionais();
                        if (Array.isArray(todosProfissionais)) {
                            const profEncontrado = todosProfissionais.find(p => 
                                p.id_cadastro_fk == idCadastro || 
                                parseInt(p.id_cadastro_fk) === parseInt(idCadastro)
                            );
                            if (profEncontrado && profEncontrado.id) {
                                idProfissional = profEncontrado.id;
                                console.log('Profissional encontrado na lista:', idProfissional);
                            }
                        }
                    } catch (e) {
                        console.error('Erro ao listar profissionais:', e);
                    }
                }
                
                if (!idProfissional) {
                    console.warn('Profissional criado mas não conseguimos obter o ID. Continuando mesmo assim...');
                    // Continua sem o ID - será buscado na etapa 2
                }
            } catch (profError) {
                console.error('Erro ao criar profissional:', profError);
                throw new Error('Não foi possível criar o profissional: ' + (profError.message || 'Erro desconhecido'));
            }

            // Salva no localStorage para o próximo passo do cadastro
            const dadosBasicos = {
                nome: nome.value,
                email: email.value,
                senha: password.value,
                tipo: 'profissional',
                idCadastro: idCadastro,
                idProfissional: idProfissional
            };
            console.log('Salvando dados no localStorage:', dadosBasicos);
            localStorage.setItem('dadosBasicos', JSON.stringify(dadosBasicos));

            // Notifica sucesso
            const { notify } = await import('../components/Notification.js');
            notify.success('Cadastro inicial realizado! Complete seus dados na próxima etapa...');
            
            // Aguarda um pouco antes de redirecionar
            setTimeout(() => {
                window.location.href = 'cont-register';
            }, 1000);
        } catch (error) {
            // Erro
            console.error('Erro no cadastro:', error);
            
            // Importa notificação para mostrar erro amigável
            const { notify } = await import('../components/Notification.js');
            
            let mensagemErro = 'Erro ao cadastrar. Por favor, tente novamente.';
            
            if (error.message) {
                if (error.message.includes('email') || error.message.includes('Email')) {
                    mensagemErro = 'Este e-mail já está em uso. Por favor, use outro e-mail ou faça login.';
                } else if (error.message.includes('cadastro')) {
                    mensagemErro = 'Não foi possível criar o cadastro. Verifique os dados e tente novamente.';
                } else {
                    mensagemErro = error.message;
                }
            }
            
            notify.error(mensagemErro);
        } finally {
            // Reabilita o botão
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Cadastrar';
        }
    });

    container.appendChild(formulario);
}
