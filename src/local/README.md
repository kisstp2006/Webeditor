# Local Storage System

This directory contains the local/offline storage implementation for the game engine. It allows you to run the editor completely offline without requiring a web API backend.

## Features

- **Offline First**: Store all projects, assets, and scenes locally using IndexedDB
- **Drop-in Replacement**: Mimics the existing REST API interface for seamless integration
- **Import/Export**: Easily backup and restore projects to/from JSON files
- **No Backend Required**: Run the editor without any server infrastructure

## Files

### Core Modules

- **`local-storage-manager.ts`**: Core IndexedDB storage implementation

  - Manages projects, assets, scenes, branches, checkpoints
  - Provides CRUD operations for all entities
  - Handles ID generation and metadata

- **`local-rest-api.ts`**: REST API wrapper

  - Wraps local storage calls to match the REST API interface
  - Returns promise-based responses compatible with existing code
  - Mimics the Ajax event system (load, error events)

- **`api-interceptor.ts`**: API call interceptor

  - Automatically replaces web API calls with local storage calls
  - Detects offline mode and redirects API requests
  - Preserves existing API interface

- **`project-import-export.ts`**: Import/export utilities

  - Export projects to JSON files
  - Import projects from JSON files
  - Backup and restore all projects
  - Provides helper functions for file operations

- **`local-backend-override.ts`**: Bootstrap module

  - Initializes offline mode based on URL parameters
  - Sets up global flags and references
  - First module loaded in the editor

- **`index.ts`**: Module exports
  - Central export point for all local storage functionality

## Usage

### Enabling Offline Mode

Add one of these URL parameters to enable offline mode:

```
?offline
?use_local_storage
?local_storage
?use_local_backend
?local_backend
```

Examples:

```
http://localhost:3000/editor?offline
http://localhost:3000/editor?use_local_storage
```

### Using from Console

When offline mode is enabled, several utilities are available in the console:

```javascript
// Export a project
await window.__exportProject__(projectId);

// Export all projects
await window.__exportAllProjects__();

// Access local storage manager directly
const manager = window.__LOCAL_STORAGE_MANAGER__;
const projects = await manager.listProjects();

// Access local REST API
const api = window.__LOCAL_API__;
```

### Programmatic Usage

```typescript
import {
  localStorageManager,
  exportProjectToFile,
  importProjectFromFile,
} from "@/local";

// Create a project
const project = await localStorageManager.createProject({
  name: "My Game",
  description: "An awesome game",
});

// Create an asset
const asset = await localStorageManager.createAsset({
  projectId: project.id,
  name: "Player Model",
  type: "model",
});

// Export project to file
await exportProjectToFile(project.id);
```

## Architecture

### Storage Structure

Data is stored in IndexedDB with the following stores:

- **projects**: Project metadata and settings
- **assets**: Asset data and references
- **scenes**: Scene data
- **branches**: Branch information
- **checkpoints**: Version checkpoints
- **settings**: User settings
- **files**: Binary file data
- **metadata**: System metadata (ID counters, etc.)

### API Compatibility

The local storage system implements the same interface as the remote REST API:

```typescript
// Both work identically
editor.api.globals.rest.projects.projectCreate(data);
// → Uses web API when online
// → Uses local storage when offline
```

### Data Flow

1. URL parameter detected → Offline mode enabled
2. Local storage initialized (IndexedDB)
3. API interceptor replaces REST API methods
4. All API calls automatically routed to local storage
5. Data persists in browser's IndexedDB

## Limitations

Current limitations of the local storage implementation:

1. **No Collaboration**: Real-time collaboration features are disabled
2. **No Cloud Assets**: External assets must be downloaded/imported manually
3. **Browser Storage Limits**: Limited by browser's IndexedDB quota
4. **No Server Features**: Server-side processing (e.g., asset compression) unavailable
5. **Single Device**: Data is local to one browser/device

## Future Enhancements

Potential improvements:

- [ ] File system API integration for larger files
- [ ] Progressive Web App (PWA) support
- [ ] Sync with cloud when connection available
- [ ] Compression for large projects
- [ ] Asset caching and optimization
- [ ] WebRTC for peer-to-peer collaboration
- [ ] Export to Git repository

## Development

### Adding New API Endpoints

To add support for a new API endpoint:

1. Add the method to `local-rest-api.ts`:

```typescript
export const myNewMethod = (args: any) => {
  return LocalAjax.post(localStorageManager.myNewOperation(args));
};
```

2. Add to the export object:

```typescript
export const localRestApi = {
  myApi: {
    myNewMethod,
  },
};
```

### Testing

Test offline mode:

1. Open the editor with `?offline` parameter
2. Check browser console for initialization messages
3. Create/edit/delete projects
4. Verify data persists after page reload
5. Export and re-import projects

### Debugging

Enable verbose logging:

```javascript
// In browser console
localStorage.setItem("DEBUG_LOCAL_STORAGE", "true");
```

View stored data:

```javascript
// List all projects
const projects = await window.__LOCAL_STORAGE_MANAGER__.listProjects();
console.table(projects);

// View IndexedDB in browser DevTools
// Chrome: Application → Storage → IndexedDB → GameEngineLocalDB
```

## Troubleshooting

### Offline mode not activating

1. Check URL parameter is correctly added
2. Verify console for initialization messages
3. Check browser supports IndexedDB
4. Clear browser cache and reload

### Data not persisting

1. Check browser storage quota
2. Verify IndexedDB is not disabled
3. Check for JavaScript errors in console
4. Try in incognito mode to rule out extensions

### Import/Export issues

1. Verify JSON file format is correct
2. Check file size is within limits
3. Ensure browser allows file downloads
4. Try exporting a single project first

## Browser Compatibility

Tested browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requirements:

- IndexedDB support
- ES6+ JavaScript support
- File API support

## License

Same license as the main project.
