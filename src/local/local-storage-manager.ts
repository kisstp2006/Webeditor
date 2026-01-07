/**
 * Local Storage Manager
 * 
 * This module provides offline storage capabilities for the game engine,
 * replacing web API calls with local IndexedDB storage.
 */

const DB_NAME = 'GameEngineLocalDB';
const DB_VERSION = 1;

// Store names
const STORES = {
    PROJECTS: 'projects',
    ASSETS: 'assets',
    SCENES: 'scenes',
    BRANCHES: 'branches',
    CHECKPOINTS: 'checkpoints',
    SETTINGS: 'settings',
    FILES: 'files',
    METADATA: 'metadata'
};

interface Project {
    id: number;
    name: string;
    description?: string;
    owner?: any;
    created: string;
    modified: string;
    private?: boolean;
    private_source_assets?: boolean;
    settings?: any;
    fork_from?: number;
    image_url?: string;
    website?: string;
    tags?: string[];
    primary_app?: number;
}

interface Asset {
    id: number;
    projectId: number;
    branchId: string;
    name: string;
    type: string;
    parent?: number | null;
    file?: any;
    data?: any;
    created: string;
    modified: string;
    thumbnails?: any;
}

interface Scene {
    id: number;
    projectId: number;
    branchId: string;
    name: string;
    data?: any;
    created: string;
    modified: string;
}

class LocalStorageManager {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;
    private nextProjectId = 1000;
    private nextAssetId = 1000;
    private nextSceneId = 1000;

