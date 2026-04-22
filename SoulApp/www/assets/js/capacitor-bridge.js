/**
 * Capacitor Bridge — injected into employee-dashboard.html
 * Handles native features: foreground service, status bar, back button.
 * Runs AFTER employee-dashboard.js has initialised.
 */
(() => {
  const isNative = () => !!window.Capacitor?.isNativePlatform?.();
  const cap      = (name) => window.Capacitor?.Plugins?.[name];

  if (!isNative()) return;   // browser — nothing to do

  // ── Status bar ──────────────────────────────────────────
  try {
    cap("StatusBar")?.setOverlaysWebView({ overlay: false });
    cap("StatusBar")?.setStyle({ style: "DARK" });
    cap("StatusBar")?.setBackgroundColor({ color: "#0a0f1e" });
  } catch { }

  // ── Foreground service ─────────────────────────────────
  // Wait for the dashboard to finish login (token appears in localStorage)
  const startTrackerWhenReady = () => {
    const token = localStorage.getItem("soul-employee-token");
    if (!token) return;   // not logged in yet

    try {
      const empName = localStorage.getItem("soul-employee-name") || "";
      const empId   = localStorage.getItem("soul-employee-id")   || "";
      cap("SoulTracker")?.startService({ token, empId, empName });
    } catch { }
  };

  // Attempt now (in case already logged in), then watch for login
  startTrackerWhenReady();

  // Watch for token changes (login/logout)
  const _origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    _origSetItem(key, value);
    if (key === "soul-employee-token") {
      if (value) startTrackerWhenReady();
      else {
        try { cap("SoulTracker")?.stopService(); } catch { }
      }
    }
  };

  // ── Android back button ────────────────────────────────
  // Back navigation is fully handled by app.js (step-back through UI layers).
  // Suppress the default ionBackButton so Capacitor doesn't also close the app.
  document.addEventListener("ionBackButton", (ev) => {
    ev.detail?.register(10, () => { /* handled by app.js */ });
  });
})();
