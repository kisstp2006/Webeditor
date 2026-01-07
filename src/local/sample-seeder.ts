/**
 * Sample Project Seeder
 * 
 * Creates sample projects for testing and demonstration purposes.
 */

import { localStorageManager } from './local-storage-manager';

/**
 * Create a blank project
 */
export async function createBlankProject(name: string = 'Blank Project'): Promise<number> {
    const project = await localStorageManager.createProject({
        name,
        description: 'A new blank project',
        settings: {
            width: 1280,
            height: 720,
            useDevicePixelRatio: true,
            fillMode: 'FILL_WINDOW',
            resolutionMode: 'AUTO',
            antiAlias: true,
            vr: false,
            layers: {
                '0': { name: 'World', opaqueSortMode: 2, transparentSortMode: 3 },
                '1': { name: 'Depth', opaqueSortMode: 2, transparentSortMode: 3 },
                '2': { name: 'Skybox', opaqueSortMode: 0, transparentSortMode: 3 },
                '3': { name: 'Immediate', opaqueSortMode: 0, transparentSortMode: 3 },
                '4': { name: 'UI', opaqueSortMode: 1, transparentSortMode: 1 }
            },
            scripts: [],
            externalScripts: []
        }
    });

    // Create default scene
    await localStorageManager.createScene({
        projectId: project.id,
        branchId: 'master',
        name: 'Main Scene',
        data: {
            entities: []
        }
    });

    return project.id;
}

/**
 * Create a project with sample assets
 */
export async function createSampleProject(): Promise<number> {
    const project = await localStorageManager.createProject({
        name: 'Sample Project',
        description: 'A sample project with example assets and scenes',
        settings: {
            width: 1280,
            height: 720,
            useDevicePixelRatio: true,
            fillMode: 'FILL_WINDOW',
            resolutionMode: 'AUTO',
            antiAlias: true
        }
    });

    // Create folder structure
    const modelsFolder = await localStorageManager.createAsset({
        projectId: project.id,
        branchId: 'master',
        name: 'Models',
        type: 'folder',
        parent: null
    });

    const texturesFolder = await localStorageManager.createAsset({
        projectId: project.id,
        branchId: 'master',
        name: 'Textures',
        type: 'folder',
        parent: null
    });

    const scriptsFolder = await localStorageManager.createAsset({
        projectId: project.id,
        branchId: 'master',
        name: 'Scripts',
        type: 'folder',
        parent: null
    });

    // Create sample assets
    await localStorageManager.createAsset({
        projectId: project.id,
        branchId: 'master',
        name: 'PlayerController.js',
        type: 'script',
        parent: scriptsFolder.id,
        data: {
            scripts: [{
                name: 'playerController',
                attributes: []
            }]
        }
    });

    await localStorageManager.createAsset({
        projectId: project.id,
        branchId: 'master',
        name: 'CameraController.js',
        type: 'script',
        parent: scriptsFolder.id,
        data: {
            scripts: [{
                name: 'cameraController',
                attributes: []
            }]
        }
    });

    // Create sample scene
    await localStorageManager.createScene({
        projectId: project.id,
        branchId: 'master',
        name: 'Game Scene',
        data: {
            entities: [
                {
                    name: 'Camera',
                    components: {
                        camera: {
                            clearColor: [0.118, 0.118, 0.118, 1],
                            farClip: 1000,
                            nearClip: 0.1,
                            fov: 45
                        }
                    },
                    position: [0, 0, 10]
                },
                {
                    name: 'Light',
                    components: {
                        light: {
                            type: 'directional',
                            color: [1, 1, 1],
                            intensity: 1
                        }
                    },
                    rotation: [45, 45, 0]
                }
            ]
        }
    });

    return project.id;
}

/**
 * Create multiple sample projects
 */
export async function seedSampleProjects(): Promise<number[]> {
    const projectIds: number[] = [];

    try {
        console.log('[Seeder] Creating sample projects...');

        // Create blank project
        const blankId = await createBlankProject('My First Project');
        projectIds.push(blankId);
        console.log('[Seeder] Created blank project:', blankId);

        // Create sample project
        const sampleId = await createSampleProject();
        projectIds.push(sampleId);
        console.log('[Seeder] Created sample project:', sampleId);

        console.log('[Seeder] Successfully created', projectIds.length, 'projects');
        return projectIds;
    } catch (error) {
        console.error('[Seeder] Failed to create sample projects:', error);
        throw error;
    }
}

/**
 * Check if any projects exist
 */
export async function hasProjects(): Promise<boolean> {
    const projects = await localStorageManager.listProjects();
    return projects.length > 0;
}

/**
 * Initialize with sample projects if none exist
 */
export async function initializeIfEmpty(): Promise<void> {
    const exists = await hasProjects();
    
    if (!exists) {
        console.log('[Seeder] No projects found, creating samples...');
        await seedSampleProjects();
    } else {
        console.log('[Seeder] Projects already exist, skipping initialization');
    }
}

// Expose to global scope for easy access
if (typeof window !== 'undefined') {
    (window as any).__createBlankProject__ = createBlankProject;
    (window as any).__createSampleProject__ = createSampleProject;
    (window as any).__seedSampleProjects__ = seedSampleProjects;
}
