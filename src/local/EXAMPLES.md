# Local Storage Examples

This file contains examples of how to use the local storage system.

## Basic Usage

### Creating a Project

```javascript
// Get the local storage manager
const manager = window.__LOCAL_STORAGE_MANAGER__;

// Create a new project
const project = await manager.createProject({
  name: "My Game",
  description: "An awesome game",
  settings: {
    width: 1920,
    height: 1080,
    antiAlias: true,
  },
});

console.log("Project created with ID:", project.id);
```

### Listing All Projects

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
const projects = await manager.listProjects();

console.table(
  projects.map((p) => ({
    ID: p.id,
    Name: p.name,
    Created: new Date(p.created).toLocaleDateString(),
  }))
);
```

### Getting a Specific Project

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
const project = await manager.getProject(1);
console.log(project);
```

### Updating a Project

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
await manager.updateProject(1, {
  name: "Updated Name",
  description: "New description",
});
```

### Deleting a Project

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
await manager.deleteProject(1);
console.log("Project deleted");
```

## Working with Assets

### Creating an Asset

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;

// Create a folder
const folder = await manager.createAsset({
  projectId: 1,
  branchId: "master",
  name: "Models",
  type: "folder",
  parent: null,
});

// Create a model asset inside the folder
const model = await manager.createAsset({
  projectId: 1,
  branchId: "master",
  name: "Player.glb",
  type: "model",
  parent: folder.id,
  data: {
    // Asset data here
  },
});
```

### Listing Project Assets

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
const assets = await manager.listAssets(1);

console.table(
  assets.map((a) => ({
    ID: a.id,
    Name: a.name,
    Type: a.type,
    Parent: a.parent,
  }))
);
```

### Searching for Assets

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
const assets = await manager.listAssets(1);

// Find all script assets
const scripts = assets.filter((a) => a.type === "script");
console.log("Script assets:", scripts);

// Find all assets in a specific folder
const folderAssets = assets.filter((a) => a.parent === 123);
console.log("Assets in folder:", folderAssets);
```

## Working with Scenes

### Creating a Scene

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;

const scene = await manager.createScene({
  projectId: 1,
  branchId: "master",
  name: "Level 1",
  data: {
    entities: [
      {
        name: "Camera",
        components: {
          camera: {
            clearColor: [0.1, 0.1, 0.1, 1],
            fov: 45,
          },
        },
      },
    ],
  },
});
```

### Listing Scenes

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
const scenes = await manager.listScenes(1);

console.table(
  scenes.map((s) => ({
    ID: s.id,
    Name: s.name,
    Created: new Date(s.created).toLocaleDateString(),
  }))
);
```

## Import/Export

### Export a Single Project

```javascript
// Export via UI button or:
await window.__exportProject__(1);
```

### Export All Projects

```javascript
await window.__exportAllProjects__();
```

### Import Project from JavaScript

```javascript
// Programmatic import
const projectData = {
  project: {
    name: "Imported Project",
    description: "From external source",
  },
  assets: [],
  scenes: [],
};

const manager = window.__LOCAL_STORAGE_MANAGER__;
const imported = await manager.importProject(projectData);
console.log("Imported project ID:", imported.id);
```

## Sample Projects

### Create a Blank Project

```javascript
const projectId = await window.__createBlankProject__("My New Game");
console.log("Created blank project:", projectId);
```

### Create a Sample Project with Assets

```javascript
const projectId = await window.__createSampleProject__();
console.log("Created sample project:", projectId);
```

### Seed Multiple Sample Projects

```javascript
const projectIds = await window.__seedSampleProjects__();
console.log("Created projects:", projectIds);
```

## Advanced Usage

### Complete CRUD Example

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;

// CREATE
const project = await manager.createProject({
  name: "CRUD Demo",
  description: "Demonstrating all operations",
});
console.log("Created:", project);

// READ
const retrieved = await manager.getProject(project.id);
console.log("Retrieved:", retrieved);

// UPDATE
const updated = await manager.updateProject(project.id, {
  description: "Updated description",
});
console.log("Updated:", updated);

// DELETE
await manager.deleteProject(project.id);
console.log("Deleted project", project.id);
```

### Bulk Operations

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;

// Create multiple projects
const projects = await Promise.all([
  manager.createProject({ name: "Project 1" }),
  manager.createProject({ name: "Project 2" }),
  manager.createProject({ name: "Project 3" }),
]);

console.log("Created", projects.length, "projects");

