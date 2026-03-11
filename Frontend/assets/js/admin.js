(() => {
  const body = document.body;
  const apiBase = window.SoulApiBase || "http://localhost:4000/api";
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

  const doctorsList = document.querySelector("[data-admin-doctors-list]");
  const doctorEmployeeSelect = document.querySelector("[data-admin-doctor-employee]");
  const doctorSearch = document.querySelector("[data-admin-doctor-search]");
  const doctorExportButtons = [...document.querySelectorAll("[data-admin-doctor-export]")];

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

  let editingEmployeeId = null;
  let editingNewsId = null;
  let editingFocusId = null;
  let cachedEmployees = [];
  let cachedNews = [];
  let cachedFocus = [];
  let cachedForms = [];
  let filteredForms = [];
  let cachedDoctors = [];
  let cachedActivities = [];

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
              <p class="muted text-sm">${emp.designation || ""} • ${emp.territoryName || ""}</p>
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
              <p class="muted text-sm">${item.category || "Update"} • ${new Date(item.publishedAt).toLocaleDateString("en-IN")}</p>
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
    formsList.innerHTML = items
      .map(
        (item) => `
        <div class="rounded-xl border border-white/30 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold">${item.name}</p>
              <p class="muted text-sm">${item.email}${item.phone ? ` • ${item.phone}` : ""}</p>
              <p class="muted text-sm">${item.topic || "general"} • ${new Date(item.createdAt).toLocaleString("en-IN")}</p>
              <p class="muted text-sm">${item.message}</p>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  };

  const renderDoctors = (items) => {
    if (!doctorsList) return;
    if (!items.length) {
      doctorsList.innerHTML = "<p class=\"muted text-sm\">No doctors found.</p>";
      return;
    }
    const employeeMap = Object.fromEntries(cachedEmployees.map((emp) => [emp._id, emp.name]));
    doctorsList.innerHTML = items
      .map(
        (doc) => `
        <div class="rounded-xl border border-white/30 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold">${doc.name}</p>
              <p class="muted text-sm">${doc.speciality || "General"} • ${doc.phone || "—"}</p>
              <p class="muted text-sm">Employee: ${employeeMap[doc.createdBy] || "Unknown"}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button data-doctor-delete="${doc._id}" class="btn-secondary !px-4 !py-2">Delete</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
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
      const padding = { top: 16, right: 12, bottom: 28, left: 36 };
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
      const padding = { top: 16, right: 16, bottom: 28, left: 40 };
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      const x = d3
        .scaleBand()
        .domain(entries.map((d) => d.label))
        .range([padding.left, width - padding.right])
        .padding(0.25);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(entries, (d) => keys.reduce((sum, key) => sum + d[key], 0)) || 1])
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

    renderPie("employees", employeesByStatus, ["#fb7185", "#f59e0b", "#38bdf8"]);
    renderBars("news", newsByCategory, "#60a5fa");
    renderBars("focus", focusCount, "#34d399");
    renderPie("forms", formsByTopic, ["#a78bfa", "#f97316", "#22c55e", "#38bdf8"]);
    renderLine("forms-timeline", timeline, "#f97316");
    renderStackedBars("employees-dept", deptEntries, ["active", "inactive"], ["#22c55e", "#fb7185"]);
  };

  const setupThreeChart = () => {
    const canvas = document.querySelector("[data-chart-3d]");
    if (!canvas || !window.THREE) return;
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const light = new THREE.PointLight(0xffffff, 0.9);
    light.position.set(4, 6, 6);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      metalness: 0.4,
      roughness: 0.2
    });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    const resize = () => {
      const width = canvas.clientWidth || 300;
      const height = canvas.clientHeight || 240;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      knot.rotation.x += 0.005;
      knot.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
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
    renderCharts();
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

  const loadAll = async () => {
    await Promise.all([loadEmployees(), loadNews(), loadFocus(), loadForms()]);
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
        setupThreeChart();
        await loadAll();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.removeItem(tokenKey);
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
        } else {
          await request("/admin/employees", {
            method: "POST",
            body: JSON.stringify(payload)
          });
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
          await loadEmployees();
        }
        if (deleteId) {
          await request(`/admin/employees/${deleteId}`, { method: "DELETE" });
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
        } else {
          await request("/admin/news", {
            method: "POST",
            body: JSON.stringify(payload)
          });
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
        } else {
          await request("/admin/focus-areas", {
            method: "POST",
            body: JSON.stringify(payload)
          });
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
          await loadFocus();
        }
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (getToken()) {
    showDashboard();
    setSection("overview");
    setupThreeChart();
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
        if (target === "doctors") {
          loadDoctors().catch(() => setFeedback("Unable to load doctors.", true));
        }
        if (target === "activities") {
          loadActivities().catch(() => setFeedback("Unable to load activities.", true));
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

  if (doctorsList) {
    doctorsList.addEventListener("click", async (event) => {
      const deleteId = event.target.getAttribute("data-doctor-delete");
      if (!deleteId) return;
      try {
        await request(`/admin/doctors/${deleteId}`, { method: "DELETE" });
        await loadDoctors();
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
        await loadActivities();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

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
})();
