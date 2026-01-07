/**
 * Local REST API Wrapper
 * 
 * This module provides a wrapper around the local storage manager that
 * mimics the interface of the remote REST API, allowing seamless replacement.
 */

import { localStorageManager } from './local-storage-manager';

/**
 * Mock Ajax class that mimics the behavior of the real Ajax class
 * but uses local storage instead of network requests
 */
class LocalAjax<T> {
    private handlers: { [key: string]: Function[] } = {};

    constructor(private promise: Promise<T>) {
        this.execute();
    }

    on(event: string, handler: Function): this {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
        return this;
    }

    private emit(event: string, ...args: any[]) {
        if (this.handlers[event]) {
            this.handlers[event].forEach(handler => handler(...args));
        }
    }

    private async execute() {
        try {
            const result = await this.promise;
            // Simulate network delay for realism (optional, can be removed)
            setTimeout(() => {
                this.emit('load', 200, result);
            }, 10);
        } catch (error) {
            setTimeout(() => {
                this.emit('error', 500, error);
            }, 10);
        }
    }

    static get<T>(promise: Promise<T>): LocalAjax<T> {
        return new LocalAjax<T>(promise);
    }

    static post<T>(promise: Promise<T>): LocalAjax<T> {
        return new LocalAjax<T>(promise);
    }

    static put<T>(promise: Promise<T>): LocalAjax<T> {
        return new LocalAjax<T>(promise);
    }

    static delete<T>(promise: Promise<T>): LocalAjax<T> {
        return new LocalAjax<T>(promise);
    }
}

// ==================== PROJECTS API ====================

export const projectCreate = (args: any) => {
    return LocalAjax.post(localStorageManager.createProject(args));
};

export const projectGet = (args: { projectId: number }) => {
    return LocalAjax.get(localStorageManager.getProject(args.projectId));
};

export const projectUpdate = (args: any) => {
    const { projectId, ...data } = args;
    return LocalAjax.put(localStorageManager.updateProject(projectId, data));
};

export const projectDelete = (args: { projectId: number }) => {
    return LocalAjax.delete(localStorageManager.deleteProject(args.projectId));
};

export const projectExport = (args: { projectId: number }) => {
    return LocalAjax.post(
        localStorageManager.exportProject(args.projectId).then(data => ({
            job: { id: 1 },
            data
        }))
    );
};

export const projectImport = (args: { export_url?: string; owner?: number; data?: any }) => {
    // If export_url is provided, we would need to fetch it
    // For now, assume data is provided directly
    if (args.data) {
        return LocalAjax.post(localStorageManager.importProject(args.data));
    }
    return LocalAjax.post(Promise.reject(new Error('Import data required for local storage')));
};

export const projectUnlock = (projectId: number) => {
    return LocalAjax.post(Promise.resolve({ success: true }));
};

export const projectTransfer = (projectId: number, data: any) => {
    return LocalAjax.post(
        localStorageManager.updateProject(projectId, { owner: data.owner_id })
    );
};

export const projectAcceptTransfer = (projectId: number) => {
    return LocalAjax.post(Promise.resolve({ success: true }));
};

export const projectDeclineTransfer = (projectId: number) => {
    return LocalAjax.post(Promise.resolve({ success: true }));
};

export const projectActivity = (projectId: number) => {
    return LocalAjax.get(Promise.resolve([]));
};

export const projectCollabList = (projectId: number) => {
    return LocalAjax.get(Promise.resolve([]));
};

export const projectCollabCreate = (projectId: number, collab: any) => {
    return LocalAjax.post(Promise.resolve(collab));
};

export const projectCollabUpdate = (projectId: number, collab: any) => {
    return LocalAjax.put(Promise.resolve(collab));
};

export const projectCollabDelete = (projectId: number, collabId: number) => {
    return LocalAjax.delete(Promise.resolve(undefined));
};

export const projectImage = (projectId: number, file: File) => {
    return LocalAjax.post(
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;
                localStorageManager.updateProject(projectId, { image_url: imageUrl })
                    .then(() => resolve({ url: imageUrl }));
            };
            reader.readAsDataURL(file);
        })
    );
};

