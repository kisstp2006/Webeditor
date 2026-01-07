// Override the API URL to point to the local dev server when requested.
// This file is imported first in editor/index.ts, so it runs before Editor boot.
(function() {
    try {
        const params = new URLSearchParams(window.location.search);
        // Enable with ?use_local_backend or ?local_backend
        const enabled = params.has('use_local_backend') || params.has('local_backend');
        if (!enabled) return;

        const localOrigin = 'http://localhost:3487';
        const localApiBase = `${localOrigin}/local-api`;

        if (window.config && window.config.url) {
            // Point the editor REST client at our local API
            window.config.url.api = localApiBase;
            // Optional: mark environment so features can branch if needed
            (window as any).__LOCAL_BACKEND__ = true;
            console.log('[Local Backend] Using', localApiBase);
        } else {
            console.warn('[Local Backend] window.config not ready; cannot override api url');
        }
    } catch (e) {
        console.warn('[Local Backend] override failed:', e);
    }
})();
