/**
 * Local Storage Module Index
 * 
 * This module exports all local storage functionality for offline use.
 */

export { localStorageManager } from './local-storage-manager';
export { localRestApi } from './local-rest-api';
export { initOfflineMode, isOfflineMode, interceptRestApi } from './api-interceptor';
export {
    exportProjectToFile,
    importProjectFromFile,
    exportAllProjects,
    importAllProjects,
    createImportFileInput,
    addImportExportControls
} from './project-import-export';
export { initOfflineUI, removeOfflineUI } from './offline-ui';
export {
    createBlankProject,
    createSampleProject,
    seedSampleProjects,
    hasProjects,
    initializeIfEmpty
} from './sample-seeder';