// Delete multiple projects
await Promise.all(projects.map((p) => manager.deleteProject(p.id)));

console.log("Deleted all projects");
```

### Working with Project Settings

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;

// Get project
const project = await manager.getProject(1);

// Update settings
project.settings.width = 2560;
project.settings.height = 1440;
project.settings.vr = true;

// Save changes
await manager.updateProject(1, {
  settings: project.settings,
});
```

### Asset Tree Navigation

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
const assets = await manager.listAssets(1);

// Build asset tree
function buildTree(assets, parentId = null) {
  return assets
    .filter((a) => a.parent === parentId)
    .map((a) => ({
      ...a,
      children: buildTree(assets, a.id),
    }));
}

const tree = buildTree(assets);
console.log("Asset tree:", tree);
```

### Export/Import with Transformation

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;

// Export project
const data = await manager.exportProject(1);

// Transform data (e.g., rename all assets)
data.assets = data.assets.map((asset) => ({
  ...asset,
  name: asset.name.toUpperCase(),
}));

// Import as new project
const newProject = await manager.importProject({
  ...data,
  project: {
    ...data.project,
    name: "Transformed Project",
  },
});

console.log("Created transformed copy:", newProject.id);
```

## Database Management

### Check Storage Usage

```javascript
// Estimate storage usage (if supported by browser)
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage / 1024 / 1024; // MB
  const quota = estimate.quota / 1024 / 1024; // MB

  console.log(`Using ${usage.toFixed(2)} MB of ${quota.toFixed(2)} MB`);
  console.log(`${((usage / quota) * 100).toFixed(2)}% full`);
}
```

### Clear All Data

```javascript
// ⚠️ WARNING: This deletes everything!
const manager = window.__LOCAL_STORAGE_MANAGER__;

if (confirm("Are you sure you want to delete ALL local data?")) {
  await manager.clearAll();
  console.log("All data cleared");
  location.reload();
}
```

### Backup Before Clearing

```javascript
// Export everything first
await window.__exportAllProjects__();

// Wait a bit for download
await new Promise((resolve) => setTimeout(resolve, 2000));

// Then clear
const manager = window.__LOCAL_STORAGE_MANAGER__;
await manager.clearAll();
console.log("Data cleared (backup downloaded)");
```

## Debugging

### Log All Projects

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;
const projects = await manager.listProjects();

for (const project of projects) {
  const assets = await manager.listAssets(project.id);
  const scenes = await manager.listScenes(project.id);

  console.group(`Project: ${project.name} (ID: ${project.id})`);
  console.log("Description:", project.description);
  console.log("Assets:", assets.length);
  console.log("Scenes:", scenes.length);
  console.log("Created:", new Date(project.created));
  console.groupEnd();
}
```

### Validate Data Integrity

```javascript
const manager = window.__LOCAL_STORAGE_MANAGER__;

async function validateData() {
  const projects = await manager.listProjects();
  const issues = [];

  for (const project of projects) {
    const assets = await manager.listAssets(project.id);

    // Check for orphaned assets
    for (const asset of assets) {
      if (asset.parent !== null) {
        const parentExists = assets.some((a) => a.id === asset.parent);
        if (!parentExists) {
          issues.push(`Asset ${asset.id} has invalid parent ${asset.parent}`);
        }
      }
    }
  }

  if (issues.length === 0) {
    console.log("✓ Data integrity check passed");
  } else {
    console.warn("✗ Data integrity issues:", issues);
  }
}

await validateData();
```

## Performance Tips

### Batch Operations

```javascript
// ❌ Bad: Multiple awaits in loop
for (let i = 0; i < 100; i++) {
  await manager.createAsset({ name: `Asset ${i}` });
}

// ✓ Good: Batch with Promise.all
const assets = Array.from({ length: 100 }, (_, i) =>
  manager.createAsset({ name: `Asset ${i}` })
);
await Promise.all(assets);
```

### Efficient Queries

```javascript
// Get assets once, then filter in memory
const assets = await manager.listAssets(projectId);
const scripts = assets.filter((a) => a.type === "script");
const textures = assets.filter((a) => a.type === "texture");
```

## Integration with Editor

### Listen for Project Changes

```javascript
// If using the editor's event system
if (typeof editor !== "undefined") {
  editor.on("project:save", async () => {
    // Auto-export on save
    const projectId = config.project.id;
    await window.__exportProject__(projectId);
    console.log("Project auto-exported");
  });
}
```

---

For more information, see [README.md](./README.md) and [QUICKSTART.md](./QUICKSTART.md).
