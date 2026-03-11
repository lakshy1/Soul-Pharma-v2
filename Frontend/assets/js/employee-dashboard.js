(() => {
  const tokenKey = "soul-employee-token";
  const apiBase = window.SoulApiBase || "http://localhost:4000/api";
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

  const logoutBtns = [...document.querySelectorAll("[data-employee-logout]")];

  let doctorsCache = [];
  let activitiesCache = [];
  let calendarCache = {};
  let editingDoctorId = null;
  let selectedMonth = new Date();
  let activityDoctorCache = [];

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
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const setNow = () => {
    if (!activityTime) return;
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    activityTime.value = local;
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

  const renderDoctors = (items) => {
    if (!doctorsList) return;
    if (!items.length) {
      doctorsList.innerHTML = "<p class=\"muted text-sm\">No doctors found yet.</p>";
      return;
    }
    doctorsList.innerHTML = items
      .map(
        (doc) => `
        <article class="doctor-card">
          <div class="doctor-card__head">
            <div>
              <p class="doctor-serial">#${doc.serialNumber}</p>
              <h3>${doc.name}</h3>
              <p class="muted text-sm">${doc.speciality || "General"} • ${doc.phone || "—"}</p>
            </div>
            <div class="doctor-actions">
              <span class="focus-pill">Managed by Admin</span>
            </div>
          </div>
          <div class="doctor-meta">
            <p><span>Clinic:</span> ${doc.clinicName || "—"}</p>
            <p><span>Address:</span> ${doc.address || "—"}</p>
            <p><span>City:</span> ${doc.city || "—"}</p>
            <p><span>Notes:</span> ${doc.notes || "—"}</p>
          </div>
        </article>
      `
      )
      .join("");
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
            <p><span>Speciality:</span> ${item.doctorSnapshot?.speciality || "—"}</p>
            <p><span>Phone:</span> ${item.doctorSnapshot?.phone || "—"}</p>
            <p><span>Address:</span> ${item.doctorSnapshot?.address || "—"}</p>
            <p><span>Follow-up:</span> ${item.followUpDate ? new Date(item.followUpDate).toLocaleDateString("en-IN") : "Not set"}</p>
          </div>
          ${item.notes ? `<p class="muted text-sm">${item.notes}</p>` : ""}
          ${item.photoUrl ? `<img src="${item.photoUrl}" alt="Visit proof" class="activity-photo">` : ""}
        </article>
      `
      )
      .join("");
  };

  const loadProfile = async () => {
    const data = await request("/employee/me", { method: "GET", headers: headers() });
    const employee = data.employee || {};
    if (greeting) greeting.textContent = `Welcome back, ${employee.name || "Employee"}`;
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
    doctorsCache = data.doctors || [];
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
        setFeedback("Doctor saved.");
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
      const monthVisits = Object.values(calendarCache).reduce((sum, day) => sum + (day.count || 0), 0);
      if (statVisits) statVisits.textContent = String(monthVisits);
    } catch (error) {
      localStorage.removeItem(tokenKey);
      window.location.href = "Auth.html";
    }
  };

  setNow();
  setSection("overview");
  init();
})();
