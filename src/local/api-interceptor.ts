/**
 * API Interceptor
 * 
 * This module intercepts REST API calls and redirects them to local storage
 * when offline mode is enabled.
 */

import { localRestApi } from './local-rest-api';

/**
 * Check if offline mode is enabled
 */
export function isOfflineMode(): boolean {
    return !!(window as any).__LOCAL_STORAGE__ || !!(window as any).__OFFLINE_MODE__;
}

/**
 * Replace the editor's REST API with local storage implementation
 */
export function interceptRestApi() {
    // Wait for editor API to be available
    const checkEditorApi = setInterval(() => {
        if (typeof editor !== 'undefined' && editor.api && editor.api.globals && editor.api.globals.rest) {
            clearInterval(checkEditorApi);
            
            if (isOfflineMode()) {
                console.log('[API Interceptor] Replacing REST API with local storage implementation');
                
                // Replace the entire REST API object
                const originalRest = editor.api.globals.rest;
                
                // Merge local API with original API to preserve any methods we haven't overridden
                Object.keys(localRestApi).forEach(apiGroup => {
                    if (originalRest[apiGroup]) {
                        Object.assign(originalRest[apiGroup], localRestApi[apiGroup]);
                    } else {
                        originalRest[apiGroup] = localRestApi[apiGroup];
                    }
                });
                
                console.log('[API Interceptor] REST API successfully replaced');
            }
        }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
        clearInterval(checkEditorApi);
    }, 10000);
}

/**
 * Initialize offline mode
 */
export function initOfflineMode() {
    if (isOfflineMode()) {
        console.log('[Offline Mode] Initializing...');
        
        // Intercept the REST API
        interceptRestApi();
        
        // Disable any features that require network connectivity
        disableNetworkFeatures();
        
        console.log('[Offline Mode] Initialized successfully');
    }
}

/**
 * Disable features that require network connectivity
 */
function disableNetworkFeatures() {
    // This function can be used to disable features like:
    // - Real-time collaboration
    // - Cloud asset loading
    // - External integrations
    // etc.
    
    if (typeof editor !== 'undefined') {
        // Wait for editor to load
        const disableFeatures = () => {
            // Disable realtime if available
            if (editor.api && editor.api.globals && editor.api.globals.realtime) {
                console.log('[Offline Mode] Disabling realtime features');
                // We don't actually disable realtime as it might be needed for local features
            }
            
            // Add more feature disabling logic here as needed
        };
        
        if (editor.api) {
            disableFeatures();
        } else if (typeof (editor as any).once === 'function') {
            (editor as any).once('load', disableFeatures);
        }
    }
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOfflineMode);
    } else {
        initOfflineMode();
    }
}