export const projectAssets = (view: string, cookies = false) => {
    // Get project ID from config if available
    const projectId = (typeof config !== 'undefined' && config.project) ? (config.project as any).id : null;
    const branchId = 'master';
    
    if (projectId) {
        return LocalAjax.get(
            localStorageManager.listAssets(projectId, branchId).then(assets => ({
                result: assets
            }))
        );
    }
    return LocalAjax.get(Promise.resolve({ result: [] }));
};

export const projectScenes = () => {
    // Get project ID from config if available
    const projectId = (typeof config !== 'undefined' && config.project) ? (config.project as any).id : null;
    const branchId = 'master';
    
    if (projectId) {
        return LocalAjax.get(
            localStorageManager.listScenes(projectId, branchId).then(scenes => ({
                result: scenes
            }))
        );
    }
    return LocalAjax.get(Promise.resolve({ result: [] }));
};

export const projectBranches = (options: any) => {
    return LocalAjax.get(Promise.resolve({ result: [{ id: 'master', name: 'Master' }] }));
};

export const projectApps = (limit = 0, skip = 0) => {
    return LocalAjax.get(Promise.resolve({ result: [] }));
};

export const projectRepoList = () => {
    return LocalAjax.get(Promise.resolve([]));
};

export const projectRepoSourcefilesList = (repoService: string) => {
    return LocalAjax.get(Promise.resolve([]));
};

export const projectRepoSourcefile = (repoService: string, relativePath: string) => {
    return LocalAjax.get(Promise.resolve(''));
};

export const projectRepoSourcefilesDelete = (fileName: string, repoService = 'directory') => {
    return LocalAjax.delete(Promise.resolve(undefined));
};

// ==================== ASSETS API ====================

export const assetCreate = (data: any) => {
    return LocalAjax.post(localStorageManager.createAsset(data));
};

export const assetGet = (assetId: number, options?: any) => {
    return LocalAjax.get(localStorageManager.getAsset(assetId));
};

export const assetUpdate = (assetId: number, data: any) => {
    return LocalAjax.put(localStorageManager.updateAsset(assetId, data));
};

export const assetDelete = (assetId: number) => {
    return LocalAjax.delete(localStorageManager.deleteAsset(assetId));
};

export const assetList = (projectId: number, branchId?: string) => {
    return LocalAjax.get(
        localStorageManager.listAssets(projectId, branchId).then(assets => ({
            result: assets
        }))
    );
};

// ==================== SCENES API ====================

export const sceneCreate = (data: any) => {
    return LocalAjax.post(localStorageManager.createScene(data));
};

export const sceneGet = (sceneId: number, cookies = false) => {
    return LocalAjax.get(localStorageManager.getScene(sceneId));
};

export const sceneDelete = (sceneId: number) => {
    return LocalAjax.delete(localStorageManager.deleteScene(sceneId));
};

export const sceneList = (projectId: number, branchId?: string) => {
    return LocalAjax.get(
        localStorageManager.listScenes(projectId, branchId).then(scenes => ({
            result: scenes
        }))
    );
};

// ==================== USERS API ====================

export const userGet = (userId: number) => {
    return LocalAjax.get(Promise.resolve({
        id: userId,
        username: 'local-user',
        full_name: 'Local User',
        email: 'local@localhost'
    }));
};

export const userProjects = (userId: number, view?: string) => {
    return LocalAjax.get(
        localStorageManager.listProjects().then(projects => ({
            result: projects
        }))
    );
};

// ==================== APPS API ====================

export const appList = (type?: string) => {
    // Return empty starter kits for local mode
    return LocalAjax.get(Promise.resolve({ result: [] }));
};

export const appGet = (appId: number) => {
    return LocalAjax.get(Promise.resolve({}));
};

// ==================== JOBS API ====================

export const jobGet = (args: { jobId: number }) => {
    // Simulate completed job
    return LocalAjax.get(Promise.resolve({
        id: args.jobId,
        status: 'complete',
        progress: 100
    }));
};