    /**
     * Initialize the IndexedDB database
     */
    async init(): Promise<void> {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.loadMetadata().then(resolve).catch(reject);
            };

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
                    const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
                    projectStore.createIndex('name', 'name', { unique: false });
                    projectStore.createIndex('owner', 'owner.id', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.ASSETS)) {
                    const assetStore = db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
                    assetStore.createIndex('projectId', 'projectId', { unique: false });
                    assetStore.createIndex('branchId', 'branchId', { unique: false });
                    assetStore.createIndex('type', 'type', { unique: false });
                    assetStore.createIndex('parent', 'parent', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.SCENES)) {
                    const sceneStore = db.createObjectStore(STORES.SCENES, { keyPath: 'id' });
                    sceneStore.createIndex('projectId', 'projectId', { unique: false });
                    sceneStore.createIndex('branchId', 'branchId', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.BRANCHES)) {
                    db.createObjectStore(STORES.BRANCHES, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.CHECKPOINTS)) {
                    db.createObjectStore(STORES.CHECKPOINTS, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains(STORES.FILES)) {
                    const fileStore = db.createObjectStore(STORES.FILES, { keyPath: 'id' });
                    fileStore.createIndex('assetId', 'assetId', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.METADATA)) {
                    db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
                }
            };
        });

        return this.initPromise;
    }

    /**
     * Load metadata (counters for IDs)
     */
    private async loadMetadata(): Promise<void> {
        if (!this.db) return;

        const transaction = this.db.transaction([STORES.METADATA], 'readonly');
        const store = transaction.objectStore(STORES.METADATA);

        const projectIdRequest = store.get('nextProjectId');
        const assetIdRequest = store.get('nextAssetId');
        const sceneIdRequest = store.get('nextSceneId');

        return new Promise((resolve) => {
            transaction.oncomplete = () => {
                if (projectIdRequest.result) {
                    this.nextProjectId = projectIdRequest.result.value;
                }
                if (assetIdRequest.result) {
                    this.nextAssetId = assetIdRequest.result.value;
                }
                if (sceneIdRequest.result) {
                    this.nextSceneId = sceneIdRequest.result.value;
                }
                resolve();
            };
        });
    }

    /**
     * Save metadata
     */
    private async saveMetadata(): Promise<void> {
        if (!this.db) return;

        const transaction = this.db.transaction([STORES.METADATA], 'readwrite');
        const store = transaction.objectStore(STORES.METADATA);

        store.put({ key: 'nextProjectId', value: this.nextProjectId });
        store.put({ key: 'nextAssetId', value: this.nextAssetId });
        store.put({ key: 'nextSceneId', value: this.nextSceneId });

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Get next project ID
     */
    private getNextProjectId(): number {
        return this.nextProjectId++;
    }

    /**
     * Get next asset ID
     */
    private getNextAssetId(): number {
        return this.nextAssetId++;
    }

    /**
     * Get next scene ID
     */
    private getNextSceneId(): number {
        return this.nextSceneId++;
    }

    // ==================== PROJECT OPERATIONS ====================

    /**
     * Create a new project
     */
    async createProject(data: Partial<Project>): Promise<Project> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const project: Project = {
            id: this.getNextProjectId(),
            name: data.name || 'Untitled Project',
            description: data.description || '',
            owner: data.owner || { id: 1, username: 'local' },
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            private: data.private ?? false,
            private_source_assets: data.private_source_assets ?? false,
            settings: data.settings || {},
            fork_from: data.fork_from,
            image_url: data.image_url,
            website: data.website,
            tags: data.tags || [],
            primary_app: data.primary_app
        };

        const transaction = this.db.transaction([STORES.PROJECTS], 'readwrite');
        const store = transaction.objectStore(STORES.PROJECTS);
        store.add(project);

        await this.saveMetadata();

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(project);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Get a project by ID
     */
    async getProject(projectId: number): Promise<Project | undefined> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORES.PROJECTS], 'readonly');
        const store = transaction.objectStore(STORES.PROJECTS);
        const request = store.get(projectId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update a project
     */
    async updateProject(projectId: number, data: Partial<Project>): Promise<Project> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const project = await this.getProject(projectId);
        if (!project) throw new Error('Project not found');

        const updatedProject: Project = {
            ...project,
            ...data,
            id: projectId, // Ensure ID doesn't change
            modified: new Date().toISOString()
        };

        const transaction = this.db.transaction([STORES.PROJECTS], 'readwrite');
        const store = transaction.objectStore(STORES.PROJECTS);
        store.put(updatedProject);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(updatedProject);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Delete a project
     */
    async deleteProject(projectId: number): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction(
            [STORES.PROJECTS, STORES.ASSETS, STORES.SCENES],
            'readwrite'
        );

        // Delete project
        transaction.objectStore(STORES.PROJECTS).delete(projectId);

        // Delete associated assets
        const assetStore = transaction.objectStore(STORES.ASSETS);
        const assetIndex = assetStore.index('projectId');
        const assetRequest = assetIndex.openCursor(IDBKeyRange.only(projectId));
        assetRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        // Delete associated scenes
        const sceneStore = transaction.objectStore(STORES.SCENES);
        const sceneIndex = sceneStore.index('projectId');
        const sceneRequest = sceneIndex.openCursor(IDBKeyRange.only(projectId));
        sceneRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * List all projects
     */
    async listProjects(): Promise<Project[]> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORES.PROJECTS], 'readonly');
        const store = transaction.objectStore(STORES.PROJECTS);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== ASSET OPERATIONS ====================

    /**
     * Create a new asset
     */
    async createAsset(data: Partial<Asset>): Promise<Asset> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const asset: Asset = {
            id: this.getNextAssetId(),
            projectId: data.projectId || 0,
            branchId: data.branchId || 'master',
            name: data.name || 'Untitled Asset',
            type: data.type || 'folder',
            parent: data.parent ?? null,
            file: data.file,
            data: data.data || {},
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            thumbnails: data.thumbnails
        };

        const transaction = this.db.transaction([STORES.ASSETS], 'readwrite');
        const store = transaction.objectStore(STORES.ASSETS);
        store.add(asset);

        await this.saveMetadata();

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(asset);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Get an asset by ID
     */
    async getAsset(assetId: number): Promise<Asset | undefined> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORES.ASSETS], 'readonly');
        const store = transaction.objectStore(STORES.ASSETS);
        const request = store.get(assetId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update an asset
     */
    async updateAsset(assetId: number, data: Partial<Asset>): Promise<Asset> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const asset = await this.getAsset(assetId);
        if (!asset) throw new Error('Asset not found');

        const updatedAsset: Asset = {
            ...asset,
            ...data,
            id: assetId,
            modified: new Date().toISOString()
        };

        const transaction = this.db.transaction([STORES.ASSETS], 'readwrite');
        const store = transaction.objectStore(STORES.ASSETS);
        store.put(updatedAsset);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(updatedAsset);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Delete an asset
     */
    async deleteAsset(assetId: number): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORES.ASSETS], 'readwrite');
        const store = transaction.objectStore(STORES.ASSETS);
        store.delete(assetId);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * List assets for a project
     */
    async listAssets(projectId: number, branchId?: string): Promise<Asset[]> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORES.ASSETS], 'readonly');
        const store = transaction.objectStore(STORES.ASSETS);
        const index = store.index('projectId');
        const request = index.getAll(IDBKeyRange.only(projectId));

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                let results = request.result;
                if (branchId) {
                    results = results.filter(asset => asset.branchId === branchId);
                }
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== SCENE OPERATIONS ====================

    /**
     * Create a new scene
     */
    async createScene(data: Partial<Scene>): Promise<Scene> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const scene: Scene = {
            id: this.getNextSceneId(),
            projectId: data.projectId || 0,
            branchId: data.branchId || 'master',
            name: data.name || 'Untitled Scene',
            data: data.data || {},
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };

        const transaction = this.db.transaction([STORES.SCENES], 'readwrite');
        const store = transaction.objectStore(STORES.SCENES);
        store.add(scene);

        await this.saveMetadata();

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(scene);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Get a scene by ID
     */
    async getScene(sceneId: number): Promise<Scene | undefined> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORES.SCENES], 'readonly');
        const store = transaction.objectStore(STORES.SCENES);
        const request = store.get(sceneId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update a scene
     */
    async updateScene(sceneId: number, data: Partial<Scene>): Promise<Scene> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const scene = await this.getScene(sceneId);
        if (!scene) throw new Error('Scene not found');

        const updatedScene: Scene = {
            ...scene,
            ...data,
            id: sceneId,
            modified: new Date().toISOString()
        };

        const transaction = this.db.transaction([STORES.SCENES], 'readwrite');
        const store = transaction.objectStore(STORES.SCENES);
        store.put(updatedScene);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(updatedScene);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Delete a scene
     */
    async deleteScene(sceneId: number): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORES.SCENES], 'readwrite');
        const store = transaction.objectStore(STORES.SCENES);
        store.delete(sceneId);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * List scenes for a project
     */
    async listScenes(projectId: number, branchId?: string): Promise<Scene[]> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORES.SCENES], 'readonly');
        const store = transaction.objectStore(STORES.SCENES);
        const index = store.index('projectId');
        const request = index.getAll(IDBKeyRange.only(projectId));

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                let results = request.result;
                if (branchId) {
                    results = results.filter(scene => scene.branchId === branchId);
                }
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== UTILITY OPERATIONS ====================

    /**
     * Export project data
     */
    async exportProject(projectId: number): Promise<any> {
        await this.init();

        const project = await this.getProject(projectId);
        const assets = await this.listAssets(projectId);
        const scenes = await this.listScenes(projectId);

        return {
            project,
            assets,
            scenes,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import project data
     */
    async importProject(data: any): Promise<Project> {
        await this.init();

        // Create the project
        const project = await this.createProject(data.project);

        // Import assets
        if (data.assets && Array.isArray(data.assets)) {
            for (const assetData of data.assets) {
                await this.createAsset({
                    ...assetData,
                    projectId: project.id
                });
            }
        }

        // Import scenes
        if (data.scenes && Array.isArray(data.scenes)) {
            for (const sceneData of data.scenes) {
                await this.createScene({
                    ...sceneData,
                    projectId: project.id
                });
            }
        }

        return project;
    }

    /**
     * Clear all data (use with caution!)
     */
    async clearAll(): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const storeNames = [STORES.PROJECTS, STORES.ASSETS, STORES.SCENES, STORES.BRANCHES, STORES.CHECKPOINTS, STORES.SETTINGS, STORES.FILES, STORES.METADATA];
        const transaction = this.db.transaction(storeNames, 'readwrite');

        for (const storeName of storeNames) {
            transaction.objectStore(storeName).clear();
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                this.nextProjectId = 1000;
                this.nextAssetId = 1000;
                this.nextSceneId = 1000;
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Export singleton instance
export const localStorageManager = new LocalStorageManager();
