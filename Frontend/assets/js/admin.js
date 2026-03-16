(() => {
  const body = document.body;
  const apiBase = window.SoulApiBase || "https://soul-pharma-v2.onrender.com/api";
  const routeKey = body.dataset.adminRoute || "";
  const tokenKey = "soul-admin-token";

  const loginSection = document.querySelector("[data-admin-login-section]");
  const loginForm = loginSection ? loginSection.querySelector("[data-admin-login]") : null;
  const logoutBtns = [...document.querySelectorAll("[data-admin-logout]")];
  const statusPill = document.querySelector("[data-admin-status]");
  const dashboard = document.querySelector("[data-admin-dashboard]");
  const feedback = document.querySelector("[data-admin-feedback]");

  const employeesList = document.querySelector("[data-employees-list]");
  const employeeForm = document.querySelector("[data-employee-form]");
  const employeeEditIndicator = document.querySelector("[data-employee-edit-indicator]");
  const employeeSubmitBtn = document.querySelector("[data-employee-submit]");
  const employeeCancelBtn = document.querySelector("[data-employee-cancel]");

  const newsList = document.querySelector("[data-news-list]");
  const newsForm = document.querySelector("[data-news-form]");

  const focusList = document.querySelector("[data-focus-list]");
  const focusForm = document.querySelector("[data-focus-form]");
  const formsList = document.querySelector("[data-forms-list]");

  const summaryEmployees = document.querySelector("[data-summary-employees]");
  const summaryNews = document.querySelector("[data-summary-news]");
  const summaryFocus = document.querySelector("[data-summary-focus]");
  const summaryForms = document.querySelector("[data-summary-forms]");
  const badgeEmployees = document.querySelectorAll("[data-badge=\"employees\"]");
  const badgeNews = document.querySelectorAll("[data-badge=\"news\"]");
  const badgeFocus = document.querySelectorAll("[data-badge=\"focus\"]");
  const badgeForms = document.querySelectorAll("[data-badge=\"forms\"]");
  const badgeDoctors = document.querySelectorAll("[data-badge=\"doctors\"]");
  const badgeActivities = document.querySelectorAll("[data-badge=\"activities\"]");
  const badgeLocations = document.querySelectorAll("[data-badge=\"locations\"]");
  const badgeNotifications = document.querySelectorAll("[data-badge=\"notifications\"]");

  const liveLocationsList = document.querySelector("[data-live-locations]");
  const locationMapEl = document.querySelector("[data-location-map]");
  const locationStatus = document.querySelector("[data-location-status]");
  const locationRefresh = document.querySelector("[data-location-refresh]");
  const locationHistoryList = document.querySelector("[data-location-history-list]");
  const locationEmployeeSelect = document.querySelector("[data-location-employee]");
  const locationFrom = document.querySelector("[data-location-from]");
  const locationTo = document.querySelector("[data-location-to]");
  const locationExportButtons = [...document.querySelectorAll("[data-location-export]")];
  const locationDeleteButton = document.querySelector("[data-location-delete]");
  const routeEmployeeSelect = document.querySelector("[data-route-employee]");
  const routeDateInput = document.querySelector("[data-route-date]");
  const routeLoadButton = document.querySelector("[data-route-load]");
  const routeExportButton = document.querySelector("[data-route-export]");
  const routeMapEl = document.querySelector("[data-route-map]");
  const routeSummary = document.querySelector("[data-route-summary]");
  const routePoints = document.querySelector("[data-route-points]");

  const notificationForm = document.querySelector("[data-admin-notification-form]");
  const notificationEmployeeSelect = document.querySelector("[data-admin-notification-employee]");
  const notificationList = document.querySelector("[data-admin-notification-list]");

  const doctorsList = document.querySelector("[data-admin-doctors-list]");
  const doctorEmployeeSelect = document.querySelector("[data-admin-doctor-employee]");
  const doctorSearch = document.querySelector("[data-admin-doctor-search]");
  const doctorExportButtons = [...document.querySelectorAll("[data-admin-doctor-export]")];
  const doctorForm = document.querySelector("[data-admin-doctor-form]");
  const doctorEditIndicator = document.querySelector("[data-admin-doctor-edit-indicator]");
  const doctorSubmitBtn = document.querySelector("[data-admin-doctor-submit]");
  const doctorCancelBtn = document.querySelector("[data-admin-doctor-cancel]");
  const doctorImportForm = document.querySelector("[data-doctor-import-form]");
  const doctorImportEmployeeSelect = document.querySelector("[data-doctor-import-employee]");
  const doctorTemplateDownload = document.querySelector("[data-doctor-template-download]");

  const activityList = document.querySelector("[data-admin-activity-list]");
  const activityEmployeeSelect = document.querySelector("[data-admin-activity-employee]");
  const activityFrom = document.querySelector("[data-admin-activity-from]");
  const activityTo = document.querySelector("[data-admin-activity-to]");
  const activityExport = document.querySelector("[data-admin-activity-export]");

  const navButtons = [...document.querySelectorAll("[data-admin-nav]")];
  const sections = [...document.querySelectorAll("[data-admin-section]")];
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  const formSearch = document.querySelector("[data-form-search]");
  const formTopic = document.querySelector("[data-form-topic]");
  const formFrom = document.querySelector("[data-form-from]");
  const formTo = document.querySelector("[data-form-to]");
  const formClear = document.querySelector("[data-form-clear]");
  const formExport = document.querySelector("[data-form-export]");

  const expensesTableBody = document.querySelector("[data-expenses-table]");
  const expensesMonthInput = document.querySelector("[data-expenses-month]");
  const expensesExportButtons = [...document.querySelectorAll("[data-expenses-export]")];
  const expensesPrintButton = document.querySelector("[data-expenses-print]");
  const expensesSummarySalary = document.querySelector("[data-expense-summary=\"salary\"]");
  const expensesSummaryExpenses = document.querySelector("[data-expense-summary=\"expenses\"]");
  const expensesSummaryTotal = document.querySelector("[data-expense-summary=\"total\"]");
  const expensesCharts = {
    salary: document.querySelector("[data-expense-chart=\"salary\"]"),
    expenses: document.querySelector("[data-expense-chart=\"expenses\"]"),
    total: document.querySelector("[data-expense-chart=\"total\"]"),
  };
  const expensesHistoryTitle = document.querySelector("[data-expense-history-title]");
  const expensesHistoryMonths = document.querySelector("[data-expense-history-months]");
  const expensesHistoryChart = document.querySelector("[data-expense-history-chart]");
  const expensesHistoryTable = document.querySelector("[data-expense-history-table]");

  const claimEmployeeSelect = document.querySelector("[data-claim-employee]");
  const claimMonthInput = document.querySelector("[data-claim-month]");
  const claimLoadButton = document.querySelector("[data-claim-load]");
  const claimTableBody = document.querySelector("[data-claim-table]");
  const claimApproveButton = document.querySelector("[data-claim-approve]");
  const claimPrintButton = document.querySelector("[data-claim-print]");
  const claimSummaryTotal = document.querySelector("[data-claim-summary=\"total\"]");
  const claimSummaryPending = document.querySelector("[data-claim-summary=\"pending\"]");
  const claimSummaryApproved = document.querySelector("[data-claim-summary=\"approved\"]");

  let editingEmployeeId = null;
  let editingNewsId = null;
  let editingFocusId = null;
  let editingDoctorId = null;
  let cachedEmployees = [];
  let cachedNews = [];
  let cachedFocus = [];
  let cachedForms = [];
  let filteredForms = [];
  let cachedDoctors = [];
  let cachedActivities = [];
  let cachedOverviewActivities = [];
  let cachedLiveLocations = [];
  let cachedLocationHistory = [];
  let cachedNotifications = [];
  let cachedExpenses = {};
  let cachedExpensesByMonth = {};
  let cachedExpenseHistory = {};
  let activeExpenseHistoryEmployee = null;
  let cachedExpensesSummary = [];
  let cachedExpenseClaims = [];
  let locationMap = null;
  let locationMarkers = new Map();
  let locationTrails = new Map();
  let routeLayer = null;
  let routeStartMarker = null;
  let routeEndMarker = null;
  let routeMap = null;
  let lastRouteSelection = null;
  const routeOverrides = new Map();
  const routeDistanceOverrides = new Map();
  const routeDistanceCache = new Map();
  let locationHistoryTimer = null;
  let socket = null;
  const expenseSaveTimers = new Map();

  const setFeedback = (message, isError = false) => {
    if (!feedback) return;
    feedback.textContent = message || "";
    feedback.classList.toggle("text-rose-500", isError);
  };

  const updateEmployeeEditUI = (isEditing, employeeName = "") => {
    if (!employeeEditIndicator || !employeeSubmitBtn || !employeeCancelBtn) return;
    
    if (isEditing) {
      employeeEditIndicator.classList.remove("hidden");
      if (employeeName) {
        document.querySelector("[data-edit-employee-name]").textContent = employeeName;
      }
      employeeSubmitBtn.textContent = "Update Employee";
      employeeCancelBtn.classList.remove("hidden");
    } else {
      employeeEditIndicator.classList.add("hidden");
      employeeSubmitBtn.textContent = "Add Employee";
      employeeCancelBtn.classList.add("hidden");
    }
  };

  const updateDoctorEditUI = () => {
    if (!doctorEditIndicator || !doctorSubmitBtn || !doctorCancelBtn) return;
    doctorEditIndicator.classList.add("hidden");
    doctorSubmitBtn.textContent = "Update Doctor";
    doctorCancelBtn.classList.add("hidden");
  };

  const formatCurrency = (value) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(safeValue);
  };

  const getActiveMonthKey = () => {
    if (expensesMonthInput) {
      if (!expensesMonthInput.value) {
        const now = new Date();
        const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        expensesMonthInput.value = key;
        return key;
      }
      return expensesMonthInput.value;
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const getMonthLabel = (monthKey) => {
    if (!monthKey) return "";
    const date = new Date(`${monthKey}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) return monthKey;
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  const ensureExpenseDefaults = (employees, monthKey) => {
    if (!cachedExpensesByMonth[monthKey]) {
      cachedExpensesByMonth[monthKey] = {};
    }
    const monthData = cachedExpensesByMonth[monthKey];
    employees.forEach((emp) => {
      if (!monthData[emp._id]) {
        monthData[emp._id] = {
          fixedSalary: Number(emp.currentSalary) || 0,
          monthlyExpenses: 0,
        };
      } else {
        monthData[emp._id].fixedSalary = Number(monthData[emp._id].fixedSalary) || 0;
        monthData[emp._id].monthlyExpenses = Number(monthData[emp._id].monthlyExpenses) || 0;
      }
    });
    cachedExpenses = monthData;
    return monthData;
  };

  const updateExpenseEntry = (employeeId, field, value) => {
    const monthKey = getActiveMonthKey();
    if (!cachedExpensesByMonth[monthKey]) {
      cachedExpensesByMonth[monthKey] = {};
    }
    if (!cachedExpensesByMonth[monthKey][employeeId]) {
      cachedExpensesByMonth[monthKey][employeeId] = { fixedSalary: 0, monthlyExpenses: 0 };
    }
    cachedExpensesByMonth[monthKey][employeeId][field] = Number(value) || 0;
    cachedExpenses = cachedExpensesByMonth[monthKey];
  };

  const getToken = () => localStorage.getItem(tokenKey);

  const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(options.headers || {})
      },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  const socketBase = apiBase.replace(/\/api\/?$/, "");

  const initSocket = () => {
    if (!window.io || !getToken() || window.SoulSocketEnabled === false) return;
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    socket = window.io(socketBase, { auth: { token: getToken() } });
    if (locationStatus) locationStatus.textContent = "Connecting...";
    socket.on("connect", () => {
      if (locationStatus) locationStatus.textContent = "Live";
    });
    socket.on("connect_error", () => {
      if (locationStatus) locationStatus.textContent = "Socket unavailable";
    });
    socket.on("disconnect", () => {
      if (locationStatus) locationStatus.textContent = "Offline";
    });
    socket.on("location:update", (payload) => {
      upsertLiveLocation(payload);
    });
    socket.on("notification:new", () => {
      loadNotifications().catch(() => {});
    });
  };

  const upsertLiveLocation = (payload) => {
    const employeeId = payload.employeeId || payload.employee?.id;
    if (!employeeId) return;
    const existingIndex = cachedLiveLocations.findIndex((item) => item.employee?.id === employeeId);
    const employee = cachedEmployees.find((emp) => emp._id === employeeId);
    const entry = {
      employee: employee
        ? {
            id: employee._id,
            name: employee.name,
            email: employee.email,
            employeeId: employee.employeeId,
            territoryName: employee.territoryName,
            designation: employee.designation,
            status: employee.status,
          }
        : {
            id: employeeId,
            name: payload.employeeName || "Employee",
          },
      location: {
        id: payload.id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy,
        capturedAt: payload.capturedAt,
        receivedAt: payload.receivedAt,
        battery: payload.battery,
      },
    };
    if (existingIndex >= 0) {
      cachedLiveLocations[existingIndex] = entry;
    } else {
      cachedLiveLocations.unshift(entry);
    }
    renderLiveLocations(cachedLiveLocations);
  };

  const renderEmployees = (employees) => {
    if (!employeesList) return;
    if (!employees.length) {
      employeesList.innerHTML = "<p class=\"muted text-sm\">No employees found.</p>";
      return;
    }
    employeesList.innerHTML = employees
      .map(
        (emp) => `
        <div class="rounded-xl border border-white/30 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold">${emp.name}</p>
              <p class="muted text-sm">${emp.email}</p>
              <p class="muted text-sm">${emp.designation || ""} \u2022 ${emp.territoryName || ""}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button data-employee-edit="${emp._id}" class="btn-secondary !px-4 !py-2">Edit</button>
              <button data-employee-toggle="${emp._id}" data-employee-status="${emp.status || "inactive"}" class="btn-secondary !px-4 !py-2">${
                emp.status === "active" ? "Deactivate" : "Activate"
              }</button>
              <button data-employee-delete="${emp._id}" class="btn-secondary !px-4 !py-2">Delete</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  };

  const renderNews = (items) => {
    if (!newsList) return;
    if (!items.length) {
      newsList.innerHTML = "<p class=\"muted text-sm\">No news items found.</p>";
      return;
    }
    newsList.innerHTML = items
      .map(
        (item) => `
        <div class="rounded-xl border border-white/30 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold">${item.title}</p>
              <p class="muted text-sm">${item.category || "Update"} ? ${new Date(item.publishedAt).toLocaleDateString("en-IN")}</p>
              <p class="muted text-sm">${item.summary}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button data-news-edit="${item._id}" class="btn-secondary !px-4 !py-2">Edit</button>
              <button data-news-delete="${item._id}" class="btn-secondary !px-4 !py-2">Delete</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  };

  const renderFocus = (items) => {
    if (!focusList) return;
    if (!items.length) {
      focusList.innerHTML = "<p class=\"muted text-sm\">No focus areas found.</p>";
      return;
    }
    focusList.innerHTML = items
      .map(
        (item) => `
        <div class="rounded-xl border border-white/30 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold">${item.title}</p>
              <p class="muted text-sm">${item.subtitle}</p>
              <p class="muted text-sm">Order: ${item.order ?? 0}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button data-focus-edit="${item._id}" class="btn-secondary !px-4 !py-2">Edit</button>
              <button data-focus-delete="${item._id}" class="btn-secondary !px-4 !py-2">Delete</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  };

  const renderForms = (items) => {
    if (!formsList) return;
    if (!items.length) {
      formsList.innerHTML = "<p class=\"muted text-sm\">No form responses yet.</p>";
      return;
    }
    formsList.innerHTML = `
      <div class="rounded-xl border border-white/30 overflow-hidden" style="overflow-x:auto;">
        <table class="w-full text-sm" style="min-width: 900px;">
          <thead class="bg-amber-500/5">
            <tr>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Name</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Email</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Phone</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Topic</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Date</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Message</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr class="border-t border-white/30">
                <td class="p-3 font-semibold">${item.name || "-"}</td>
                <td class="p-3">${item.email || "-"}</td>
                <td class="p-3">${item.phone || "-"}</td>
                <td class="p-3">${item.topic || "general"}</td>
                <td class="p-3">${item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}</td>
                <td class="p-3">${item.message || "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  const renderExpensesTable = () => {
    if (!expensesTableBody) return;
    if (!cachedEmployees.length) {
      expensesTableBody.innerHTML = "<tr><td class=\"p-4 muted\" colspan=\"7\">No employees found.</td></tr>";
      if (expensesSummarySalary) expensesSummarySalary.textContent = formatCurrency(0);
      if (expensesSummaryExpenses) expensesSummaryExpenses.textContent = formatCurrency(0);
      if (expensesSummaryTotal) expensesSummaryTotal.textContent = formatCurrency(0);
      return;
    }
    const monthKey = getActiveMonthKey();
    const monthData = ensureExpenseDefaults(cachedEmployees, monthKey);
    let totalSalary = 0;
    let totalExpenses = 0;

    const rows = cachedEmployees.map((emp, idx) => {
      const record = monthData[emp._id] || { fixedSalary: 0, monthlyExpenses: 0 };
      const fixedSalary = Number(record.fixedSalary) || 0;
      const monthlyExpenses = Number(record.monthlyExpenses) || 0;
      const rowTotal = fixedSalary + monthlyExpenses;
      totalSalary += fixedSalary;
      totalExpenses += monthlyExpenses;
      return `
        <tr class="border-t border-white/20">
          <td class="p-3 font-semibold">${idx + 1}</td>
          <td class="p-3">
            <div class="font-semibold">${emp.name || "Employee"}</div>
            <div class="muted text-xs">${emp.designation || "Team"}${emp.employeeId ? ` • ${emp.employeeId}` : ""}</div>
          </td>
          <td class="p-3">${emp.territoryName || "—"}</td>
          <td class="p-3">
            <input type="number" min="0" step="100" class="expenses-input" data-expense-input data-expense-field="fixedSalary" data-expense-employee="${emp._id}" value="${fixedSalary}">
          </td>
          <td class="p-3">
            <input type="number" min="0" step="100" class="expenses-input" data-expense-input data-expense-field="monthlyExpenses" data-expense-employee="${emp._id}" value="${monthlyExpenses}">
          </td>
          <td class="p-3 font-semibold" data-expense-row-total="${emp._id}">${formatCurrency(rowTotal)}</td>
          <td class="p-3">
            <button type="button" class="expenses-history-btn" data-expense-history="${emp._id}">History</button>
          </td>
        </tr>
      `;
    }).join("");

    const grandTotal = totalSalary + totalExpenses;
    const totalRow = `
      <tr class="border-t border-white/30 bg-rose-500/10 font-semibold">
        <td class="p-3" colspan="3">Totals</td>
        <td class="p-3" data-expense-total="salary">${formatCurrency(totalSalary)}</td>
        <td class="p-3" data-expense-total="expenses">${formatCurrency(totalExpenses)}</td>
        <td class="p-3" data-expense-total="total">${formatCurrency(grandTotal)}</td>
        <td class="p-3"></td>
      </tr>
    `;

    expensesTableBody.innerHTML = rows + totalRow;
    if (expensesSummarySalary) expensesSummarySalary.textContent = formatCurrency(totalSalary);
    if (expensesSummaryExpenses) expensesSummaryExpenses.textContent = formatCurrency(totalExpenses);
    if (expensesSummaryTotal) expensesSummaryTotal.textContent = formatCurrency(grandTotal);
  };

  const renderExpensesCharts = () => {
    if (!window.d3 || !cachedEmployees.length) return;
    const d3 = window.d3;
    if (!expensesCharts.salary && !expensesCharts.expenses && !expensesCharts.total) return;
    const monthKey = getActiveMonthKey();
    const monthData = ensureExpenseDefaults(cachedEmployees, monthKey);

    const buildEntries = (field) =>
      cachedEmployees.map((emp) => {
        const entry = monthData[emp._id] || { fixedSalary: 0, monthlyExpenses: 0 };
        const value =
          field === "total"
            ? (Number(entry.fixedSalary) || 0) + (Number(entry.monthlyExpenses) || 0)
            : Number(entry[field]) || 0;
        const label = emp.name ? emp.name.split(" ")[0] : "Emp";
        return { label: label.slice(0, 8), value };
      });

    const renderBars = (selector, entries, color) => {
      const svg = d3.select(`svg[data-expense-chart="${selector}"]`);
      if (svg.empty()) return;
      svg.selectAll("*").remove();
      const width = svg.node().clientWidth || 320;
      const height = svg.node().clientHeight || 240;
      const padding = { top: 12, right: 8, bottom: 28, left: 52 };
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      const x = d3
        .scaleBand()
        .domain(entries.map((d) => d.label))
        .range([padding.left, width - padding.right])
        .padding(0.25);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(entries, (d) => d.value) || 1])
        .nice()
        .range([height - padding.bottom, padding.top]);

      const bars = svg
        .append("g")
        .selectAll("rect")
        .data(entries)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.label))
        .attr("width", x.bandwidth())
        .attr("y", height - padding.bottom)
        .attr("height", 0)
        .attr("rx", 8)
        .attr("fill", color)
        .attr("opacity", 0.88);

      bars
        .transition()
        .duration(450)
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => height - padding.bottom - y(d.value));

      bars.append("title").text((d) => `${d.label}: ${formatCurrency(d.value)}`);

      svg
        .append("g")
        .attr("transform", `translate(0, ${height - padding.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor")
        .attr("transform", "rotate(-12)")
        .style("text-anchor", "end");

      svg
        .append("g")
        .attr("transform", `translate(${padding.left}, 0)`)
        .call(d3.axisLeft(y).ticks(4))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor");
    };

    renderBars("salary", buildEntries("fixedSalary"), "#f97316");
    renderBars("expenses", buildEntries("monthlyExpenses"), "#38bdf8");
    renderBars("total", buildEntries("total"), "#22c55e");
  };

  const renderExpenseHistory = (employeeId) => {
    if (!expensesHistoryTable || !expensesHistoryTitle || !expensesHistoryChart) return;
    if (!employeeId) {
      expensesHistoryTitle.textContent = "Pick an employee to view history";
      expensesHistoryTable.innerHTML = "<p class=\"muted text-sm\">Select an employee to view month-wise expenses.</p>";
      if (expensesHistoryChart) {
        expensesHistoryChart.innerHTML = "";
      }
      return;
    }
    const employee = cachedEmployees.find((emp) => emp._id === employeeId);
    const history = cachedExpenseHistory[employeeId] || [];
    expensesHistoryTitle.textContent = employee?.name || "Employee";
    if (expensesHistoryMonths) {
      expensesHistoryMonths.textContent = `Last ${Math.max(history.length, 1)} months`;
    }
    if (!history.length) {
      expensesHistoryTable.innerHTML = "<p class=\"muted text-sm\">No history available for this employee.</p>";
      if (expensesHistoryChart) {
        expensesHistoryChart.innerHTML = "";
      }
      return;
    }

    const rows = history
      .map((item) => {
        const fixedSalary = Number(item.fixedSalary) || 0;
        const monthlyExpenses = Number(item.monthlyExpenses) || 0;
        const total = fixedSalary + monthlyExpenses;
        return `
          <tr>
            <td>${getMonthLabel(item.month)}</td>
            <td>${formatCurrency(fixedSalary)}</td>
            <td>${formatCurrency(monthlyExpenses)}</td>
            <td>${formatCurrency(total)}</td>
          </tr>
        `;
      })
      .join("");

    expensesHistoryTable.innerHTML = `
      <div class="expenses-history-table">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Salary</th>
              <th>Expenses</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    if (window.d3) {
      const d3 = window.d3;
      const svg = d3.select(expensesHistoryChart);
      svg.selectAll("*").remove();
      const width = svg.node().clientWidth || 320;
      const height = svg.node().clientHeight || 240;
      const padding = { top: 12, right: 12, bottom: 30, left: 56 };
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      const chartData = [...history]
        .slice()
        .reverse()
        .map((item) => ({
          label: new Date(`${item.month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short" }),
          value: (Number(item.fixedSalary) || 0) + (Number(item.monthlyExpenses) || 0),
        }));

      const x = d3
        .scalePoint()
        .domain(chartData.map((d) => d.label))
        .range([padding.left, width - padding.right]);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(chartData, (d) => d.value) || 1])
        .nice()
        .range([height - padding.bottom, padding.top]);

      const line = d3
        .line()
        .x((d) => x(d.label))
        .y((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      svg
        .append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", "#d62839")
        .attr("stroke-width", 2.5)
        .attr("d", line);

      svg
        .append("g")
        .selectAll("circle")
        .data(chartData)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.label))
        .attr("cy", (d) => y(d.value))
        .attr("r", 3.5)
        .attr("fill", "#d62839");

      svg
        .append("g")
        .attr("transform", `translate(0, ${height - padding.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor");

      svg
        .append("g")
        .attr("transform", `translate(${padding.left}, 0)`)
        .call(d3.axisLeft(y).ticks(4))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor");
    }
  };

  const loadExpenseHistory = async (employeeId) => {
    if (!employeeId) return;
    const data = await request(`/admin/expenses/history/${employeeId}?limit=6`);
    cachedExpenseHistory[employeeId] = data.history || [];
    activeExpenseHistoryEmployee = employeeId;
    renderExpenseHistory(employeeId);
  };

  const renderExpensesSection = () => {
    renderExpensesTable();
    renderExpensesCharts();
  };

  const updateExpenseSummaries = () => {
    if (!cachedEmployees.length) return;
    const monthKey = getActiveMonthKey();
    const monthData = ensureExpenseDefaults(cachedEmployees, monthKey);
    let totalSalary = 0;
    let totalExpenses = 0;
    cachedEmployees.forEach((emp) => {
      const record = monthData[emp._id] || { fixedSalary: 0, monthlyExpenses: 0 };
      totalSalary += Number(record.fixedSalary) || 0;
      totalExpenses += Number(record.monthlyExpenses) || 0;
    });
    const total = totalSalary + totalExpenses;
    if (expensesSummarySalary) expensesSummarySalary.textContent = formatCurrency(totalSalary);
    if (expensesSummaryExpenses) expensesSummaryExpenses.textContent = formatCurrency(totalExpenses);
    if (expensesSummaryTotal) expensesSummaryTotal.textContent = formatCurrency(total);
    const salaryCell = expensesTableBody?.querySelector("[data-expense-total=\"salary\"]");
    const expensesCell = expensesTableBody?.querySelector("[data-expense-total=\"expenses\"]");
    const totalCell = expensesTableBody?.querySelector("[data-expense-total=\"total\"]");
    if (salaryCell) salaryCell.textContent = formatCurrency(totalSalary);
    if (expensesCell) expensesCell.textContent = formatCurrency(totalExpenses);
    if (totalCell) totalCell.textContent = formatCurrency(total);
  };

  const getClaimsMonthKey = () => {
    if (claimMonthInput) {
      if (!claimMonthInput.value) {
        const now = new Date();
        const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        claimMonthInput.value = key;
        return key;
      }
      return claimMonthInput.value;
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const renderExpenseClaims = () => {
    if (!claimTableBody) return;
    if (!cachedExpenseClaims.length) {
      claimTableBody.innerHTML = "<tr><td class=\"p-4 muted\" colspan=\"8\">No expense records found.</td></tr>";
      if (claimSummaryTotal) claimSummaryTotal.textContent = formatCurrency(0);
      if (claimSummaryPending) claimSummaryPending.textContent = formatCurrency(0);
      if (claimSummaryApproved) claimSummaryApproved.textContent = formatCurrency(0);
      return;
    }
    const rows = cachedExpenseClaims
      .map((item) => {
        const dateKey = new Date(item.expenseDate || item.date || item.createdAt).toISOString().slice(0, 10);
        const status = item.status || "pending";
        const employeeName = item.employee?.name || item.employeeName || "Employee";
        const statusClass =
          status === "approved" ? "is-approved" : status === "rejected" ? "is-rejected" : "is-pending";
        return `
          <tr class="border-t border-white/30">
            <td class="p-3">
              <input type="date" class="claim-input" data-claim-field="expenseDate" value="${dateKey}">
            </td>
            <td class="p-3 font-semibold">${employeeName}</td>
            <td class="p-3">
              <input type="text" class="claim-input" data-claim-field="workingArea" value="${item.workingArea || ""}">
            </td>
            <td class="p-3">
              <input type="number" min="0" step="0.1" class="claim-input" data-claim-field="distance" value="${Number(item.distance) || 0}">
            </td>
            <td class="p-3">
              <input type="number" min="0" step="1" class="claim-input" data-claim-field="amount" value="${Number(item.amount) || 0}">
            </td>
            <td class="p-3">
              <input type="text" class="claim-input" data-claim-field="remarks" value="${item.remarks || ""}">
            </td>
            <td class="p-3">
              <span class="claim-pill ${statusClass}">${status}</span>
            </td>
            <td class="p-3">
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn-secondary !px-3 !py-1" data-claim-update="${item._id}">Update</button>
                <button type="button" class="btn-secondary !px-3 !py-1" data-claim-delete="${item._id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
    claimTableBody.innerHTML = rows;

    const totals = cachedExpenseClaims.reduce(
      (acc, item) => {
        const amount = Number(item.amount) || 0;
        acc.total += amount;
        if ((item.status || "pending") === "approved") {
          acc.approved += amount;
        } else {
          acc.pending += amount;
        }
        return acc;
      },
      { total: 0, pending: 0, approved: 0 }
    );
    if (claimSummaryTotal) claimSummaryTotal.textContent = formatCurrency(totals.total);
    if (claimSummaryPending) claimSummaryPending.textContent = formatCurrency(totals.pending);
    if (claimSummaryApproved) claimSummaryApproved.textContent = formatCurrency(totals.approved);
  };

  const loadExpenseClaims = async () => {
    const month = getClaimsMonthKey();
    const employeeId = claimEmployeeSelect?.value || "";
    const params = new URLSearchParams({ month });
    if (employeeId) params.set("employeeId", employeeId);
    const data = await request(`/admin/employee-expenses?${params.toString()}`);
    cachedExpenseClaims = data.expenses || [];
    renderExpenseClaims();
  };

  const generateExpenseClaimsPrintHtml = () => {
    const monthKey = getClaimsMonthKey();
    const monthLabel = getMonthLabel(monthKey);
    const employeeId = claimEmployeeSelect?.value || "";
    const employeeName =
      cachedEmployees.find((emp) => emp._id === employeeId)?.name || (employeeId ? "Employee" : "All Employees");
    const total = cachedExpenseClaims.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const reportDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const rows = cachedExpenseClaims
      .map((item, idx) => {
        const dateLabel = new Date(item.expenseDate || item.date || item.createdAt).toLocaleDateString("en-IN");
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${item.employee?.name || item.employeeName || "Employee"}</td>
            <td>${dateLabel}</td>
            <td>${item.workingArea || "-"}</td>
            <td>${Number(item.distance) || 0}</td>
            <td>${formatCurrency(item.amount)}</td>
            <td>${item.remarks || "-"}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Expense Claims Report</title>
        <style>
          @page { size: A4 portrait; margin: 18mm; }
          body { font-family: "Manrope", Arial, sans-serif; color: #0f172a; }
          h1 { margin: 0 0 8px; font-size: 20px; }
          .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; font-size: 12px; margin-bottom: 12px; }
          .meta p { margin: 0; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; vertical-align: top; }
          th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.12em; font-size: 9px; }
        </style>
      </head>
      <body>
        <h1>Expense Claims Report</h1>
        <div class="meta">
          <p><strong>Employee Name:</strong> ${employeeName}</p>
          <p><strong>Month:</strong> ${monthLabel}</p>
          <p><strong>Expenses:</strong> ${formatCurrency(total)}</p>
          <p><strong>Date:</strong> ${reportDate}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Date</th>
              <th>Working Area</th>
              <th>Distance (km)</th>
              <th>Amount</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="7">No records found.</td></tr>`}
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  const generateExpensesReportHtml = () => {
    const monthKey = getActiveMonthKey();
    const monthLabel = getMonthLabel(monthKey);
    const monthData = ensureExpenseDefaults(cachedEmployees, monthKey);
    const rows = cachedEmployees.map((emp, idx) => {
      const record = monthData[emp._id] || { fixedSalary: 0, monthlyExpenses: 0 };
      const fixedSalary = Number(record.fixedSalary) || 0;
      const monthlyExpenses = Number(record.monthlyExpenses) || 0;
      const total = fixedSalary + monthlyExpenses;
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${emp.name || "Employee"}</td>
          <td>${emp.territoryName || "-"}</td>
          <td>${formatCurrency(fixedSalary)}</td>
          <td>${formatCurrency(monthlyExpenses)}</td>
          <td>${formatCurrency(total)}</td>
        </tr>
      `;
    }).join("");

    const totals = cachedEmployees.reduce(
      (acc, emp) => {
        const record = monthData[emp._id] || { fixedSalary: 0, monthlyExpenses: 0 };
        acc.salary += Number(record.fixedSalary) || 0;
        acc.expenses += Number(record.monthlyExpenses) || 0;
        return acc;
      },
      { salary: 0, expenses: 0 }
    );
    const grandTotal = totals.salary + totals.expenses;
    const maxValue = Math.max(totals.salary, totals.expenses, grandTotal, 1);

    const buildBar = (value, color) => `
      <svg viewBox="0 0 100 12" preserveAspectRatio="none">
        <rect x="0" y="2" width="${(value / maxValue) * 100}" height="8" rx="4" fill="${color}"></rect>
      </svg>
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Monthly Expense Report</title>
        <style>
          body { font-family: "Manrope", Arial, sans-serif; padding: 32px; color: #0f172a; }
          h1 { margin: 0 0 6px; }
          .muted { color: #64748b; }
          .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 20px 0 24px; }
          .card { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; background: #f8fafc; }
          .card h3 { margin: 4px 0 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
          th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.12em; font-size: 10px; }
          .charts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 24px; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
          .chart-card h4 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
          svg { width: 100%; height: 12px; }
        </style>
      </head>
      <body>
        <h1>Monthly Expense Report</h1>
        <p class="muted">Month: ${monthLabel}</p>
        <div class="summary">
          <div class="card"><span class="muted">Salary Total</span><h3>${formatCurrency(totals.salary)}</h3></div>
          <div class="card"><span class="muted">Expenses Total</span><h3>${formatCurrency(totals.expenses)}</h3></div>
          <div class="card"><span class="muted">Grand Total</span><h3>${formatCurrency(grandTotal)}</h3></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Area</th>
              <th>Fixed Salary</th>
              <th>Monthly Expenses</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="charts">
          <div class="chart-card">
            <h4>Salary</h4>
            ${buildBar(totals.salary, "#f97316")}
            <p class="muted">${formatCurrency(totals.salary)}</p>
          </div>
          <div class="chart-card">
            <h4>Expenses</h4>
            ${buildBar(totals.expenses, "#38bdf8")}
            <p class="muted">${formatCurrency(totals.expenses)}</p>
          </div>
          <div class="chart-card">
            <h4>Total</h4>
            ${buildBar(grandTotal, "#22c55e")}
            <p class="muted">${formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };


  const renderDoctors = (items) => {
    if (!doctorsList) return;
    if (!items.length) {
      doctorsList.innerHTML = "<p class=\"muted text-sm\">No doctors found.</p>";
      return;
    }
    const employeeMap = Object.fromEntries(cachedEmployees.map((emp) => [emp._id, emp.name]));
    const isCompact = window.matchMedia("(max-width: 767px)").matches;
    if (isCompact) {
      doctorsList.innerHTML = items
        .map((doc) => {
          const isEditing = editingDoctorId === doc._id;
          if (isEditing) {
            return `
              <div class="rounded-xl border border-white/30 p-4">
                <div class="grid gap-3">
                  <input class="form-input !p-2" name="name" value="${doc.name || ""}">
                  <input class="form-input !p-2" name="speciality" value="${doc.speciality || ""}">
                  <input class="form-input !p-2" name="phone" value="${doc.phone || ""}">
                  <input class="form-input !p-2" name="clinicName" value="${doc.clinicName || ""}">
                  <input class="form-input !p-2" name="city" value="${doc.city || ""}">
                  <textarea class="form-textarea !p-2" name="notes" rows="2">${doc.notes || ""}</textarea>
                  <div class="flex flex-wrap gap-2">
                    <button data-doctor-save="${doc._id}" class="btn-brand !px-4 !py-2">Save</button>
                    <button data-doctor-cancel="${doc._id}" class="btn-secondary !px-4 !py-2">Cancel</button>
                  </div>
                </div>
              </div>
            `;
          }
          return `
            <div class="rounded-xl border border-white/30 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold">${doc.name}</p>
                  <p class="muted text-sm">${doc.speciality || "General"} • ${doc.phone || "-"}</p>
                  <p class="muted text-sm">Employee: ${employeeMap[doc.createdBy] || "Unknown"}</p>
                  <p class="muted text-sm">Clinic: ${doc.clinicName || "-"}</p>
                  <p class="muted text-sm">City: ${doc.city || "-"}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button data-doctor-edit="${doc._id}" class="btn-secondary !px-4 !py-2">Edit</button>
                  <button data-doctor-delete="${doc._id}" class="btn-secondary !px-4 !py-2">Delete</button>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
      return;
    }
    doctorsList.innerHTML = `
      <div class="rounded-xl border border-white/30 overflow-hidden" style="overflow-x:auto;">
        <table class="w-full text-sm" style="min-width: 900px;">
          <thead class="bg-amber-500/5">
            <tr>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Doctor</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Speciality</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Phone</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Employee</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Clinic</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">City</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((doc) => {
                const isEditing = editingDoctorId === doc._id;
                if (isEditing) {
                  return `
                    <tr class="border-t border-white/30">
                      <td class="p-3">
                        <input class="form-input !p-2" name="name" value="${doc.name || ""}">
                      </td>
                      <td class="p-3">
                        <input class="form-input !p-2" name="speciality" value="${doc.speciality || ""}">
                      </td>
                      <td class="p-3">
                        <input class="form-input !p-2" name="phone" value="${doc.phone || ""}">
                      </td>
                      <td class="p-3">${employeeMap[doc.createdBy] || "Unknown"}</td>
                      <td class="p-3">
                        <input class="form-input !p-2" name="clinicName" value="${doc.clinicName || ""}">
                      </td>
                      <td class="p-3">
                        <input class="form-input !p-2" name="city" value="${doc.city || ""}">
                      </td>
                      <td class="p-3">
                        <div class="flex flex-wrap gap-2">
                          <button data-doctor-save="${doc._id}" class="btn-brand !px-4 !py-2">Save</button>
                          <button data-doctor-cancel="${doc._id}" class="btn-secondary !px-4 !py-2">Cancel</button>
                        </div>
                      </td>
                    </tr>
                    <tr class="border-t border-white/30">
                      <td class="p-3" colspan="7">
                        <div class="grid gap-2">
                          <label class="text-xs uppercase tracking-[0.14em] muted">Notes</label>
                          <textarea class="form-textarea !p-2" name="notes" rows="2">${doc.notes || ""}</textarea>
                        </div>
                      </td>
                    </tr>
                  `;
                }
                return `
                  <tr class="border-t border-white/30">
                    <td class="p-3 font-semibold">${doc.name}</td>
                    <td class="p-3">${doc.speciality || "General"}</td>
                    <td class="p-3">${doc.phone || "-"}</td>
                    <td class="p-3">${employeeMap[doc.createdBy] || "Unknown"}</td>
                    <td class="p-3">${doc.clinicName || "-"}</td>
                    <td class="p-3">${doc.city || "-"}</td>
                    <td class="p-3">
                      <div class="flex flex-wrap gap-2">
                        <button data-doctor-edit="${doc._id}" class="btn-secondary !px-4 !py-2">Edit</button>
                        <button data-doctor-delete="${doc._id}" class="btn-secondary !px-4 !py-2">Delete</button>
                      </div>
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  const exportDoctorsCsv = () => {
    if (!cachedDoctors.length) {
      setFeedback("No doctor data to export.", true);
      return;
    }
    const rows = cachedDoctors.map((doc) => ({
      serialNumber: doc.serialNumber ?? "",
      name: doc.name || "",
      speciality: doc.speciality || "",
      phone: doc.phone || "",
      email: doc.email || "",
      clinicName: doc.clinicName || "",
      address: doc.address || "",
      city: doc.city || "",
      state: doc.state || "",
      pincode: doc.pincode || "",
      notes: doc.notes || "",
      createdBy: doc.createdBy || "",
    }));
    const header = Object.keys(rows[0] || {});
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header.map((key) => `"${String(row[key] ?? "").replace(/\"/g, "\"\"")}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "doctors-export.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const exportDoctorsTable = () => {
    if (!cachedDoctors.length) {
      setFeedback("No doctor data to export.", true);
      return;
    }
    const header = [
      "Serial",
      "Name",
      "Speciality",
      "Phone",
      "Email",
      "Clinic",
      "Address",
      "City",
      "State",
      "Pincode",
      "Notes",
      "Created By",
    ];
    const rows = cachedDoctors.map((doc) => [
      doc.serialNumber ?? "",
      doc.name || "",
      doc.speciality || "",
      doc.phone || "",
      doc.email || "",
      doc.clinicName || "",
      doc.address || "",
      doc.city || "",
      doc.state || "",
      doc.pincode || "",
      doc.notes || "",
      doc.createdBy || "",
    ]);
    const tableHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Doctors Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin-bottom: 12px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; }
          th { background: #f8fafc; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Doctors Export</h1>
        <table>
          <thead>
            <tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map((row) => `<tr>${row.map((cell) => `<td>${String(cell)}</td>`).join("")}</tr>`)
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableHtml], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "doctors-export.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const renderActivities = (items) => {
    if (!activityList) return;
    if (!items.length) {
      activityList.innerHTML = "<p class=\"muted text-sm\">No activities found.</p>";
      return;
    }
    const employeeMap = Object.fromEntries(cachedEmployees.map((emp) => [emp._id, emp.name]));
    const isCompact = window.matchMedia("(max-width: 767px)").matches;
    if (isCompact) {
      activityList.innerHTML = items
        .map(
          (item) => `
          <div class="rounded-xl border border-white/30 p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-lg font-semibold">${item.doctorSnapshot?.name || "Doctor"}</p>
                <p class="muted text-sm">${new Date(item.visitedAt).toLocaleString("en-IN")}</p>
                <p class="muted text-sm">Employee: ${employeeMap[item.employee] || "Unknown"}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button data-activity-delete="${item._id}" class="btn-secondary !px-4 !py-2">Delete</button>
              </div>
            </div>
            ${item.notes ? `<p class="muted text-sm mt-2">${item.notes}</p>` : ""}
          </div>
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
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Employee</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Follow-up</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Notes</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr class="border-t border-white/30">
                <td class="p-3 font-semibold">${item.doctorSnapshot?.name || "Doctor"}</td>
                <td class="p-3">${new Date(item.visitedAt).toLocaleString("en-IN")}</td>
                <td class="p-3">${employeeMap[item.employee] || "Unknown"}</td>
                <td class="p-3">${item.followUpDate ? new Date(item.followUpDate).toLocaleDateString("en-IN") : "-"}</td>
                <td class="p-3">${item.notes || "-"}</td>
                <td class="p-3">
                  <button data-activity-delete="${item._id}" class="btn-secondary !px-4 !py-2">Delete</button>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  const mapUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;
  const previewMaps = new Map();

  const initLocationMap = () => {
    if (!locationMapEl || !window.L || locationMap) return;
    locationMap = window.L.map(locationMapEl, { zoomControl: true }).setView([20.5937, 78.9629], 4);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(locationMap);
  };

  const initRouteMap = () => {
    if (!routeMapEl || !window.L) return;
    if (routeMap) {
      try {
        routeMap.remove();
      } catch (_e) {
        // ignore
      }
      routeMap = null;
    }
    routeMapEl.innerHTML = "";
    routeMap = window.L.map(routeMapEl, { zoomControl: true }).setView([20.5937, 78.9629], 4);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(routeMap);
  };

  const haversineKm = (a, b) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const buildRoutePoints = (items) =>
    items
      .map((item) => ({
        lat: item.latitude,
        lng: item.longitude,
        time: item.receivedAt || item.capturedAt,
      }))
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
      .sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0));

  const drawRoute = (mapInstance, points) => {
    if (!mapInstance) return 0;
    if (routeLayer) routeLayer.remove();
    if (routeStartMarker) routeStartMarker.remove();
    if (routeEndMarker) routeEndMarker.remove();
    if (!points.length) return 0;

    const latLngs = points.map((p) => [p.lat, p.lng]);
    routeLayer = window.L.polyline(latLngs, {
      color: "#0ea5e9",
      weight: 4,
      opacity: 0.85,
      dashArray: "6 6",
    }).addTo(mapInstance);
    routeStartMarker = window.L.circleMarker(latLngs[0], {
      radius: 6,
      color: "#22c55e",
      fillColor: "#22c55e",
      fillOpacity: 0.9,
    }).addTo(mapInstance);
    routeStartMarker.bindTooltip("Start", { permanent: true, direction: "top", offset: [0, -8] });
    if (latLngs.length > 1) {
      routeEndMarker = window.L.circleMarker(latLngs[latLngs.length - 1], {
        radius: 6,
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.9,
      }).addTo(mapInstance);
      routeEndMarker.bindTooltip("Last seen", { permanent: true, direction: "top", offset: [0, -8] });
      mapInstance.fitBounds(routeLayer.getBounds(), { padding: [24, 24] });
    } else {
      mapInstance.setView(latLngs[0], 15);
    }

    let distance = 0;
    for (let i = 1; i < latLngs.length; i += 1) {
      distance += haversineKm(latLngs[i - 1], latLngs[i]);
    }
    return distance;
  };

  const upsertTrailPoint = (employeeId, latitude, longitude) => {
    const trail = locationTrails.get(employeeId) || [];
    trail.push([latitude, longitude]);
    if (trail.length > 12) trail.shift();
    locationTrails.set(employeeId, trail);
  };

  const MAX_ROUTE_POINTS = 500;

  const downsamplePoints = (points) => {
    if (points.length <= MAX_ROUTE_POINTS) return points;
    const step = Math.ceil(points.length / MAX_ROUTE_POINTS);
    return points.filter((_p, idx) => idx % step === 0);
  };

  const getEmployeeRouteDistance = (employeeId, dateKey) => {
    const cacheKey = `${employeeId}:${dateKey}`;
    if (routeDistanceCache.has(cacheKey)) {
      return routeDistanceCache.get(cacheKey);
    }
    let points = cachedLocationHistory
      .filter((item) => item.employee?._id === employeeId || item.employee?.id === employeeId)
      .filter((item) => {
        if (!dateKey) return true;
        const ts = item.receivedAt || item.capturedAt;
        if (!ts) return false;
        return new Date(ts).toISOString().slice(0, 10) === dateKey;
      })
      .map((item) => [item.latitude, item.longitude, item.receivedAt || item.capturedAt])
      .filter((p) => typeof p[0] === "number" && typeof p[1] === "number")
      .sort((a, b) => new Date(a[2] || 0) - new Date(b[2] || 0))
      .map((p) => [p[0], p[1]]);
    points = downsamplePoints(points);
    if (points.length < 2) return 0;
    let distance = 0;
    for (let i = 1; i < points.length; i += 1) {
      distance += haversineKm(points[i - 1], points[i]);
    }
    routeDistanceCache.set(cacheKey, distance);
    return distance;
  };

  const renderSparkline = (employeeId) => {
    if (!window.d3) return;
    const svg = document.querySelector(`[data-location-sparkline="${employeeId}"]`);
    if (!svg) return;
    const d3 = window.d3;
    const trail = locationTrails.get(employeeId) || [];
    const width = 140;
    const height = 40;
    const padding = 6;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const s = d3.select(svg);
    s.selectAll("*").remove();
    if (trail.length < 2) {
      s.append("text")
        .attr("x", 8)
        .attr("y", 22)
        .attr("font-size", 10)
        .attr("fill", "currentColor")
        .text("No trail yet");
      return;
    }
    const lats = trail.map((p) => p[0]);
    const lngs = trail.map((p) => p[1]);
    const x = d3.scaleLinear().domain([Math.min(...lngs), Math.max(...lngs)]).range([padding, width - padding]);
    const y = d3.scaleLinear().domain([Math.min(...lats), Math.max(...lats)]).range([height - padding, padding]);
    const line = d3
      .line()
      .x((d) => x(d[1]))
      .y((d) => y(d[0]));
    s.append("path")
      .datum(trail)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2);
    const last = trail[trail.length - 1];
    s.append("circle").attr("cx", x(last[1])).attr("cy", y(last[0])).attr("r", 3).attr("fill", "#f97316");
  };

  const updateMarkers = (items) => {
    if (!locationMap) return;
    items.forEach((item) => {
      const employeeId = item.employee?.id || item.employeeId;
      if (!employeeId) return;
      const lat = item.location?.latitude ?? item.latitude;
      const lng = item.location?.longitude ?? item.longitude;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      const label = item.employee?.name || item.employeeName || "Employee";
      if (locationMarkers.has(employeeId)) {
        locationMarkers.get(employeeId).setLatLng([lat, lng]).setPopupContent(label);
      } else {
        const marker = window.L.marker([lat, lng]).addTo(locationMap).bindPopup(label);
        locationMarkers.set(employeeId, marker);
      }
      upsertTrailPoint(employeeId, lat, lng);
      renderSparkline(employeeId);
    });
  };

  const renderLiveLocations = (items) => {
    if (!liveLocationsList) return;
    if (!items.length) {
      liveLocationsList.innerHTML = "<p class=\"muted text-sm\">No live location data yet.</p>";
      return;
    }
    const now = Date.now();
    const todayKey = new Date().toISOString().slice(0, 10);
    liveLocationsList.innerHTML = items
      .map((item) => {
        const emp = item.employee || {};
        const loc = item.location || item;
        const lat = loc.latitude;
        const lng = loc.longitude;
        const batteryPct = loc.battery?.level != null ? Math.round(loc.battery.level * 100) : null;
        const batteryClass =
          batteryPct == null ? "battery-pill is-unknown" : batteryPct <= 20 ? "battery-pill is-low" : "battery-pill";
        const batteryLabel = batteryPct == null ? "Battery N/A" : `${batteryPct}%`;
        const batteryStyle = batteryPct == null ? "" : `style="--battery-level:${batteryPct}"`;
        const batteryLevelClass =
          batteryPct == null
            ? "battery-bar is-unknown"
            : batteryPct <= 20
              ? "battery-bar is-low"
              : batteryPct <= 50
                ? "battery-bar is-mid"
                : "battery-bar is-high";
        const lastSeen = loc.receivedAt || loc.capturedAt;
        const lastTs = lastSeen ? new Date(lastSeen).getTime() : 0;
        const isOnline = lastTs && now - lastTs < 3 * 60 * 1000;
        const presenceLabel = isOnline ? "Logged in" : "Logged out";
        const presenceClass = isOnline ? "presence-pill is-online" : "presence-pill is-offline";
        const empId = emp.id || item.employeeId;
        const override = routeDistanceOverrides.get(empId);
        const dateKeyForPill = routeOverrides.get(empId)
          || (lastRouteSelection && lastRouteSelection.employeeId === empId ? lastRouteSelection.dateKey : todayKey);
        const distance = empId
          ? (override ? override.distance : getEmployeeRouteDistance(empId, dateKeyForPill))
          : 0;
        const distanceTitle = override?.dateKey ? `Route date: ${override.dateKey}` : "";
        return `
          <div class="rounded-xl border border-white/30 p-4">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="text-lg font-semibold">${emp.name || item.employeeName || "Employee"}</p>
                <p class="muted text-xs">${emp.designation || "Field Ops"} • ${emp.territoryName || "Territory"}</p>
                <p class="muted text-xs">Last seen: ${formatDateTime(loc.receivedAt || loc.capturedAt)}</p>
              </div>
              <div class="live-card-actions">
                <span class="${presenceClass}">${presenceLabel}</span>
                <span class="route-pill route-pill--sync" title="${distanceTitle}">
                  Route • ${distance.toFixed(1)} km
                  ${empId ? `<button type="button" class="sync-route-btn" data-sync-route="${empId}" title="Sync route distance">&#8635;</button>` : ""}
                </span>
                <span class="${batteryClass}" ${batteryStyle}>
                  <span class="battery-shell" aria-hidden="true">
                    <span class="${batteryLevelClass}"></span>
                  </span>
                  <span>${batteryLabel}</span>
                </span>
                <a class="map-link-btn" href="${mapUrl(lat, lng)}" target="_blank" rel="noreferrer">Open map</a>
              </div>
            </div>
            <div class="mt-3 rounded-lg border border-white/10 overflow-hidden" style="height:180px;width:100%;" data-location-preview="${emp.id || item.employeeId}"></div>
            <div class="mt-3 flex items-center justify-between">
              <p class="text-xs muted">Lat: ${Number(lat).toFixed(5)} • Lng: ${Number(lng).toFixed(5)}</p>
              <svg width="140" height="40" data-location-sparkline="${emp.id || item.employeeId}"></svg>
            </div>
          </div>
        `;
      })
      .join("");
    updateMarkers(items);
    initPreviewMaps(items);
  };

  const initPreviewMaps = (items) => {
    if (!window.L) return;
    previewMaps.forEach((map) => {
      try {
        map.remove();
      } catch (_e) {
        // ignore
      }
    });
    previewMaps.clear();
    items.forEach((item) => {
      const employeeId = item.employee?.id || item.employeeId;
      if (!employeeId) return;
      const lat = item.location?.latitude ?? item.latitude;
      const lng = item.location?.longitude ?? item.longitude;
      const container = document.querySelector(`[data-location-preview="${employeeId}"]`);
      if (!container || typeof lat !== "number" || typeof lng !== "number") return;
      const map = window.L.map(container, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
      });
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);
      window.L.marker([lat, lng]).addTo(map);
      map.setView([lat, lng], 14);
      previewMaps.set(employeeId, map);
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (_e) {
          // ignore
        }
      }, 60);
    });
  };

  const renderLocationHistory = (items) => {
    if (!locationHistoryList) return;
    if (!items.length) {
      locationHistoryList.innerHTML = "<p class=\"muted text-sm\">No location history found.</p>";
      return;
    }
    const isCompact = window.matchMedia("(max-width: 767px)").matches;

    if (isCompact) {
      locationHistoryList.innerHTML = items
        .map((group) => {
          const emp = group.employee || {};
          const labelDate = group.receivedAt || group.capturedAt;
          return `
            <article class="rounded-xl border border-white/30 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold">${emp.name || "Employee"}</p>
                  <p class="muted text-xs">${emp.designation || "Field Ops"} • ${emp.territoryName || "-"}</p>
                  <p class="muted text-xs">${formatDateTime(labelDate)}</p>
                </div>
              </div>
              <div class="mt-3 grid gap-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="muted">Lat: ${Number(group.latitude).toFixed(5)} • Lng: ${Number(group.longitude).toFixed(5)}</span>
                  <a class="map-link-btn" href="${mapUrl(group.latitude, group.longitude)}" target="_blank" rel="noreferrer">Open map</a>
                </div>
              </div>
            </article>
          `;
        })
        .join("");
      return;
    }
    locationHistoryList.innerHTML = `
      <div class="rounded-xl border border-white/30 overflow-hidden" style="overflow-x:auto;">
        <table class="w-full text-sm" style="min-width: 1100px;">
          <thead class="bg-amber-500/5">
            <tr>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Time</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Latitude</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Longitude</th>
              <th class="p-3 text-left text-xs uppercase tracking-[0.14em]">Map</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((item) => {
                const emp = item.employee || {};
                return `
                  <tr class="border-t border-white/30">
                    <td class="p-3">${formatDateTime(item.receivedAt || item.capturedAt)}</td>
                    <td class="p-3">${Number(item.latitude).toFixed(5)}</td>
                    <td class="p-3">${Number(item.longitude).toFixed(5)}</td>
                    <td class="p-3"><a class="map-link-btn" href="${mapUrl(item.latitude, item.longitude)}" target="_blank" rel="noreferrer">Open map</a></td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  const exportLocationHistoryCsv = () => {
    if (!cachedLocationHistory.length) {
      setFeedback("No location data to export.", true);
      return;
    }
    const rows = cachedLocationHistory.map((item) => ({
      employee: item.employee?.name || "",
      employeeId: item.employee?.employeeId || "",
      designation: item.employee?.designation || "",
      territory: item.employee?.territoryName || "",
      latitude: item.latitude,
      longitude: item.longitude,
      time: item.receivedAt ? new Date(item.receivedAt).toISOString() : "",
      link: mapUrl(item.latitude, item.longitude),
    }));
    const header = Object.keys(rows[0] || {});
    const csv = [
      header.join(","),
      ...rows.map((row) => header.map((key) => `"${String(row[key] ?? "").replace(/\"/g, "\"\"")}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "location-history.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const exportLocationHistoryTable = () => {
    if (!cachedLocationHistory.length) {
      setFeedback("No location data to export.", true);
      return;
    }
    const header = ["Employee", "Employee ID", "Designation", "Territory", "Latitude", "Longitude", "Time", "Link"];
    const rows = cachedLocationHistory.map((item) => [
      item.employee?.name || "",
      item.employee?.employeeId || "",
      item.employee?.designation || "",
      item.employee?.territoryName || "",
      item.latitude,
      item.longitude,
      item.receivedAt ? new Date(item.receivedAt).toISOString() : "",
      mapUrl(item.latitude, item.longitude),
    ]);
    const tableHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Location History Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin-bottom: 12px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; }
          th { background: #f8fafc; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Location History Export</h1>
        <table>
          <thead>
            <tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableHtml], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "location-history.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const renderNotifications = (items) => {
    if (!notificationList) return;
    if (!items.length) {
      notificationList.innerHTML = "<p class=\"muted text-sm\">No notifications sent yet.</p>";
      return;
    }
    notificationList.innerHTML = items
      .map((item) => `
        <div class="rounded-xl border border-white/30 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold">${item.title || "Notification"}</p>
              <p class="muted text-xs">${item.employee?.name || "All Employees"} • ${formatDateTime(item.createdAt)}</p>
              <p class="muted text-sm mt-2">${item.message}</p>
            </div>
            <span class="focus-pill">${item.priority || "info"}</span>
          </div>
        </div>
      `)
      .join("");
  };

  const exportActivitiesCsv = () => {
    if (!cachedActivities.length) {
      setFeedback("No activity data to export.", true);
      return;
    }
    const rows = cachedActivities.map((item) => ({
      doctor: item.doctorSnapshot?.name || "",
      speciality: item.doctorSnapshot?.speciality || "",
      phone: item.doctorSnapshot?.phone || "",
      address: item.doctorSnapshot?.address || "",
      visitedAt: item.visitedAt ? new Date(item.visitedAt).toISOString() : "",
      followUpDate: item.followUpDate ? new Date(item.followUpDate).toISOString() : "",
      notes: item.notes || "",
      employee: item.employee || "",
    }));
    const header = Object.keys(rows[0] || {});
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header.map((key) => `"${String(row[key] ?? "").replace(/\"/g, "\"\"")}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "activity-export.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const setBadges = (nodes, value) => {
    nodes.forEach((node) => {
      node.textContent = String(value);
    });
  };

  const applyFormFilters = () => {
    const query = (formSearch?.value || "").toLowerCase();
    const topic = formTopic?.value || "";
    const from = formFrom?.value ? new Date(formFrom.value) : null;
    const to = formTo?.value ? new Date(formTo.value) : null;

    filteredForms = cachedForms.filter((item) => {
      const created = item.createdAt ? new Date(item.createdAt) : null;
      if (from && created && created < from) return false;
      if (to && created) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
      if (topic && (item.topic || "general") !== topic) return false;
      if (query) {
        const haystack = `${item.name} ${item.email} ${item.phone || ""} ${item.message || ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    renderForms(filteredForms);
  };

  const updateFormTopics = () => {
    if (!formTopic) return;
    const options = new Set(cachedForms.map((item) => item.topic || "general"));
    const current = formTopic.value;
    formTopic.innerHTML = "<option value=\"\">All Topics</option>";
    [...options].sort().forEach((topic) => {
      const opt = document.createElement("option");
      opt.value = topic;
      opt.textContent = topic;
      formTopic.appendChild(opt);
    });
    formTopic.value = current;
  };

  const exportFormsCsv = () => {
    const rows = (filteredForms.length ? filteredForms : cachedForms).map((item) => ({
      name: item.name,
      email: item.email,
      phone: item.phone || "",
      topic: item.topic || "general",
      message: item.message || "",
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : ""
    }));
    if (!rows.length) {
      setFeedback("No form responses to export.", true);
      return;
    }
    const header = ["name", "email", "phone", "topic", "message", "createdAt"];
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header
          .map((key) => `"${String(row[key] ?? "").replace(/\"/g, "\"\"")}"`)
          .join(",")
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "form-responses.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const exportExpensesCsv = () => {
    if (!cachedEmployees.length) {
      setFeedback("No employees to export.", true);
      return;
    }
    const monthKey = getActiveMonthKey();
    const monthData = ensureExpenseDefaults(cachedEmployees, monthKey);
    const rows = cachedEmployees.map((emp) => {
      const record = monthData[emp._id] || { fixedSalary: 0, monthlyExpenses: 0 };
      const fixedSalary = Number(record.fixedSalary) || 0;
      const monthlyExpenses = Number(record.monthlyExpenses) || 0;
      return {
        employee: emp.name || "",
        area: emp.territoryName || "",
        fixedSalary,
        monthlyExpenses,
        total: fixedSalary + monthlyExpenses,
        month: monthKey
      };
    });
    const header = Object.keys(rows[0] || {});
    const csv = [
      header.join(","),
      ...rows.map((row) => header.map((key) => `"${String(row[key] ?? "").replace(/\"/g, "\"\"")}"`).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-${monthKey}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const exportExpensesPdf = async () => {
    const monthKey = getActiveMonthKey();
    try {
      const response = await fetch(`${apiBase}/admin/expenses/report/pdf?month=${encodeURIComponent(monthKey)}`, {
        headers: {
          ...authHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error("Unable to export PDF.");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `expenses-report-${monthKey}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (_error) {
      setFeedback("Unable to export PDF report.", true);
    }
  };

  const printExpensesReport = () => {
    const html = generateExpensesReportHtml();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setFeedback("Pop-up blocked. Allow pop-ups to print.", true);
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderCharts = () => {
    if (!window.d3) return;
    const d3 = window.d3;

    const renderPie = (selector, entries, palette) => {
      const svg = d3.select(`svg[data-chart="${selector}"]`);
      if (svg.empty()) return;
      svg.selectAll("*").remove();
      const width = svg.node().clientWidth || 320;
      const height = svg.node().clientHeight || 240;
      const radius = Math.min(width, height) / 2 - 8;
      const g = svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const pie = d3.pie().value((d) => d.value);
      const arc = d3.arc().innerRadius(radius * 0.35).outerRadius(radius);

      const arcs = g.selectAll("path").data(pie(entries)).enter().append("path");
      arcs
        .attr("d", arc)
        .attr("fill", (d, i) => palette[i % palette.length])
        .attr("opacity", 0.9);

      const label = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 0.9);
      g.selectAll("text")
        .data(pie(entries))
        .enter()
        .append("text")
        .attr("transform", (d) => `translate(${label.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "11")
        .attr("fill", "currentColor")
        .text((d) => (d.data.value ? d.data.label : ""));
    };

    const renderBars = (selector, entries, color) => {
      const svg = d3.select(`svg[data-chart="${selector}"]`);
      if (svg.empty()) return;
      svg.selectAll("*").remove();
      const width = svg.node().clientWidth || 320;
      const height = svg.node().clientHeight || 240;
      const padding =
        selector === "expenses-monthly"
          ? { top: 12, right: 8, bottom: 40, left: 68 }
          : { top: 16, right: 12, bottom: 28, left: 36 };
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      const x = d3
        .scaleBand()
        .domain(entries.map((d) => d.label))
        .range([padding.left, width - padding.right])
        .padding(0.25);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(entries, (d) => d.value) || 1])
        .nice()
        .range([height - padding.bottom, padding.top]);

      svg
        .append("g")
        .selectAll("rect")
        .data(entries)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.label))
        .attr("y", (d) => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - padding.bottom - y(d.value))
        .attr("rx", 8)
        .attr("fill", color)
        .attr("opacity", 0.85);

      svg
        .append("g")
        .attr("transform", `translate(0, ${height - padding.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor")
        .attr("transform", "rotate(-12)")
        .style("text-anchor", "end");

      svg
        .append("g")
        .attr("transform", `translate(${padding.left}, 0)`)
        .call(d3.axisLeft(y).ticks(4))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor");
    };

    const renderLine = (selector, entries, color) => {
      const svg = d3.select(`svg[data-chart="${selector}"]`);
      if (svg.empty()) return;
      svg.selectAll("*").remove();
      const width = svg.node().clientWidth || 320;
      const height = svg.node().clientHeight || 240;
      const padding = { top: 16, right: 18, bottom: 28, left: 40 };
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      const x = d3
        .scalePoint()
        .domain(entries.map((d) => d.label))
        .range([padding.left, width - padding.right]);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(entries, (d) => d.value) || 1])
        .nice()
        .range([height - padding.bottom, padding.top]);

      const line = d3
        .line()
        .x((d) => x(d.label))
        .y((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      svg
        .append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("d", line);

      svg
        .append("g")
        .selectAll("circle")
        .data(entries)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.label))
        .attr("cy", (d) => y(d.value))
        .attr("r", 3.5)
        .attr("fill", color);

      svg
        .append("g")
        .attr("transform", `translate(0, ${height - padding.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor");

      svg
        .append("g")
        .attr("transform", `translate(${padding.left}, 0)`)
        .call(d3.axisLeft(y).ticks(4))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor");
    };

    const renderStackedBars = (selector, entries, keys, palette) => {
      const svg = d3.select(`svg[data-chart="${selector}"]`);
      if (svg.empty()) return;
      svg.selectAll("*").remove();
      const width = svg.node().clientWidth || 320;
      const height = svg.node().clientHeight || 240;
      const padding = { top: 14, right: 12, bottom: 28, left: 52 };
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      const x = d3
        .scaleBand()
        .domain(entries.map((d) => d.label))
        .range([padding.left, width - padding.right])
        .padding(0.25);
      const maxValue = d3.max(entries, (d) =>
        keys.length ? keys.reduce((sum, key) => sum + (d[key] || 0), 0) : 0
      );
      const y = d3
        .scaleLinear()
        .domain([0, maxValue || 1])
        .nice()
        .range([height - padding.bottom, padding.top]);

      const stack = d3.stack().keys(keys)(entries);
      svg
        .append("g")
        .selectAll("g")
        .data(stack)
        .enter()
        .append("g")
        .attr("fill", (d, i) => palette[i % palette.length])
        .selectAll("rect")
        .data((d) => d.map((value) => ({ key: d.key, value })))
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.value.data.label))
        .attr("y", (d) => y(d.value[1]))
        .attr("height", (d) => y(d.value[0]) - y(d.value[1]))
        .attr("width", x.bandwidth())
        .attr("rx", 6);

      svg
        .append("g")
        .attr("transform", `translate(0, ${height - padding.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor")
        .attr("transform", "rotate(-12)")
        .style("text-anchor", "end");

      svg
        .append("g")
        .attr("transform", `translate(${padding.left}, 0)`)
        .call(d3.axisLeft(y).ticks(4))
        .selectAll("text")
        .attr("font-size", "10")
        .attr("fill", "currentColor");
    };

    const employeesByStatus = ["active", "inactive"].map((status) => ({
      label: status,
      value: cachedEmployees.filter((emp) => (emp.status || "inactive") === status).length
    }));

    const newsByCategory = Object.entries(
      cachedNews.reduce((acc, item) => {
        const key = item.category || "Update";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([label, value]) => ({ label, value }));

    const focusCount = [{ label: "Focus Areas", value: cachedFocus.length }];

    const formsByTopic = Object.entries(
      cachedForms.reduce((acc, item) => {
        const key = item.topic || "general";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([label, value]) => ({ label, value }));

    const timelineDays = 14;
    const now = new Date();
    const timeline = Array.from({ length: timelineDays }).map((_, idx) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (timelineDays - 1 - idx));
      const label = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const key = date.toISOString().slice(0, 10);
      return { label, key, value: 0 };
    });
    const timelineIndex = new Map(timeline.map((d, i) => [d.key, i]));
    cachedForms.forEach((item) => {
      if (!item.createdAt) return;
      const key = new Date(item.createdAt).toISOString().slice(0, 10);
      const idx = timelineIndex.get(key);
      if (idx !== undefined) {
        timeline[idx].value += 1;
      }
    });

    const deptMap = cachedEmployees.reduce((acc, emp) => {
      const dept = emp.department || "General";
      const status = emp.status || "inactive";
      if (!acc[dept]) {
        acc[dept] = { label: dept, active: 0, inactive: 0 };
      }
      acc[dept][status] = (acc[dept][status] || 0) + 1;
      return acc;
    }, {});
    const deptEntries = Object.values(deptMap).slice(0, 6);

    const activityDays = 7;
    const today = new Date();
    const dayBuckets = Array.from({ length: activityDays }).map((_, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (activityDays - 1 - idx));
      const key = toLocalKey(date);
      const label = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      return { key, label };
    });
    const dayIndex = new Map(dayBuckets.map((d, i) => [d.key, i]));
    const employeeActivityCounts = cachedOverviewActivities.reduce((acc, item) => {
      const empId = item.employee;
      const key = item.visitedAt ? toLocalKey(item.visitedAt) : "";
      if (!empId || !key || !dayIndex.has(key)) return acc;
      if (!acc[empId]) acc[empId] = Array(activityDays).fill(0);
      acc[empId][dayIndex.get(key)] += 1;
      return acc;
    }, {});
    const topEmployeeIds = Object.keys(employeeActivityCounts);
    const activityEntries = dayBuckets.map((day, idx) => {
      const row = { label: day.label };
      topEmployeeIds.forEach((empId) => {
        row[empId] = employeeActivityCounts[empId]?.[idx] || 0;
      });
      return row;
    });
    const activityKeys = topEmployeeIds;
    const activityPalette = ["#fb7185", "#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#38bdf8", "#22c55e", "#f97316"];
    const activityLabels = topEmployeeIds.map(
      (empId) => cachedEmployees.find((emp) => emp._id === empId)?.name?.split(" ")[0] || "Emp"
    );

    const activityEntriesWithLabels = activityEntries.map((entry) => {
      const mapped = { label: entry.label };
      activityKeys.forEach((key, idx) => {
        mapped[activityLabels[idx]] = entry[key] || 0;
      });
      return mapped;
    });

    const expenseMonthlyEntries = cachedExpensesSummary.map((item) => {
      const date = new Date(`${item.month}-01T00:00:00`);
      const label = Number.isNaN(date.getTime())
        ? item.month
        : `${date.toLocaleDateString("en-IN", { month: "short" }).toLowerCase()}'${String(date.getFullYear()).slice(-2)}`;
      return { label, value: Number(item.total) || 0 };
    });

    renderPie("employees", employeesByStatus, ["#fb7185", "#f59e0b", "#38bdf8"]);
    renderBars("news", newsByCategory, "#60a5fa");
    renderBars("focus", focusCount, "#34d399");
    renderPie("forms", formsByTopic, ["#a78bfa", "#f97316", "#22c55e", "#38bdf8"]);
    renderLine("forms-timeline", timeline, "#f97316");
    renderStackedBars("employees-dept", deptEntries, ["active", "inactive"], ["#22c55e", "#fb7185"]);
    if (activityKeys.length) {
      renderStackedBars("activities-daily", activityEntriesWithLabels, activityLabels, activityPalette);
    } else {
      renderBars("activities-daily", [{ label: "No data", value: 0 }], "#cbd5f5");
    }
    if (expenseMonthlyEntries.length) {
      renderBars("expenses-monthly", expenseMonthlyEntries, "#fb7185");
    } else {
      renderBars("expenses-monthly", [{ label: "No data", value: 0 }], "#cbd5f5");
    }
  };


  const loadEmployees = async () => {
    const data = await request("/admin/employees");
    cachedEmployees = data.employees || [];
    renderEmployees(cachedEmployees);
    if (summaryEmployees) summaryEmployees.textContent = String(cachedEmployees.length);
    setBadges(badgeEmployees, cachedEmployees.length);
    if (doctorEmployeeSelect) {
      doctorEmployeeSelect.innerHTML = "<option value=\"\">All Employees</option>";
      cachedEmployees.forEach((emp) => {
        const opt = document.createElement("option");
        opt.value = emp._id;
        opt.textContent = emp.name;
        doctorEmployeeSelect.appendChild(opt);
      });
    }
    if (activityEmployeeSelect) {
      activityEmployeeSelect.innerHTML = "<option value=\"\">All Employees</option>";
      cachedEmployees.forEach((emp) => {
        const opt = document.createElement("option");
        opt.value = emp._id;
        opt.textContent = emp.name;
        activityEmployeeSelect.appendChild(opt);
      });
    }
    if (locationEmployeeSelect) {
      locationEmployeeSelect.innerHTML = "<option value=\"\">All Employees</option>";
      cachedEmployees.forEach((emp) => {
        const opt = document.createElement("option");
        opt.value = emp._id;
        opt.textContent = emp.name;
        locationEmployeeSelect.appendChild(opt);
      });
    }
    if (routeEmployeeSelect) {
      routeEmployeeSelect.innerHTML = "<option value=\"\">Select employee</option>";
      cachedEmployees.forEach((emp) => {
        const opt = document.createElement("option");
        opt.value = emp._id;
        opt.textContent = emp.name;
        routeEmployeeSelect.appendChild(opt);
      });
    }
    if (notificationEmployeeSelect) {
      notificationEmployeeSelect.innerHTML = "<option value=\"\">All Employees</option>";
      cachedEmployees.forEach((emp) => {
        const opt = document.createElement("option");
        opt.value = emp._id;
        opt.textContent = emp.name;
        notificationEmployeeSelect.appendChild(opt);
      });
    }
    if (doctorImportEmployeeSelect) {
      doctorImportEmployeeSelect.innerHTML = "<option value=\"\">Select employee</option>";
      cachedEmployees.forEach((emp) => {
        const opt = document.createElement("option");
        opt.value = emp._id;
        opt.textContent = emp.name;
        doctorImportEmployeeSelect.appendChild(opt);
      });
    }
    if (claimEmployeeSelect) {
      claimEmployeeSelect.innerHTML = "<option value=\"\">Select employee</option>";
      cachedEmployees.forEach((emp) => {
        const opt = document.createElement("option");
        opt.value = emp._id;
        opt.textContent = emp.name;
        claimEmployeeSelect.appendChild(opt);
      });
    }
    renderCharts();
    renderExpensesSection();
  };

  const toLocalKey = (dateValue) => {
    const date = new Date(dateValue);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const loadOverviewActivities = async () => {
    const days = 7;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const params = new URLSearchParams({
      from: start.toISOString(),
      to: end.toISOString(),
    });
    const data = await request(`/admin/activities?${params.toString()}`);
    cachedOverviewActivities = data.activities || [];
    renderCharts();
  };

  const loadExpensesSummary = async () => {
    const data = await request("/admin/expenses/summary?months=12&startMonth=3");
    cachedExpensesSummary = data.rows || [];
    renderCharts();
  };

  const loadExpenses = async () => {
    const monthKey = getActiveMonthKey();
    const data = await request(`/admin/expenses?month=${encodeURIComponent(monthKey)}`);
    cachedExpensesByMonth[monthKey] = {};
    (data.expenses || []).forEach((item) => {
      const employeeId = item.employee?.toString ? item.employee.toString() : item.employee;
      if (!employeeId) return;
      cachedExpensesByMonth[monthKey][employeeId] = {
        fixedSalary: Number(item.fixedSalary) || 0,
        monthlyExpenses: Number(item.monthlyExpenses) || 0,
      };
    });
    cachedExpenses = cachedExpensesByMonth[monthKey];
    renderExpensesSection();
  };

  const loadNews = async () => {
    const data = await request("/admin/news");
    cachedNews = data.items || [];
    renderNews(cachedNews);
    if (summaryNews) summaryNews.textContent = String(cachedNews.length);
    setBadges(badgeNews, cachedNews.length);
    renderCharts();
  };

  const loadFocus = async () => {
    const data = await request("/admin/focus-areas");
    cachedFocus = data.items || [];
    renderFocus(cachedFocus);
    if (summaryFocus) summaryFocus.textContent = String(cachedFocus.length);
    setBadges(badgeFocus, cachedFocus.length);
    renderCharts();
  };

  const loadForms = async () => {
    const data = await request("/admin/forms");
    cachedForms = data.responses || [];
    updateFormTopics();
    filteredForms = cachedForms;
    applyFormFilters();
    if (summaryForms) summaryForms.textContent = String(cachedForms.length);
    setBadges(badgeForms, cachedForms.length);
    renderCharts();
  };

  const loadDoctors = async () => {
    const params = new URLSearchParams();
    if (doctorEmployeeSelect?.value) params.set("employeeId", doctorEmployeeSelect.value);
    if (doctorSearch?.value) params.set("query", doctorSearch.value.trim());
    const data = await request(`/admin/doctors?${params.toString()}`);
    cachedDoctors = data.doctors || [];
    renderDoctors(cachedDoctors);
    setBadges(badgeDoctors, cachedDoctors.length);
  };

  const loadActivities = async () => {
    const params = new URLSearchParams();
    if (activityEmployeeSelect?.value) params.set("employeeId", activityEmployeeSelect.value);
    if (activityFrom?.value) params.set("from", activityFrom.value);
    if (activityTo?.value) params.set("to", activityTo.value);
    const data = await request(`/admin/activities?${params.toString()}`);
    cachedActivities = data.activities || [];
    renderActivities(cachedActivities);
    setBadges(badgeActivities, cachedActivities.length);
  };

  const loadLiveLocations = async () => {
    const data = await request("/admin/locations/live");
    cachedLiveLocations = data.locations || [];
    renderLiveLocations(cachedLiveLocations);
  };

  const loadLocationHistory = async () => {
    const params = new URLSearchParams();
    if (locationEmployeeSelect?.value) params.set("employeeId", locationEmployeeSelect.value);
    const fromKey = normalizeDateKey(locationFrom?.value || "");
    const toKey = normalizeDateKey(locationTo?.value || "");
    if (fromKey) {
      const range = getIstRangeIso(fromKey);
      params.set("from", range.from);
    }
    if (toKey) {
      const range = getIstRangeIso(toKey);
      params.set("to", range.to);
    }
    const data = await request(`/admin/locations/history?${params.toString()}`);
    cachedLocationHistory = data.locations || [];
    routeDistanceCache.clear();
    renderLocationHistory(cachedLocationHistory);
    setBadges(badgeLocations, cachedLocationHistory.length);
  };

  const loadNotifications = async () => {
    const data = await request("/admin/notifications");
    cachedNotifications = data.notifications || [];
    renderNotifications(cachedNotifications);
    setBadges(badgeNotifications, cachedNotifications.length);
  };

  const loadAll = async () => {
    await Promise.all([
      loadEmployees(),
      loadNews(),
      loadFocus(),
      loadForms(),
      loadLiveLocations(),
      loadNotifications(),
      loadExpenses(),
      loadOverviewActivities(),
      loadExpensesSummary(),
    ]);
    renderCharts();
  };

  const setSection = (id) => {
    sections.forEach((section) => {
      section.classList.toggle("hidden", section.dataset.adminSection !== id);
    });
    navButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.adminNav === id);
    });
  };

  const closeMobileMenu = () => {
    if (!mobileMenu || mobileMenu.classList.contains("hidden")) return;
    mobileMenu.classList.add("hidden");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
    }
  };

  const showDashboard = () => {
    if (dashboard) dashboard.classList.remove("hidden");
    if (loginSection) loginSection.classList.add("hidden");
    logoutBtns.forEach((btn) => btn.classList.remove("hidden"));
    if (statusPill) statusPill.textContent = "Signed in";
  };

  const showLogin = () => {
    if (dashboard) dashboard.classList.add("hidden");
    if (loginSection) loginSection.classList.remove("hidden");
    logoutBtns.forEach((btn) => btn.classList.add("hidden"));
    if (statusPill) statusPill.textContent = "Signed out";
  };

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setFeedback("");
      const email = loginForm.querySelector("input[type=\"email\"]")?.value?.trim();
      const password = loginForm.querySelector("input[type=\"password\"]")?.value || "";
      if (!email || !password) {
        setFeedback("Email and password required", true);
        return;
      }
      try {
        const response = await fetch(`${apiBase}/admin/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-route": routeKey
          },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }
        if (data?.token) {
          localStorage.setItem(tokenKey, data.token);
        }
        showDashboard();
        setSection("overview");
        initLocationMap();
        initSocket();
        await loadAll();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.removeItem(tokenKey);
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      if (locationHistoryTimer) {
        clearInterval(locationHistoryTimer);
        locationHistoryTimer = null;
      }
      showLogin();
    });
  });

  if (employeeForm) {
    employeeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(employeeForm);
      const payload = Object.fromEntries(formData.entries());
      
      // Remove empty password when updating
      if (editingEmployeeId && !payload.password) {
        delete payload.password;
      }
      
      try {
        if (editingEmployeeId) {
          await request(`/admin/employees/${editingEmployeeId}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
          });
          setFeedback("Employee updated.");
        } else {
          await request("/admin/employees", {
            method: "POST",
            body: JSON.stringify(payload)
          });
          setFeedback("Employee created.");
        }
        editingEmployeeId = null;
        updateEmployeeEditUI(false);
        employeeForm.reset();
        await loadEmployees();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (employeeCancelBtn) {
    employeeCancelBtn.addEventListener("click", () => {
      editingEmployeeId = null;
      updateEmployeeEditUI(false);
      employeeForm.reset();
    });
  }

  if (employeesList) {
    employeesList.addEventListener("click", async (event) => {
      const editId = event.target.getAttribute("data-employee-edit");
      const toggleId = event.target.getAttribute("data-employee-toggle");
      const deleteId = event.target.getAttribute("data-employee-delete");
      try {
        if (editId) {
          const data = await request("/admin/employees");
          const employee = (data.employees || []).find((emp) => emp._id === editId);
          if (employee) {
            editingEmployeeId = editId;
            updateEmployeeEditUI(true, employee.name);
            employeeForm.querySelector("[name=name]").value = employee.name || "";
            employeeForm.querySelector("[name=email]").value = employee.email || "";
            employeeForm.querySelector("[name=password]").value = "";
            employeeForm.querySelector("[name=employeeId]").value = employee.employeeId || "";
            employeeForm.querySelector("[name=joiningDate]").value = employee.joiningDate?.slice(0, 10) || "";
            employeeForm.querySelector("[name=currentSalary]").value = employee.currentSalary ?? "";
            employeeForm.querySelector("[name=territoryName]").value = employee.territoryName || "";
            employeeForm.querySelector("[name=designation]").value = employee.designation || "";
            employeeForm.querySelector("[name=department]").value = employee.department || "";
            employeeForm.querySelector("[name=managerName]").value = employee.managerName || "";
          }
        }
        if (toggleId) {
          const status = event.target.getAttribute("data-employee-status");
          const nextStatus = status === "active" ? "inactive" : "active";
          await request(`/admin/employees/${toggleId}`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus })
          });
          setFeedback(`Employee ${nextStatus === "active" ? "activated" : "deactivated"}.`);
          await loadEmployees();
        }
        if (deleteId) {
          await request(`/admin/employees/${deleteId}`, { method: "DELETE" });
          setFeedback("Employee deleted.");
          await loadEmployees();
        }
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (newsForm) {
    newsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(newsForm);
      const payload = Object.fromEntries(formData.entries());
      payload.isFeatured = payload.isFeatured === "on";
      try {
        if (editingNewsId) {
          await request(`/admin/news/${editingNewsId}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
          });
          setFeedback("News updated.");
        } else {
          await request("/admin/news", {
            method: "POST",
            body: JSON.stringify(payload)
          });
          setFeedback("News published.");
        }
        editingNewsId = null;
        newsForm.reset();
        await loadNews();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (newsList) {
    newsList.addEventListener("click", async (event) => {
      const editId = event.target.getAttribute("data-news-edit");
      const deleteId = event.target.getAttribute("data-news-delete");
      try {
        if (editId) {
          const data = await request("/admin/news");
          const item = (data.items || []).find((news) => news._id === editId);
          if (item) {
            editingNewsId = editId;
            newsForm.querySelector("[name=title]").value = item.title || "";
            newsForm.querySelector("[name=summary]").value = item.summary || "";
            newsForm.querySelector("[name=imageUrl]").value = item.imageUrl || "";
            newsForm.querySelector("[name=category]").value = item.category || "";
            newsForm.querySelector("[name=publishedAt]").value = item.publishedAt?.slice(0, 10) || "";
            newsForm.querySelector("[name=isFeatured]").checked = Boolean(item.isFeatured);
          }
        }
        if (deleteId) {
          await request(`/admin/news/${deleteId}`, { method: "DELETE" });
          setFeedback("News deleted.");
          await loadNews();
        }
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (focusForm) {
    focusForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(focusForm);
      const payload = Object.fromEntries(formData.entries());
      payload.medicines = payload.medicines
        ? payload.medicines.split(",").map((item) => item.trim()).filter(Boolean)
        : [];
      payload.order = payload.order ? Number(payload.order) : 0;
      try {
        if (editingFocusId) {
          await request(`/admin/focus-areas/${editingFocusId}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
          });
          setFeedback("Focus area updated.");
        } else {
          await request("/admin/focus-areas", {
            method: "POST",
            body: JSON.stringify(payload)
          });
          setFeedback("Focus area created.");
        }
        editingFocusId = null;
        focusForm.reset();
        await loadFocus();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (focusList) {
    focusList.addEventListener("click", async (event) => {
      const editId = event.target.getAttribute("data-focus-edit");
      const deleteId = event.target.getAttribute("data-focus-delete");
      try {
        if (editId) {
          const data = await request("/admin/focus-areas");
          const item = (data.items || []).find((focus) => focus._id === editId);
          if (item) {
            editingFocusId = editId;
            focusForm.querySelector("[name=title]").value = item.title || "";
            focusForm.querySelector("[name=subtitle]").value = item.subtitle || "";
            focusForm.querySelector("[name=imageUrl]").value = item.imageUrl || "";
            focusForm.querySelector("[name=medicines]").value = (item.medicines || []).join(", ");
            focusForm.querySelector("[name=order]").value = item.order ?? 0;
          }
        }
        if (deleteId) {
          await request(`/admin/focus-areas/${deleteId}`, { method: "DELETE" });
          setFeedback("Focus area deleted.");
          await loadFocus();
        }
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (doctorForm) {
    doctorForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }

  if (doctorCancelBtn) {
    doctorCancelBtn.addEventListener("click", () => {
      editingDoctorId = null;
      updateDoctorEditUI(false);
      doctorForm?.reset();
    });
  }

  if (getToken()) {
    showDashboard();
    setSection("overview");
    initLocationMap();
    initSocket();
    if (routeDateInput) {
      const today = new Date();
      routeDateInput.value = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
    }
    if (claimMonthInput) {
      const now = new Date();
      claimMonthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    loadAll().catch(() => {
      localStorage.removeItem(tokenKey);
      showLogin();
      setFeedback("Session expired. Please login again.", true);
    });
  } else {
    showLogin();
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.adminNav;
      if (target) {
        setSection(target);
        closeMobileMenu();
        if (target === "overview") {
          initLocationMap();
          loadLiveLocations().catch(() => setFeedback("Unable to load live locations.", true));
          loadOverviewActivities().catch(() => setFeedback("Unable to load activity chart.", true));
          loadExpensesSummary().catch(() => setFeedback("Unable to load expense chart.", true));
        }
        if (target === "expenses") {
          loadExpenses().catch(() => setFeedback("Unable to load expenses.", true));
        }
        if (target === "manage-expenses") {
          loadExpenseClaims().catch(() => setFeedback("Unable to load expense claims.", true));
        }
        if (target === "doctors") {
          loadDoctors().catch(() => setFeedback("Unable to load doctors.", true));
        }
        if (target === "activities") {
          loadActivities().catch(() => setFeedback("Unable to load activities.", true));
        }
        if (target === "locations") {
          loadLocationHistory().catch(() => setFeedback("Unable to load location history.", true));
          if (locationHistoryTimer) clearInterval(locationHistoryTimer);
          locationHistoryTimer = setInterval(() => {
            loadLocationHistory().catch(() => {});
          }, 120000);
        } else if (locationHistoryTimer) {
          clearInterval(locationHistoryTimer);
          locationHistoryTimer = null;
        }
        if (target === "routes") {
          initRouteMap();
        }
        if (target === "notifications") {
          loadNotifications().catch(() => setFeedback("Unable to load notifications.", true));
        }
      }
    });
  });

  if (doctorEmployeeSelect) {
    doctorEmployeeSelect.addEventListener("change", () => {
      loadDoctors().catch(() => setFeedback("Unable to load doctors.", true));
    });
  }
  if (doctorSearch) {
    doctorSearch.addEventListener("input", () => {
      loadDoctors().catch(() => setFeedback("Unable to load doctors.", true));
    });
  }
  if (doctorExportButtons.length) {
    doctorExportButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.adminDoctorExport;
        if (mode === "table") {
          exportDoctorsTable();
        } else {
          exportDoctorsCsv();
        }
      });
    });
  }
  if (doctorTemplateDownload) {
    doctorTemplateDownload.addEventListener("click", async () => {
      try {
        const response = await fetch(`${apiBase}/admin/doctors/template`, {
          headers: {
            ...authHeaders(),
          },
        });
        if (!response.ok) {
          throw new Error("Unable to download template");
        }
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "doctors-template.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      } catch (_error) {
        setFeedback("Unable to download template.", true);
      }
    });
  }
  if (doctorImportForm) {
    doctorImportForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(doctorImportForm);
      const employeeId = formData.get("employeeId");
      const file = formData.get("file");
      if (!employeeId || !file || !(file instanceof File) || !file.size) {
        setFeedback("Select employee and file to upload.", true);
        return;
      }
      try {
        const response = await fetch(`${apiBase}/admin/doctors/import`, {
          method: "POST",
          headers: {
            ...authHeaders(),
          },
          body: formData,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Upload failed");
        }
        setFeedback(`Imported ${data.created || 0} doctors. Skipped ${data.skipped || 0}.`);
        doctorImportForm.reset();
        if (doctorImportEmployeeSelect) {
          doctorImportEmployeeSelect.value = "";
        }
        await loadDoctors();
      } catch (error) {
        setFeedback(error.message || "Unable to import doctors.", true);
      }
    });
  }
  if (activityEmployeeSelect) {
    activityEmployeeSelect.addEventListener("change", () => {
      loadActivities().catch(() => setFeedback("Unable to load activities.", true));
    });
  }
  if (activityFrom) {
    activityFrom.addEventListener("change", () => {
      loadActivities().catch(() => setFeedback("Unable to load activities.", true));
    });
  }
  if (activityTo) {
    activityTo.addEventListener("change", () => {
      loadActivities().catch(() => setFeedback("Unable to load activities.", true));
    });
  }

  if (activityExport) {
    activityExport.addEventListener("click", exportActivitiesCsv);
  }

  if (locationRefresh) {
    locationRefresh.addEventListener("click", () => {
      loadLiveLocations().catch(() => setFeedback("Unable to load live locations.", true));
    });
  }
  if (locationEmployeeSelect) {
    locationEmployeeSelect.addEventListener("change", () => {
      loadLocationHistory().catch(() => setFeedback("Unable to load location history.", true));
    });
  }
  if (locationFrom) {
    locationFrom.addEventListener("change", () => {
      loadLocationHistory().catch(() => setFeedback("Unable to load location history.", true));
    });
  }
  if (locationTo) {
    locationTo.addEventListener("change", () => {
      loadLocationHistory().catch(() => setFeedback("Unable to load location history.", true));
    });
  }
  if (locationExportButtons.length) {
    locationExportButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.locationExport;
        if (mode === "table") {
          exportLocationHistoryTable();
        } else {
          exportLocationHistoryCsv();
        }
      });
    });
  }

  if (locationDeleteButton) {
    locationDeleteButton.addEventListener("click", async () => {
      const employeeId = locationEmployeeSelect?.value || "";
      const fromKey = normalizeDateKey(locationFrom?.value || "");
      const toKey = normalizeDateKey(locationTo?.value || "");
      if (!fromKey || !toKey) {
        setFeedback("Select from/to dates to delete.", true);
        return;
      }
      const confirmed = window.confirm("Delete location history in the selected range? This cannot be undone.");
      if (!confirmed) return;
      try {
        const params = new URLSearchParams();
        if (employeeId) params.set("employeeId", employeeId);
        const fromRange = getIstRangeIso(fromKey);
        const toRange = getIstRangeIso(toKey);
        params.set("from", fromRange.from);
        params.set("to", toRange.to);
        const data = await request(`/admin/locations/history?${params.toString()}`, { method: "DELETE" });
        setFeedback(`Deleted ${data.deletedCount || 0} records.`);
        await loadLocationHistory();
      } catch (error) {
        setFeedback(error.message || "Unable to delete history.", true);
      }
    });
  }

  const IST_OFFSET_MINUTES = 330;

  const normalizeDateKey = (raw) => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const [d, m, y] = raw.split("-");
      return `${y}-${m}-${d}`;
    }
    return raw;
  };

  const toIstDayKey = (dateValue) => {
    const d = new Date(dateValue);
    const istMs = d.getTime() + IST_OFFSET_MINUTES * 60000;
    return new Date(istMs).toISOString().slice(0, 10);
  };

  const getIstRangeIso = (dateKey) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const startUtcMs = Date.UTC(y, m - 1, d, 0, -IST_OFFSET_MINUTES, 0, 0);
    const endUtcMs = Date.UTC(y, m - 1, d, 23, 59 - IST_OFFSET_MINUTES, 59, 999);
    return { from: new Date(startUtcMs).toISOString(), to: new Date(endUtcMs).toISOString() };
  };

  const loadRouteData = async (employeeId, dateKey) => {
    const normalized = normalizeDateKey(dateKey);
    const range = getIstRangeIso(normalized);
    const params = new URLSearchParams({ employeeId, from: range.from, to: range.to });
    const data = await request(`/admin/locations/history?${params.toString()}`);
    return data.locations || [];
  };

  const loadNearestRouteData = async (employeeId, dateKey) => {
    const params = new URLSearchParams({ employeeId, limit: "1000" });
    const data = await request(`/admin/locations/history?${params.toString()}`);
    const items = data.locations || [];
    if (!items.length) return { points: [], nearestKey: "" };
    const groups = items.reduce((acc, item) => {
      const ts = item.receivedAt || item.capturedAt;
      if (!ts) return acc;
      const key = toIstDayKey(ts);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    const keys = Object.keys(groups);
    if (!keys.length) return { points: [], nearestKey: "" };
    const target = new Date(`${dateKey}T00:00:00`);
    let nearestKey = keys[0];
    let minDiff = Infinity;
    keys.forEach((key) => {
      const diff = Math.abs(new Date(`${key}T00:00:00`).getTime() - target.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        nearestKey = key;
      }
    });
    return { points: groups[nearestKey] || [], nearestKey };
  };

  const renderRoutePanel = (points, employeeId, dateKey) => {
    initRouteMap();
    setTimeout(() => {
      try {
        routeMap?.invalidateSize();
      } catch (_e) {
        // ignore
      }
    }, 120);
    const trimmedPoints = downsamplePoints(points);
    const routePointsList = buildRoutePoints(trimmedPoints);
    const distance = drawRoute(routeMap, routePointsList);
    if (routeSummary) {
      routeSummary.textContent = `Route • ${distance.toFixed(1)} km`;
      routeSummary.classList.remove("hidden");
    }
    if (routeExportButton) {
      routeExportButton.classList.remove("hidden");
    }
    if (routePoints) {
      if (!points.length) {
        routePoints.innerHTML = "<p class=\"muted text-sm\">No route data for this date.</p>";
      } else {
        routePoints.innerHTML = trimmedPoints
          .sort((a, b) => new Date(a.receivedAt || a.capturedAt || 0) - new Date(b.receivedAt || b.capturedAt || 0))
          .map((item, idx) => {
            return `
              <div class="flex items-center justify-between">
                <span class="muted">${idx + 1}. ${formatDateTime(item.receivedAt || item.capturedAt)}</span>
                <a class="map-link-btn" href="${mapUrl(item.latitude, item.longitude)}" target="_blank" rel="noreferrer">Open map</a>
              </div>
              <p class="muted text-xs">Lat: ${Number(item.latitude).toFixed(5)} • Lng: ${Number(item.longitude).toFixed(5)}</p>
            `;
          })
          .join("");
      }
    }
    if (routeMap) {
      setTimeout(() => {
        try {
          routeMap.invalidateSize();
        } catch (_e) {
          // ignore
        }
      }, 240);
    }
  };

  if (routeLoadButton) {
    routeLoadButton.addEventListener("click", async () => {
      const employeeId = routeEmployeeSelect?.value || "";
      const dateKey = normalizeDateKey(routeDateInput?.value || "");
      if (!employeeId || !dateKey) {
        setFeedback("Select employee and date.", true);
        return;
      }
      try {
        setSection("routes");
        initRouteMap();
        let points = await loadRouteData(employeeId, dateKey);
        let effectiveDate = dateKey;
        if (!points.length) {
          const fallback = await loadNearestRouteData(employeeId, dateKey);
          points = fallback.points;
          if (fallback.nearestKey) {
            effectiveDate = fallback.nearestKey;
            setFeedback(`No data for ${dateKey}. Showing nearest day: ${effectiveDate}.`, true);
          }
        }
        renderRoutePanel(points, employeeId, effectiveDate);
        lastRouteSelection = { employeeId, dateKey: effectiveDate };
        loadLiveLocations().catch(() => {});
      } catch (error) {
        setFeedback(error.message || "Unable to load route.", true);
      }
    });
  }

  if (routeExportButton) {
    routeExportButton.addEventListener("click", () => {
      const employeeId = routeEmployeeSelect?.value || "";
      const dateKey = normalizeDateKey(routeDateInput?.value || "");
      const employeeName = cachedEmployees.find((emp) => emp._id === employeeId)?.name || "Employee";
      if (!employeeId || !dateKey) {
        setFeedback("Select employee and date.", true);
        return;
      }
      const points = cachedLocationHistory
        .filter((item) => item.employee?._id === employeeId || item.employee?.id === employeeId)
        .filter((item) => {
          const ts = item.receivedAt || item.capturedAt;
          if (!ts) return false;
          return new Date(ts).toISOString().slice(0, 10) === dateKey;
        })
        .sort((a, b) => new Date(a.receivedAt || a.capturedAt || 0) - new Date(b.receivedAt || b.capturedAt || 0));
      const rows = points
        .map(
          (item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${new Date(item.receivedAt || item.capturedAt || 0).toLocaleString("en-IN")}</td>
            <td>${Number(item.latitude).toFixed(5)}</td>
            <td>${Number(item.longitude).toFixed(5)}</td>
            <td>${mapUrl(item.latitude, item.longitude)}</td>
          </tr>
        `
        )
        .join("");
      const distance = drawRoute(routeMap, buildRoutePoints(points));
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Route Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 6px; }
            .meta { color: #475569; margin-bottom: 16px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; }
            th { background: #f8fafc; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Route Report</h1>
          <p class="meta">Employee: ${employeeName} • Date: ${dateKey} • Distance: ${distance.toFixed(1)} km</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Map</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `route-${employeeName.replace(/\s+/g, "-").toLowerCase()}-${dateKey}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    });
  }

  if (notificationForm) {
    notificationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(notificationForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        await request("/admin/notifications", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notificationForm.reset();
        setFeedback("Notification sent.");
        await loadNotifications();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (doctorsList) {
    doctorsList.addEventListener("click", async (event) => {
      const editId = event.target.getAttribute("data-doctor-edit");
      const saveId = event.target.getAttribute("data-doctor-save");
      const cancelId = event.target.getAttribute("data-doctor-cancel");
      const deleteId = event.target.getAttribute("data-doctor-delete");
      try {
        if (editId) {
          if (!doctorForm) {
            setFeedback("Doctor form not available.", true);
            return;
          }
          editingDoctorId = editId;
          renderDoctors(cachedDoctors);
          return;
        }
        if (cancelId) {
          editingDoctorId = null;
          renderDoctors(cachedDoctors);
          return;
        }
        if (saveId) {
          const row = event.target.closest("tr");
          const notesRow = row?.nextElementSibling;
          const payload = {
            name: row?.querySelector("[name=name]")?.value?.trim() || "",
            speciality: row?.querySelector("[name=speciality]")?.value?.trim() || "",
            phone: row?.querySelector("[name=phone]")?.value?.trim() || "",
            clinicName: row?.querySelector("[name=clinicName]")?.value?.trim() || "",
            city: row?.querySelector("[name=city]")?.value?.trim() || "",
            notes: notesRow?.querySelector("[name=notes]")?.value?.trim() || "",
          };
          if (!payload.name || !payload.phone) {
            setFeedback("Doctor name and phone are required.", true);
            return;
          }
          await request(`/admin/doctors/${saveId}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
          });
          setFeedback("Doctor updated.");
          editingDoctorId = null;
          await loadDoctors();
          return;
        }
        if (deleteId) {
          await request(`/admin/doctors/${deleteId}`, { method: "DELETE" });
          setFeedback("Doctor deleted.");
          if (editingDoctorId === deleteId) {
            editingDoctorId = null;
            updateDoctorEditUI(false);
            doctorForm?.reset();
          }
          await loadDoctors();
        }
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (activityList) {
    activityList.addEventListener("click", async (event) => {
      const deleteId = event.target.getAttribute("data-activity-delete");
      if (!deleteId) return;
      try {
        await request(`/admin/activities/${deleteId}`, { method: "DELETE" });
        setFeedback("Activity deleted.");
        await loadActivities();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (locationHistoryList) {
    locationHistoryList.addEventListener("click", (event) => {
      const employeeId = event.target.getAttribute("data-route-employee");
      const dateKey = event.target.getAttribute("data-route-date");
      if (!employeeId) return;
      initRouteMap();
      drawRoute(routeMap, employeeId, dateKey || null);
      if (routeMapEl) {
        routeMapEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  if (liveLocationsList) {
    liveLocationsList.addEventListener("click", async (event) => {
      const employeeId = event.target.getAttribute("data-sync-route");
      if (!employeeId) return;
      const today = new Date();
      const localKey = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      const dateKey = normalizeDateKey(localKey);
      try {
        const points = await loadRouteData(employeeId, dateKey);
        let effectivePoints = points;
        let effectiveDate = dateKey;
        if (!effectivePoints.length) {
          const fallback = await loadNearestRouteData(employeeId, dateKey);
          effectivePoints = fallback.points;
          if (fallback.nearestKey) {
            effectiveDate = fallback.nearestKey;
          }
        }
        const routePointsList = buildRoutePoints(effectivePoints);
        let distance = 0;
        for (let i = 1; i < routePointsList.length; i += 1) {
          distance += haversineKm([routePointsList[i - 1].lat, routePointsList[i - 1].lng], [routePointsList[i].lat, routePointsList[i].lng]);
        }
        routeOverrides.set(employeeId, effectiveDate);
        routeDistanceOverrides.set(employeeId, { distance, dateKey: effectiveDate });
        loadLiveLocations().catch(() => {});
      } catch (error) {
        setFeedback(error.message || "Unable to sync route.", true);
      }
    });
  }

  window.addEventListener("resize", () => {
    if (doctorsList && cachedDoctors.length) {
      renderDoctors(cachedDoctors);
    }
    if (activityList && cachedActivities.length) {
      renderActivities(cachedActivities);
    }
    if (locationHistoryList && cachedLocationHistory.length) {
      renderLocationHistory(cachedLocationHistory);
    }
    if (liveLocationsList && cachedLiveLocations.length) {
      renderLiveLocations(cachedLiveLocations);
    }
    if (expensesCharts.salary || expensesCharts.expenses || expensesCharts.total) {
      renderExpensesCharts();
    }
    if (activeExpenseHistoryEmployee) {
      renderExpenseHistory(activeExpenseHistoryEmployee);
    }
  });

  if (formSearch) {
    formSearch.addEventListener("input", applyFormFilters);
  }
  if (formTopic) {
    formTopic.addEventListener("change", applyFormFilters);
  }
  if (formFrom) {
    formFrom.addEventListener("change", applyFormFilters);
  }
  if (formTo) {
    formTo.addEventListener("change", applyFormFilters);
  }
  if (formClear) {
    formClear.addEventListener("click", () => {
      if (formSearch) formSearch.value = "";
      if (formTopic) formTopic.value = "";
      if (formFrom) formFrom.value = "";
      if (formTo) formTo.value = "";
      applyFormFilters();
    });
  }
  if (formExport) {
    formExport.addEventListener("click", exportFormsCsv);
  }

  if (expensesMonthInput) {
    expensesMonthInput.addEventListener("change", () => {
      loadExpenses().catch(() => setFeedback("Unable to load expenses.", true));
    });
  }

  if (expensesTableBody) {
    expensesTableBody.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.matches("[data-expense-input]")) return;
      const employeeId = target.dataset.expenseEmployee;
      const field = target.dataset.expenseField;
      if (!employeeId || !field) return;
      updateExpenseEntry(employeeId, field, target.value);
      const rowTotalCell = expensesTableBody.querySelector(`[data-expense-row-total="${employeeId}"]`);
      const record = cachedExpenses[employeeId] || { fixedSalary: 0, monthlyExpenses: 0 };
      const rowTotal = (Number(record.fixedSalary) || 0) + (Number(record.monthlyExpenses) || 0);
      if (rowTotalCell) rowTotalCell.textContent = formatCurrency(rowTotal);
      updateExpenseSummaries();
      renderExpensesCharts();
      const monthKey = getActiveMonthKey();
      if (expenseSaveTimers.has(employeeId)) {
        clearTimeout(expenseSaveTimers.get(employeeId));
      }
      expenseSaveTimers.set(
        employeeId,
        setTimeout(async () => {
          try {
            await request("/admin/expenses", {
              method: "POST",
              body: JSON.stringify({
                employeeId,
                month: monthKey,
                fixedSalary: record.fixedSalary,
                monthlyExpenses: record.monthlyExpenses,
              }),
            });
          } catch (_error) {
            setFeedback("Unable to save expense changes.", true);
          }
        }, 600)
      );
    });
    expensesTableBody.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const employeeId = target.getAttribute("data-expense-history");
      if (!employeeId) return;
      loadExpenseHistory(employeeId).catch(() => setFeedback("Unable to load expense history.", true));
    });
  }

  if (expensesExportButtons.length) {
    expensesExportButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.expensesExport;
        if (mode === "pdf") {
          exportExpensesPdf();
        } else {
          exportExpensesCsv();
        }
      });
    });
  }

  if (expensesPrintButton) {
    expensesPrintButton.addEventListener("click", printExpensesReport);
  }

  if (claimMonthInput) {
    claimMonthInput.addEventListener("change", () => {
      loadExpenseClaims().catch(() => setFeedback("Unable to load expense claims.", true));
    });
  }

  if (claimEmployeeSelect) {
    claimEmployeeSelect.addEventListener("change", () => {
      loadExpenseClaims().catch(() => setFeedback("Unable to load expense claims.", true));
    });
  }

  if (claimLoadButton) {
    claimLoadButton.addEventListener("click", () => {
      loadExpenseClaims().catch(() => setFeedback("Unable to load expense claims.", true));
    });
  }

  if (claimApproveButton) {
    claimApproveButton.addEventListener("click", async () => {
      const employeeId = claimEmployeeSelect?.value || "";
      const month = getClaimsMonthKey();
      if (!employeeId) {
        setFeedback("Select an employee to approve expenses.", true);
        return;
      }
      try {
        await request("/admin/employee-expenses/approve", {
          method: "POST",
          body: JSON.stringify({ employeeId, month }),
        });
        setFeedback("Expenses approved and added to payroll.");
        await loadExpenseClaims();
        await loadExpenses();
      } catch (error) {
        setFeedback(error.message || "Unable to approve expenses.", true);
      }
    });
  }

  if (claimPrintButton) {
    claimPrintButton.addEventListener("click", () => {
      const html = generateExpenseClaimsPrintHtml();
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    });
  }

  if (claimTableBody) {
    claimTableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const updateId = target.getAttribute("data-claim-update");
      const deleteId = target.getAttribute("data-claim-delete");
      try {
        if (updateId) {
          const row = target.closest("tr");
          if (!row) return;
          const payload = {};
          row.querySelectorAll("[data-claim-field]").forEach((input) => {
            if (!(input instanceof HTMLInputElement)) return;
            payload[input.dataset.claimField] = input.value;
          });
          await request(`/admin/employee-expenses/${updateId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
          setFeedback("Expense record updated.");
          await loadExpenseClaims();
        }
        if (deleteId) {
          await request(`/admin/employee-expenses/${deleteId}`, { method: "DELETE" });
          setFeedback("Expense record deleted.");
          await loadExpenseClaims();
        }
      } catch (error) {
        setFeedback(error.message || "Unable to update expense record.", true);
      }
    });
  }
})();

