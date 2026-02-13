// Sistema centralizado de tratamento de erros
import { notify } from '../components/Notification.js';

// Trata erros de forma padronizada
export function handleError(error, context = '', showToUser = true) {
    // console.error(`[${context}]`, error);
    
    // Determina mensagem
    let message = 'Ocorreu um erro. Tente novamente.';
    
    if (error.message) {
        message = error.message;
    } else if (error.response?.data?.message) {
        message = error.response.data.message;
    } else if (typeof error === 'string') {
        message = error;
    }
    
    // Mensagens para erros comuns
    if (message.includes('fetch') || message.includes('network')) {
        message = 'Erro de conexão. Verifique sua internet e tente novamente.';
    } else if (message.includes('401') || message.includes('Unauthorized')) {
        message = 'Sua sessão expirou. Por favor, faça login novamente.';
    } else if (message.includes('403') || message.includes('Forbidden')) {
        message = 'Você não tem permissão para realizar esta ação.';
    } else if (message.includes('404') || message.includes('Not Found')) {
        message = 'Recurso não encontrado.';
    } else if (message.includes('500') || message.includes('Internal Server')) {
        message = 'Erro no servidor. Tente novamente mais tarde.';
    }
    
    // Mostra notificação
    if (showToUser) {
        notify.error(message);
    }
    
    // Log para monitoramento
    if (window.errorLogger) {
        window.errorLogger.log({
            error: error.message || message,
            context,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
    
    return message;
}

// Wrapper para funções assíncronas com tratamento de erro
export function withErrorHandling(fn, context = '') {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            handleError(error, context);
            throw error;
        }
    };
}

