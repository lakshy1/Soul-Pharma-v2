(() => {
  const root = document.documentElement;
  const body = document.body;
  const storageKey = "soul-theme";
  const getApiBase = () => window.SoulApiBase || "http://localhost:4000/api";

  function applyTheme(theme) {
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.setAttribute("data-theme", theme);
    body.setAttribute("data-theme", theme);

    document.querySelectorAll("[data-theme-icon]").forEach((node) => {
      node.textContent = theme === "dark" ? "\u2600" : "\u263E";
    });
  }

  function setupTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem(storageKey);
    } catch (error) {
      saved = null;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    applyTheme(initial);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = root.classList.contains("dark") ? "light" : "dark";
        try {
          localStorage.setItem(storageKey, next);
        } catch (error) {
          // Ignore storage write errors (e.g., privacy mode).
        }
        applyTheme(next);
      });
    });
  }

  function setupNav() {
    const currentPage = body.dataset.page;
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === currentPage) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("hidden");
        menuButton.setAttribute("aria-expanded", String(!isOpen));
      });

      mobileMenu.querySelectorAll("a").forEach((item) => {
        item.addEventListener("click", () => {
          mobileMenu.classList.add("hidden");
          menuButton.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  function setupReveal() {
    const targets = document.querySelectorAll("main section, main article, .hero-panel, .glass-card");
    targets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  function setupSmoothScrolling() {
    const samePageHashLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    samePageHashLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const target = id ? document.querySelector(id) : null;
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", id);
      });
    });
  }

  function setupThreeBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || !window.THREE) {
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const pointsCount = window.innerWidth < 768 ? 90 : 170;
    const positions = new Float32Array(pointsCount * 3);

    for (let i = 0; i < pointsCount * 3; i += 3) {
      const r = 11 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff6b6b,
      size: window.innerWidth < 768 ? 0.18 : 0.22,
      transparent: true,
      opacity: 0.65
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 52;

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener("mousemove", (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    const targetFps = 40;
    const minFrameTime = 1000 / targetFps;
    let lastFrame = 0;

    function animate(now = 0) {
      requestAnimationFrame(animate);
      if (now - lastFrame < minFrameTime) {
        return;
      }
      lastFrame = now;
      particles.rotation.y += 0.0015;
      particles.rotation.x += 0.0008;
      particles.position.x += (mouseX * 1.2 - particles.position.x) * 0.02;
      particles.position.y += (-mouseY * 1.2 - particles.position.y) * 0.02;
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
  }

  function setupPresenceMap() {
    const mapRoot = document.querySelector("[data-presence-map]");
    if (!mapRoot) {
      return;
    }

    const svg = mapRoot.querySelector(".presence-viz-svg");
    const tabsRoot = mapRoot.querySelector("[data-state-tabs]");
    const tooltip = mapRoot.querySelector("[data-map-tooltip]");
    if (!tabsRoot || !tooltip || !svg) {
      return;
    }

    const width = 1000;
    const height = 560;
    const states = [
      {
        id: "maharashtra",
        name: "Maharashtra",
        accent: "#fb7185",
        cities: [
          { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
          { name: "Wardha", lat: 20.7453, lon: 78.6022 },
          { name: "Chandrapur", lat: 19.9615, lon: 79.2961 },
          { name: "Brahmapuri", lat: 20.6115, lon: 79.8574 },
          { name: "Akola", lat: 20.7059, lon: 77.0219 },
          { name: "Gadchiroli", lat: 20.1849, lon: 80.003 },
          { name: "Gondia", lat: 21.4602, lon: 80.1961 },
          { name: "Yavatmal", lat: 20.3888, lon: 78.1204 },
          { name: "Washim", lat: 20.111, lon: 77.133 },
          { name: "Buldhana", lat: 20.5293, lon: 76.184 }
        ]
      },
      {
        id: "madhya-pradesh",
        name: "Madhya Pradesh",
        accent: "#38bdf8",
        cities: [
          { name: "Gwalior", lat: 26.2183, lon: 78.1828 },
          { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
          { name: "Satna", lat: 24.6005, lon: 80.8322 },
          { name: "Rewa", lat: 24.5362, lon: 81.3037 },
          { name: "Katni", lat: 23.8388, lon: 80.3949 },
          { name: "Guna", lat: 24.6348, lon: 77.3002 },
          { name: "Sagar", lat: 23.8388, lon: 78.7378 }
        ]
      },
      {
        id: "chhattisgarh",
        name: "Chhattisgarh",
        accent: "#22c55e",
        cities: [
          { name: "Raipur", lat: 21.2514, lon: 81.6296 },
          { name: "Bilaspur", lat: 22.0797, lon: 82.1409 }
        ]
      }
    ];

    function createSvgElement(tag, attrs = {}) {
      const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      return node;
    }

    function buildStateChips() {
      tabsRoot.innerHTML = "";
      states.forEach((state) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "map-state-chip";
        chip.dataset.state = state.id;
        chip.style.setProperty("--state-accent", state.accent);
        chip.innerHTML = `${state.name} <span>${state.cities.length} cities</span>`;
        chip.addEventListener("click", () => highlightState(state.id));
        tabsRoot.appendChild(chip);
      });
    }

    function highlightState(stateId) {
      svg.querySelectorAll("[data-state]").forEach((node) => {
        const active = node.getAttribute("data-state") === stateId;
        node.classList.toggle("is-dimmed", !active);
      });
      tabsRoot.querySelectorAll(".map-state-chip").forEach((chip) => {
        chip.classList.toggle("is-active", chip.dataset.state === stateId);
      });
    }

    function clearHighlight() {
      svg.querySelectorAll("[data-state]").forEach((node) => node.classList.remove("is-dimmed"));
      tabsRoot.querySelectorAll(".map-state-chip").forEach((chip) => chip.classList.remove("is-active"));
    }

    function renderMarkers() {
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.innerHTML = "";

      const centers = [
        { id: "maharashtra", x: 260, y: 290 },
        { id: "madhya-pradesh", x: 500, y: 210 },
        { id: "chhattisgarh", x: 740, y: 320 }
      ];

      const centerMap = Object.fromEntries(centers.map((c) => [c.id, c]));

      states.forEach((state, index) => {
        const center = centerMap[state.id];
        const group = createSvgElement("g", { class: "state-group" });
        group.setAttribute("data-state", state.id);
        svg.appendChild(group);

        const orbitGroup = createSvgElement("g", {
          class: `state-orbit ${index % 2 === 0 ? "is-fast" : "is-slow"}`
        });
        orbitGroup.setAttribute("data-state", state.id);
        orbitGroup.style.transformOrigin = `${center.x}px ${center.y}px`;

        const rings = [58, 88];
        rings.forEach((radius) => {
          const ring = createSvgElement("circle", {
            class: "orbit-track",
            cx: center.x,
            cy: center.y,
            r: radius
          });
          orbitGroup.appendChild(ring);
        });

        const core = createSvgElement("circle", {
          class: "state-core",
          cx: center.x,
          cy: center.y,
          r: 36
        });
        core.style.fill = state.accent;
        group.appendChild(core);

        const coreRing = createSvgElement("circle", {
          class: "state-core-ring",
          cx: center.x,
          cy: center.y,
          r: 48
        });
        group.appendChild(coreRing);

        const label = createSvgElement("text", {
          class: "state-label",
          x: center.x,
          y: center.y + 6,
          "text-anchor": "middle"
        });
        label.textContent = state.name;
        group.appendChild(label);

        const count = createSvgElement("text", {
          class: "state-count",
          x: center.x,
          y: center.y + 26,
          "text-anchor": "middle"
        });
        count.textContent = `${state.cities.length} cities`;
        group.appendChild(count);

        const markerNodes = [];
        state.cities.forEach((city, i) => {
          const ring = rings[i % rings.length];
          const angle = (i / state.cities.length) * Math.PI * 2;
          const x = center.x + Math.cos(angle) * ring;
          const y = center.y + Math.sin(angle) * ring;

          const dotGroup = createSvgElement("g", {
            class: "city-dot",
            "data-city": city.name,
            "data-state": state.id,
            transform: `translate(${x},${y})`
          });

          const glow = createSvgElement("circle", {
            class: "city-glow",
            r: 9
          });
          glow.style.fill = state.accent;

          const dot = createSvgElement("circle", {
            r: 4.5
          });
          dot.style.fill = "#0f172a";
          dot.style.stroke = state.accent;
          dot.style.strokeWidth = "2.5";

          dotGroup.appendChild(glow);
          dotGroup.appendChild(dot);
          orbitGroup.appendChild(dotGroup);
          markerNodes.push({ node: dotGroup, city: city.name, state: state.name });
        });

        group.appendChild(orbitGroup);

        markerNodes.forEach((marker) => {
          marker.node.addEventListener("mouseenter", (event) => {
            showTooltip(event, `${marker.city}, ${marker.state}`);
            highlightState(state.id);
          });
          marker.node.addEventListener("mousemove", moveTooltip);
          marker.node.addEventListener("mouseleave", () => {
            hideTooltip();
            clearHighlight();
          });
        });
      });
    }

    function showTooltip(event, text) {
      tooltip.textContent = text;
      tooltip.classList.add("is-visible");
      moveTooltip(event);
    }

    function moveTooltip(event) {
      const canvasRect = mapRoot.querySelector(".presence-map-canvas").getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const rawLeft = event.clientX - canvasRect.left + 14;
      const rawTop = event.clientY - canvasRect.top - 18;
      const maxLeft = canvasRect.width - tooltipRect.width - 10;
      const left = Math.max(10, Math.min(rawLeft, maxLeft));
      const top = Math.max(10, rawTop);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    }

    function hideTooltip() {
      tooltip.classList.remove("is-visible");
    }

    renderMarkers();
    buildStateChips();
    if (states[0]) {
      highlightState(states[0].id);
    }
  }

  function setupAboutEnhancements() {
    if (body.dataset.page !== "about") {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const counters = [...document.querySelectorAll("[data-counter]")];
    if (counters.length) {
      const runCounter = (node) => {
        const raw = node.getAttribute("data-counter") || "0";
        const end = Number(raw);
        if (!Number.isFinite(end)) {
          return;
        }

        const suffix = /\+/.test(node.textContent || "") ? "+" : "";
        const duration = 1200;
        const start = performance.now();

        function frame(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(end * eased);
          node.textContent = `${value}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(frame);
          }
        }

        requestAnimationFrame(frame);
      };

      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }
            runCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.45 }
      );

      counters.forEach((counter) => counterObserver.observe(counter));
    }

    if (!reducedMotion) {
      const tiltCards = [...document.querySelectorAll("[data-tilt]")];
      tiltCards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
          const rect = card.getBoundingClientRect();
          const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
          card.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-2px)`;
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
    }

    const aboutCanvas = document.getElementById("about-scene-canvas");
    if (!aboutCanvas || !window.THREE || reducedMotion) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 2, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas: aboutCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const shell = aboutCanvas.parentElement;
    function resizeAboutCanvas() {
      const width = aboutCanvas.clientWidth || shell.clientWidth;
      const height = aboutCanvas.clientHeight || 112;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    resizeAboutCanvas();

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xfb7185, 1.45, 30);
    keyLight.position.set(2.6, 2.2, 3.8);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 1.15, 26);
    fillLight.position.set(-3.2, -2.4, 4.2);
    scene.add(fillLight);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.72, 0.24, 180, 28),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.35,
        roughness: 0.25,
        emissive: 0x1e293b,
        emissiveIntensity: 0.22
      })
    );
    scene.add(knot);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.045, 22, 120),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = 1.2;
    scene.add(ring);

    camera.position.z = 4.4;

    const targetAboutFps = 42;
    const minAboutFrameTime = 1000 / targetAboutFps;
    let lastAboutFrame = 0;

    function animateAboutScene(now = 0) {
      requestAnimationFrame(animateAboutScene);
      if (now - lastAboutFrame < minAboutFrameTime) {
        return;
      }
      lastAboutFrame = now;
      knot.rotation.x += 0.007;
      knot.rotation.y += 0.009;
      ring.rotation.z -= 0.005;
      renderer.render(scene, camera);
    }

    animateAboutScene();
    window.addEventListener("resize", resizeAboutCanvas);
  }

  function wireFlipCards(scope = document) {
    const flipCards = [...scope.querySelectorAll("[data-flip]")];
    const updateAria = (card, isFlipped) => {
      card.setAttribute("aria-pressed", String(isFlipped));
    };

    flipCards.forEach((card) => {
      if (card.dataset.flipReady) {
        return;
      }
      card.dataset.flipReady = "true";
      updateAria(card, false);

      const toggle = () => {
        const next = !card.classList.contains("is-flipped");
        if (next) {
          document.querySelectorAll("[data-flip].is-flipped").forEach((openCard) => {
            if (openCard === card) {
              return;
            }
            openCard.classList.remove("is-flipped");
            updateAria(openCard, false);
          });
        }
        card.classList.toggle("is-flipped", next);
        updateAria(card, next);
      };

      card.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) {
          return;
        }
        toggle();
      });

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });

    if (!scope.querySelector("[data-flip]")) {
      return;
    }

    if (document.documentElement.dataset.flipOutsideReady) {
      return;
    }
    document.documentElement.dataset.flipOutsideReady = "true";

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest("[data-flip]")) {
        return;
      }
      const flipped = [...document.querySelectorAll("[data-flip].is-flipped")];
      if (!flipped.length) {
        return;
      }
      flipped.forEach((card) => {
        card.classList.remove("is-flipped");
        updateAria(card, false);
      });
      const focusSection = document.getElementById("Middle");
      if (focusSection) {
        focusSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function setupBusinessEnhancements() {
    if (body.dataset.page !== "business") {
      return;
    }
    wireFlipCards();
  }

  function setupNewsroomData() {
    if (body.dataset.page !== "newsroom") {
      return;
    }

    const grid = document.querySelector("[data-news-grid]");
    if (!grid) {
      return;
    }

    const apiBase = getApiBase();
    const countNodes = {
      total: document.querySelector("[data-news-count=\"total\"]"),
      conference: document.querySelector("[data-news-count=\"conference\"]"),
      markets: document.querySelector("[data-news-count=\"markets\"]")
    };

    const formatDate = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleDateString("en-IN", { year: "numeric", month: "long" });
    };

    let conferenceAssigned = false;
    let storyAssigned = false;

    const renderCard = (item) => {
      const category = String(item.category || "").toLowerCase();
      let id = "";
      if (!conferenceAssigned && category.includes("conference")) {
        id = "Medical-Conferences";
        conferenceAssigned = true;
      } else if (!storyAssigned && (category.includes("milestone") || category.includes("story") || /anniversary/i.test(item.title || ""))) {
        id = "Stories";
        storyAssigned = true;
      }
      return `
        <article ${id ? `id="${id}"` : ""} class="glass-card overflow-hidden !p-0">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" class="h-56 w-full object-cover">` : ""}
          <div class="p-5">
            <h2 class="text-xl font-semibold">${item.title}</h2>
            <p class="muted mt-2 text-sm">${item.summary}</p>
            <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">Updated ${formatDate(item.publishedAt)}</p>
          </div>
        </article>
      `;
    };

    const setCounts = (items) => {
      if (countNodes.total) {
        countNodes.total.textContent = String(items.length);
      }
      if (countNodes.conference) {
        const conferenceCount = items.filter((item) =>
          String(item.category || "").toLowerCase().includes("conference")
        ).length;
        countNodes.conference.textContent = String(conferenceCount);
      }
      if (countNodes.markets) {
        countNodes.markets.textContent = "12+";
      }
    };

    const setError = () => {
      grid.innerHTML = `
        <article class="glass-card">
          <h2 class="text-xl font-semibold">Unable to load updates</h2>
          <p class="muted mt-2 text-sm">Please try again later.</p>
        </article>
      `;
    };

    fetch(`${apiBase}/news`)
      .then((response) => response.json())
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        if (items.length === 0) {
          setError();
          return;
        }
        setCounts(items);
        grid.innerHTML = items.map(renderCard).join("");
        wireFlipCards(grid);
      })
      .catch(() => setError());
  }

  function setupBusinessData() {
    if (body.dataset.page !== "business") {
      return;
    }

    const grid = document.querySelector("[data-focus-grid]");
    if (!grid) {
      return;
    }

    const apiBase = getApiBase();
    const fallbackItems = [
      {
        title: "Cardiology & Critical Care",
        subtitle: "Heart health therapies trusted by specialists.",
        imageUrl: "Images/Business-Medicine.jpg",
        medicines: ["Cardiovate", "Vasotone", "Clopimax", "Statrive"]
      },
      {
        title: "Gynecology & Women’s Health",
        subtitle: "End-to-end care for every life stage.",
        imageUrl: "Images/Gyn.jpg",
        medicines: ["Gynova", "Ovacare", "Ferrovia", "PregoCal"]
      },
      {
        title: "Neurology & Pain",
        subtitle: "Targeted relief for nerve and pain management.",
        imageUrl: "Images/NP.jpg",
        medicines: ["Neurogain", "Nervax", "Painlax", "Migraease"]
      },
      {
        title: "Orthopedics & Bone",
        subtitle: "Mobility-first formulations for active recovery.",
        imageUrl: "Images/OR.jpg",
        medicines: ["OrthoFlex", "CalciRise", "D3Max", "Jointiva"]
      },
      {
        title: "Pediatrics",
        subtitle: "Gentle, precise formulations for young patients.",
        imageUrl: "Images/Pediatrics.jpg",
        medicines: ["PediaSure", "CoughEase Jr.", "Immuniva", "Zincare"]
      },
      {
        title: "Respiratory & Allergy",
        subtitle: "Breathe-easy solutions for daily comfort.",
        imageUrl: "Images/O.jpg",
        medicines: ["RespiraX", "AirRelief", "Allerstat", "Bronchol"]
      }
    ];

    const normalizeItems = (items = []) =>
      items.map((item, index) => {
        const fallback = fallbackItems[index % fallbackItems.length];
        return {
          title: item?.title || fallback.title,
          subtitle: item?.subtitle || fallback.subtitle,
          imageUrl: item?.imageUrl || fallback.imageUrl,
          medicines: Array.isArray(item?.medicines) && item.medicines.length ? item.medicines : fallback.medicines
        };
      });

    const renderCard = (item) => `
      <article class="focus-flip-card" data-flip tabindex="0" role="button" aria-pressed="false">
        <div class="focus-flip-inner">
          <div class="focus-flip-front">
            <img src="${item.imageUrl}" alt="${item.title}" class="focus-flip-image">
            <div class="focus-front-overlay">
              <h3>${item.title}</h3>
              <p>${item.subtitle}</p>
              <span class="focus-product">Products: ${(item.medicines || []).slice(0, 2).join(" • ")}</span>
              <span class="focus-tap">Flip to view medicines</span>
            </div>
          </div>
          <div class="focus-flip-back">
            <h3>${item.title}</h3>
            <p class="focus-subtitle">Key medicines</p>
            <div class="focus-med-tags">
              ${(item.medicines || []).map((med) => `<span>${med}</span>`).join("")}
            </div>
          </div>
        </div>
      </article>
    `;

    const setError = () => {
      const normalized = normalizeItems(fallbackItems);
      grid.innerHTML = normalized.map(renderCard).join("");
      wireFlipCards(grid);
    };

    fetch(`${apiBase}/business/focus-areas`)
      .then((response) => response.json())
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        const normalized = items.length ? normalizeItems(items) : normalizeItems(fallbackItems);
        grid.innerHTML = normalized.map(renderCard).join("");
        wireFlipCards(grid);
      })
      .catch(() => setError());
  }

  function setupContactForm() {
    const form = document.querySelector("[data-contact-form]");
    const toastStack = document.querySelector(".toast-stack");
    if (!form || !toastStack) {
      return;
    }

    const showToast = (type, title, message) => {
      const toast = document.createElement("div");
      toast.className = `toast ${type === "error" ? "is-error" : "is-success"}`;

      const content = document.createElement("div");
      const heading = document.createElement("p");
      heading.className = "toast-title";
      heading.textContent = title;
      const bodyText = document.createElement("p");
      bodyText.className = "toast-message";
      bodyText.textContent = message;
      content.appendChild(heading);
      content.appendChild(bodyText);

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "toast-close";
      closeBtn.textContent = "×";
      closeBtn.setAttribute("aria-label", "Dismiss notification");
      closeBtn.addEventListener("click", () => toast.remove());

      toast.appendChild(content);
      toast.appendChild(closeBtn);
      toastStack.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 4800);
    };

    const submitButton = form.querySelector("button[type=\"submit\"]");
    const originalLabel = submitButton ? submitButton.textContent : "";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const apiBase = getApiBase();

      try {
        const response = await fetch(`${apiBase}/forms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Submission failed");
        }

        form.reset();
        showToast("success", "Message sent", "Thanks for reaching out. We'll respond within 1-2 business days.");
      } catch (error) {
        showToast("error", "Submission failed", "Please try again or email us directly at Soulpharmangp@gmail.com.");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });
  }

  function setupAuth() {
    if (body.dataset.page !== "auth") {
      return;
    }

    const switcher = document.querySelector("[data-auth-switch]");
    const tabs = switcher ? [...switcher.querySelectorAll("[data-auth-target]")] : [];
    const indicator = switcher ? switcher.querySelector(".auth-indicator") : null;
    const views = [...document.querySelectorAll("[data-auth-view]")];
    const otpWrap = document.querySelector("[data-otp]");
    const otpTimer = document.querySelector("[data-otp-timer]");
    const otpResend = document.querySelector("[data-otp-resend]");
    const authPanel = document.querySelector(".auth-panel");

    let timerId = null;
    let remaining = 59;
    let otpContext = null;

    const API_BASE = getApiBase();
    let feedback = document.querySelector("[data-auth-feedback]");
    if (!feedback && authPanel) {
      feedback = document.createElement("p");
      feedback.dataset.authFeedback = "";
      feedback.className = "muted text-sm";
      authPanel.prepend(feedback);
    }

    const setFeedback = (message, isError = false) => {
      if (!feedback) {
        if (message) {
          window.alert(message);
        }
        return;
      }
      feedback.textContent = message || "";
      feedback.classList.toggle("is-error", isError);
    };

    const request = async (path, payload) => {
      const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }
      return data;
    };

    const updateIndicator = (activeId) => {
      if (!switcher || !indicator) {
        return;
      }
      const activeTab = tabs.find((tab) => tab.dataset.authTarget === activeId);
      if (!activeTab) {
        switcher.classList.add("is-hidden");
        return;
      }
      switcher.classList.remove("is-hidden");
      const offset = activeTab.offsetLeft;
      const width = activeTab.offsetWidth;
      indicator.style.transform = `translateX(${offset}px)`;
      indicator.style.width = `${width}px`;
      tabs.forEach((tab) => tab.classList.toggle("is-active", tab === activeTab));
    };

    const setView = (id) => {
      views.forEach((view) => {
        const isActive = view.dataset.authView === id;
        view.classList.toggle("is-active", isActive);
        view.setAttribute("aria-hidden", String(!isActive));
      });
      updateIndicator(id);
    };

    const startTimer = () => {
      if (!otpTimer) {
        return;
      }
      remaining = 59;
      otpTimer.textContent = "Resend in 00:59";
      if (timerId) {
        window.clearInterval(timerId);
      }
      timerId = window.setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        const secs = String(remaining).padStart(2, "0");
        otpTimer.textContent = `Resend in 00:${secs}`;
        if (remaining === 0) {
          window.clearInterval(timerId);
        }
      }, 1000);
    };

    document.querySelectorAll("[data-auth-target]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget.dataset.authTarget;
        if (!target) {
          return;
        }
        setView(target);
        if (target === "otp") {
          startTimer();
        }
      });
    });

    const loginForm = document.querySelector("[data-auth-form=\"login\"]");
    const signupForm = document.querySelector("[data-auth-form=\"signup\"]");
    const forgotForm = document.querySelector("[data-auth-form=\"forgot\"]");
    const otpForm = document.querySelector("[data-auth-form=\"otp\"]");
    const resetForm = document.querySelector("[data-auth-form=\"reset\"]");

    const getOtpCode = () => {
      if (!otpWrap) {
        return "";
      }
      return [...otpWrap.querySelectorAll("input")].map((input) => input.value).join("");
    };

    const setLoading = (form, isLoading, label) => {
      if (!form) {
        return;
      }
      const button = form.querySelector("button[type=\"submit\"]");
      if (!button) {
        return;
      }
      if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = label || "Please wait...";
        button.disabled = true;
      } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
      }
    };

    const sendOtp = async (email, purpose) => {
      await request("/auth/request-otp", { email, purpose });
      setView("otp");
      startTimer();
    };

    if (localStorage.getItem("soul-employee-token")) {
      window.location.href = "employee-dashboard.html";
      return;
    }

    if (loginForm) {
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFeedback("");
        const email = loginForm.querySelector("input[type=\"email\"]")?.value?.trim();
        const password = loginForm.querySelector("input[type=\"password\"]")?.value || "";
        if (!email || !password) {
          setFeedback("Please enter email and password.", true);
          return;
        }

        try {
          setLoading(loginForm, true, "Logging in...");
          const data = await request("/employee/login", { email, password });
          if (data?.token) {
            localStorage.setItem("soul-employee-token", data.token);
          }
          window.location.href = "employee-dashboard.html";
        } catch (error) {
          setFeedback(error.message, true);
        } finally {
          setLoading(loginForm, false);
        }
      });
    }

    if (signupForm) {
      signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFeedback("");
        const name = signupForm.querySelector("[name=\"name\"]")?.value?.trim();
        const email = signupForm.querySelector("[name=\"email\"]")?.value?.trim();
        const phone = signupForm.querySelector("[name=\"phone\"]")?.value?.trim();
        const empCode = signupForm.querySelector("[name=\"empCode\"]")?.value || "";
        const password = signupForm.querySelector("[name=\"password\"]")?.value || "";
        const termsChecked = signupForm.querySelector("[name=\"terms\"]")?.checked;
        const missing = [];
        if (!name) missing.push("Full name");
        if (!email) missing.push("Email");
        if (!empCode) missing.push("Employee access code");
        if (!password) missing.push("Password");
        if (!termsChecked) missing.push("Terms & Privacy consent");
        if (missing.length) {
          setFeedback(`Missing: ${missing.join(", ")}.`, true);
          return;
        }

        try {
          setLoading(signupForm, true, "Sending OTP...");
          otpContext = { action: "employee-signup", name, email, phone, password, empCode };
          await sendOtp(email, "signup");
          setFeedback("OTP sent to your email.");
        } catch (error) {
          setFeedback(error.message, true);
        } finally {
          setLoading(signupForm, false);
        }
      });
    }

    if (forgotForm) {
      forgotForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFeedback("");
        const email = forgotForm.querySelector("input[type=\"email\"]")?.value?.trim();
        if (!email) {
          setFeedback("Please enter your email.", true);
          return;
        }

        try {
          setLoading(forgotForm, true, "Sending OTP...");
          otpContext = { action: "reset", email };
          await sendOtp(email, "reset");
          setFeedback("OTP sent to your email.");
        } catch (error) {
          setFeedback(error.message, true);
        } finally {
          setLoading(forgotForm, false);
        }
      });
    }

    if (otpForm) {
      otpForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFeedback("");
        const code = getOtpCode();
        if (!otpContext || !code || code.length !== 6) {
          setFeedback("Please enter the 6-digit OTP.", true);
          return;
        }

        try {
          setLoading(otpForm, true, "Verifying...");
          if (otpContext.action === "reset") {
            otpContext.code = code;
            setView("reset");
            setFeedback("Enter your new password.");
          } else if (otpContext.action === "employee-signup") {
            const data = await request("/employee/signup", {
              name: otpContext.name,
              email: otpContext.email,
              phone: otpContext.phone,
              password: otpContext.password,
              otp: code,
              empCode: otpContext.empCode
            });
            if (data?.token) {
              localStorage.setItem("soul-employee-token", data.token);
            }
            setView("login");
            setFeedback("Signup complete. Please login.");
          } else if (otpContext.action === "employee-login") {
            const data = await request("/employee/login", {
              email: otpContext.email,
              password: otpContext.password,
              otp: code
            });
            if (data?.token) {
              localStorage.setItem("soul-employee-token", data.token);
            }
            window.location.href = "employee-dashboard.html";
          }
        } catch (error) {
          setFeedback(error.message, true);
        } finally {
          setLoading(otpForm, false);
        }
      });
    }

    if (resetForm) {
      resetForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFeedback("");
        const inputs = resetForm.querySelectorAll("input[type=\"password\"]");
        const newPassword = inputs[0]?.value || "";
        const confirmPassword = inputs[1]?.value || "";
        if (!newPassword || newPassword !== confirmPassword) {
          setFeedback("Passwords do not match.", true);
          return;
        }
        if (!otpContext?.email || !otpContext?.code) {
          setFeedback("OTP verification required.", true);
          return;
        }

        try {
          setLoading(resetForm, true, "Updating...");
          await request("/auth/reset-password", {
            email: otpContext.email,
            code: otpContext.code,
            newPassword
          });
          setView("login");
          setFeedback("Password updated. Please login.");
        } catch (error) {
          setFeedback(error.message, true);
        } finally {
          setLoading(resetForm, false);
        }
      });
    }

    document.querySelectorAll("[data-toggle-password]").forEach((button) => {
      button.addEventListener("click", () => {
        const wrapper = button.closest(".auth-password-field");
        const input = wrapper ? wrapper.querySelector("input") : null;
        if (!input) {
          return;
        }
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        const icon = button.querySelector("i");
        if (icon) {
          icon.className = isPassword ? "fa fa-eye-slash" : "fa fa-eye";
        }
      });
    });

    if (otpWrap) {
      const inputs = [...otpWrap.querySelectorAll("input")];
      inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
          input.value = input.value.replace(/[^0-9]/g, "");
          if (input.value && inputs[index + 1]) {
            inputs[index + 1].focus();
          }
        });
        input.addEventListener("keydown", (event) => {
          if (event.key === "Backspace" && !input.value && inputs[index - 1]) {
            inputs[index - 1].focus();
          }
        });
      });
    }

    if (otpResend) {
      otpResend.addEventListener("click", async () => {
        if (!otpContext?.email) {
          return;
        }
        try {
          setFeedback("");
          const purpose =
            otpContext.action === "reset"
              ? "reset"
              : otpContext.action === "employee-signup"
                ? "signup"
                : "login";
          await sendOtp(otpContext.email, purpose);
          setFeedback("OTP resent.");
        } catch (error) {
          setFeedback(error.message, true);
        }
      });
    }

    updateIndicator("login");
  }

  setupTheme();
  setupNav();
  setupSmoothScrolling();
  setupReveal();
  setupThreeBackground();
  setupPresenceMap();
  setupAuth();
  setupAboutEnhancements();
  setupBusinessEnhancements();
  setupNewsroomData();
  setupBusinessData();
  setupContactForm();
})();


