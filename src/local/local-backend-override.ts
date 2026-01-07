// Override the API to use local IndexedDB storage instead of web API
// This file is imported first in editor/index.ts, so it runs before Editor boot.
import { localRestApi } from './local-rest-api';
import { localStorageManager } from './local-storage-manager';
import { initOfflineMode } from './api-interceptor';
import { initOfflineUI } from './offline-ui';
import { initializeIfEmpty, createBlankProject } from './sample-seeder';

(function() {
    try {
        const params = new URLSearchParams(window.location.search);
        // Enable with ?use_local_storage, ?local_storage, ?offline or ?use_local_backend
        const enabled = params.has('use_local_storage') || 
                       params.has('local_storage') || 
                       params.has('offline') ||
                       params.has('use_local_backend') || 
                       params.has('local_backend');
        
        if (!enabled) return;

        // Initialize local storage
        localStorageManager.init().then(async () => {
            console.log('[Local Storage] Initialized successfully');
            
            // Check if we need to create a default project
            const projects = await localStorageManager.listProjects();
            
            if (projects.length === 0) {
                console.log('[Local Storage] No projects found, creating default project...');
                const projectId = await createBlankProject('Default Project');
                console.log('[Local Storage] Created default project with ID:', projectId);
                
                // Update config if it exists
                if (window.config && window.config.project) {
                    (window.config.project as any).id = projectId;
                    (window.config.project as any).name = 'Default Project';
                    console.log('[Local Storage] Updated config with default project');
                }
            } else {
                console.log('[Local Storage] Found', projects.length, 'existing project(s)');
                
                // If config expects a project but it doesn't exist, use the first one
                if (window.config && window.config.project) {
                    const currentProjectId = (window.config.project as any).id;
                    const projectExists = projects.some(p => p.id === currentProjectId);
                    
                    if (!projectExists) {
                        console.log('[Local Storage] Current project not found, using first available project');
                        (window.config.project as any).id = projects[0].id;
                        (window.config.project as any).name = projects[0].name;
                    }
                }
            }
        }).catch((error) => {
            console.error('[Local Storage] Initialization failed:', error);
        });

        // Mark environment so features can branch if needed
        (window as any).__LOCAL_STORAGE__ = true;
        (window as any).__LOCAL_BACKEND__ = true;
        (window as any).__OFFLINE_MODE__ = true;
        
        // Store reference to local API for global access
        (window as any).__LOCAL_API__ = localRestApi;
        (window as any).__LOCAL_STORAGE_MANAGER__ = localStorageManager;

        console.log('[Local Storage] Offline mode enabled - using IndexedDB storage');
        console.log('[Local Storage] Add ?use_local_storage or ?offline to URL to enable');
        
        // Initialize offline mode (this will intercept API calls)
        initOfflineMode();
        
        // Initialize offline UI
        initOfflineUI();
    } catch (e) {
        console.warn('[Local Storage] override failed:', e);
    }
})();
