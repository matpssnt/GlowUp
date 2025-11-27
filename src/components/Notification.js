// Mostra notificação
export function showNotification(message, type = 'info', duration = 3000) {
    // Remove notificações antigas se houver muitas
    const existing = document.querySelectorAll('.notification');
    if (existing.length > 3) {
        existing[0].remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const iconMap = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi ${iconMap[type] || iconMap.info} notification-icon"></i>
            <span class="notification-message">${escapeHTML(message)}</span>
            <button class="notification-close" aria-label="Fechar">&times;</button>
        </div>
    `;
    
    // Cria container se não existir
    if (!document.querySelector('.notifications-container')) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    const container = document.querySelector('.notifications-container');
    container.appendChild(notification);
    
    notification.offsetHeight;
    notification.classList.add('show');
    
    // Auto-remove após duração
    let timeout = null;
    if (duration > 0) {
        timeout = setTimeout(() => {
            removeNotification(notification);
        }, duration);
    }
    
    // Botão de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        if (timeout) clearTimeout(timeout);
        removeNotification(notification);
    });
    
    return notification;
}

// Remove notificação
function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Funções de conveniência
export const notify = {
    success: (msg, duration) => showNotification(msg, 'success', duration),
    error: (msg, duration) => showNotification(msg, 'error', duration || 5000),
    warning: (msg, duration) => showNotification(msg, 'warning', duration),
    info: (msg, duration) => showNotification(msg, 'info', duration)
};

