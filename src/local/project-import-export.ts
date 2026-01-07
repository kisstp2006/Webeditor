/**
 * Project Import/Export Utilities
 * 
 * This module provides utilities for importing and exporting projects
 * between local storage and file system.
 */

import { localStorageManager } from './local-storage-manager';

/**
 * Export a project to a JSON file
 */
export async function exportProjectToFile(projectId: number): Promise<void> {
    try {
        const projectData = await localStorageManager.exportProject(projectId);
        
        // Convert to JSON string
        const jsonString = JSON.stringify(projectData, null, 2);
        
        // Create a blob
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-${projectData.project.name}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('[Export] Project exported successfully');
    } catch (error) {
        console.error('[Export] Failed to export project:', error);
        throw error;
    }
}

/**
 * Import a project from a JSON file
 */
export async function importProjectFromFile(file: File): Promise<number> {
    try {
        const text = await file.text();
        const projectData = JSON.parse(text);
        
        const project = await localStorageManager.importProject(projectData);
        
        console.log('[Import] Project imported successfully:', project.id);
        return project.id;
    } catch (error) {
        console.error('[Import] Failed to import project:', error);
        throw error;
    }
}

/**
 * Export all projects to a single backup file
 */
export async function exportAllProjects(): Promise<void> {
    try {
        const projects = await localStorageManager.listProjects();
        const allData = [];
        
        for (const project of projects) {
            const projectData = await localStorageManager.exportProject(project.id);
            allData.push(projectData);
        }
        
        const jsonString = JSON.stringify({
            version: 1,
            exportedAt: new Date().toISOString(),
            projects: allData
        }, null, 2);
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all-projects-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('[Export] All projects exported successfully');
    } catch (error) {
        console.error('[Export] Failed to export all projects:', error);
        throw error;
    }
}

/**
 * Import multiple projects from a backup file
 */
export async function importAllProjects(file: File): Promise<number[]> {
    try {
        const text = await file.text();
        const backupData = JSON.parse(text);
        
        if (!backupData.projects || !Array.isArray(backupData.projects)) {
            throw new Error('Invalid backup file format');
        }
        
        const importedIds: number[] = [];
        
        for (const projectData of backupData.projects) {
            const project = await localStorageManager.importProject(projectData);
            importedIds.push(project.id);
        }
        
        console.log('[Import] All projects imported successfully');
        return importedIds;
    } catch (error) {
        console.error('[Import] Failed to import all projects:', error);
        throw error;
    }
}

/**
 * Create a file input element for importing
 */
export function createImportFileInput(onImport: (projectId: number) => void): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.addEventListener('change', async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            try {
                const projectId = await importProjectFromFile(file);
                onImport(projectId);
            } catch (error) {
                alert('Failed to import project: ' + (error as Error).message);
            }
        }
    });
    
    return input;
}

/**
 * Add UI controls for import/export to the editor
 */
export function addImportExportControls() {
    // This function can be called to add UI controls to the editor
    // It could add buttons to the toolbar or menu for import/export
    
    if (typeof editor === 'undefined') {
        console.warn('[Import/Export] Editor not available');
        return;
    }
    
    if (typeof (editor as any).once === 'function') {
        (editor as any).once('load', () => {
            console.log('[Import/Export] Controls ready');
            
            // Expose functions to global scope for easy access from console
            (window as any).__exportProject__ = exportProjectToFile;
            (window as any).__importProject__ = importProjectFromFile;
            (window as any).__exportAllProjects__ = exportAllProjects;
            (window as any).__importAllProjects__ = importAllProjects;
            
            console.log('[Import/Export] Use window.__exportProject__(projectId) to export');
            console.log('[Import/Export] Use window.__exportAllProjects__() to export all');
        });
    }
}

// Auto-initialize controls when offline mode is enabled
if (typeof window !== 'undefined' && (window as any).__OFFLINE_MODE__) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addImportExportControls);
    } else {
        addImportExportControls();
    }
}
