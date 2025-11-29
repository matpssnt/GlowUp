export default function renderFormProf(container) {

    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';

    // NOME
    const nome = document.createElement('input');
    nome.type = 'text';
    nome.placeholder = "Nome do Estabelecimento";
    nome.className = 'form-control mb-3';
    nome.required = true;
    formulario.appendChild(nome);

    // EMAIL
    const email = document.createElement('input');
    email.type = 'email';
    email.placeholder = "Seu e-mail";
    email.className = 'form-control mb-3';
    email.required = true;
    formulario.appendChild(email);

    // SENHA
    const password = document.createElement('input');
    password.type = 'password';
    password.placeholder = "Sua senha (mínimo 6 caracteres)";
    password.className = 'form-control mb-1';
    password.required = true;
    formulario.appendChild(password);

    // MENSAGEM ERRO SENHA
    const passwordError = document.createElement('div');
    passwordError.className = 'invalid-feedback';
    passwordError.textContent = 'A senha deve ter no mínimo 6 caracteres.';
    formulario.appendChild(passwordError);

    // CONFIRMAR SENHA
    const passwordConfirm = document.createElement('input');
    passwordConfirm.type = 'password';
    passwordConfirm.placeholder = "Confirme sua senha";
    passwordConfirm.className = 'form-control mb-1';
    passwordConfirm.required = true;
    formulario.appendChild(passwordConfirm);

    // MENSAGEM ERRO CONFIRMAÇÃO
    const errorMsg = document.createElement("div");
    errorMsg.className = "invalid-feedback";
    errorMsg.textContent = "As senhas são diferentes.";
    formulario.appendChild(errorMsg);

    // BOTÃO
    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.className = 'btn btn-primary mt-2';
    formulario.appendChild(btnSubmit);

    // Função validar senha
    function validarSenha(s) {
        return s.length >= 6;
    }

    // VALIDAÇÃO SENHA
    password.addEventListener("input", () => {
        if (!validarSenha(password.value)) {
            password.classList.add("is-invalid");
            password.classList.remove("is-valid");
        } else {
            password.classList.remove("is-invalid");
            password.classList.add("is-valid");
        }
    });

    // VALIDAÇÃO CONFIRMAR SENHA
    passwordConfirm.addEventListener("input", () => {
        if (passwordConfirm.value !== password.value || !validarSenha(password.value)) {
            passwordConfirm.classList.add("is-invalid");
            passwordConfirm.classList.remove("is-valid");
        } else {
            passwordConfirm.classList.remove("is-invalid");
            passwordConfirm.classList.add("is-valid");
        }
    });

    // SUBMIT
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        let invalido = false;

        // senha curta
        if (!validarSenha(password.value)) {
            invalido = true;
            password.classList.add("is-invalid");
        }

        // senhas diferentes
        if (passwordConfirm.value !== password.value) {
            invalido = true;
            passwordConfirm.classList.add("is-invalid");
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
            
            // Tenta criar cadastro (vai falhar na criação do profissional por falta de CPF)
            const responseCadastro = await api.cadastrarProfissional(
                nome.value.trim(),
                email.value.trim(),
                password.value
            );
            
            console.log('Resposta do cadastro:', responseCadastro);
            
            // Se retornou erro de CPF, o cadastro foi criado mas o profissional não
            if (responseCadastro.erroCPF) {
                console.log('Erro de CPF detectado. Cadastro foi criado mas profissional não.');
                // O cadastro foi criado, precisamos buscar o ID
                // O cadastro foi criado mas o profissional não. Buscamos o cadastro pelo email
                try {
                    console.log('Buscando cadastro criado pelo email:', email.value.trim());
                    const cadastros = await api.listarCadastros();
                    console.log('Lista de cadastros:', cadastros);
                    
                    if (Array.isArray(cadastros)) {
                        const cadastroEncontrado = cadastros.find(c => c.email === email.value.trim());
                        if (cadastroEncontrado) {
                            idCadastro = cadastroEncontrado.id;
                            console.log('Cadastro encontrado pelo email:', idCadastro);
                        } else {
                            console.warn('Cadastro não encontrado na lista. Tentando buscar novamente...');
                            // Tenta novamente após um pequeno delay (caso o banco ainda esteja processando)
                            await new Promise(resolve => setTimeout(resolve, 500));
                            const cadastrosRetry = await api.listarCadastros();
                            if (Array.isArray(cadastrosRetry)) {
                                const cadastroRetry = cadastrosRetry.find(c => c.email === email.value.trim());
                                if (cadastroRetry) {
                                    idCadastro = cadastroRetry.id;
                                    console.log('Cadastro encontrado na segunda tentativa:', idCadastro);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Erro ao buscar cadastro:', e);
                    // Mesmo com erro, continua - pode ser que o cadastro tenha sido criado
                }
            } else {
                // Sucesso normal (raro, pois normalmente falha por CPF)
                idCadastro = responseCadastro.idCadastro || responseCadastro.id;
                idProfissional = responseCadastro.idProfissional;
                console.log('Cadastro criado com sucesso completo:', { idCadastro, idProfissional });
            }
            
            // Se ainda não temos o ID do cadastro, houve um problema real
            if (!idCadastro) {
                throw new Error('Não foi possível criar ou encontrar o cadastro. Por favor, verifique se o email já está em uso e tente novamente.');
            }
            
            console.log('ID do cadastro:', idCadastro);
            
            // Verifica se profissional já existe (pode ter sido criado antes do erro)
            try {
                const profExistente = await api.buscarProfissionalPorCadastro(idCadastro);
                if (profExistente && profExistente.id) {
                    idProfissional = profExistente.id;
                    console.log('Profissional já existe:', idProfissional);
                }
            } catch (e) {
                console.log('Profissional não encontrado, será criado agora');
            }
            
            // Se o profissional não foi criado, cria com CPF temporário único
            if (!idProfissional) {
                console.log('Criando profissional com CPF temporário...');
                
                //cria um cpf temporario que vai ser substituido na segunda etapa
                const idStr = String(idCadastro).padStart(8, '0');
                const cpfTemporario = '999' + idStr;
                
                const profissionalData = {
                    nome: nome.value.trim(),
                    email: email.value.trim(),
                    descricao: 'Cadastro em andamento', // Descrição temporária - será atualizada na etapa 2
                    acessibilidade: 0,
                    isJuridica: 0,
                    id_cadastro_fk: idCadastro,
                    cpf: cpfTemporario // CPF temporário único - será atualizado na etapa 2
                };
                
                console.log('CPF temporário gerado:', cpfTemporario);
                
                try {
                    const responseProf = await api.criarProfissional(profissionalData);
                    console.log('Profissional criado com sucesso:', responseProf);
                    
                    // Tenta buscar o profissional criado para obter o ID
                    // Pode haver um pequeno delay para o banco processar
                    let tentativas = 0;
                    const maxTentativas = 3;
                    
                    while (tentativas < maxTentativas && !idProfissional) {
                        try {
                            await new Promise(resolve => setTimeout(resolve, 300 * (tentativas + 1))); // Delay crescente
                            const profCriado = await api.buscarProfissionalPorCadastro(idCadastro);
                            if (profCriado && profCriado.id) {
                                idProfissional = profCriado.id;
                                console.log(`ID do profissional encontrado na tentativa ${tentativas + 1}:`, idProfissional);
                                break;
                            }
                        } catch (e) {
                            console.log(`Tentativa ${tentativas + 1} falhou, tentando novamente...`);
                        }
                        tentativas++;
                    }
                    
                    // Se ainda não encontrou, tenta listar todos e buscar pelo id_cadastro_fk
                    if (!idProfissional) {
                        console.log('Tentando buscar profissional listando todos...');
                        try {
                            const todosProfissionais = await api.request('/profissional', 'GET');
                            if (Array.isArray(todosProfissionais)) {
                                const profEncontrado = todosProfissionais.find(p => p.id_cadastro_fk == idCadastro);
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
                    // Se o erro for que não encontrou, pode ser que já foi criado
                    if (profError.message.includes('não encontrada')) {
                        console.log('Profissional pode ter sido criado. Continuando...');
                        // Continua sem o ID - será buscado na etapa 2
                    } else {
                        throw new Error('Não foi possível criar o profissional: ' + profError.message);
                    }
                }
            }
            
            // Se não temos o ID do profissional, não é crítico - será buscado na etapa 2
            if (!idProfissional) {
                console.warn('Aviso: ID do profissional não obtido na etapa 1. Será buscado na etapa 2.');
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

            // Redireciona para continuar o cadastro profissional
            window.location.href = 'cont-register';
        } catch (error) {
            // Erro
            alert('Erro ao cadastrar: ' + error.message);
            console.error('Erro no cadastro:', error);
        } finally {
            // Reabilita o botão
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Cadastrar';
        }
    });

    container.appendChild(formulario);
}
