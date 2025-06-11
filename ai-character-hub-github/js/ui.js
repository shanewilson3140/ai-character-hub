// Add these methods to your UIManager class in ui.js

showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="window.app.uiManager.resolveConfirm(false)">Cancel</button>
                    <button class="btn btn-primary" onclick="window.app.uiManager.resolveConfirm(true)">Confirm</button>
                </div>
            </div>
        `;
        
        document.getElementById('modals-container').appendChild(modal);
        this.activeModals.push(modal);
        
        // Store the resolve function
        this.confirmResolve = resolve;
    });
}

resolveConfirm(value) {
    if (this.confirmResolve) {
        this.confirmResolve(value);
        this.confirmResolve = null;
    }
    this.closeModal();
}

toggleGridView() {
    const grid = document.getElementById('character-grid');
    if (grid) {
        grid.classList.toggle('list-view');
        const icon = document.getElementById('view-icon');
        if (icon) {
            icon.textContent = grid.classList.contains('list-view') ? '⚏' : '⚐';
        }
    }
}

// Enhanced notification with auto-dismiss
showNotification(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type} notification-enter`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('notification-show'), 10);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('notification-exit');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    return notification;
}