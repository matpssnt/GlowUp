/**
 * Lógica compartilhada do formulário de perfil
 */
import CepAPI from '../utils/cepAPI.js';
import { addMaskToInput, validateField, showFieldError, clearFieldError, markFieldValid } from '../utils/validation.js';

/**
 * Configura busca de CEP com validação
 */
export function setupCepSearch(inputCep, container) {
    let timeoutId = null;

    const buscarCep = async () => {
        const cep = inputCep.value.trim();

        if (!cep || cep.replace(/\D/g, '').length < 8) {
            CepAPI.removerErro();
            return;
        }

        try {
            const campos = {
                cidade: 'cidade',
                bairro: 'bairro',
                street: 'rua',
                state: 'estado'
            };

            await CepAPI.buscarEPreencher(cep, campos, {
                success: (dados) => {
                    inputCep.value = CepAPI.formatarCep(cep);
                    markFieldValid(inputCep);
                    const campoNumero = container.querySelector('#numero');
                    if (campoNumero) {
                        campoNumero.focus();
                    }
                },
                error: (error) => {
                    showFieldError(inputCep, error.message || 'CEP não encontrado');
                }
            });
        } catch (error) {
            showFieldError(inputCep, 'Erro ao buscar CEP. Tente novamente.');
        }
    };

    // Máscara de CEP
    addMaskToInput(inputCep, 'cep');

    // Validação em tempo real
    inputCep.addEventListener('blur', () => {
        const cepDigits = inputCep.value.replace(/\D/g, '');
        if (cepDigits.length > 0 && cepDigits.length < 8) {
            showFieldError(inputCep, 'CEP deve ter 8 dígitos');
        } else if (cepDigits.length === 8) {
            clearFieldError(inputCep);
        }
    });

    // Busca automática ao completar 8 dígitos
    inputCep.addEventListener('input', (e) => {
        CepAPI.removerErro();
        clearFieldError(inputCep);

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const cepDigits = e.target.value.replace(/\D/g, '');
        if (cepDigits.length === 8) {
            timeoutId = setTimeout(buscarCep, 800);
        }
    });

    inputCep.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarCep();
        }
    });

    inputCep.addEventListener('paste', (e) => {
        setTimeout(() => {
            const valor = e.target.value.replace(/\D/g, '');
            if (valor.length === 8) {
                buscarCep();
            }
        }, 100);
    });
}

/**
 * Configura máscaras e validações nos campos
 */
export function setupFieldMasksAndValidation(container) {
    // Máscara de telefone
    const telefoneInput = container.querySelector('#telefone');
    if (telefoneInput) {
        addMaskToInput(telefoneInput, 'telefone');
        
        telefoneInput.addEventListener('blur', () => {
            const digits = telefoneInput.value.replace(/\D/g, '');
            if (digits.length > 0) {
                if (digits.length === 10 || digits.length === 11) {
                    markFieldValid(telefoneInput);
                } else {
                    showFieldError(telefoneInput, 'Telefone deve ter 10 ou 11 dígitos');
                }
            } else {
                clearFieldError(telefoneInput);
            }
        });
    }

    // Validação de email
    const emailInput = container.querySelector('#email');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const error = validateField(emailInput.value, ['required', 'email']);
            if (error !== true) {
                showFieldError(emailInput, error);
            } else {
                markFieldValid(emailInput);
            }
        });
    }

    // Validação de nome e sobrenome
    const nomeInput = container.querySelector('#nome');
    const sobrenomeInput = container.querySelector('#sobrenome');
    
    [nomeInput, sobrenomeInput].forEach(input => {
        if (input) {
            input.addEventListener('blur', () => {
                const error = validateField(input.value, ['required']);
                if (error !== true) {
                    showFieldError(input, error);
                } else {
                    markFieldValid(input);
                }
            });
        }
    });

    // Validação de senha (se preenchida)
    const senhaInput = container.querySelector('#senha');
    if (senhaInput) {
        senhaInput.addEventListener('blur', () => {
            if (senhaInput.value.trim()) {
                const error = validateField(senhaInput.value, ['senha']);
                if (error !== true) {
                    showFieldError(senhaInput, error);
                } else {
                    markFieldValid(senhaInput);
                }
            } else {
                clearFieldError(senhaInput);
            }
        });
    }
}

/**
 * Valida todo o formulário antes de submit
 */
export function validateFormBeforeSubmit(container) {
    const nome = container.querySelector('#nome');
    const sobrenome = container.querySelector('#sobrenome');
    const email = container.querySelector('#email');
    const senha = container.querySelector('#senha');

    let isValid = true;

    // Valida nome
    const nomeError = validateField(nome?.value || '', ['required']);
    if (nomeError !== true) {
        showFieldError(nome, nomeError);
        isValid = false;
    }

    // Valida sobrenome
    const sobrenomeError = validateField(sobrenome?.value || '', ['required']);
    if (sobrenomeError !== true) {
        showFieldError(sobrenome, sobrenomeError);
        isValid = false;
    }

    // Valida email
    const emailError = validateField(email?.value || '', ['required', 'email']);
    if (emailError !== true) {
        showFieldError(email, emailError);
        isValid = false;
    }

    // Valida senha se preenchida
    if (senha?.value.trim()) {
        const senhaError = validateField(senha.value, ['senha']);
        if (senhaError !== true) {
            showFieldError(senha, senhaError);
            isValid = false;
        }
    }

    return isValid;
}

