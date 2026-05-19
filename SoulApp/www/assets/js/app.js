(() => {
  const DEFAULT_API_BASES = [
    "https://soul-pharma-v2-5kmg.onrender.com/api",
    "https://soul-pharma-v2.onrender.com/api",
  ];
  const normalizeApiBase = (value) => {
    const raw = String(value || "").trim().replace(/\/+$/, "");
    if (!raw) return "";
    return /\/api$/.test(raw) ? raw : `${raw}/api`;
  };
  const getApiBases = () => {
    const configured = Array.isArray(window.SoulApiBases)
      ? window.SoulApiBases
      : window.SoulApiBases
        ? [window.SoulApiBases]
        : window.SoulApiBase
          ? [window.SoulApiBase]
          : DEFAULT_API_BASES;
    return [...new Set(configured.map(normalizeApiBase).filter(Boolean))];
  };
  const API_BASES = getApiBases();
  const API_BASE  = API_BASES[0] || DEFAULT_API_BASES[0];
  if (!window.SoulApiBases) window.SoulApiBases = API_BASES;
  if (!window.SoulApiBase) window.SoulApiBase = API_BASE;
  if (!window.SoulApiFetch) {
    window.SoulApiFetch = async (path, options = {}) => {
      let lastError = null;
      for (let index = 0; index < API_BASES.length; index += 1) {
        const base = API_BASES[index];
        try {
          const response = await fetch(`${base}${path}`, options);
          if (response.ok || response.status < 500 || index === API_BASES.length - 1) {
            return response;
          }
          lastError = new Error(`Backend returned ${response.status} for ${base}${path}`);
        } catch (error) {
          lastError = error;
          if (index === API_BASES.length - 1) throw error;
        }
      }
      throw lastError || new Error("Unable to reach backend");
    };
  }
  const TOKEN_KEY = "soul-employee-token";

  const isNative = () => !!window.Capacitor?.isNativePlatform?.();
  const cap      = (name) => window.Capacitor?.Plugins?.[name];

  // ── State ──────────────────────────────────────────────
  const state = {
    token: null, employee: null, tab: "home",
    doctors: [], activities: [], expenses: [], products: [],
    expenseMonth: new Date(),
    calMonth: new Date(), calCache: {},
    locGranted: false, notifGranted: false,
    selectedDoctorId: null, selectedDoctor: null,
    selectedExpDay: null,
    previewIdx: 0,
  };

  // ── Formatting ─────────────────────────────────────────
  const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const currency  = (v) => INR.format(Number(v) || 0);
  const dmy       = (d) => { const dt = new Date(d); return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`; };
  const timeStr   = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const monthLabel= (d) => d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const initial   = (name) => (name || "?")[0].toUpperCase();
  const nowDate   = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const nowTime   = () => { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };
  const isoDate   = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  // ── Storage (token via Capacitor Preferences + localStorage) ──
  const storage = {
    async get(key) {
      if (isNative()) { try { const r = await cap("Preferences").get({ key }); return r.value; } catch { return localStorage.getItem(key); } }
      return localStorage.getItem(key);
    },
    async set(key, value) {
      if (isNative()) { try { await cap("Preferences").set({ key, value: String(value) }); } catch {} }
      localStorage.setItem(key, String(value));
    },
    async remove(key) {
      if (isNative()) { try { await cap("Preferences").remove({ key }); } catch {} }
      localStorage.removeItem(key);
    },
  };

  // ── API ────────────────────────────────────────────────
  const api = async (path, opts = {}) => {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 28000);
    try {
      const res = await window.SoulApiFetch(path, {
        signal: controller.signal,
        method: opts.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
        },
        ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || `Error ${res.status}`); }
      return res.json();
    } finally {
      clearTimeout(tid);
    }
  };

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

  // ── Loader ─────────────────────────────────────────────
  const loader = (() => {
    let cur = 0, creepTimer = null;
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
        clearInterval(creepTimer); cur = 0; ui(0);
        const m_ = msg(); if (m_ && m) m_.textContent = m;
        const e = el();
        if (e) { e.style.display = ""; e.classList.remove("sl-done"); e.style.opacity = "1"; e.style.pointerEvents = "all"; }
      },
      snap(p, m) {
        clearInterval(creepTimer); cur = p; ui(p);
        const m_ = msg(); if (m && m_) m_.textContent = m;
      },
      creep(cap_, rate = 0.055) {
        clearInterval(creepTimer);
        creepTimer = setInterval(() => {
          if (cur < cap_) { cur = Math.min(cap_, cur + rate); ui(cur); }
          else clearInterval(creepTimer);
        }, 80);
      },
      hide() {
        clearInterval(creepTimer);
        const e = el(); if (!e) return;
        e.classList.add("sl-done");
        setTimeout(() => { e.style.opacity = "0"; e.style.pointerEvents = "none"; }, 700);
      },
    };
  })();

  // ── Screen & Tab navigation ────────────────────────────
  const showScreen = (id) => {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(`screen-${id}`)?.classList.remove("hidden");
  };

  const setTab = (tab) => {
    state.tab = tab;
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === `tab-${tab}`));
    const fab = document.getElementById("app-fab");
    if (["expenses","doctors","activities"].includes(tab)) fab?.classList.remove("hidden");
    else fab?.classList.add("hidden");
    if (tab === "expenses")   loadExpenses();
    if (tab === "doctors")    renderDoctors();
    if (tab === "activities") renderActivities();
    if (tab === "products")   loadProducts();
  };

  // ── Permissions ────────────────────────────────────────
  const perms = {
    async checkLocation() {
      if (!isNative()) return true;
      try { const s = await cap("Geolocation").checkPermissions(); return s.location === "granted"; } catch { return false; }
    },
    async requestLocation() {
      if (!isNative()) return true;
      try { const s = await cap("Geolocation").requestPermissions(); return s.location === "granted"; } catch { return false; }
    },
    async checkNotif() {
      if (!isNative()) return true;
      try { const s = await cap("LocalNotifications").checkPermissions(); return s.display === "granted"; } catch { return false; }
    },
    async requestNotif() {
      if (!isNative()) return true;
      try { const s = await cap("LocalNotifications").requestPermissions(); return s.display === "granted"; } catch { return false; }
    },
  };

  const updatePermUI = () => {
    if (state.locGranted)   { document.getElementById("loc-granted-tag")?.classList.remove("hidden");   document.getElementById("btn-loc")?.classList.add("hidden");   document.getElementById("perm-card-loc")?.classList.add("granted"); }
    if (state.notifGranted) { document.getElementById("notif-granted-tag")?.classList.remove("hidden"); document.getElementById("btn-notif")?.classList.add("hidden"); document.getElementById("perm-card-notif")?.classList.add("granted"); }
    const cont = document.getElementById("btn-perms-continue");
    if (cont) cont.disabled = !state.locGranted;
  };

  // ── Foreground service ─────────────────────────────────
  const tracker = {
    start() {
      if (!isNative()) return;
      try { cap("SoulTracker")?.startService({ token: state.token, empId: state.employee?._id || "", empName: state.employee?.name || "" }); } catch {}
    },
    stop() { if (!isNative()) return; try { cap("SoulTracker")?.stopService(); } catch {} },
  };

  // ── Send location ping ────────────────────────────────
  const sendLocationPing = async (source = "heartbeat") => {
    if (!isNative()) return;
    try {
      const pos = await cap("Geolocation")?.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      if (!pos) return;
      await api("/employee/locations", {
        method: "POST",
        body: {
          latitude:  Number(pos.coords.latitude),
          longitude: Number(pos.coords.longitude),
          accuracy:  Number(pos.coords.accuracy),
          source,
        },
      });
      const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const el = document.getElementById("home-last-sync");
      if (el) el.textContent = `Synced ${t}`;
    } catch {}
  };

  // ── Location watch (foreground, on GPS update) ─────────
  let _watchId = null;
  const startLocationWatch = () => {
    if (!isNative()) return;
    cap("Geolocation")?.watchPosition({ enableHighAccuracy: true, timeout: 10000 }, async (pos, err) => {
      if (err || !pos) return;
      try {
        await api("/employee/locations", {
          method: "POST",
          body: {
            latitude:  Number(pos.coords.latitude),
            longitude: Number(pos.coords.longitude),
            accuracy:  Number(pos.coords.accuracy),
            source: "gps-update",
          },
        });
        const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        const el = document.getElementById("home-last-sync");
        if (el) el.textContent = `Synced ${t}`;
      } catch {}
    }).then(id => { _watchId = id; }).catch(() => {});

    // Heartbeat every 3 minutes
    setInterval(() => sendLocationPing("heartbeat"), 3 * 60 * 1000);
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
      // Close every overlay so nothing lingers over the login screen
      document.getElementById("exit-dialog")?.classList.add("hidden");
      document.getElementById("product-preview")?.classList.add("hidden");
      document.getElementById("sheet-calendar")?.classList.add("hidden");
      document.querySelectorAll(".bottom-sheet").forEach(s => s.classList.add("hidden"));
      // Dismiss any toast
      clearTimeout(_toastTimer);
      if (toastEl) toastEl.className = "hidden";

      // Animate dashboard sliding away
      const dash = document.getElementById("screen-dash");
      if (dash && !dash.classList.contains("hidden")) {
        dash.style.animation = "screen-exit-down .32s ease forwards";
        dash.style.pointerEvents = "none";
        await new Promise(r => setTimeout(r, 310));
        dash.style.animation = "";
        dash.style.pointerEvents = "";
      }

      // Wipe auth state and caches
      await storage.remove(TOKEN_KEY);
      localStorage.removeItem("soul-cache-employee");
      localStorage.removeItem("soul-cache-doctors");
      localStorage.removeItem("soul-cache-activities");
      localStorage.removeItem("soul-cache-expenses");
      state.token = null; state.employee = null;
      tracker.stop();
      if (_watchId !== null) { try { await cap("Geolocation")?.clearWatch({ id: _watchId }); } catch {} _watchId = null; }
      if (_socket) { try { _socket.disconnect(); } catch {} _socket = null; }

      // Reset login form to a clean state
      const errEl = document.getElementById("login-error");
      const btn   = document.getElementById("login-btn");
      if (errEl) errEl.textContent = "";
      if (btn)   { btn.disabled = false; btn.textContent = "Login"; }

      // Pre-fill saved credentials
      const savedEmail = localStorage.getItem("soul-saved-email") || "";
      const savedPass  = localStorage.getItem("soul-saved-pass")  || "";
      const emailInput = document.getElementById("inp-email");
      const passInput  = document.getElementById("inp-pass");
      if (emailInput && savedEmail) emailInput.value = savedEmail;
      if (passInput  && savedPass)  passInput.value  = savedPass;

      // Show login with entrance animation
      document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
      const loginScr = document.getElementById("screen-login");
      if (loginScr) {
        loginScr.classList.remove("hidden");
        loginScr.style.animation = "screen-enter-up .38s cubic-bezier(0.16,1,0.3,1) forwards";
        setTimeout(() => { loginScr.style.animation = ""; }, 400);
      }
    },
    async verifyToken(token) {
      state.token = token;
      const data  = await api("/employee/me");
      state.employee = data.employee;
    },
  };

  // ── Cache helpers ──────────────────────────────────────
  const cache = {
    loadAll() {
      try {
        const emp  = localStorage.getItem("soul-cache-employee");
        const docs = localStorage.getItem("soul-cache-doctors");
        const acts = localStorage.getItem("soul-cache-activities");
        const exps = localStorage.getItem("soul-cache-expenses");
        if (emp)  state.employee   = JSON.parse(emp);
        if (docs) state.doctors    = JSON.parse(docs);
        if (acts) state.activities = JSON.parse(acts);
        if (exps) state.expenses   = JSON.parse(exps);
      } catch {}
    },
    saveEmployee(emp)   { try { localStorage.setItem("soul-cache-employee",   JSON.stringify(emp));   } catch {} },
    saveDoctors(docs)   { try { localStorage.setItem("soul-cache-doctors",    JSON.stringify(docs));  } catch {} },
    saveActivities(acts){ try { localStorage.setItem("soul-cache-activities", JSON.stringify(acts));  } catch {} },
    saveExpenses(exps)  { try { localStorage.setItem("soul-cache-expenses",   JSON.stringify(exps));  } catch {} },
  };

  // ── Data loaders ───────────────────────────────────────
  const loadProfile = async () => {
    const data = await api("/employee/me");
    state.employee = data.employee;
    cache.saveEmployee(data.employee);
    renderProfile(); renderHomeHeader();
  };

  const loadDoctors = async () => {
    const data = await api("/employee/doctors");
    state.doctors = data.doctors || [];
    cache.saveDoctors(state.doctors);
    renderDoctors();
  };

  const loadActivities = async () => {
    const now  = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
    const data = await api(`/employee/activities?from=${from}&to=${nowDate()}`);
    state.activities = data.activities || [];
    cache.saveActivities(state.activities);
    renderActivities(); renderHomeActivity();
  };

  const loadExpenses = async () => {
    const d    = state.expenseMonth;
    const from = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
    const last = new Date(d.getFullYear(), d.getMonth()+1, 0);
    const to   = `${last.getFullYear()}-${String(last.getMonth()+1).padStart(2,"0")}-${String(last.getDate()).padStart(2,"0")}`;
    const data = await api(`/employee/expenses?from=${from}&to=${to}`);
    state.expenses = data.expenses || [];
    cache.saveExpenses(state.expenses);
    renderExpenseCalendar();
  };

  const loadProducts = async () => {
    const wrap = document.getElementById("product-list-wrap");
    try {
      const data = await api("/employee/products");
      state.products = data.products || [];
      renderProducts();
    } catch {
      state.products = [];
      renderProducts();
    }
  };

  const loadCalendar = async () => {
    const monthKey = `${state.calMonth.getFullYear()}-${String(state.calMonth.getMonth()+1).padStart(2,"0")}`;
    try {
      const data = await api(`/employee/activities/calendar?month=${monthKey}`);
      state.calCache = {};
      (data.days || []).forEach(d => { state.calCache[d.date] = d; });
    } catch {}
    renderCalendar();
  };

  // ── Renderers ──────────────────────────────────────────
  const renderHomeHeader = () => {
    const emp  = state.employee || {};
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const el = (id) => document.getElementById(id);
    if (el("home-name"))    el("home-name").textContent  = emp.name || "Employee";
    if (el("home-greeting"))el("home-greeting").textContent = greet;
    if (el("stat-doctors")) el("stat-doctors").textContent = state.doctors.length;
    if (el("stat-visits"))  el("stat-visits").textContent  = state.activities.length;
    const totalExp = state.expenses.reduce((s,e) => s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0),0);
    if (el("stat-expenses"))el("stat-expenses").textContent = currency(totalExp);
  };

  const renderHomeActivity = () => {
    const el = document.getElementById("home-activity");
    if (!el) return;
    const recent = state.activities.slice(0,5);
    if (!recent.length) { el.innerHTML = `<p class="empty-state">No activities yet this month.</p>`; return; }
    el.innerHTML = recent.map(a => {
      const name = a.doctorSnapshot?.name || a.doctorName || "Visit";
      const ts   = a.visitedAt || a.createdAt;
      return `<div class="list-item mt-2">
        <div class="list-avatar">${initial(name)}</div>
        <div class="list-body">
          <p class="list-name">${name}</p>
          <p class="list-meta">${dmy(ts)} · ${timeStr(ts)}${a.notes ? " · " + a.notes.slice(0,40) : ""}</p>
        </div>
      </div>`;
    }).join("");
  };

  const renderProfile = () => {
    const emp = state.employee || {};
    const fields = {
      "profile-name":        emp.name || "–",
      "profile-role":        emp.designation || "Field Representative",
      "profile-empid":       emp.employeeId || "–",
      "profile-email":       emp.email || "–",
      "profile-designation": emp.designation || "–",
      "profile-department":  emp.department || "–",
      "profile-territory":   emp.territoryName || emp.territory || "–",
      "profile-manager":     emp.managerName || emp.manager?.name || "–",
      "profile-joining":     emp.joiningDate ? dmy(emp.joiningDate) : "–",
      "profile-salary":      emp.salary ? currency(emp.salary) : "–",
    };
    Object.entries(fields).forEach(([id,val]) => {
      const e = document.getElementById(id); if (e) e.textContent = val;
    });

    // Avatar in profile sheet
    const initEl = document.getElementById("profile-initial");
    const imgEl  = document.getElementById("profile-photo-img");
    const savedPhoto = localStorage.getItem("soul-profile-photo");
    if (savedPhoto && imgEl && initEl) {
      imgEl.src = savedPhoto;
      imgEl.classList.remove("hidden");
      initEl.style.display = "none";
    } else {
      if (initEl) { initEl.textContent = initial(emp.name); initEl.style.display = ""; }
      if (imgEl)  imgEl.classList.add("hidden");
    }

    // Navbar avatar
    const navInitEl = document.getElementById("profile-nav-initial");
    const navImgEl  = document.getElementById("profile-nav-img");
    if (savedPhoto && navImgEl && navInitEl) {
      navImgEl.src = savedPhoto;
      navImgEl.classList.remove("hidden");
      navInitEl.style.display = "none";
    } else {
      if (navInitEl) { navInitEl.textContent = initial(emp.name); navInitEl.style.display = ""; }
      if (navImgEl)  navImgEl.classList.add("hidden");
    }
  };

  // ── Expense Calendar ───────────────────────────────────
  const renderExpenseCalendar = () => {
    const lbl = document.getElementById("exp-month-label");
    if (lbl) lbl.textContent = monthLabel(state.expenseMonth);

    // Summary
    const total    = state.expenses.reduce((s,e)=>s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0),0);
    const pending  = state.expenses.filter(e=>(e.status||"pending")==="pending").reduce((s,e)=>s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0),0);
    const approved = state.expenses.filter(e=>e.status==="approved").reduce((s,e)=>s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0),0);
    const g = (id) => document.getElementById(id);
    if (g("exp-total"))   g("exp-total").textContent   = currency(total);
    if (g("exp-pending")) g("exp-pending").textContent = currency(pending);
    if (g("exp-approved"))g("exp-approved").textContent= currency(approved);

    const container = document.getElementById("exp-calendar-grid");
    if (!container) return;

    const d     = state.expenseMonth;
    const year  = d.getFullYear();
    const month = d.getMonth();

    // Build a map: "YYYY-MM-DD" -> expense
    const expMap = {};
    state.expenses.forEach(e => {
      const raw = e.expenseDate || e.date || e.createdAt;
      if (!raw) return;
      const dt  = new Date(raw);
      const key = isoDate(dt);
      if (!expMap[key]) expMap[key] = [];
      expMap[key].push(e);
    });

    const today    = isoDate(new Date());
    const firstDay = new Date(year, month, 1);
    // Monday-start: 0=Mon..6=Sun
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(year, month+1, 0).getDate();
    const dayHeaders  = ["Mo","Tu","We","Th","Fr","Sa","Su"];

    let html = `<div class="cal-grid">`;
    // Headers
    dayHeaders.forEach(h => { html += `<div class="cal-day-hdr">${h}</div>`; });
    // Empty leading cells
    for (let i = 0; i < startOffset; i++) html += `<div class="cal-day empty"></div>`;
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const key  = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const exps = expMap[key] || [];
      const hasExp = exps.length > 0;
      const isToday = key === today;
      const cls  = ["cal-day", hasExp ? "has-expense" : "", isToday ? "today" : ""].filter(Boolean).join(" ");
      const amt  = hasExp ? exps.reduce((s,e)=>s+(Number(e.amount)||0)+(Number(e.travelAllowance)||0),0) : 0;
      html += `<div class="${cls}" data-date="${key}">
        <div class="cal-day-num">${day}</div>
        ${hasExp ? `<div class="cal-day-amt">${currency(amt)}</div><div class="cal-dot"></div>` : ""}
      </div>`;
    }
    html += `</div>`;
    container.innerHTML = html;

    // Clear detail list
    const detailEl = document.getElementById("exp-detail-list");
    if (detailEl) detailEl.innerHTML = "";

    // Attach click handlers
    container.querySelectorAll(".cal-day:not(.empty)").forEach(cell => {
      cell.addEventListener("click", () => {
        const date = cell.dataset.date;
        const exps = expMap[date] || [];
        if (exps.length > 0) {
          showExpenseDetail(date, exps);
        } else {
          // Open add-expense sheet with date pre-filled
          const dateInput = document.getElementById("exp-form-date");
          if (dateInput) dateInput.value = date;
          openSheet("sheet-expense");
        }
      });
    });
  };

  const showExpenseDetail = (dateStr, exps) => {
    const titleEl = document.getElementById("sheet-exp-detail-title");
    const bodyEl  = document.getElementById("sheet-exp-detail-body");
    if (titleEl) titleEl.textContent = `Expenses — ${dmy(dateStr + "T00:00:00")}`;
    if (bodyEl) {
      bodyEl.innerHTML = exps.map(e => {
        const st = e.status || "pending";
        const pillCls = st === "approved" ? "pill-green" : st === "rejected" ? "pill-red" : "pill-yellow";
        const ta = Number(e.travelAllowance) || 0;
        return `<div class="list-item mt-2">
          <div style="flex:1;min-width:0;">
            <div class="card-row">
              <p class="list-name">${currency(e.amount)}${ta ? ` <span style="font-size:.72rem;color:var(--muted);">+${currency(ta)} TA</span>` : ""}</p>
              <span class="pill ${pillCls}">${st}</span>
            </div>
            <p class="list-meta">${e.workingArea||"Field"} · ${Number(e.distance)||0} km</p>
            ${e.remarks ? `<p class="list-meta mt-1">${e.remarks}</p>` : ""}
          </div>
        </div>`;
      }).join("");
    }
    openSheet("sheet-exp-detail");
  };

  let _docFilter = "";
  const renderDoctors = () => {
    const el = document.getElementById("doc-list");
    if (!el) return;
    const filtered = state.doctors.filter(d =>
      [d.name, d.speciality, d.clinicName, d.city].some(f => f?.toLowerCase().includes(_docFilter.toLowerCase()))
    );
    if (!filtered.length) { el.innerHTML = `<p class="empty-state">${state.doctors.length ? "No results." : "No doctors added yet."}</p>`; return; }
    el.innerHTML = filtered.map(d => `
      <div class="list-item">
        <div class="list-avatar">${initial(d.name)}</div>
        <div class="list-body" style="flex:1;min-width:0;">
          <p class="list-name">${d.name}</p>
          <p class="list-meta">${[d.speciality, d.clinicName, d.city].filter(Boolean).join(" · ")}</p>
          ${d.phone ? `<p class="list-meta">📞 ${d.phone}</p>` : ""}
          ${d.address ? `<p class="list-meta">📍 ${d.address}${d.state ? ", " + d.state : ""}${d.pincode ? " " + d.pincode : ""}</p>` : ""}
          ${d.email ? `<p class="list-meta">✉ ${d.email}</p>` : ""}
          ${d.notes ? `<p class="list-meta" style="opacity:.65;">${d.notes.slice(0,60)}</p>` : ""}
        </div>
      </div>`).join("");
  };

  const renderActivities = () => {
    const el = document.getElementById("act-list");
    if (!el) return;
    if (!state.activities.length) { el.innerHTML = `<p class="empty-state">No visits logged this month.</p>`; return; }
    el.innerHTML = state.activities.map(a => {
      const name = a.doctorSnapshot?.name || a.doctorName || "Visit";
      const ts   = a.visitedAt || a.createdAt;
      const spec = a.doctorSnapshot?.speciality || "";
      const hasLoc = a.visitLocation?.latitude && a.visitLocation?.longitude;
      const mapsUrl = hasLoc ? `https://www.google.com/maps?q=${a.visitLocation.latitude},${a.visitLocation.longitude}` : null;
      return `<div class="list-item">
        <div class="list-avatar">${initial(name)}</div>
        <div class="list-body" style="flex:1;min-width:0;">
          <p class="list-name">${name}${spec ? `<span style="font-size:.72rem;color:var(--muted);font-weight:400;margin-left:.4rem;">${spec}</span>` : ""}</p>
          <p class="list-meta">${dmy(ts)} · ${timeStr(ts)}</p>
          ${a.followUpDate ? `<p class="list-meta mt-1">Follow-up: ${dmy(a.followUpDate)}</p>` : ""}
          ${a.notes ? `<p class="list-meta mt-1">${a.notes.slice(0,60)}</p>` : ""}
          ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" style="font-size:.72rem;color:var(--blue);margin-top:3px;display:inline-block;">📍 View location</a>` : ""}
        </div>
      </div>`;
    }).join("");
  };

  // ── Products renderer ──────────────────────────────────
  const renderProducts = () => {
    const wrap = document.getElementById("product-list-wrap");
    if (!wrap) return;
    if (!state.products.length) {
      wrap.innerHTML = `<p class="empty-state">No products available yet.<br><span style="font-size:.72rem;">Products will appear here once added by admin.</span></p>`;
      return;
    }
    wrap.innerHTML = `<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;">
      <table class="product-table">
        <thead>
          <tr>
            <th class="td-sn">#</th>
            <th>Product Name</th>
            <th>Composition</th>
          </tr>
        </thead>
        <tbody>
          ${state.products.map((p,i) => `
            <tr data-product-idx="${i}">
              <td class="td-sn">${p.serialNumber || i+1}</td>
              <td class="td-name">${p.name}</td>
              <td class="td-comp">${p.composition || "–"}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
    wrap.querySelectorAll("[data-product-idx]").forEach(row => {
      row.addEventListener("click", () => openProductPreview(Number(row.dataset.productIdx)));
    });
  };

  // ── Product preview ────────────────────────────────────
  const openProductPreview = (idx) => {
    state.previewIdx = Math.max(0, Math.min(idx, state.products.length - 1));
    const overlay = document.getElementById("product-preview");
    if (!overlay) return;
    overlay.classList.remove("hidden");
    updatePreviewSlide();
  };

  const closeProductPreview = () => {
    document.getElementById("product-preview")?.classList.add("hidden");
    try { screen.orientation?.unlock?.(); } catch {}
  };

  const updatePreviewSlide = () => {
    const p = state.products[state.previewIdx];
    if (!p) return;
    const imgEl   = document.getElementById("prev-img");
    const noImgEl = document.getElementById("prev-no-img");
    const nameEl  = document.getElementById("prev-name");
    const counter = document.getElementById("prev-counter");
    const prevBtn = document.getElementById("prev-btn-prev");
    const nextBtn = document.getElementById("prev-btn-next");

    if (nameEl) nameEl.textContent = p.name;
    if (counter) counter.textContent = `${state.previewIdx + 1} / ${state.products.length}`;
    if (prevBtn) prevBtn.disabled = state.previewIdx === 0;
    if (nextBtn) nextBtn.disabled = state.previewIdx === state.products.length - 1;

    if (imgEl && noImgEl) {
      if (p.imageUrl) {
        imgEl.style.opacity = "0";
        imgEl.src = p.imageUrl;
        imgEl.classList.remove("hidden");
        noImgEl.classList.add("hidden");
        imgEl.onload = () => { imgEl.style.opacity = "1"; };
        imgEl.onerror = () => { imgEl.classList.add("hidden"); noImgEl.classList.remove("hidden"); };
      } else {
        imgEl.classList.add("hidden");
        noImgEl.classList.remove("hidden");
      }
    }
  };

  const bindProductPreview = () => {
    const overlay = document.getElementById("product-preview");
    if (!overlay) return;

    document.getElementById("prev-close-btn")?.addEventListener("click", closeProductPreview);
    document.getElementById("prev-btn-prev")?.addEventListener("click", () => {
      if (state.previewIdx > 0) { state.previewIdx--; updatePreviewSlide(); }
    });
    document.getElementById("prev-btn-next")?.addEventListener("click", () => {
      if (state.previewIdx < state.products.length - 1) { state.previewIdx++; updatePreviewSlide(); }
    });

    // Orientation toggle
    document.getElementById("prev-orient-btn")?.addEventListener("click", async () => {
      try {
        if (screen.orientation?.type?.startsWith("landscape")) {
          await screen.orientation?.lock?.("portrait");
        } else {
          await screen.orientation?.lock?.("landscape");
        }
      } catch {}
    });

    // Swipe left/right
    let touchStartX = 0, touchStartY = 0;
    overlay.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    overlay.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0 && state.previewIdx < state.products.length - 1) { state.previewIdx++; updatePreviewSlide(); }
      if (dx > 0 && state.previewIdx > 0) { state.previewIdx--; updatePreviewSlide(); }
    }, { passive: true });

    // Keyboard left/right
    document.addEventListener("keydown", (e) => {
      if (overlay.classList.contains("hidden")) return;
      if (e.key === "ArrowLeft"  && state.previewIdx > 0) { state.previewIdx--; updatePreviewSlide(); }
      if (e.key === "ArrowRight" && state.previewIdx < state.products.length - 1) { state.previewIdx++; updatePreviewSlide(); }
      if (e.key === "Escape") closeProductPreview();
    });
  };

  // ── Activity calendar ──────────────────────────────────
  const renderCalendar = () => {
    const lbl = document.getElementById("cal-month-lbl");
    if (lbl) lbl.textContent = monthLabel(state.calMonth);

    const wrap = document.getElementById("cal-grid-wrap");
    if (!wrap) return;

    const d = state.calMonth;
    const year = d.getFullYear(), month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const today = isoDate(new Date());
    const hdrs  = ["Mo","Tu","We","Th","Fr","Sa","Su"];

    let html = `<div class="cal-grid">`;
    hdrs.forEach(h => { html += `<div class="cal-day-hdr">${h}</div>`; });
    for (let i = 0; i < startOffset; i++) html += `<div class="cal-day empty"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const key  = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const meta = state.calCache[key];
      const cnt  = meta?.count || 0;
      const isToday = key === today;
      let cls = "cal-day";
      if (cnt >= 3) cls += " has-visit has-visit-3";
      else if (cnt === 2) cls += " has-visit has-visit-2";
      else if (cnt === 1) cls += " has-visit";
      if (isToday) cls += " today";
      html += `<div class="${cls}" data-cal-date="${key}">
        <div class="cal-day-num">${day}</div>
        ${cnt ? `<div class="cal-day-visits">${cnt} visit${cnt>1?"s":""}</div>` : ""}
      </div>`;
    }
    html += `</div>`;
    wrap.innerHTML = html;

    wrap.querySelectorAll("[data-cal-date]").forEach(cell => {
      cell.addEventListener("click", () => {
        const key = cell.dataset.calDate;
        const meta = state.calCache[key];
        const detail = document.getElementById("cal-day-detail");
        if (!detail) return;
        if (!meta?.count) {
          detail.innerHTML = `<p class="empty-state" style="padding:1rem 0;">No visits on ${dmy(key+"T00:00:00")}.</p>`;
        } else {
          detail.innerHTML = `<p style="font-size:.72rem;color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem;">${dmy(key+"T00:00:00")}</p>
            ${meta.items.map(it => `<div class="cal-detail-card">
              <p style="font-weight:700;font-size:.9rem;">${it.doctorName || "Visit"}</p>
              <p style="font-size:.75rem;color:var(--muted);margin-top:3px;">${timeStr(it.time)}</p>
            </div>`).join("")}`;
        }
      });
    });
  };

  const openCalendar = () => {
    document.getElementById("sheet-calendar")?.classList.remove("hidden");
    loadCalendar();
  };

  const closeCalendar = () => {
    document.getElementById("sheet-calendar")?.classList.add("hidden");
  };

  // ── Sheets ─────────────────────────────────────────────
  const stampActivityTime = () => {
    const el = document.getElementById("act-form-visitedAt");
    if (!el) return;
    const now = new Date();
    el.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}T${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  };

  const openSheet = (id) => {
    document.getElementById(id)?.classList.remove("hidden");
    if (id === "sheet-activity") stampActivityTime();
  };
  const closeSheet = (id) => document.getElementById(id)?.classList.add("hidden");

  // ── Notifications ──────────────────────────────────────
  let _socket = null;

  const notifPriority = (p) => (p === "urgent" || p === "warning") ? p : "info";

  const renderNotifCard = (n) => {
    const p    = notifPriority(n.priority);
    const unread = !n.readAt && !n.read ? " unread" : "";
    const label = p === "urgent" ? "Urgent" : p === "warning" ? "Warning" : "Info";
    const timeStr2 = n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }) : "";
    return `
      <div class="notif-card ${p}${unread}">
        <div class="notif-card-title">${n.title || "Notification"}</div>
        ${n.message ? `<div class="notif-card-body">${n.message}</div>` : ""}
        <div class="notif-card-meta">
          <span class="notif-pill ${p}">${label}</span>
          ${timeStr2 ? `<span>${timeStr2}</span>` : ""}
        </div>
      </div>`;
  };

  const fetchNotifications = async () => {
    const listEl = document.getElementById("notif-list");
    const badge  = document.getElementById("notif-badge");
    openSheet("sheet-notifs");
    if (listEl) listEl.innerHTML = `<p class="empty-state">Loading...</p>`;
    try {
      const data   = await api("/employee/notifications");
      const notifs = data.notifications || [];
      if (badge) badge.classList.toggle("visible", notifs.some(n => !n.readAt && !n.read));
      if (!listEl) return;
      if (!notifs.length) { listEl.innerHTML = `<p class="empty-state">No notifications yet.</p>`; return; }
      listEl.innerHTML = notifs.map(renderNotifCard).join("");
    } catch {
      if (listEl) listEl.innerHTML = `<p class="empty-state">Failed to load notifications.</p>`;
    }
  };

  const connectSocket = () => {
    if (typeof io === "undefined" || !state.token) return;
    if (_socket) { _socket.disconnect(); _socket = null; }
    _socket = io(API_BASE.replace(/\/api$/, ""), {
      auth: { token: state.token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    _socket.on("notification:new", async (payload) => {
      // Update badge
      const badge = document.getElementById("notif-badge");
      if (badge) badge.classList.add("visible");

      // Fire local notification if panel is not open
      const sheet = document.getElementById("sheet-notifs");
      const panelOpen = sheet && !sheet.classList.contains("hidden");
      if (state.notifGranted && !panelOpen) {
        try {
          await cap("LocalNotifications")?.schedule({
            notifications: [{
              id: Math.floor(Math.random() * 999999) + 1,
              title: payload.title || "Soul Pharma",
              body:  payload.message || "",
              smallIcon: "ic_stat_soul",
            }],
          });
        } catch {}
      }

      // Prepend card to open panel
      const listEl = document.getElementById("notif-list");
      if (listEl && panelOpen) {
        const empty = listEl.querySelector(".empty-state");
        if (empty) listEl.innerHTML = "";
        listEl.insertAdjacentHTML("afterbegin", renderNotifCard({ ...payload, read: false }));
      }
    });
  };

  // ── Profile photo ──────────────────────────────────────
  const bindProfilePhoto = () => {
    const btn    = document.getElementById("btn-change-photo");
    const inp    = document.getElementById("inp-profile-photo");
    const imgEl  = document.getElementById("profile-photo-img");
    const initEl = document.getElementById("profile-initial");
    const navImg = document.getElementById("profile-nav-img");
    const navInit= document.getElementById("profile-nav-initial");

    btn?.addEventListener("click", () => inp?.click());

    inp?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target.result;
        localStorage.setItem("soul-profile-photo", b64);
        if (imgEl)   { imgEl.src = b64; imgEl.classList.remove("hidden"); }
        if (initEl)  initEl.style.display = "none";
        if (navImg)  { navImg.src = b64; navImg.classList.remove("hidden"); }
        if (navInit) navInit.style.display = "none";
        toast("Profile photo updated!");
      };
      reader.readAsDataURL(file);
    });
  };

  // ── Pull to refresh ────────────────────────────────────
  const bindPullToRefresh = () => {
    const content   = document.getElementById("dash-content");
    const indicator = document.getElementById("ptr-indicator");
    if (!content || !indicator) return;

    let startY = 0, pulling = false, triggered = false;
    const THRESHOLD = 60;

    content.addEventListener("touchstart", (e) => {
      if (content.scrollTop === 0) {
        startY  = e.touches[0].clientY;
        pulling = true;
        triggered = false;
      }
    }, { passive: true });

    content.addEventListener("touchmove", (e) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > THRESHOLD && !triggered) {
        indicator.classList.add("visible");
        indicator.textContent = "↻ Release to refresh";
        triggered = true;
      } else if (dy <= THRESHOLD && triggered) {
        indicator.classList.remove("visible");
        triggered = false;
      }
    }, { passive: true });

    content.addEventListener("touchend", async () => {
      if (triggered) {
        indicator.textContent = "↻ Refreshing...";
        try {
          if (state.tab === "home") {
            await Promise.all([loadProfile(), loadDoctors(), loadActivities(), loadExpenses()]);
            renderHomeHeader();
          } else if (state.tab === "expenses") {
            await loadExpenses();
          } else if (state.tab === "doctors") {
            await loadDoctors();
          } else if (state.tab === "activities") {
            await loadActivities();
          }
          toast("Refreshed!");
        } catch {
          toast("Refresh failed.", true);
        }
        indicator.classList.remove("visible");
      }
      pulling = false; triggered = false;
    });
  };

  // ── Dashboard launch ───────────────────────────────────
  const launchDashboard = async () => {
    loader.show("Loading your data");
    loader.creep(20, 0.08);
    showScreen("dash");
    setTab("home");

    // Load from cache immediately for instant display
    cache.loadAll();
    if (state.employee) {
      renderHomeHeader();
      renderHomeActivity();
      renderProfile();
      renderExpenseCalendar();
      renderDoctors();
      renderActivities();
    }

    const safe = async (fn, snapTo, label) => {
      try { await fn(); } catch { /* keep going, cache still shown */ }
      loader.snap(snapTo, label);
    };

    await safe(loadProfile,    35, "Profile loaded");
    await safe(loadDoctors,    58, "Doctors synced");
    await safe(loadActivities, 78, "Activities loaded");
    await safe(loadExpenses,   93, "Expenses fetched");

    renderHomeHeader();
    loader.snap(100, "All set!");
    tracker.start();
    sendLocationPing("login");
    startLocationWatch();
    connectSocket();
    setTimeout(() => loader.hide(), 600);
  };

  // ── After login: permissions gate then dashboard ───────
  const goToPermissionsOrDash = async () => {
    if (!isNative()) { await launchDashboard(); return; }
    state.locGranted   = await perms.checkLocation();
    state.notifGranted = await perms.checkNotif();
    if (!state.locGranted) {
      loader.hide();
      showScreen("perms");
      updatePermUI();
    } else {
      await launchDashboard();
    }
  };

  // ── Login screen ───────────────────────────────────────
  const bindLoginScreen = () => {
    const form      = document.getElementById("login-form");
    const errEl     = document.getElementById("login-error");
    const btn       = document.getElementById("login-btn");
    const emailInput = document.getElementById("inp-email");
    const passInput  = document.getElementById("inp-pass");
    if (!form) return;

    // Pre-fill on first bind (fresh app open)
    const savedEmail = localStorage.getItem("soul-saved-email") || "";
    const savedPass  = localStorage.getItem("soul-saved-pass")  || "";
    if (emailInput && savedEmail) emailInput.value = savedEmail;
    if (passInput  && savedPass)  passInput.value  = savedPass;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.textContent = "";
      btn.disabled = true; btn.textContent = "Logging in...";
      loader.show("Connecting to server");
      loader.creep(35, 0.06);

      const email = emailInput.value.trim();
      const pass  = passInput.value;

      try {
        loader.snap(40, "Verifying credentials");
        await auth.login(email, pass);
        // Persist credentials for next login
        localStorage.setItem("soul-saved-email", email);
        localStorage.setItem("soul-saved-pass",  pass);
        loader.snap(55, "Login successful");
        await goToPermissionsOrDash();
      } catch (err) {
        loader.hide();
        errEl.textContent = err.message || "Login failed. Check your credentials.";
        btn.disabled = false; btn.textContent = "Login";
      }
    });
  };

  // ── Permissions screen ─────────────────────────────────
  const bindPermsScreen = () => {
    document.getElementById("btn-loc")?.addEventListener("click", async () => {
      state.locGranted = await perms.requestLocation();
      if (!state.locGranted) toast("Location permission is required.", true);
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

  // ── Dashboard bindings ─────────────────────────────────
  const bindDashboard = () => {
    // Bottom nav
    document.querySelectorAll(".nav-btn").forEach(btn =>
      btn.addEventListener("click", () => setTab(btn.dataset.tab))
    );

    // FAB
    document.getElementById("app-fab")?.addEventListener("click", () => {
      if (state.tab === "expenses") {
        document.getElementById("exp-form-date").value = nowDate();
        openSheet("sheet-expense");
      }
      if (state.tab === "doctors") openSheet("sheet-doctor");
      if (state.tab === "activities") openSheet("sheet-activity");
    });

    // Logout
    document.getElementById("btn-logout")?.addEventListener("click", () => auth.logout());

    // Navbar: calendar icon
    document.getElementById("btn-cal")?.addEventListener("click", openCalendar);
    document.getElementById("btn-cal-close")?.addEventListener("click", closeCalendar);
    document.getElementById("cal-prev")?.addEventListener("click", () => {
      state.calMonth = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth()-1, 1);
      loadCalendar();
    });
    document.getElementById("cal-next")?.addEventListener("click", () => {
      const next = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth()+1, 1);
      if (next <= new Date()) { state.calMonth = next; loadCalendar(); }
    });

    // Navbar: profile avatar
    document.getElementById("btn-profile-nav")?.addEventListener("click", () => openSheet("sheet-profile"));

    // Product preview
    bindProductPreview();

    // Expense month nav
    document.getElementById("exp-prev")?.addEventListener("click", () => {
      state.expenseMonth = new Date(state.expenseMonth.getFullYear(), state.expenseMonth.getMonth()-1, 1);
      loadExpenses();
    });
    document.getElementById("exp-next")?.addEventListener("click", () => {
      const next = new Date(state.expenseMonth.getFullYear(), state.expenseMonth.getMonth()+1, 1);
      if (next <= new Date()) { state.expenseMonth = next; loadExpenses(); }
    });

    // Doctor search
    document.getElementById("doc-search")?.addEventListener("input", (e) => {
      _docFilter = e.target.value; renderDoctors();
    });

    // Notification bell
    document.getElementById("btn-notif-bell")?.addEventListener("click", fetchNotifications);

    // ── Expense form submit
    document.getElementById("form-expense")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("exp-submit-btn");
      btn.disabled = true; btn.textContent = "Saving...";
      const body = Object.fromEntries(new FormData(e.target).entries());
      try {
        await api("/employee/expenses", { method: "POST", body });
        e.target.reset(); closeSheet("sheet-expense");
        await loadExpenses(); renderHomeHeader();
        toast("Expense saved!");
      } catch (err) { toast(err.message || "Failed to save.", true); }
      finally { btn.disabled = false; btn.textContent = "Save Expense"; }
    });

    // ── Doctor form submit
    document.getElementById("form-doctor")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("doc-submit-btn");
      btn.disabled = true; btn.textContent = "Saving...";
      const body = Object.fromEntries(new FormData(e.target).entries());
      try {
        await api("/employee/doctors", { method: "POST", body });
        e.target.reset(); closeSheet("sheet-doctor");
        await loadDoctors(); renderHomeHeader();
        toast("Doctor added!");
      } catch (err) { toast(err.message || "Failed to save.", true); }
      finally { btn.disabled = false; btn.textContent = "Save Doctor"; }
    });

    // ── Activity form + doctor autocomplete
    const actDoctorInput   = document.getElementById("act-doctor-input");
    const actDoctorResults = document.getElementById("act-doctor-results");

    const actFillDoctor = (doctor) => {
      state.selectedDoctorId = doctor._id;
      state.selectedDoctor   = doctor;
      const g = (id) => document.getElementById(id);
      if (g("act-doctor-id"))  g("act-doctor-id").value  = doctor._id || "";
      if (g("act-speciality")) g("act-speciality").value = doctor.speciality || "";
      if (g("act-phone"))      g("act-phone").value      = doctor.phone || "";
      if (g("act-address"))    g("act-address").value    = doctor.address || "";
    };

    const actClearDoctor = () => {
      state.selectedDoctorId = null;
      state.selectedDoctor   = null;
      const g = (id) => document.getElementById(id);
      ["act-doctor-id","act-speciality","act-phone","act-address"].forEach(id => { if (g(id)) g(id).value = ""; });
    };

    actDoctorInput?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      actClearDoctor();
      if (!q) { actDoctorResults.style.display = "none"; return; }
      const matches = state.doctors.filter(d => d.name?.toLowerCase().includes(q));
      if (!matches.length) { actDoctorResults.style.display = "none"; return; }
      actDoctorResults.style.display = "block";
      actDoctorResults.innerHTML = matches.slice(0,6).map(d =>
        `<div data-id="${d._id}" style="padding:.6rem .85rem;font-size:.88rem;font-weight:600;cursor:pointer;border-bottom:1px solid var(--border);">${d.name}<span style="font-size:.72rem;color:var(--muted);font-weight:400;margin-left:.4rem;">${d.speciality||""}</span></div>`
      ).join("");
      actDoctorResults.querySelectorAll("[data-id]").forEach(el => {
        el.addEventListener("click", () => {
          const doc = state.doctors.find(d => d._id === el.dataset.id);
          if (doc) { actFillDoctor(doc); actDoctorInput.value = doc.name; }
          actDoctorResults.style.display = "none";
        });
      });
    });

    document.getElementById("form-activity")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("act-submit-btn");
      const gpsStatus = document.getElementById("act-gps-status");
      btn.disabled = true; btn.textContent = "Saving...";
      const body = Object.fromEntries(new FormData(e.target).entries());

      // Remove empty hidden doctorId to avoid sending blank string
      if (!body.doctorId) delete body.doctorId;

      // Capture GPS at moment of submit
      if (isNative() && gpsStatus) gpsStatus.style.display = "";
      try {
        const pos = await cap("Geolocation")?.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 });
        if (pos?.coords) {
          body.visitLatitude  = pos.coords.latitude;
          body.visitLongitude = pos.coords.longitude;
          body.visitAccuracy  = pos.coords.accuracy;
        }
      } catch {}
      if (gpsStatus) gpsStatus.style.display = "none";

      try {
        await api("/employee/activities", { method: "POST", body });
        e.target.reset();
        actDoctorResults.style.display = "none";
        actClearDoctor();
        closeSheet("sheet-activity");
        await loadActivities(); renderHomeHeader();
        toast("Visit logged with location!");
      } catch (err) { toast(err.message || "Failed to save.", true); }
      finally { btn.disabled = false; btn.textContent = "Save Visit"; }
    });

    // Sheet close buttons & backdrops
    [
      ["sheet-expense",   "sheet-expense-close",   "sheet-expense-bd"],
      ["sheet-doctor",    "sheet-doctor-close",    "sheet-doctor-bd"],
      ["sheet-activity",  "sheet-activity-close",  "sheet-activity-bd"],
      ["sheet-notifs",    "sheet-notifs-close",    "sheet-notifs-bd"],
      ["sheet-exp-detail",null,                    "sheet-exp-detail-bd"],
      ["sheet-profile",   null,                    "sheet-profile-bd"],
    ].forEach(([sheet, closeBtn, backdrop]) => {
      if (closeBtn) document.getElementById(closeBtn)?.addEventListener("click", () => closeSheet(sheet));
      document.getElementById(backdrop)?.addEventListener("click", () => closeSheet(sheet));
    });

    // Profile photo
    bindProfilePhoto();

    // Pull to refresh
    bindPullToRefresh();

    // Native status bar
    if (isNative()) {
      try {
        cap("StatusBar")?.setOverlaysWebView({ overlay: false });
        cap("StatusBar")?.setStyle({ style: "DARK" });
        cap("StatusBar")?.setBackgroundColor({ color: "#0a0f1e" });
      } catch {}
    }

    // Exit dialog wiring
    const exitDialog  = document.getElementById("exit-dialog");
    const showExitDlg = () => exitDialog?.classList.remove("hidden");
    const hideExitDlg = () => exitDialog?.classList.add("hidden");
    document.getElementById("exit-cancel")?.addEventListener("click", hideExitDlg);
    document.getElementById("exit-confirm")?.addEventListener("click", () => {
      hideExitDlg();
      cap("App")?.exitApp?.();
    });

    // Android back button — step back through UI layers
    cap("App")?.addListener?.("backButton", () => {
      // 1. Exit dialog visible → dismiss it
      if (exitDialog && !exitDialog.classList.contains("hidden")) {
        hideExitDlg(); return;
      }
      // 2. Product preview open → close it
      const preview = document.getElementById("product-preview");
      if (preview && !preview.classList.contains("hidden")) {
        closeProductPreview(); return;
      }
      // 3. Calendar sheet open → close it
      const cal = document.getElementById("sheet-calendar");
      if (cal && !cal.classList.contains("hidden")) {
        closeCalendar(); return;
      }
      // 4. Any bottom sheet open → close it
      const openSheet = document.querySelector(".bottom-sheet:not(.hidden)");
      if (openSheet) {
        openSheet.classList.add("hidden"); return;
      }
      // 5. Not on home tab → go home
      if (state.tab !== "home") {
        setTab("home"); return;
      }
      // 6. On home → styled exit dialog
      showExitDlg();
    });
  };

  // ── Init ───────────────────────────────────────────────
  const init = async () => {
    loader.snap(0, "Starting up");
    loader.creep(18, 0.045);
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
      setTimeout(() => { loader.hide(); showScreen("login"); }, 500);
    }
  };

  document.addEventListener("DOMContentLoaded", init);
})();
