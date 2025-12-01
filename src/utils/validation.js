/**
 * Sistema de validação de formulários e máscaras de input
 */

// ============================================
// VALIDAÇÃO
// ============================================

export const validators = {
    /**
     * Valida email
     */
    email: (value) => {
        if (!value || !value.trim()) return 'Email é obrigatório';
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value.trim()) || 'Email inválido';
    },
    
    /**
     * Valida telefone (10 ou 11 dígitos)
     */
    telefone: (value) => {
        if (!value) return true; // Opcional
        const digits = value.replace(/\D/g, '');
        return (digits.length === 10 || digits.length === 11) || 'Telefone deve ter 10 ou 11 dígitos';
    },
    
    /**
     * Valida CEP (8 dígitos)
     */
    cep: (value) => {
        if (!value) return true; // Opcional
        const digits = value.replace(/\D/g, '');
        return digits.length === 8 || 'CEP deve ter 8 dígitos';
    },
    
    /**
     * Valida campo obrigatório
     */
    required: (value) => {
        return (value && value.trim().length > 0) || 'Campo obrigatório';
    },
    
    /**
     * Valida tamanho mínimo
     */
    minLength: (min) => (value) => {
        if (!value) return true;
        return value.length >= min || `Mínimo de ${min} caracteres`;
    },
    
    /**
     * Valida tamanho máximo
     */
    maxLength: (max) => (value) => {
        if (!value) return true;
        return value.length <= max || `Máximo de ${max} caracteres`;
    },
    
    /**
     * Valida senha (mínimo 6 caracteres)
     */
    senha: (value) => {
        if (!value) return true; // Opcional se já existe senha
        return value.length >= 6 || 'Senha deve ter no mínimo 6 caracteres';
    }
};

/**
 * Valida um campo com múltiplas regras
 * @param {string} value - Valor a ser validado
 * @param {Array} rules - Array de regras de validação
 * @returns {string|true} - Retorna mensagem de erro ou true se válido
 */
export function validateField(value, rules) {
    for (const rule of rules) {
        let validator;
        
        if (typeof rule === 'function') {
            validator = rule;
        } else if (typeof rule === 'string') {
            validator = validators[rule];
        } else if (Array.isArray(rule)) {
            // Formato: ['minLength', 3]
            const [name, ...args] = rule;
            validator = validators[name](...args);
        }
        
        if (!validator) continue;
        
        const result = validator(value);
        if (result !== true) {
            return result; // Retorna mensagem de erro
        }
    }
    return true; // Válido
}

/**
 * Valida todo o formulário
 * @param {HTMLFormElement} form - Formulário a ser validado
 * @param {Object} rules - Objeto com regras por campo { campoId: [regras] }
 * @returns {Object} - { isValid: boolean, errors: { campoId: mensagem } }
 */
export function validateForm(form, rules) {
    const errors = {};
    let isValid = true;
    
    Object.keys(rules).forEach(fieldId => {
        const field = form.querySelector(`#${fieldId}`);
        if (!field) return;
        
        const error = validateField(field.value, rules[fieldId]);
        if (error !== true) {
            errors[fieldId] = error;
            isValid = false;
        }
    });
    
    return { isValid, errors };
}

/**
 * Mostra erro de validação em um campo
 */
export function showFieldError(field, message) {
    // Remove erro anterior
    clearFieldError(field);
    
    // Adiciona classe de erro
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    
    // Cria elemento de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    errorDiv.id = `${field.id}-error`;
    
    // Insere após o campo
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

/**
 * Remove erro de validação de um campo
 */
export function clearFieldError(field) {
    field.classList.remove('is-invalid');
    
    const errorDiv = document.getElementById(`${field.id}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Marca campo como válido
 */
export function markFieldValid(field) {
    field.classList.add('is-valid');
    field.classList.remove('is-invalid');
    clearFieldError(field);
}

// ============================================
// MÁSCARAS
// ============================================

/**
 * Aplica máscara de CEP (00000-000)
 */
export function maskCEP(value) {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) {
        return digits;
    }
    return digits.substring(0, 5) + '-' + digits.substring(5, 8);
}

/**
 * Aplica máscara de telefone ((00) 0000-0000 ou (00) 00000-0000)
 */
export function maskTelefone(value) {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) {
        return digits.length > 0 ? `(${digits}` : '';
    } else if (digits.length <= 6) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    } else if (digits.length <= 10) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    } else {
        // Telefone com 9 dígitos (celular)
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
    }
}

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function maskCPF(value) {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) {
        return digits;
    } else if (digits.length <= 6) {
        return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    } else if (digits.length <= 9) {
        return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    } else {
        return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;
    }
}

/**
 * Aplica máscara de CNPJ (00.000.000/0000-00)
 */
export function maskCNPJ(value) {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) {
        return digits;
    } else if (digits.length <= 5) {
        return `${digits.substring(0, 2)}.${digits.substring(2)}`;
    } else if (digits.length <= 8) {
        return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5)}`;
    } else if (digits.length <= 12) {
        return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8)}`;
    } else {
        return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8, 12)}-${digits.substring(12, 14)}`;
    }
}

/**
 * Aplica máscara genérica baseada no tipo
 */
export function applyMask(value, type) {
    switch (type) {
        case 'cep':
            return maskCEP(value);
        case 'telefone':
            return maskTelefone(value);
        case 'cpf':
            return maskCPF(value);
        case 'cnpj':
            return maskCNPJ(value);
        default:
            return value;
    }
}

/**
 * Adiciona máscara a um input
 */
export function addMaskToInput(input, type) {
    input.addEventListener('input', (e) => {
        const cursorPosition = e.target.selectionStart;
        const oldValue = e.target.value;
        const newValue = applyMask(e.target.value, type);
        
        e.target.value = newValue;
        
        // Mantém posição do cursor
        const lengthDiff = newValue.length - oldValue.length;
        e.target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
    });
    
    // Aplica máscara no valor inicial se houver
    if (input.value) {
        input.value = applyMask(input.value, type);
    }
}
