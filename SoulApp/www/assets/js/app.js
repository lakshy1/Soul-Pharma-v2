(() => {
  const API_BASE  = "https://soul-pharma-v2.onrender.com/api";
  const TOKEN_KEY = "soul-employee-token";

  const isNative = () => !!window.Capacitor?.isNativePlatform?.();
  const cap      = (name) => window.Capacitor?.Plugins?.[name];

  // ── Storage (Capacitor Preferences + localStorage) ────
  const storage = {
    async get(key) {
      if (isNative()) { const r = await cap("Preferences").get({ key }); return r.value; }
      return localStorage.getItem(key);
    },
    async set(key, value) {
      if (isNative()) await cap("Preferences").set({ key, value: String(value) });
      localStorage.setItem(key, String(value));
    },
    async remove(key) {
      if (isNative()) await cap("Preferences").remove({ key });
      localStorage.removeItem(key);
    },
  };

  // ── Loader ─────────────────────────────────────────────
  const loader = (() => {
    let cur = 0, creep = null;
    const el   = () => document.getElementById("soul-loader");
    const fill = () => document.getElementById("sl-fill");
    const pct  = () => document.getElementById("sl-pct");
    const msg  = () => document.getElementById("sl-msg");
    const ui = (p) => {
      p = Math.min(100, Math.max(0, p));
      const f = fill(); if (f) f.style.width = p + "%";
      const c = pct();  if (c) c.textContent  = Math.round(p) + "%";
    };
    return {
      show(m = "Loading") {
        clearInterval(creep); cur = 0; ui(0);
        const m_ = msg(); if (m_ && m) m_.textContent = m;
        const e = el();
        if (e) { e.style.display = ""; e.classList.remove("sl-done"); e.style.opacity = "1"; e.style.pointerEvents = "all"; }
      },
      snap(p, m) {
        clearInterval(creep); cur = p; ui(p);
        const m_ = msg(); if (m && m_) m_.textContent = m;
      },
      creep(cap_, rate = 0.055) {
        clearInterval(creep);
        creep = setInterval(() => {
          if (cur < cap_) { cur = Math.min(cap_, cur + rate); ui(cur); }
          else clearInterval(creep);
        }, 80);
      },
      hide() {
        clearInterval(creep);
        const e = el(); if (!e) return;
        e.classList.add("sl-done");
        setTimeout(() => { e.style.opacity = "0"; e.style.pointerEvents = "none"; }, 700);
      },
    };
  })();

  // ── Toast ──────────────────────────────────────────────
  const toastEl = document.getElementById("app-toast");
  let _toastTimer;
  const toast = (msg, isError = false) => {
    if (!toastEl) return;
    clearTimeout(_toastTimer);
    toastEl.textContent = msg;
    toastEl.className   = isError ? "error" : "success";
    _toastTimer = setTimeout(() => { toastEl.className = "hidden"; }, 3500);
  };

  // ── Screen navigation ──────────────────────────────────
  const showScreen = (id) => {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(`screen-${id}`)?.classList.remove("hidden");
  };

  // ── Permissions ────────────────────────────────────────
  const perms = {
    async checkLocation() {
      if (!isNative()) return true;
      try { const s = await cap("Geolocation").checkPermissions(); return s.location === "granted"; }
      catch { return false; }
    },
    async requestLocation() {
      if (!isNative()) return true;
      try { const s = await cap("Geolocation").requestPermissions(); return s.location === "granted"; }
      catch { return false; }
    },
    async checkNotif() {
      if (!isNative()) return true;
      try { const s = await cap("LocalNotifications").checkPermissions(); return s.display === "granted"; }
      catch { return false; }
    },
    async requestNotif() {
      if (!isNative()) return true;
      try { const s = await cap("LocalNotifications").requestPermissions(); return s.display === "granted"; }
      catch { return false; }
    },
  };

  // ── Permission screen UI ───────────────────────────────
  let locGranted = false, notifGranted = false;
  const updatePermUI = () => {
    const locTag   = document.getElementById("loc-granted-tag");
    const locBtn   = document.getElementById("btn-loc");
    const notifTag = document.getElementById("notif-granted-tag");
    const notifBtn = document.getElementById("btn-notif");
    const cont     = document.getElementById("btn-perms-continue");
    if (locGranted)   { locTag?.classList.remove("hidden");   locBtn?.classList.add("hidden");   document.getElementById("perm-card-loc")?.classList.add("granted"); }
    if (notifGranted) { notifTag?.classList.remove("hidden"); notifBtn?.classList.add("hidden"); document.getElementById("perm-card-notif")?.classList.add("granted"); }
    if (cont) cont.disabled = !locGranted;
  };

  // ── Go to dashboard (real employee-dashboard.html) ─────
  const goToDashboard = () => {
    loader.snap(100, "Launching dashboard");
    setTimeout(() => { window.location.href = "employee-dashboard.html"; }, 400);
  };

  // ── After login: permissions then dashboard ────────────
  const goToPermissionsOrDash = async () => {
    if (!isNative()) { goToDashboard(); return; }
    locGranted   = await perms.checkLocation();
    notifGranted = await perms.checkNotif();
    if (!locGranted) {
      loader.hide();
      showScreen("perms");
      updatePermUI();
    } else {
      goToDashboard();
    }
  };

  // ── Login ──────────────────────────────────────────────
  const bindLoginScreen = () => {
    const form  = document.getElementById("login-form");
    const errEl = document.getElementById("login-error");
    const btn   = document.getElementById("login-btn");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.textContent = "";
      btn.disabled = true;
      btn.textContent = "Logging in...";
      loader.show("Connecting to server");
      loader.creep(35, 0.06);

      try {
        loader.snap(40, "Verifying credentials");
        const res = await fetch(`${API_BASE}/employee/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: document.getElementById("inp-email").value.trim(),
            password: document.getElementById("inp-pass").value,
          }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.message || `Error ${res.status}`);
        }
        const data = await res.json();
        if (!data.token) throw new Error("No token received");

        loader.snap(55, "Login successful");

        // Store token for employee-dashboard.js to pick up
        await storage.set(TOKEN_KEY, data.token);
        // Also store employee info for capacitor-bridge.js
        if (data.employee) {
          localStorage.setItem("soul-employee-name", data.employee.name || "");
          localStorage.setItem("soul-employee-id",   data.employee._id  || data.employee.employeeId || "");
        }

        await goToPermissionsOrDash();
      } catch (err) {
        loader.hide();
        errEl.textContent = err.message || "Login failed. Check your credentials.";
        btn.disabled = false;
        btn.textContent = "Login";
      }
    });
  };

  // ── Permission screen buttons ──────────────────────────
  const bindPermsScreen = () => {
    document.getElementById("btn-loc")?.addEventListener("click", async () => {
      locGranted = await perms.requestLocation();
      if (!locGranted) toast("Location permission is required to use this app.", true);
      updatePermUI();
    });
    document.getElementById("btn-notif")?.addEventListener("click", async () => {
      notifGranted = await perms.requestNotif();
      updatePermUI();
    });
    document.getElementById("btn-perms-continue")?.addEventListener("click", async () => {
      if (!locGranted) { toast("Location permission is required.", true); return; }
      loader.show("Launching dashboard");
      goToDashboard();
    });
  };

  // ── Status bar (native) ────────────────────────────────
  const initStatusBar = () => {
    if (!isNative()) return;
    try {
      cap("StatusBar")?.setOverlaysWebView({ overlay: false });
      cap("StatusBar")?.setStyle({ style: "DARK" });
      cap("StatusBar")?.setBackgroundColor({ color: "#0a0f1e" });
    } catch { }
  };

  // ── Init ───────────────────────────────────────────────
  const init = async () => {
    loader.snap(0, "Starting up");
    loader.creep(18, 0.045);
    initStatusBar();
    bindLoginScreen();
    bindPermsScreen();

    const token = await storage.get(TOKEN_KEY);

    if (!token) {
      loader.snap(100, "Ready");
      setTimeout(() => { loader.hide(); showScreen("login"); }, 500);
      return;
    }

    // Token exists — verify it's still valid
    loader.snap(20, "Verifying session");
    try {
      const res = await fetch(`${API_BASE}/employee/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Session expired");
      loader.snap(55, "Session active");
      await goToPermissionsOrDash();
    } catch {
      await storage.remove(TOKEN_KEY);
      loader.snap(100, "Session expired");
      setTimeout(() => { loader.hide(); showScreen("login"); toast("Session expired. Please login again.", true); }, 500);
    }
  };

  document.addEventListener("DOMContentLoaded", init);
})();
