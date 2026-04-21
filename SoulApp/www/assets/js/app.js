(() => {
  const API_BASE  = "https://soul-pharma-v2.onrender.com/api";
  const TOKEN_KEY = "soul-employee-token";

  // ── Platform ───────────────────────────────────────────
  const isNative = () => !!window.Capacitor?.isNativePlatform?.();
  const cap      = (name) => window.Capacitor?.Plugins?.[name];

  // ── State ──────────────────────────────────────────────
  const state = {
    token: null, employee: null, tab: "home",
    doctors: [], activities: [], expenses: [],
    expenseMonth: new Date(),
    locGranted: false, notifGranted: false,
    selectedDoctorId: null,
  };

  // ── Formatting ─────────────────────────────────────────
  const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const currency = (v) => INR.format(Number(v) || 0);
  const dmy = (d) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
  };
  const timeStr = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const monthLabel = (d) => d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const initial = (name) => (name || "?")[0].toUpperCase();
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const nowDate  = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const nowTime  = () => { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };

  // ── Storage ────────────────────────────────────────────
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

  // ── API ────────────────────────────────────────────────
  const api = async (path, opts = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: opts.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      },
      ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || `Error ${res.status}`);
    }
    return res.json();
  };

  // ── Toast ──────────────────────────────────────────────
  const toastEl = document.getElementById("app-toast");
  let _toastTimer;
  const toast = (msg, isError = false) => {
    clearTimeout(_toastTimer);
    toastEl.textContent = msg;
    toastEl.className   = isError ? "error" : "success";
    _toastTimer = setTimeout(() => { toastEl.className = "hidden"; }, 3000);
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
        clearInterval(creep);
        cur = 0; ui(0);
        const m_ = msg(); if (m_ && m) m_.textContent = m;
        const e = el();
        if (e) {
          e.style.display = "";
          e.classList.remove("sl-done");
          e.style.opacity = "1";
          e.style.pointerEvents = "all";
        }
      },
      snap(p, m) {
        clearInterval(creep);
        cur = p; ui(p);
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
        // Don't remove — keep in DOM so it can be re-shown on login
        setTimeout(() => {
          e.style.opacity = "0";
          e.style.pointerEvents = "none";
        }, 700);
      },
    };
  })();

  // ── Screen navigation ──────────────────────────────────
  const showScreen = (id) => {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(`screen-${id}`)?.classList.remove("hidden");
    document.getElementById("app-fab")?.classList.add("hidden");
  };

  // ── Tab navigation ─────────────────────────────────────
  const setTab = (tab) => {
    state.tab = tab;
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === `tab-${tab}`));

    const fab = document.getElementById("app-fab");
    if (["expenses","doctors","activities"].includes(tab)) {
      fab.classList.remove("hidden");
    } else {
      fab.classList.add("hidden");
    }
    if (tab === "expenses")   renderExpenses();
    if (tab === "doctors")    renderDoctors();
    if (tab === "activities") renderActivities();
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

  // ── Foreground service (custom plugin) ─────────────────
  const tracker = {
    start() {
      if (!isNative()) return;
      try { cap("SoulTracker")?.startService({ title: "Soul Pharma Active", text: "Location tracking is on" }); }
      catch { /* native plugin not available in browser */ }
    },
    stop() {
      if (!isNative()) return;
      try { cap("SoulTracker")?.stopService(); }
      catch { }
    },
    updateStatus(text) {
      if (!isNative()) return;
      try { cap("SoulTracker")?.updateNotification({ text }); }
      catch { }
    },
  };

  // ── Live location watch ────────────────────────────────
  let _watchId = null;
  const startLocationWatch = () => {
    if (!isNative()) return;
    const sendLoc = async (lat, lng, acc) => {
      try {
        await api("/employee/location", {
          method: "POST",
          body: { latitude: lat, longitude: lng, accuracy: acc, source: "foreground" },
        });
        const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        const el = document.getElementById("home-last-sync");
        if (el) el.textContent = `Synced ${t}`;
        tracker.updateStatus(`Last sync: ${t}`);
      } catch { /* ignore */ }
    };

    cap("Geolocation")?.watchPosition({ enableHighAccuracy: true, timeout: 10000 }, (pos, err) => {
      if (err || !pos) return;
      sendLoc(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
    }).then(id => { _watchId = id; }).catch(() => {});
  };

  // ── Local Notification helper ──────────────────────────
  const sendLocalNotif = async (title, body) => {
    if (!isNative()) return;
    try {
      await cap("LocalNotifications").schedule({
        notifications: [{ title, body, id: Math.floor(Math.random() * 100000), sound: "default" }],
      });
    } catch { }
  };

  // ── Auth ───────────────────────────────────────────────
  const auth = {
    async login(email, password) {
      const data = await api("/employee/login", { method: "POST", body: { email, password } });
      if (!data.token) throw new Error("No token received");
      state.token    = data.token;
      state.employee = data.employee;
      await storage.set(TOKEN_KEY, data.token);
    },
    async logout() {
      await storage.remove(TOKEN_KEY);
      state.token = null; state.employee = null;
      tracker.stop();
      if (_watchId !== null) {
        try { await cap("Geolocation")?.clearWatch({ id: _watchId }); } catch {}
        _watchId = null;
      }
      showScreen("login");
    },
    async verifyToken(token) {
      state.token = token;
      const data  = await api("/employee/profile");
      state.employee = data.employee;
    },
  };

  // ── Dashboard data loaders ─────────────────────────────
  const loadProfile = async () => {
    const data = await api("/employee/profile");
    state.employee = data.employee;
    renderProfile();
    renderHomeHeader();
  };

  const loadDoctors = async () => {
    const data = await api("/employee/doctors");
    state.doctors = data.doctors || [];
    renderDoctors();
  };

  const loadActivities = async () => {
    const now  = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
    const to   = nowDate();
    const data = await api(`/employee/activities?from=${from}&to=${to}`);
    state.activities = data.activities || [];
    renderActivities();
    renderHomeActivity();
  };

  const loadExpenses = async () => {
    const d    = state.expenseMonth;
    const from = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
    const lastD = new Date(d.getFullYear(), d.getMonth()+1, 0);
    const to   = `${lastD.getFullYear()}-${String(lastD.getMonth()+1).padStart(2,"0")}-${String(lastD.getDate()).padStart(2,"0")}`;
    const data = await api(`/employee/expenses?from=${from}&to=${to}`);
    state.expenses = data.expenses || [];
    renderExpenses();
  };

  // ── Renderers ──────────────────────────────────────────
  const renderHomeHeader = () => {
    const emp  = state.employee || {};
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const nameEl = document.getElementById("home-name");
    const greetEl= document.getElementById("home-greeting");
    if (nameEl)  nameEl.textContent  = emp.name || "Employee";
    if (greetEl) greetEl.textContent = greet;

    document.getElementById("stat-doctors").textContent = state.doctors.length;
    document.getElementById("stat-visits").textContent  = state.activities.length;
    const totalExp = state.expenses.reduce((s,e) => s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0), 0);
    document.getElementById("stat-expenses").textContent = currency(totalExp);
  };

  const renderHomeActivity = () => {
    const el = document.getElementById("home-activity");
    if (!el) return;
    const recent = [...state.activities].slice(0, 5);
    if (!recent.length) { el.innerHTML = `<p class="empty-state">No activities yet this month.</p>`; return; }
    el.innerHTML = recent.map(a => `
      <div class="list-item mt-2">
        <div class="list-avatar">${initial(a.doctorName || a.doctor?.name || "V")}</div>
        <div class="list-body">
          <p class="list-name">${a.doctorName || a.doctor?.name || "Visit"}</p>
          <p class="list-meta">${dmy(a.date || a.createdAt)} ${a.notes ? "· " + a.notes.slice(0,40) : ""}</p>
        </div>
      </div>`).join("");
  };

  const renderProfile = () => {
    const emp = state.employee || {};
    const els = {
      "profile-name": emp.name || "–",
      "profile-role": emp.designation || "Field Representative",
      "profile-empid": emp.employeeId || "–",
      "profile-email": emp.email || "–",
      "profile-territory": emp.territoryName || "–",
      "profile-designation": emp.designation || "–",
    };
    Object.entries(els).forEach(([id,val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
    const init = document.getElementById("profile-initial");
    if (init) init.textContent = initial(emp.name);
  };

  const renderExpenses = () => {
    const el = document.getElementById("exp-list");
    const lbl = document.getElementById("exp-month-label");
    if (lbl) lbl.textContent = monthLabel(state.expenseMonth);
    if (!el) return;

    const total    = state.expenses.reduce((s,e) => s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0),0);
    const pending  = state.expenses.filter(e=>(e.status||"pending")==="pending").reduce((s,e)=>s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0),0);
    const approved = state.expenses.filter(e=>e.status==="approved").reduce((s,e)=>s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0),0);
    const t = document.getElementById("exp-total");   if(t) t.textContent = currency(total);
    const p = document.getElementById("exp-pending"); if(p) p.textContent = currency(pending);
    const a = document.getElementById("exp-approved");if(a) a.textContent = currency(approved);

    if (!state.expenses.length) { el.innerHTML = `<p class="empty-state">No expenses for this period.</p>`; return; }

    el.innerHTML = state.expenses.map(e => {
      const st = e.status || "pending";
      const pillCls = st === "approved" ? "pill-green" : st === "rejected" ? "pill-red" : "pill-yellow";
      const ta = Number(e.travelAllowance) || 0;
      return `
        <div class="list-item">
          <div style="flex:1;min-width:0;">
            <div class="card-row">
              <p class="list-name">${currency(e.amount)}${ta ? ` <span style="font-size:.72rem;font-weight:500;color:var(--muted);">+${currency(ta)} TA</span>` : ""}</p>
              <span class="pill ${pillCls}">${st}</span>
            </div>
            <p class="list-meta">${dmy(e.expenseDate||e.date||e.createdAt)} · ${e.workingArea || "Field"} · ${Number(e.distance)||0} km</p>
            ${e.remarks ? `<p class="list-meta mt-1">${e.remarks}</p>` : ""}
          </div>
        </div>`;
    }).join("");
  };

  let _docFilter = "";
  const renderDoctors = () => {
    const el = document.getElementById("doc-list");
    if (!el) return;
    const filtered = state.doctors.filter(d =>
      [d.name, d.speciality, d.clinicName, d.city].some(f => f?.toLowerCase().includes(_docFilter.toLowerCase()))
    );
    if (!filtered.length) { el.innerHTML = `<p class="empty-state">${state.doctors.length ? "No results found." : "No doctors added yet."}</p>`; return; }
    el.innerHTML = filtered.map(d => `
      <div class="list-item">
        <div class="list-avatar">${initial(d.name)}</div>
        <div class="list-body">
          <p class="list-name">${d.name}</p>
          <p class="list-meta">${[d.speciality, d.clinicName, d.city].filter(Boolean).join(" · ")}</p>
          ${d.phone ? `<p class="list-meta">📞 ${d.phone}</p>` : ""}
        </div>
      </div>`).join("");
  };

  const renderActivities = () => {
    const el = document.getElementById("act-list");
    if (!el) return;
    if (!state.activities.length) { el.innerHTML = `<p class="empty-state">No visits logged this month.</p>`; return; }
    el.innerHTML = state.activities.map(a => `
      <div class="list-item">
        <div class="list-avatar">${initial(a.doctorName || a.doctor?.name || "V")}</div>
        <div class="list-body">
          <p class="list-name">${a.doctorName || a.doctor?.name || "Visit"}</p>
          <p class="list-meta">${dmy(a.date || a.createdAt)} at ${timeStr(a.date || a.createdAt)}</p>
          ${a.notes ? `<p class="list-meta mt-1">${a.notes}</p>` : ""}
        </div>
      </div>`).join("");
  };

  // ── Sheets ─────────────────────────────────────────────
  const openSheet = (id) => document.getElementById(id)?.classList.remove("hidden");
  const closeSheet = (id) => document.getElementById(id)?.classList.add("hidden");

  // ── Permissions Screen Logic ───────────────────────────
  const updatePermUI = () => {
    const locTag  = document.getElementById("loc-granted-tag");
    const locBtn  = document.getElementById("btn-loc");
    const notifTag= document.getElementById("notif-granted-tag");
    const notifBtn= document.getElementById("btn-notif");
    const cont    = document.getElementById("btn-perms-continue");
    const locCard = document.getElementById("perm-card-loc");
    const notifCard = document.getElementById("perm-card-notif");

    if (state.locGranted) {
      locTag?.classList.remove("hidden");
      locBtn?.classList.add("hidden");
      locCard?.classList.add("granted");
    }
    if (state.notifGranted) {
      notifTag?.classList.remove("hidden");
      notifBtn?.classList.add("hidden");
      notifCard?.classList.add("granted");
    }
    if (cont) cont.disabled = !state.locGranted;
  };

  // ── Login Screen Logic ─────────────────────────────────
  const bindLoginScreen = () => {
    const form = document.getElementById("login-form");
    const errEl = document.getElementById("login-error");
    const btn   = document.getElementById("login-btn");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.textContent = "";
      btn.disabled = true;
      btn.textContent = "Logging in...";

      // Show loader immediately on login press
      loader.show("Connecting to server");
      loader.creep(35, 0.06);

      try {
        loader.snap(40, "Verifying credentials");
        await auth.login(
          document.getElementById("inp-email").value.trim(),
          document.getElementById("inp-pass").value
        );
        loader.snap(55, "Login successful");
        // After login, check permissions
        await goToPermissionsOrDash();
      } catch (err) {
        loader.hide();
        errEl.textContent = err.message || "Login failed. Check your credentials.";
        btn.disabled = false;
        btn.textContent = "Login";
      }
    });
  };

  const goToPermissionsOrDash = async () => {
    if (!isNative()) { await launchDashboard(); return; }
    state.locGranted   = await perms.checkLocation();
    state.notifGranted = await perms.checkNotif();
    if (!state.locGranted) {
      showScreen("perms");
      updatePermUI();
    } else {
      await launchDashboard();
    }
  };

  // ── Permissions Screen Binds ───────────────────────────
  const bindPermsScreen = () => {
    document.getElementById("btn-loc")?.addEventListener("click", async () => {
      state.locGranted = await perms.requestLocation();
      if (!state.locGranted) {
        toast("Location permission is required to use this app.", true);
        // Show settings guidance
        sendLocalNotif("Permission Required", "Please grant location access in Settings to use Soul Pharma.");
      }
      updatePermUI();
    });

    document.getElementById("btn-notif")?.addEventListener("click", async () => {
      state.notifGranted = await perms.requestNotif();
      updatePermUI();
    });

    document.getElementById("btn-perms-continue")?.addEventListener("click", async () => {
      if (!state.locGranted) { toast("Location permission is required.", true); return; }
      await launchDashboard();
    });
  };

  // ── Launch Dashboard ───────────────────────────────────
  const launchDashboard = async () => {
    loader.show("Loading your data");
    loader.creep(20, 0.08);
    showScreen("dash");

    try {
      await loadProfile();   loader.snap(35, "Profile loaded");
      await loadDoctors();   loader.snap(60, "Doctor records synced");
      await loadActivities();loader.snap(80, "Activities loaded");
      await loadExpenses();  loader.snap(95, "Expenses fetched");
      renderHomeHeader();
      loader.snap(100, "All set — launching");

      tracker.start();
      startLocationWatch();

      if (state.notifGranted) {
        await sendLocalNotif("Soul Pharma Active", "Location tracking started. Have a great field day!");
      }
      setTimeout(() => loader.hide(), 700);
    } catch (err) {
      loader.snap(100, "Error loading data");
      setTimeout(() => loader.hide(), 500);
      toast("Some data failed to load. Pull to refresh.", true);
    }
  };

  // ── Dashboard event binds ──────────────────────────────
  const bindDashboard = () => {
    // Nav buttons
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => setTab(btn.dataset.tab));
    });

    // FAB
    document.getElementById("app-fab")?.addEventListener("click", () => {
      if (state.tab === "expenses")   { document.getElementById("exp-form-date").value = nowDate(); openSheet("sheet-expense"); }
      if (state.tab === "doctors")    openSheet("sheet-doctor");
      if (state.tab === "activities") { document.getElementById("act-form-date").value = nowDate(); document.getElementById("act-form-time").value = nowTime(); openSheet("sheet-activity"); }
    });

    // Logout
    document.getElementById("btn-logout")?.addEventListener("click", async () => {
      if (confirm("Sign out of Soul Pharma?")) await auth.logout();
    });

    // Expense month nav
    document.getElementById("exp-prev")?.addEventListener("click", () => {
      state.expenseMonth = new Date(state.expenseMonth.getFullYear(), state.expenseMonth.getMonth()-1, 1);
      loadExpenses();
    });
    document.getElementById("exp-next")?.addEventListener("click", () => {
      const now = new Date();
      const next = new Date(state.expenseMonth.getFullYear(), state.expenseMonth.getMonth()+1, 1);
      if (next <= now) { state.expenseMonth = next; loadExpenses(); }
    });

    // Doctor search
    document.getElementById("doc-search")?.addEventListener("input", (e) => {
      _docFilter = e.target.value;
      renderDoctors();
    });

    // ── Expense form
    document.getElementById("form-expense")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("exp-submit-btn");
      btn.disabled = true; btn.textContent = "Saving...";
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      try {
        await api("/employee/expenses", { method: "POST", body });
        e.target.reset();
        closeSheet("sheet-expense");
        await loadExpenses();
        renderHomeHeader();
        toast("Expense saved!");
      } catch (err) { toast(err.message || "Failed to save expense.", true); }
      finally { btn.disabled = false; btn.textContent = "Save Expense"; }
    });

    // ── Doctor form
    document.getElementById("form-doctor")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("doc-submit-btn");
      btn.disabled = true; btn.textContent = "Saving...";
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      try {
        await api("/employee/doctors", { method: "POST", body });
        e.target.reset();
        closeSheet("sheet-doctor");
        await loadDoctors();
        renderHomeHeader();
        toast("Doctor added!");
      } catch (err) { toast(err.message || "Failed to save doctor.", true); }
      finally { btn.disabled = false; btn.textContent = "Save Doctor"; }
    });

    // ── Activity form + doctor autocomplete
    const actDoctorInput   = document.getElementById("act-doctor-input");
    const actDoctorResults = document.getElementById("act-doctor-results");

    actDoctorInput?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      state.selectedDoctorId = null;
      if (!q) { actDoctorResults.style.display = "none"; return; }
      const matches = state.doctors.filter(d => d.name?.toLowerCase().includes(q));
      if (!matches.length) { actDoctorResults.style.display = "none"; return; }
      actDoctorResults.style.display = "block";
      actDoctorResults.innerHTML = matches.slice(0,6).map(d =>
        `<div data-id="${d._id}" data-name="${d.name}" style="padding:.6rem .85rem;font-size:.88rem;font-weight:600;cursor:pointer;border-bottom:1px solid var(--border);">${d.name}<span style="font-size:.72rem;color:var(--muted);font-weight:400;margin-left:.4rem;">${d.speciality||""}</span></div>`
      ).join("");
      actDoctorResults.querySelectorAll("[data-id]").forEach(el => {
        el.addEventListener("click", () => {
          state.selectedDoctorId = el.dataset.id;
          actDoctorInput.value = el.dataset.name;
          actDoctorResults.style.display = "none";
        });
      });
    });

    document.getElementById("form-activity")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("act-submit-btn");
      btn.disabled = true; btn.textContent = "Saving...";
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      if (state.selectedDoctorId) body.doctorId = state.selectedDoctorId;
      try {
        await api("/employee/activities", { method: "POST", body });
        e.target.reset(); actDoctorResults.style.display = "none"; state.selectedDoctorId = null;
        closeSheet("sheet-activity");
        await loadActivities();
        renderHomeHeader();
        toast("Visit logged!");
      } catch (err) { toast(err.message || "Failed to log visit.", true); }
      finally { btn.disabled = false; btn.textContent = "Save Visit"; }
    });

    // Sheet close buttons + backdrop
    [
      ["sheet-expense",  "sheet-expense-close",  "sheet-expense-bd"],
      ["sheet-doctor",   "sheet-doctor-close",   "sheet-doctor-bd"],
      ["sheet-activity", "sheet-activity-close", "sheet-activity-bd"],
    ].forEach(([sheet, closeBtn, backdrop]) => {
      document.getElementById(closeBtn)?.addEventListener("click", () => closeSheet(sheet));
      document.getElementById(backdrop)?.addEventListener("click", () => closeSheet(sheet));
    });

    // StatusBar overlay (native only)
    if (isNative()) {
      try {
        cap("StatusBar")?.setOverlaysWebView({ overlay: true });
        cap("StatusBar")?.setStyle({ style: "DARK" });
      } catch { }
    }
  };

  // ── Init ───────────────────────────────────────────────
  const init = async () => {
    loader.creep(18, 0.045);
    loader.snap(0, "Starting up");

    bindLoginScreen();
    bindPermsScreen();
    bindDashboard();

    const token = await storage.get(TOKEN_KEY);

    if (!token) {
      loader.snap(100, "Ready");
      setTimeout(() => { loader.hide(); showScreen("login"); }, 500);
      return;
    }

    loader.snap(20, "Verifying session");
    try {
      await auth.verifyToken(token);
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
