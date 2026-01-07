/**
 * Offline Mode UI
 * 
 * Adds UI elements to indicate offline mode status and provide
 * import/export functionality.
 */

import { isOfflineMode } from './api-interceptor';
import { 
    exportProjectToFile, 
    importProjectFromFile,
    exportAllProjects,
    createImportFileInput
} from './project-import-export';

let offlineIndicator: HTMLElement | null = null;

/**
 * Create the offline mode indicator
 */
function createOfflineIndicator(): HTMLElement {
    const indicator = document.createElement('div');
    indicator.id = 'offline-mode-indicator';
    indicator.innerHTML = `
        <div class="offline-badge">
            <span class="offline-icon">📦</span>
            <span class="offline-text">Offline Mode</span>
        </div>
        <div class="offline-controls">
            <button id="export-current-project" title="Export Current Project">
                <span>💾</span> Export Project
            </button>
            <button id="export-all-projects" title="Export All Projects">
                <span>📚</span> Export All
            </button>
            <button id="import-project" title="Import Project">
                <span>📥</span> Import
            </button>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #offline-mode-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(33, 150, 243, 0.95);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 180px;
        }
        
        .offline-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: bold;
        }
        
        .offline-icon {
            font-size: 16px;
        }
        
        .offline-controls {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-top: 4px;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .offline-controls button {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s;
            white-space: nowrap;
        }
        
        .offline-controls button:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .offline-controls button:active {
            background: rgba(255, 255, 255, 0.4);
        }
        
        .offline-controls button span {
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            #offline-mode-indicator {
                top: 5px;
                right: 5px;
                font-size: 11px;
                padding: 6px 10px;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    return indicator;
}

/**
 * Get current project ID
 */
function getCurrentProjectId(): number | null {
    if (typeof config !== 'undefined' && config.project && (config.project as any).id) {
        return (config.project as any).id;
    }
    return null;
}

/**
 * Setup event listeners for the offline UI
 */
function setupEventListeners() {
    const exportCurrentBtn = document.getElementById('export-current-project');
    const exportAllBtn = document.getElementById('export-all-projects');
    const importBtn = document.getElementById('import-project');
    
    if (exportCurrentBtn) {
        exportCurrentBtn.addEventListener('click', async () => {
            const projectId = getCurrentProjectId();
            if (projectId) {
                try {
                    await exportProjectToFile(projectId);
                    showNotification('Project exported successfully!', 'success');
                } catch (error) {
                    showNotification('Failed to export project', 'error');
                    console.error(error);
                }
            } else {
                showNotification('No project is currently open', 'warning');
            }
        });
    }
    
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', async () => {
            try {
                await exportAllProjects();
                showNotification('All projects exported successfully!', 'success');
            } catch (error) {
                showNotification('Failed to export projects', 'error');
                console.error(error);
            }
        });
    }
    
    if (importBtn) {
        const fileInput = createImportFileInput((projectId) => {
            showNotification(`Project imported successfully! ID: ${projectId}`, 'success');
        });
        document.body.appendChild(fileInput);
        
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
}

/**
 * Show a notification message
 */
function showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const notification = document.createElement('div');
    notification.className = `offline-notification offline-notification-${type}`;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        .offline-notification {
            position: fixed;
            top: 50px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 13px;
            font-family: Arial, sans-serif;
            z-index: 10001;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        }
        
        .offline-notification-error {
            background: #f44336;
        }
        
        .offline-notification-warning {
            background: #ff9800;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    
    if (!document.querySelector('.offline-notification-style')) {
        style.className = 'offline-notification-style';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Initialize the offline mode UI
 */
export function initOfflineUI() {
    if (!isOfflineMode()) {
        return;
    }
    
    // Wait for DOM to be ready
    const init = () => {
        if (offlineIndicator) {
            return; // Already initialized
        }
        
        offlineIndicator = createOfflineIndicator();
        document.body.appendChild(offlineIndicator);
        setupEventListeners();
        
        console.log('[Offline UI] Initialized');
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

/**
 * Remove the offline mode UI
 */
export function removeOfflineUI() {
    if (offlineIndicator && offlineIndicator.parentNode) {
        offlineIndicator.parentNode.removeChild(offlineIndicator);
        offlineIndicator = null;
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    initOfflineUI();
}
