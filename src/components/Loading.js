/* Componente de Loading Reutilizável
   Suporta diferentes tamanhos, variantes e contextos*/

export default function Loading(options = {}) {
    const {
        size = 'medium', // small, medium, large
        variant = 'spinner', // spinner, skeleton, progress, dots
        context = 'default', // default, page, card, button, modal, inline
        message = '',
        progress = null, // 0-100 para variant progress
        fullScreen = false
    } = options;

    const container = document.createElement('div');
    container.className = `loading-container loading-${context} loading-${size}`;
    
    if (fullScreen) {
        container.classList.add('loading-fullscreen');
    }

    let loadingContent = '';

    switch (variant) {
        case 'spinner':
            loadingContent = `
                <div class="loading-spinner loading-spinner-${size}">
                    <div class="spinner-border spinner-border-${size === 'small' ? 'sm' : size === 'large' ? 'lg' : ''}" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
            `;
            break;

        case 'skeleton':
            loadingContent = `
                <div class="loading-skeleton">
                    <div class="skeleton-line skeleton-line-${size}"></div>
                    <div class="skeleton-line skeleton-line-${size}"></div>
                    <div class="skeleton-line skeleton-line-${size} skeleton-line-short"></div>
                </div>
            `;
            break;

        case 'progress':
            const progressValue = progress !== null ? Math.min(100, Math.max(0, progress)) : 0;
            loadingContent = `
                <div class="loading-progress">
                    <div class="progress" style="height: ${size === 'small' ? '4px' : size === 'large' ? '8px' : '6px'};">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" 
                             style="width: ${progressValue}%"
                             aria-valuenow="${progressValue}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                        </div>
                    </div>
                    ${progress !== null ? `<small class="loading-progress-text">${progress}%</small>` : ''}
                </div>
            `;
            break;

        case 'dots':
            loadingContent = `
                <div class="loading-dots loading-dots-${size}">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            break;

        default:
            loadingContent = `
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            `;
    }

    container.innerHTML = `
        ${loadingContent}
        ${message ? `<p class="loading-message loading-message-${size}">${message}</p>` : ''}
    `;

    return container;
}

// Cria um overlay de loading para modais
export function createLoadingOverlay(message = 'Carregando...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-overlay-content">
            ${Loading({ size: 'large', variant: 'spinner', message }).innerHTML}
        </div>
    `;
    return overlay;
}

// Cria loading inline para botões
export function createButtonLoading(text = 'Carregando...') {
    return `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        ${text}
    `;
}

//Cria skeleton loader para cards/
export function createCardSkeleton(count = 1) {
    const container = document.createElement('div');
    container.className = 'skeleton-cards-container';
    
    for (let i = 0; i < count; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'skeleton-card';
        skeletonCard.innerHTML = `
            <div class="skeleton-card-image"></div>
            <div class="skeleton-card-body">
                <div class="skeleton-line skeleton-line-medium"></div>
                <div class="skeleton-line skeleton-line-medium skeleton-line-short"></div>
                <div class="skeleton-line skeleton-line-small"></div>
            </div>
        `;
        container.appendChild(skeletonCard);
    }
    
    return container;
}

// Cria loading específico para páginas
 export function createPageLoading(message = 'Carregando página...') {
    return Loading({
        size: 'large',
        variant: 'spinner',
        context: 'page',
        message,
        fullScreen: false
    });
}

// Cria loading específico para cards/
export function createCardLoading() {
    return Loading({
        size: 'medium',
        variant: 'skeleton',
        context: 'card'
    });
}

// Cria loading específico para modais
export function createModalLoading(message = 'Processando...') {
    return createLoadingOverlay(message);
}

