/*Utilitário para validação visual de formulários
  Adiciona ícones, validação em tempo real, mensagens, etc.*/

import { validateField, showFieldError, clearFieldError, markFieldValid } from './validation.js';

//Adiciona ícone de validação a um campo
export function addValidationIcon(field, isValid) {
    // Remove ícones anteriores
    const existingIcon = field.parentElement.querySelector('.validation-icon');
    if (existingIcon) {
        existingIcon.remove();
    }
    
    // Cria container para ícone se não existir
    let iconContainer = field.parentElement.querySelector('.validation-icon-container');
    if (!iconContainer) {
        iconContainer = document.createElement('div');
        iconContainer.className = 'validation-icon-container';
        field.parentElement.appendChild(iconContainer);
    }
    
    // Cria ícone
    const icon = document.createElement('i');
    icon.className = `validation-icon bi ${isValid ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`;
    iconContainer.appendChild(icon);
}

// Adiciona tooltip de ajuda a um campo
export function addHelpTooltip(field, helpText) {
    // Remove tooltip anterior se existir
    const existingTooltip = field.parentElement.querySelector('.help-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Cria tooltip
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'help-tooltip-container';
    
    const tooltipIcon = document.createElement('i');
    tooltipIcon.className = 'bi bi-question-circle help-tooltip-icon';
    tooltipIcon.setAttribute('data-bs-toggle', 'tooltip');
    tooltipIcon.setAttribute('data-bs-placement', 'top');
    tooltipIcon.setAttribute('title', helpText);
    
    tooltipContainer.appendChild(tooltipIcon);
    field.parentElement.appendChild(tooltipContainer);
    
    // Inicializa tooltip do Bootstrap
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        new bootstrap.Tooltip(tooltipIcon);
    }
}

// Adiciona validação em tempo real (on blur)
export function addRealtimeValidation(field, rules, customMessage = null) {
    field.addEventListener('blur', () => {
        const value = field.value;
        const error = validateField(value, rules);
        
        if (error !== true) {
            const message = customMessage || error;
            showFieldError(field, message);
            addValidationIcon(field, false);
        } else {
            clearFieldError(field);
            markFieldValid(field);
            addValidationIcon(field, true);
        }
    });
    
    // Validação também no input para feedback imediato
    field.addEventListener('input', () => {
        if (field.value.length > 0) {
            const error = validateField(field.value, rules);
            if (error === true) {
                clearFieldError(field);
                markFieldValid(field);
                addValidationIcon(field, true);
            } else {
                // Não mostra erro durante digitação, só remove validação positiva
                const existingIcon = field.parentElement.querySelector('.validation-icon');
                if (existingIcon && existingIcon.classList.contains('text-success')) {
                    existingIcon.remove();
                }
            }
        }
    });
}

// Cria progress indicator para formulários multi-step
export function createProgressIndicator(steps, currentStep) {
    const container = document.createElement('div');
    container.className = 'form-progress-indicator';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress';
    progressBar.style.height = '8px';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-bar progress-bar-striped progress-bar-animated';
    progressFill.role = 'progressbar';
    progressFill.style.width = `${(currentStep / steps) * 100}%`;
    progressFill.setAttribute('aria-valuenow', currentStep);
    progressFill.setAttribute('aria-valuemin', '0');
    progressFill.setAttribute('aria-valuemax', steps);
    
    progressBar.appendChild(progressFill);
    container.appendChild(progressBar);
    
    // Indicador de passos
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'form-steps-indicator d-flex justify-content-between mt-2';
    
    for (let i = 1; i <= steps; i++) {
        const stepIndicator = document.createElement('div');
        stepIndicator.className = `form-step ${i <= currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}`;
        stepIndicator.innerHTML = `
            <div class="step-circle">${i}</div>
            <small class="step-label">Passo ${i}</small>
        `;
        stepsContainer.appendChild(stepIndicator);
    }
    
    container.appendChild(stepsContainer);
    
    return container;
}

// Implementa auto-save de formulários
export function enableAutoSave(form, saveKey, interval = 30000) {
    const formData = new FormData(form);
    const formObject = {};
    
    // Salva dados iniciais
    form.querySelectorAll('input, textarea, select').forEach(field => {
        if (field.name || field.id) {
            const key = field.name || field.id;
            formObject[key] = field.value;
        }
    });
    
    localStorage.setItem(saveKey, JSON.stringify(formObject));
    
    // Auto-save periódico
    const autoSaveInterval = setInterval(() => {
        const currentData = {};
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.name || field.id) {
                const key = field.name || field.id;
                currentData[key] = field.value;
            }
        });
        localStorage.setItem(saveKey, JSON.stringify(currentData));
        console.log('Auto-save realizado');
    }, interval);
    
    // Auto-save ao sair da página
    window.addEventListener('beforeunload', () => {
        const currentData = {};
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.name || field.id) {
                const key = field.name || field.id;
                currentData[key] = field.value;
            }
        });
        localStorage.setItem(saveKey, JSON.stringify(currentData));
    });
    
    // Restaura dados salvos
    const savedData = localStorage.getItem(saveKey);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            form.querySelectorAll('input, textarea, select').forEach(field => {
                const key = field.name || field.id;
                if (key && data[key] !== undefined) {
                    field.value = data[key];
                }
            });
        } catch (e) {
            console.error('Erro ao restaurar dados salvos:', e);
        }
    }
    
    // Retorna função para limpar auto-save
    return () => {
        clearInterval(autoSaveInterval);
        localStorage.removeItem(saveKey);
    };
}

//Mensagens de erro mais amigáveis
export const friendlyMessages = {
    required: 'Este campo é obrigatório',
    email: 'Por favor, insira um e-mail válido',
    minLength: (min) => `Este campo deve ter no mínimo ${min} caracteres`,
    maxLength: (max) => `Este campo deve ter no máximo ${max} caracteres`,
    password: 'A senha deve ter no mínimo 6 caracteres',
    passwordMatch: 'As senhas não coincidem',
    phone: 'Por favor, insira um telefone válido (10 ou 11 dígitos)',
    cep: 'Por favor, insira um CEP válido (8 dígitos)',
    cpf: 'Por favor, insira um CPF válido',
    cnpj: 'Por favor, insira um CNPJ válido'
};

// Aplica validação visual completa a um campo
export function applyVisualValidation(field, rules, options = {}) {
    const {
        helpText = null,
        customMessage = null,
        realtime = true
    } = options;
    
    // Adiciona tooltip se fornecido
    if (helpText) {
        addHelpTooltip(field, helpText);
    }
    
    // Adiciona validação em tempo real
    if (realtime) {
        addRealtimeValidation(field, rules, customMessage);
    }
    
    // Adiciona classe para estilização
    field.classList.add('has-visual-validation');
}

