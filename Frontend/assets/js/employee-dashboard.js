(() => {
  const tokenKey = "soul-employee-token";
  const apiBase = window.SoulApiBase || "https://soul-pharma-v2.onrender.com/api";
  const token = localStorage.getItem(tokenKey);

  if (!token) {
    window.location.href = "Auth.html";
    return;
  }

  const headers = () => ({ Authorization: `Bearer ${token}` });

  const feedback = document.querySelector("[data-emp-feedback]");
  const greeting = document.querySelector("[data-emp-greeting]");
  const statusPill = document.querySelector("[data-employee-status]");
  const rolePill = document.querySelector("[data-employee-role]");

  const trackingStatus = document.querySelector("[data-tracking-status]");
  const trackingGps = document.querySelector("[data-tracking-gps]");
  const trackingNotifications = document.querySelector("[data-tracking-notifications]");
  const trackingBattery = document.querySelector("[data-tracking-battery]");
  const trackingLast = document.querySelector("[data-tracking-last]");
  const notificationList = document.querySelector("[data-employee-notification-list]");
  const notificationCountNodes = [...document.querySelectorAll("[data-emp-notification-count]")];
  const notificationButton = document.querySelector("[data-emp-notification-button]");

  const nameEl = document.querySelector("[data-employee-name]");
  const emailEl = document.querySelector("[data-employee-email]");
  const idEl = document.querySelector("[data-employee-id]");
  const territoryEl = document.querySelector("[data-employee-territory]");
  const recentActivityEl = document.querySelector("[data-recent-activity]");

  const statDoctors = document.querySelector("[data-stat-doctors]");
  const statVisits = document.querySelector("[data-stat-visits]");
  const statFollowups = document.querySelector("[data-stat-followups]");

  const navButtons = [...document.querySelectorAll("[data-emp-nav]")];
  const sections = [...document.querySelectorAll("[data-emp-section]")];
  const menuToggle = document.querySelector("[data-emp-menu-toggle]");
  const mobileMenu = document.querySelector("[data-emp-mobile-menu]");
  const homeButton = document.querySelector("[data-emp-home]");

  const doctorsList = document.querySelector("[data-doctors-list]");
  const doctorSearch = document.querySelector("[data-doctor-search]");
  const doctorForm = document.querySelector("[data-doctor-form]");

  const activityList = document.querySelector("[data-activity-list]");
  const activityForm = document.querySelector("[data-activity-form]");
  const activitySearch = document.querySelector("[data-activity-doctor-search]");
  const activityResults = document.querySelector("[data-activity-doctor-results]");
  const activityTime = document.querySelector("[data-activity-time]");
  const activityFile = document.querySelector("[data-activity-file]");
  const uploadStatus = document.querySelector("[data-upload-status]");
  const uploadProgress = document.querySelector("[data-upload-progress]");
  const uploadBar = document.querySelector("[data-upload-bar]");
  const uploadText = document.querySelector("[data-upload-text]");
  const uploadPreview = document.querySelector("[data-upload-preview]");

  const calSvg = document.querySelector("[data-calendar]");
  const calendarShell = calSvg ? calSvg.closest(".calendar-shell") : null;
  const calLabel = document.querySelector("[data-cal-label]");
  const calPrev = document.querySelector("[data-cal-prev]");
  const calNext = document.querySelector("[data-cal-next]");
  const popup = document.querySelector("[data-calendar-popup]");
  const popupDate = document.querySelector("[data-popup-date]");
  const popupList = document.querySelector("[data-popup-list]");
  const popupClose = document.querySelector("[data-popup-close]");

  const expenseGrid = document.querySelector("[data-expense-grid]");
  const expenseDayList = document.querySelector("[data-expense-day-list]");
  const expenseForm = document.querySelector("[data-expense-form]");
  const expenseDateInput = document.querySelector("[data-expense-date]");
  const expenseMonthLabel = document.querySelector("[data-expense-month-label]");
  const expenseTotalLabel = document.querySelector("[data-expense-total-label]");
  const expenseSelectedLabel = document.querySelector("[data-expense-selected-label]");
  const expenseSelectedDate = document.querySelector("[data-expense-selected-date]");
  const expenseSelectedTotal = document.querySelector("[data-expense-selected-total]");
  const expenseMonthPrev = document.querySelector("[data-expense-month-prev]");
  const expenseMonthNext = document.querySelector("[data-expense-month-next]");
  const expensePopup = document.querySelector("[data-expense-popup]");
  const expensePopupClose = document.querySelector("[data-expense-popup-close]");
  const expensePopupList = document.querySelector("[data-expense-popup-list]");
  const expensePopupLabel = document.querySelector("[data-expense-popup-label]");
  const expensePopupForm = document.querySelector("[data-expense-popup-form]");
  const expensePopupDateInput = document.querySelector("[data-expense-popup-date]");

  const logoutBtns = [...document.querySelectorAll("[data-employee-logout]")];

  let doctorsCache = [];
  let activitiesCache = [];
  let calendarCache = {};
  let editingDoctorId = null;
  let selectedMonth = new Date();
  let activityDoctorCache = [];
  let watchId = null;
  let lastSentAt = 0;
  let deviceInfo = null;
  let batteryInfo = null;
  let locationQueue = [];
  let socket = null;
  let expenseCache = [];
  let expenseByDate = {};
  let selectedExpenseDate = "";
  let expenseMonthDate = null;

  const setFeedback = (message, isError = false) => {
    if (!feedback) return;
    feedback.textContent = message || "";
    feedback.classList.toggle("text-rose-500", isError);
    feedback.classList.toggle("hidden", !message);
  };

  const setSection = (id) => {
    sections.forEach((section) => {
      section.classList.toggle("hidden", section.dataset.empSection !== id);
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.empNav === id);
    });
    if (id === "calendar") {
      window.setTimeout(() => {
        loadCalendar();
      }, 60);
    }
    if (id === "expenses") {
      loadExpenses().catch(() => {});
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const toLocalDateKey = (dateValue) => {
    const date = new Date(dateValue);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };
  if (!selectedExpenseDate) {
    selectedExpenseDate = toLocalDateKey(new Date());
  }

  const setNow = () => {
    if (!activityTime) return;
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    activityTime.value = local;
  };

  const toIsoFromLocalInput = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toISOString();
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, {
      headers: { "Content-Type": "application/json", ...headers(), ...(options.headers || {}) },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  const socketBase = apiBase.replace(/\/api\/?$/, "");

  const setTrackingText = (el, value) => {
    if (!el) return;
    el.textContent = value;
  };

  const updateTrackingStatus = (text) => {
    if (trackingStatus) trackingStatus.textContent = text;
  };

  const getDeviceInfo = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: { width: window.screen?.width || 0, height: window.screen?.height || 0 },
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
  });

  const getNetworkInfo = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return { online: navigator.onLine };
    return {
      online: navigator.onLine,
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      downlink: connection.downlink,
    };
  };

  const loadBatteryInfo = async () => {
    if (!navigator.getBattery) {
      setTrackingText(trackingBattery, "Not supported");
      return;
    }
    const battery = await navigator.getBattery();
    const update = () => {
      batteryInfo = { level: battery.level, charging: battery.charging };
      const pct = Math.round(battery.level * 100);
      setTrackingText(trackingBattery, `${pct}% ${battery.charging ? "charging" : "on battery"}`);
    };
    update();
    battery.addEventListener("levelchange", update);
    battery.addEventListener("chargingchange", update);
  };

  const saveQueue = () => {
    try {
      localStorage.setItem("soul-location-queue", JSON.stringify(locationQueue.slice(-50)));
    } catch (_e) {
      // ignore storage errors
    }
  };

  const loadQueue = () => {
    try {
      const raw = localStorage.getItem("soul-location-queue");
      locationQueue = raw ? JSON.parse(raw) : [];
    } catch (_e) {
      locationQueue = [];
    }
  };

  const sendLocation = async (payload) => {
    try {
      await request("/employee/locations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTrackingText(trackingLast, new Date().toLocaleTimeString("en-IN"));
      updateTrackingStatus("Live");
      return true;
    } catch (_error) {
      return false;
    }
  };

  const flushQueue = async () => {
    if (!locationQueue.length) return;
    const copy = [...locationQueue];
    locationQueue = [];
    for (const item of copy) {
      const ok = await sendLocation(item);
      if (!ok) {
        locationQueue.unshift(item);
        break;
      }
    }
    saveQueue();
  };

  const handlePosition = async (pos) => {
    const now = Date.now();
    if (now - lastSentAt < 180000) return;
    lastSentAt = now;
    setTrackingText(trackingGps, "Active");
    const payload = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      capturedAt: pos.timestamp ? new Date(pos.timestamp).toISOString() : new Date().toISOString(),
      device: deviceInfo,
      battery: batteryInfo,
      network: getNetworkInfo(),
      source: "watchPosition",
    };
    if (!navigator.onLine) {
      locationQueue.push(payload);
      saveQueue();
      updateTrackingStatus("Offline - queued");
      return;
    }
    const ok = await sendLocation(payload);
    if (!ok) {
      locationQueue.push(payload);
      saveQueue();
      updateTrackingStatus("Delayed");
    }
  };

  const handlePositionError = () => {
    setTrackingText(trackingGps, "Denied");
    updateTrackingStatus("GPS blocked");
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setTrackingText(trackingGps, "Not supported");
      updateTrackingStatus("Unavailable");
      return;
    }
    if (watchId) return;
    setTrackingText(trackingGps, "Requesting...");
    watchId = navigator.geolocation.watchPosition(handlePosition, handlePositionError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    });
  };

  const requestPermissions = async () => {
    deviceInfo = getDeviceInfo();
    setTrackingText(trackingGps, "Pending");
    setTrackingText(trackingNotifications, "Pending");
    setTrackingText(trackingBattery, "Loading...");
    updateTrackingStatus("Preparing");

    await loadBatteryInfo();

    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setTrackingText(trackingNotifications, permission);
    } else {
      setTrackingText(trackingNotifications, "Not supported");
    }

    startTracking();
  };

  const initSocket = () => {
    if (!window.io || window.SoulSocketEnabled === false) return;
    if (socket) socket.disconnect();
    socket = window.io(socketBase, { auth: { token } });
    socket.on("notification:new", (payload) => {
      renderNotification(payload, true);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(payload.title || "Soul Pharma", { body: payload.message || "" });
      }
    });
  };

  const renderNotification = (item, prepend = false) => {
    if (!notificationList) return;
    const emptyState = notificationList.querySelector("[data-empty-notifications]");
    if (emptyState) emptyState.remove();
    const entry = document.createElement("div");
    entry.className = "rounded-xl border border-white/30 p-4";
    entry.setAttribute("data-notification-item", "true");
    entry.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-lg font-semibold">${item.title || "Notification"}</p>
          <p class="muted text-xs">${new Date(item.createdAt || Date.now()).toLocaleString("en-IN")}</p>
          <p class="muted text-sm mt-2">${item.message || ""}</p>
        </div>
        <span class="focus-pill">${item.priority || "info"}</span>
      </div>
    `;
    if (prepend) {
      notificationList.prepend(entry);
    } else {
      notificationList.appendChild(entry);
    }
    const count = notificationList.querySelectorAll("[data-notification-item]").length;
    notificationCountNodes.forEach((node) => {
      node.textContent = String(count);
    });
  };

  const loadNotifications = async () => {
    try {
      const data = await request("/employee/notifications", { method: "GET" });
      if (notificationList) notificationList.innerHTML = "";
      const items = data.notifications || [];
      if (notificationList) {
        notificationList.innerHTML = "";
      }
      if (!items.length && notificationList) {
        notificationList.innerHTML = "<p class=\"muted text-sm\" data-empty-notifications>No notifications yet.</p>";
      } else {
        items.forEach((item) => renderNotification(item, false));
      }
      notificationCountNodes.forEach((node) => node.textContent = String(items.length));
    } catch (_error) {
      // ignore
    }
  };

  const renderDoctors = (items) => {
    if (!doctorsList) return;
    if (!items.length) {
      doctorsList.innerHTML = "<p class=\"muted text-sm\">No doctors found yet.</p>";
      return;
    }
    const isCompact = window.matchMedia("(max-width: 767px)").matches;
    if (isCompact) {
      doctorsList.innerHTML = items
        .map(
          (doc, index) => `
          <article class="doctor-card">
            <div class="doctor-card__head">
              <div>
                <p class="doctor-serial">#${index + 1}</p>
                <h3>${doc.name}</h3>
                <p class="muted text-sm">${doc.speciality || "General"} • ${doc.phone || "-"}</p>
              </div>
              <div class="doctor-actions">
                <span class="focus-pill">Managed by Admin</span>
              </div>
            </div>
            <div class="doctor-meta">
              <p><span>Clinic:</span> ${doc.clinicName || "-"}</p>
              <p><span>City:</span> ${doc.city || "-"}</p>
              <p><span>Notes:</span> ${doc.notes || "-"}</p>
            </div>
          </article>
        `
        )
        .join("");
      return;
    }
    doctorsList.innerHTML = `
      <div class="rounded-xl border border-white/30 overflow-hidden" style="overflow-x:auto;">
        <table class="w-full text-sm" style="min-width: 900px;">
          <thead class="bg-amber-500/5">
            <tr>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">#</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Doctor</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Speciality</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Phone</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Clinic</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">City</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (doc, index) => `
              <tr class="border-t border-white/30">
                <td class="p-3 font-semibold text-amber-600">#${index + 1}</td>
                <td class="p-3 font-semibold">${doc.name}</td>
                <td class="p-3">${doc.speciality || "General"}</td>
                <td class="p-3">${doc.phone || "-"}</td>
                <td class="p-3">${doc.clinicName || "-"}</td>
                <td class="p-3">${doc.city || "-"}</td>
                <td class="p-3">${doc.notes || "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };
  const renderRecentActivity = (items) => {
    if (!recentActivityEl) return;
    if (!items.length) {
      recentActivityEl.innerHTML = "<p class=\"muted text-sm\">No visits logged yet.</p>";
      return;
    }
    recentActivityEl.innerHTML = items
      .slice(0, 5)
      .map(
        (item) => `
        <div class="activity-card">
          <div>
            <p class="activity-title">${item.doctorSnapshot?.name || "Doctor"}</p>
            <p class="muted text-xs">${formatDateTime(item.visitedAt)}</p>
          </div>
          <span class="focus-pill">${item.followUpDate ? "Follow-up set" : "No follow-up"}</span>
        </div>
      `
      )
      .join("");
  };

  const renderActivities = (items) => {
    if (!activityList) return;
    if (!items.length) {
      activityList.innerHTML = "<p class=\"muted text-sm\">No activity logs yet.</p>";
      return;
    }
    const isCompact = window.matchMedia("(max-width: 767px)").matches;
    if (isCompact) {
      activityList.innerHTML = items
        .map(
          (item) => `
        <article class="activity-card-lg">
          <div class="activity-card__head">
            <div>
              <h3>${item.doctorSnapshot?.name || "Doctor"}</h3>
              <p class="muted text-sm">${formatDateTime(item.visitedAt)}</p>
            </div>
            <span class="focus-pill">Managed by Admin</span>
          </div>
          <div class="activity-card__meta">
            <p><span>Speciality:</span> ${item.doctorSnapshot?.speciality || "-"}</p>
            <p><span>Phone:</span> ${item.doctorSnapshot?.phone || "-"}</p>
            <p><span>Address:</span> ${item.doctorSnapshot?.address || "-"}</p>
            <p><span>Follow-up:</span> ${item.followUpDate ? new Date(item.followUpDate).toLocaleDateString("en-IN") : "Not set"}</p>
          </div>
          ${item.notes ? `<p class="muted text-sm">${item.notes}</p>` : ""}
          ${item.photoUrl ? `<img src="${item.photoUrl}" alt="Visit proof" class="activity-photo">` : ""}
        </article>
      `
        )
        .join("");
      return;
    }
    activityList.innerHTML = `
      <div class="rounded-xl border border-white/30 overflow-hidden" style="overflow-x:auto;">
        <table class="w-full text-sm" style="min-width: 1000px;">
          <thead class="bg-amber-500/5">
            <tr>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Doctor</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Visit Time</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Speciality</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Phone</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Address</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Follow-up</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr class="border-t border-white/30">
                <td class="p-3 font-semibold">${item.doctorSnapshot?.name || "Doctor"}</td>
                <td class="p-3">${formatDateTime(item.visitedAt)}</td>
                <td class="p-3">${item.doctorSnapshot?.speciality || "-"}</td>
                <td class="p-3">${item.doctorSnapshot?.phone || "-"}</td>
                <td class="p-3">${item.doctorSnapshot?.address || "-"}</td>
                <td class="p-3">${item.followUpDate ? new Date(item.followUpDate).toLocaleDateString("en-IN") : "Not set"}</td>
                <td class="p-3">${item.notes || "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const loadProfile = async () => {
    const data = await request("/employee/me", { method: "GET", headers: headers() });
    const employee = data.employee || {};
    if (greeting) greeting.textContent = `${getGreeting()}, ${employee.name || "Employee"}`;
    if (nameEl) nameEl.textContent = employee.name || "—";
    if (emailEl) emailEl.textContent = employee.email || "—";
    if (idEl) idEl.textContent = employee.employeeId || "—";
    if (territoryEl) territoryEl.textContent = employee.territoryName || "Unassigned";
    if (statusPill) statusPill.textContent = employee.status || "active";
    if (rolePill) rolePill.textContent = employee.designation || "Employee";
  };

  const loadDoctors = async (query = "") => {
    const data = await request(`/employee/doctors?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: headers(),
    });
    doctorsCache = (data.doctors || []).slice().sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    renderDoctors(doctorsCache);
    if (statDoctors) statDoctors.textContent = String(doctorsCache.length);
  };

  const loadActivities = async () => {
    const data = await request("/employee/activities?limit=50", { method: "GET", headers: headers() });
    activitiesCache = data.activities || [];
    renderActivities(activitiesCache);
    renderRecentActivity(activitiesCache);
    const followups = activitiesCache.filter(
      (item) => item.followUpDate && new Date(item.followUpDate) >= new Date()
    );
    if (statFollowups) statFollowups.textContent = String(followups.length);
  };

  const loadCalendar = async () => {
    if (!calSvg) return;
    const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`;
    const data = await request(`/employee/activities/calendar?month=${monthKey}`, {
      method: "GET",
      headers: headers(),
    });
    calendarCache = {};
    (data.days || []).forEach((day) => {
      calendarCache[day.date] = day;
    });
    renderCalendar();
    requestAnimationFrame(renderCalendar);
  };

  const getMonthRange = (dateInMonth) => {
    const start = new Date(dateInMonth.getFullYear(), dateInMonth.getMonth(), 1);
    const end = new Date(dateInMonth.getFullYear(), dateInMonth.getMonth() + 1, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getMonthDays = (dateInMonth) => {
    const days = [];
    const year = dateInMonth.getFullYear();
    const month = dateInMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= totalDays; d += 1) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const setSelectedExpenseDate = (dateKey) => {
    selectedExpenseDate = dateKey;
    renderExpenseDays();
    renderExpenseDayList();
  };

  const buildExpenseMap = (items) => {
    const map = {};
    items.forEach((item) => {
      const dateKey = toLocalDateKey(item.expenseDate || item.date || item.createdAt);
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(item);
    });
    return map;
  };

  const renderExpenseDays = () => {
    if (!expenseGrid) return;
    if (!expenseMonthDate) {
      const now = new Date();
      expenseMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
    const days = getMonthDays(expenseMonthDate);
    const total = Object.values(expenseByDate).flat().reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    if (expenseTotalLabel) expenseTotalLabel.textContent = `Total: ${formatCurrency(total)}`;
    if (expenseMonthLabel) {
      expenseMonthLabel.textContent = expenseMonthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }

    const cards = days
      .map((day) => {
        const dateKey = toLocalDateKey(day);
        const entries = expenseByDate[dateKey] || [];
        const dayTotal = entries.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const isActive = dateKey === selectedExpenseDate;
        const hasPending = entries.some((item) => (item.status || "pending") === "pending");
        const hasApproved = entries.some((item) => (item.status || "pending") === "approved");
        const statusLabel = hasPending && hasApproved ? "mixed" : hasPending ? "pending" : hasApproved ? "approved" : "";
        const statusText = statusLabel ? statusLabel : "";
        return `
          <button type="button" class="expense-day ${isActive ? "is-active" : ""}" data-expense-day="${dateKey}">
            <div class="day-meta">${day.toLocaleDateString("en-IN", { weekday: "short" })}</div>
            <div class="day-label">${day.toLocaleDateString("en-IN", { day: "2-digit" })}</div>
            <div class="day-total">${formatCurrency(dayTotal)}</div>
            <div class="day-count">${entries.length} ${entries.length === 1 ? "entry" : "entries"}</div>
            ${statusLabel ? `<span class="expense-status is-${statusLabel}">${statusText}</span>` : ""}
          </button>
        `;
      })
      .join("");
    expenseGrid.innerHTML = cards;
  };

  const updateExpenseMonthNav = () => {
    if (!expenseMonthNext) return;
    if (!expenseMonthDate) return;
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const activeMonthKey = `${expenseMonthDate.getFullYear()}-${String(expenseMonthDate.getMonth() + 1).padStart(2, "0")}`;
    const isCurrent = currentMonthKey === activeMonthKey;
    expenseMonthNext.disabled = isCurrent;
    expenseMonthNext.classList.toggle("opacity-50", isCurrent);
    expenseMonthNext.classList.toggle("cursor-not-allowed", isCurrent);
  };

  const renderExpenseDayList = () => {
    if (!expenseDayList && !expensePopupList) return;
    const entries = (expenseByDate[selectedExpenseDate] || []).slice().sort((a, b) => {
      return new Date(b.expenseDate || b.date || b.createdAt) - new Date(a.expenseDate || a.date || a.createdAt);
    });
    const total = entries.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    if (expenseSelectedDate) {
      expenseSelectedDate.textContent = new Date(`${selectedExpenseDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (expenseSelectedTotal) expenseSelectedTotal.textContent = formatCurrency(total);
    if (expenseSelectedLabel) expenseSelectedLabel.textContent = "Selected Day";

    const listHtml = !entries.length
      ? "<p class=\"muted text-sm\">No expenses logged for this day.</p>"
      : entries
          .map((item) => {
            const distance = Number(item.distance) || 0;
            const area = item.workingArea || "Working area";
            const time = item.expenseDate
              ? new Date(item.expenseDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
              : "";
            return `
              <div class="activity-card">
                <div>
                  <p class="activity-title">${formatCurrency(item.amount)}</p>
                  <p class="muted text-xs">${area}${time ? ` â€¢ ${time}` : ""}</p>
                  ${item.remarks ? `<p class="muted text-sm mt-1">${item.remarks}</p>` : ""}
                </div>
                <span class="focus-pill">${distance ? `${distance} km` : "Expense"}</span>
              </div>
            `;
          })
          .join("");
    if (expenseDayList) expenseDayList.innerHTML = listHtml;
    if (expensePopupList) expensePopupList.innerHTML = listHtml;
  };

  const loadExpenses = async () => {
    if (!expenseMonthDate) {
      const now = new Date();
      expenseMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
    const range = getMonthRange(expenseMonthDate);
    const params = new URLSearchParams({
      from: toLocalDateKey(range.start),
      to: toLocalDateKey(range.end),
    });
    const data = await request(`/employee/expenses?${params.toString()}`, { method: "GET", headers: headers() });
    expenseCache = data.expenses || [];
    expenseByDate = buildExpenseMap(expenseCache);
    if (!expenseByDate[selectedExpenseDate]) {
      selectedExpenseDate = toLocalDateKey(range.start);
    }
    renderExpenseDays();
    renderExpenseDayList();
    updateExpenseMonthNav();
  };

  const renderCalendar = () => {
    if (!calSvg || !window.d3) return;
    const d3 = window.d3;
    const width = calendarShell?.clientWidth || calSvg.clientWidth || 0;
    if (width < 240) {
      return;
    }
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const weeks = 6;

    if (calLabel) {
      calLabel.textContent = firstDay.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }

    const cellSize = width / 7;
    const headerHeight = cellSize * 0.75;
    const svg = d3.select(calSvg);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${headerHeight + cellSize * weeks}`);

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    svg
      .append("g")
      .attr("class", "weekday-row")
      .selectAll("text")
      .data(weekdays)
      .enter()
      .append("text")
      .attr("x", (_d, i) => i * cellSize + 12)
      .attr("y", headerHeight * 0.75)
      .attr("fill", "currentColor")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .text((d) => d);

    const days = [];
    for (let day = 1; day <= totalDays; day += 1) {
      const index = startDay + (day - 1);
      const row = Math.floor(index / 7);
      const col = index % 7;
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const meta = calendarCache[dateKey] || { count: 0, items: [] };
      days.push({ day, row, col, dateKey, count: meta.count, items: meta.items });
    }

    const maxCount = Math.max(1, ...days.map((d) => d.count));
    const scale = d3.scaleLinear().domain([0, maxCount]).range([0.1, 0.9]);

    const cell = svg
      .selectAll("g.day-cell")
      .data(days)
      .enter()
      .append("g")
      .attr("class", "day-cell")
      .attr("transform", (d) => `translate(${d.col * cellSize}, ${headerHeight + d.row * cellSize})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => openPopup(d));

    cell
      .append("rect")
      .attr("x", 6)
      .attr("y", 10)
      .attr("width", cellSize - 12)
      .attr("height", cellSize - 12)
      .attr("rx", 10)
      .attr("fill", (d) => `rgba(214, 40, 57, ${scale(d.count)})`)
      .attr("stroke", "rgba(255,255,255,0.25)");

    cell
      .append("text")
      .attr("x", 14)
      .attr("y", 34)
      .attr("fill", "currentColor")
      .attr("font-size", 12)
      .text((d) => d.day);

    cell
      .append("text")
      .attr("x", cellSize - 18)
      .attr("y", cellSize - 18)
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .attr("fill", "currentColor")
      .text((d) => (d.count ? d.count : ""));
  };

  const openPopup = (day) => {
    if (!popup || !popupList || !popupDate) return;
    popupDate.textContent = new Date(day.dateKey).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!day.items.length) {
      popupList.innerHTML = "<p class=\"muted text-sm\">No visits recorded.</p>";
    } else {
      popupList.innerHTML = day.items
        .map((item) => {
          const time = new Date(item.time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `
            <div class="activity-card">
              <div>
                <p class="activity-title">${item.doctorName}</p>
                <p class="muted text-xs">${time}</p>
              </div>
              <span class="focus-pill">Visit</span>
            </div>
          `;
        })
        .join("");
    }
    popup.classList.remove("hidden");
  };

  const closePopup = () => {
    if (popup) popup.classList.add("hidden");
  };

  const uploadImage = (file) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${apiBase}/employee/uploads`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.addEventListener("progress", (event) => {
        if (!uploadProgress || !uploadBar || !uploadText || !event.lengthComputable) return;
        const pct = Math.round((event.loaded / event.total) * 100);
        uploadProgress.classList.remove("hidden");
        uploadBar.style.width = `${pct}%`;
        uploadText.textContent = `Uploading... ${pct}%`;
      });
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText || "{}");
          resolve(data);
          return;
        }
        reject(new Error("Upload failed"));
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      const form = new FormData();
      form.append("file", file);
      xhr.send(form);
    });

  if (doctorSearch) {
    doctorSearch.addEventListener("input", () => loadDoctors(doctorSearch.value.trim()));
  }

  if (doctorForm) {
    doctorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(doctorForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        if (editingDoctorId) {
          await request(`/employee/doctors/${editingDoctorId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await request("/employee/doctors", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        editingDoctorId = null;
        doctorForm.reset();
        await loadDoctors();
        setFeedback("Doctor created.");
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (doctorsList) {
    doctorsList.addEventListener("click", (event) => {
      const editId = event.target.getAttribute("data-doctor-edit");
      const deleteId = event.target.getAttribute("data-doctor-delete");
      if (editId || deleteId) {
        setFeedback("Only admins can edit or delete doctors.", true);
      }
    });
  }

  if (activitySearch && activityResults) {
    activitySearch.addEventListener("input", async () => {
      const query = activitySearch.value.trim();
      if (!query) {
        activityResults.classList.add("hidden");
        activityResults.innerHTML = "";
        return;
      }
      const data = await request(`/employee/doctors?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: headers(),
      });
      const doctors = data.doctors || [];
      activityDoctorCache = doctors;
      if (!doctors.length) {
        activityResults.classList.add("hidden");
        return;
      }
      activityResults.innerHTML = doctors
        .map(
          (doc) => `
          <button type="button" class="dropdown-item" data-doctor-pick="${doc._id}">
            <strong>${doc.name}</strong>
            <span>${doc.speciality || "General"} • ${doc.phone || ""}</span>
          </button>
        `
        )
        .join("");
      activityResults.classList.remove("hidden");
    });

    activityResults.addEventListener("click", (event) => {
      const target = event.target.closest("[data-doctor-pick]");
      if (!target) return;
      const id = target.dataset.doctorPick;
      const doctor = activityDoctorCache.find((doc) => doc._id === id) || doctorsCache.find((doc) => doc._id === id);
      if (!doctor) return;
      activityForm.querySelector("[name=doctorId]").value = doctor._id;
      activityForm.querySelector("[name=doctorName]").value = doctor.name || "";
      activityForm.querySelector("[name=speciality]").value = doctor.speciality || "";
      activityForm.querySelector("[name=phone]").value = doctor.phone || "";
      activityForm.querySelector("[name=address]").value = doctor.address || "";
      activitySearch.value = doctor.name;
      activityResults.classList.add("hidden");
    });
  }

  if (activityFile) {
    activityFile.addEventListener("change", async () => {
      const file = activityFile.files?.[0];
      if (!file) return;
      if (uploadStatus) uploadStatus.textContent = "Uploading";
      if (uploadProgress) uploadProgress.classList.remove("hidden");
      if (uploadBar) uploadBar.style.width = "0%";
      if (uploadText) uploadText.textContent = "Uploading...";
      try {
        const data = await uploadImage(file);
        activityForm.querySelector("[name=photoUrl]").value = data.url || "";
        activityForm.querySelector("[name=photoPublicId]").value = data.publicId || "";
        if (uploadPreview) {
          uploadPreview.src = data.url;
          uploadPreview.classList.remove("hidden");
        }
        if (uploadStatus) uploadStatus.textContent = "Uploaded";
        setFeedback("Image uploaded.");
      } catch (error) {
        if (uploadStatus) uploadStatus.textContent = "Failed";
        setFeedback("Image upload failed.", true);
      } finally {
        if (uploadProgress) {
          setTimeout(() => uploadProgress.classList.add("hidden"), 1200);
        }
      }
    });
  }

  if (activityForm) {
    activityForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(activityForm);
      const payload = Object.fromEntries(formData.entries());
      if (!payload.visitedAt) {
        setNow();
        payload.visitedAt = activityTime?.value || "";
      }
      payload.visitedAt = toIsoFromLocalInput(payload.visitedAt);
      try {
        await request("/employee/activities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        activityForm.reset();
        if (uploadPreview) uploadPreview.classList.add("hidden");
        if (uploadStatus) uploadStatus.textContent = "Idle";
        setNow();
        await loadActivities();
        await loadCalendar();
        setFeedback("Visit saved.");
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (activityList) {
    activityList.addEventListener("click", (event) => {
      const deleteId = event.target.getAttribute("data-activity-delete");
      if (deleteId) {
        setFeedback("Only admins can edit or delete activities.", true);
      }
    });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.empNav;
      if (target) {
        setSection(target);
        if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.add("hidden");
          menuToggle?.setAttribute("aria-expanded", "false");
        }
      }
    });
  });

  if (homeButton) {
    homeButton.addEventListener("click", () => {
      setSection("overview");
      if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
        menuToggle?.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (notificationButton) {
    notificationButton.addEventListener("click", () => {
      setSection("notifications");
      if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
        menuToggle?.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("hidden");
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  if (calPrev) {
    calPrev.addEventListener("click", () => {
      selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
      loadCalendar();
    });
  }

  if (calNext) {
    calNext.addEventListener("click", () => {
      selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
      loadCalendar();
    });
  }

  if (popupClose) {
    popupClose.addEventListener("click", closePopup);
  }
  if (popup) {
    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        closePopup();
      }
    });
  }

  const openExpensePopup = () => {
    if (!expensePopup) return;
    if (expensePopupLabel) {
      expensePopupLabel.textContent = new Date(`${selectedExpenseDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (expensePopupDateInput) {
      expensePopupDateInput.value = selectedExpenseDate;
    }
    renderExpenseDayList();
    expensePopup.classList.remove("hidden");
  };

  const closeExpensePopup = () => {
    if (expensePopup) expensePopup.classList.add("hidden");
  };

  if (expenseGrid) {
    const handler = (event) => {
      const target = event.target.closest("[data-expense-day]");
      if (!target) return;
      const dateKey = target.dataset.expenseDay;
      if (dateKey) {
        setSelectedExpenseDate(dateKey);
        if (expenseDateInput) expenseDateInput.value = dateKey;
      }
      openExpensePopup();
    };
    expenseGrid?.addEventListener("click", handler);
  }

  if (expenseForm) {
    expenseForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(expenseForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        await request("/employee/expenses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        expenseForm.reset();
        if (expenseDateInput) {
        expenseDateInput.value = toLocalDateKey(new Date());
        }
        await loadExpenses();
        setFeedback("Expense submitted.");
      } catch (error) {
        setFeedback(error.message || "Unable to submit expense.", true);
      }
    });
  }

  if (expensePopupForm) {
    expensePopupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(expensePopupForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        await request("/employee/expenses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        expensePopupForm.reset();
        await loadExpenses();
        closeExpensePopup();
        setFeedback("Expense submitted.");
      } catch (error) {
        setFeedback(error.message || "Unable to submit expense.", true);
      }
    });
  }

  if (expensePopupClose) {
    expensePopupClose.addEventListener("click", closeExpensePopup);
  }
  if (expensePopup) {
    expensePopup.addEventListener("click", (event) => {
      if (event.target === expensePopup) {
        closeExpensePopup();
      }
    });
  }

  if (expenseMonthPrev) {
    expenseMonthPrev.addEventListener("click", () => {
      if (!expenseMonthDate) {
        const now = new Date();
        expenseMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      } else {
        expenseMonthDate = new Date(expenseMonthDate.getFullYear(), expenseMonthDate.getMonth() - 1, 1);
      }
      selectedExpenseDate = toLocalDateKey(expenseMonthDate);
      loadExpenses().catch(() => {});
    });
  }

  if (expenseMonthNext) {
    expenseMonthNext.addEventListener("click", () => {
      if (!expenseMonthDate) {
        const now = new Date();
        expenseMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const activeMonthKey = `${expenseMonthDate.getFullYear()}-${String(expenseMonthDate.getMonth() + 1).padStart(2, "0")}`;
      if (currentMonthKey === activeMonthKey) {
        updateExpenseMonthNav();
        return;
      }
      expenseMonthDate = new Date(expenseMonthDate.getFullYear(), expenseMonthDate.getMonth() + 1, 1);
      selectedExpenseDate = toLocalDateKey(expenseMonthDate);
      loadExpenses().catch(() => {});
    });
  }

  window.addEventListener("resize", () => {
    if (doctorsList && doctorsCache.length) {
      renderDoctors(doctorsCache);
    }
    if (activityList && activitiesCache.length) {
      renderActivities(activitiesCache);
    }
    if (expenseGrid && expenseCache.length) {
      renderExpenseDays();
      renderExpenseDayList();
    }
  });

  window.addEventListener("online", () => {
    updateTrackingStatus("Online");
    flushQueue();
  });

  window.addEventListener("offline", () => {
    updateTrackingStatus("Offline");
  });

  setInterval(() => {
    if (navigator.onLine) {
      flushQueue();
    }
  }, 30000);

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.removeItem(tokenKey);
      window.location.href = "Auth.html";
    });
  });

  const init = async () => {
    try {
      await loadProfile();
      await loadDoctors();
      await loadActivities();
      await loadCalendar();
      await loadExpenses();
      loadQueue();
      await loadNotifications();
      initSocket();
      requestPermissions();
      flushQueue();
      const monthVisits = Object.values(calendarCache).reduce((sum, day) => sum + (day.count || 0), 0);
      if (statVisits) statVisits.textContent = String(monthVisits);
    } catch (error) {
      localStorage.removeItem(tokenKey);
      window.location.href = "Auth.html";
    }
  };

  setNow();
  if (expenseDateInput) {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const range = getMonthRange(prev);
    expenseDateInput.value = toLocalDateKey(range.end);
  }
  setSection("overview");
  init();
})();