// ==================== UPLOAD API ====================

export const uploadStart = (args: { filename: string }) => {
    return LocalAjax.post(Promise.resolve({
        uploadId: 'local-' + Date.now(),
        key: args.filename
    }));
};

export const uploadUrls = (args: { uploadId: string; parts: number; key: string }) => {
    const urls = [];
    for (let i = 0; i < args.parts; i++) {
        urls.push({ url: `local://upload/${i}`, partNumber: i + 1 });
    }
    return LocalAjax.post(Promise.resolve({ urls }));
};

export const uploadComplete = (args: any) => {
    return LocalAjax.post(Promise.resolve({
        url: `local://file/${args.key}`
    }));
};

// ==================== BRANCHES API ====================

export const branchCreate = (data: any) => {
    return LocalAjax.post(Promise.resolve({
        id: 'branch-' + Date.now(),
        name: data.name
    }));
};

export const branchGet = (branchId: string) => {
    return LocalAjax.get(Promise.resolve({
        id: branchId,
        name: branchId === 'master' ? 'Master' : branchId
    }));
};

export const branchUpdate = (branchId: string, data: any) => {
    return LocalAjax.put(Promise.resolve({ id: branchId, ...data }));
};

export const branchDelete = (branchId: string) => {
    return LocalAjax.delete(Promise.resolve(undefined));
};

export const branchList = (projectId: number) => {
    return LocalAjax.get(Promise.resolve({
        result: [{ id: 'master', name: 'Master' }]
    }));
};

// ==================== CHECKPOINTS API ====================

export const checkpointCreate = (data: any) => {
    return LocalAjax.post(Promise.resolve({
        id: 'checkpoint-' + Date.now(),
        ...data
    }));
};

export const checkpointList = (projectId: number) => {
    return LocalAjax.get(Promise.resolve({ result: [] }));
};

// ==================== OTHER APIs ====================

export const watchCreate = (data: any) => {
    return LocalAjax.post(Promise.resolve({ id: 1 }));
};

export const watchDelete = (watchId: number) => {
    return LocalAjax.delete(Promise.resolve(undefined));
};

export const storeList = (args: any) => {
    return LocalAjax.get(Promise.resolve({ result: [] }));
};

export const storeClone = (storeId: number, data: any) => {
    return LocalAjax.post(Promise.resolve({}));
};

// ==================== Aggregated Export ====================

export const localRestApi = {
    // Projects
    projects: {
        projectCreate,
        projectGet,
        projectUpdate,
        projectDelete,
        projectExport,
        projectImport,
        projectUnlock,
        projectTransfer,
        projectAcceptTransfer,
        projectDeclineTransfer,
        projectActivity,
        projectCollabList,
        projectCollabCreate,
        projectCollabUpdate,
        projectCollabDelete,
        projectImage,
        projectAssets,
        projectScenes,
        projectBranches,
        projectApps,
        projectRepoList,
        projectRepoSourcefilesList,
        projectRepoSourcefile,
        projectRepoSourcefilesDelete
    },
    // Assets
    assets: {
        assetCreate,
        assetGet,
        assetUpdate,
        assetDelete,
        assetList
    },
    // Scenes
    scenes: {
        sceneCreate,
        sceneGet,
        sceneDelete,
        sceneList
    },
    // Users
    users: {
        userGet,
        userProjects
    },
    // Apps
    apps: {
        appList,
        appGet
    },
    // Jobs
    jobs: {
        jobGet
    },
    // Upload
    upload: {
        uploadStart,
        uploadUrls,
        uploadComplete
    },
    // Branches
    branches: {
        branchCreate,
        branchGet,
        branchUpdate,
        branchDelete,
        branchList
    },
    // Checkpoints
    checkpoints: {
        checkpointCreate,
        checkpointList
    },
    // Watch
    watch: {
        watchCreate,
        watchDelete
    },
    // Store
    store: {
        storeList,
        storeClone
    }
};
