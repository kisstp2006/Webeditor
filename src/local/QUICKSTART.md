# Quick Start: Offline Mode

This guide will help you get started with the offline/local storage mode for the game engine.

## 🚀 Getting Started

### Step 1: Enable Offline Mode

Add one of these parameters to your URL:

```
http://localhost:3000/editor?offline
```

Or use any of these alternatives:

- `?use_local_storage`
- `?local_storage`
- `?use_local_backend`
- `?local_backend`

### Step 2: Verify It's Working

You should see:

1. **Blue badge** in the top-right corner saying "Offline Mode 📦"
2. **Console messages** confirming initialization:
   ```
   [Local Storage] Initialized successfully
   [Local Storage] Offline mode enabled - using IndexedDB storage
   [API Interceptor] REST API successfully replaced
   ```

### Step 3: Use the Editor

Everything works as normal, but now all data is stored locally in your browser!

## 📥 Import/Export Projects

### Export Current Project

1. Click the **💾 Export Project** button in the offline mode badge
2. A JSON file will download automatically
3. Save it somewhere safe!

### Export All Projects

1. Click the **📚 Export All** button
2. All your projects will be exported to a single backup file

### Import a Project

1. Click the **📥 Import** button
2. Select a previously exported JSON file
3. The project will be imported and available immediately

## 🎮 Working Offline

### What Works

✅ Create, edit, and delete projects  
✅ Create, edit, and delete assets  
✅ Create, edit, and delete scenes  
✅ All editor features (UI, viewport, etc.)  
✅ Export/import projects  
✅ Data persists after browser restart

### What Doesn't Work

❌ Real-time collaboration  
❌ Cloud asset loading from external sources  
❌ Server-side asset processing  
❌ User authentication/account features  
❌ Sharing projects with others (use export/import instead)

## 💾 Data Storage

Your data is stored in **IndexedDB** in your browser:

- **Location**: Browser's local storage
- **Persistence**: Survives page reloads and browser restarts
- **Size limit**: Depends on browser (usually several GB)

### View Your Data

In Chrome/Edge:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** → **GameEngineLocalDB**

In Firefox:

1. Open DevTools (F12)
2. Go to **Storage** tab
3. Expand **Indexed DB** → **GameEngineLocalDB**

## 🔧 Advanced Usage

### Console Commands

```javascript
// List all projects
const projects = await window.__LOCAL_STORAGE_MANAGER__.listProjects();
console.table(projects);

// Get a specific project
const project = await window.__LOCAL_STORAGE_MANAGER__.getProject(1);
console.log(project);

// Export a project programmatically
await window.__exportProject__(projectId);

// Export all projects
await window.__exportAllProjects__();

// Clear all data (careful!)
await window.__LOCAL_STORAGE_MANAGER__.clearAll();
```

### Creating Sample Projects

```javascript
// Create a new project
const manager = window.__LOCAL_STORAGE_MANAGER__;

const project = await manager.createProject({
  name: "My Awesome Game",
  description: "A cool game I am making",
  settings: {
    width: 1920,
    height: 1080,
  },
});

console.log("Project created:", project.id);
```

## 🐛 Troubleshooting

### "Offline mode not working"

**Solutions:**

1. Check the URL has the correct parameter (`?offline`)
2. Refresh the page (Ctrl+R or Cmd+R)
3. Clear browser cache
4. Check browser console for errors

### "Data disappeared"

**Solutions:**

1. Check if browser cleared storage (private/incognito mode)
2. Look in a different browser profile
3. Restore from backup (if you exported)

### "Import not working"

**Solutions:**

1. Verify the JSON file is valid
2. Try with a smaller project first
3. Check browser console for specific errors
4. Make sure file wasn't corrupted during download

### "Running out of storage"

**Solutions:**

1. Export and delete old projects
2. Clear browser cache
3. Request more storage quota from browser
4. Use Chrome/Edge (better storage limits)

## 📊 Storage Limits

Typical browser storage limits:

| Browser     | Limit                   |
| ----------- | ----------------------- |
| Chrome/Edge | ~80% of disk space      |
| Firefox     | ~50% of free disk space |
| Safari      | ~1 GB                   |

The actual limit depends on available disk space.

## 🔒 Privacy & Security

- All data stays in **your browser only**
- Nothing is sent to any server
- Data is **not encrypted** (stored in plain IndexedDB)
- Use **export** feature to create backups
- **Incognito/Private mode**: Data is deleted when closing browser

## 📱 Mobile Support

Offline mode works on mobile browsers too:

- **Chrome Android**: ✅ Full support
- **Safari iOS**: ✅ Full support (1GB limit)
- **Firefox Android**: ✅ Full support

**Tip**: Add to home screen for app-like experience!

## 🌐 Switching Between Online/Offline

### Go Offline

Add `?offline` to URL and reload

### Go Online

Remove `?offline` from URL and reload

**Note**: Online and offline modes use **separate storage**. Use export/import to move projects between them.

## 💡 Tips & Best Practices

1. **Regular Backups**: Export your projects regularly
2. **Browser Updates**: Keep your browser updated
3. **Storage Monitoring**: Check available space occasionally
4. **Testing**: Test imports periodically to ensure backups work
5. **Multiple Browsers**: Data doesn't sync between browsers

## 🆘 Need Help?

Check the full documentation: [src/local/README.md](./README.md)

---

**Enjoy working offline! 🎉**
