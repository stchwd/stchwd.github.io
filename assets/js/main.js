(function () {
  "use strict";
  const W = window.WEDDING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------------- Bind config text ---------------- */
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), W);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const extras = {
    bride: W.couple.bride,
    groom: W.couple.groom,
    groomAcc: W.couple.groomAcc || W.couple.groom.replace(/ς$/, ""),
    brideAcc: W.couple.brideAcc || W.couple.bride,
    initials: `${W.couple.groom[0]}&${W.couple.bride[0]}`,
  };
  $$("[data-bind]").forEach((el) => {
    const key = el.dataset.bind;
    const val = key in extras ? extras[key] : get(key);
    if (val != null) el.textContent = val;
  });
  $(".nav__logo span").innerHTML =
    `${esc(W.couple.groom[0])}<svg class="ico ico--heart" aria-hidden="true"><use href="#i-heart"/></svg>${esc(W.couple.bride[0])}`;

  const fmtPhone = (p) => p.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  const telIcon = '<svg class="ico ico--tel" aria-hidden="true"><use href="#i-phone"/></svg>';
  $$(".phones").forEach((el) => {
    const ico = el.closest("#rsvp") ? telIcon : "";
    el.innerHTML = (W.phones || []).map((p) => `<a href="tel:+30${p}">${ico}${fmtPhone(p)}</a>`).join(" ή\u00A0");
  });
  const fillList = (id, arr) => { const ul = $(id); if (ul) ul.innerHTML = (arr || []).map((x) => `<li>${esc(x)}</li>`).join(""); };

  // Split hero names into letters for the entrance animation
  let ci = 0;
  $$(".split").forEach((el) => {
    el.setAttribute("aria-label", el.textContent);
    el.innerHTML = [...el.textContent].map((ch) => `<span class="ch" aria-hidden="true" style="--i:${ci++ + (el.previousElementSibling ? 4 : 0)}">${ch}</span>`).join("");
  });

  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  fillList("#families", W.families);
  fillList("#koumbaroi", W.koumbaroi);

  /* ---------------- Petals (canvas confetti) ---------------- */
  const Petals = (() => {
    const c = $("#petals");
    if (!c || reduceMotion) return { burst() {} };
    const ctx = c.getContext("2d");
    const colors = ["#c4623f", "#e08a63", "#e3a857", "#6b7a4b", "#f2e3cf", "#9c4529", "#f0b48c"];
    let parts = [], raf = null, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    };
    addEventListener("resize", resize);
    resize();
    function burst(n = 110, at) {
      n = Math.round(n * Math.min(1, Math.max(0.45, innerWidth / 1000)));
      for (let i = 0; i < n; i++) {
        const fromPoint = !!at;
        parts.push({
          x: fromPoint ? at.x : Math.random() * innerWidth,
          y: fromPoint ? at.y : -20 - Math.random() * innerHeight * 0.7,
          vx: fromPoint ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 1.2,
          vy: fromPoint ? -Math.random() * 11 - 3 : Math.random() * 1.2 + 0.8,
          r: Math.random() * 5 + 5,
          rot: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.12,
          sway: Math.random() * 6.28,
          color: colors[(Math.random() * colors.length) | 0],
          leaf: Math.random() < 0.3,
        });
      }
      if (!raf) raf = requestAnimationFrame(step);
    }
    function step() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.y < innerHeight + 40);
      for (const p of parts) {
        p.sway += 0.035;
        p.vy = Math.min(p.vy + 0.14, 3.4);
        p.vx *= 0.98;
        p.x += p.vx + Math.sin(p.sway) * 0.9;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.abs(Math.cos(p.sway)) * 0.6 + 0.4);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        if (p.leaf) ctx.ellipse(0, 0, p.r * 1.5, p.r * 0.45, 0, 0, Math.PI * 2);
        else {
          ctx.moveTo(0, -p.r);
          ctx.quadraticCurveTo(p.r * 1.1, 0, 0, p.r);
          ctx.quadraticCurveTo(-p.r * 1.1, 0, 0, -p.r);
        }
        ctx.fill();
        ctx.restore();
      }
      if (parts.length) raf = requestAnimationFrame(step);
      else { ctx.clearRect(0, 0, innerWidth, innerHeight); raf = null; }
    }
    return { burst };
  })();

  /* ---------------- Intro (envelope) ---------------- */
  const hero = $("#hero");
  const intro = $("#intro");
  const env = $("#envelope");
  const startHero = () => requestAnimationFrame(() => hero.classList.add("is-in"));

  if (document.body.classList.contains("intro-active")) {
    let opened = false, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
      intro.classList.add("is-leaving");
      startHero();
      setTimeout(() => Petals.burst(120), 250);
      setTimeout(() => document.body.classList.remove("intro-active"), 950);
    };
    const open = () => {
      if (opened) return;
      opened = true;
      intro.classList.add("is-opening");
      env.classList.add("is-open");
      setTimeout(() => env.classList.add("is-flap-back"), 650);
      setTimeout(() => env.classList.add("is-letter"), 700);
      setTimeout(finish, 2700);
    };
    env.addEventListener("click", open);
    $("#intro-open").addEventListener("click", open);
    $("#intro-skip").addEventListener("click", finish);
    document.addEventListener("keydown", (e) => {
      if (finished) return;
      if (e.key === "Escape") finish();
    });
    setTimeout(() => $("#seal").focus({ preventScroll: true }), 50);
  } else {
    startHero();
  }

  /* ---------------- Hero sunset on scroll & scroll progress ---------------- */
  const progress = $("#progress");
  let ticking = false;
  function onScrollFx() {
    ticking = false;
    const h = hero.offsetHeight || 1;
    const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.8)));
    hero.style.setProperty("--p", p.toFixed(3));
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty("--s", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
  onScrollFx();

  /* ---------------- Nav ---------------- */
  const nav = $("#nav");
  const toggle = $(".nav__toggle");
  const links = $("#nav-links");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    links.classList.toggle("is-open", !open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
    }
  });

  /* ---------------- Reveal on scroll ---------------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      }),
      // Όχι threshold: ένα πολύ ψηλό μπλοκ (π.χ. ο οδηγός με τις 23 κάρτες)
      // δεν χωράει ποτέ κατά 12% στην οθόνη του κινητού και δεν θα εμφανιζόταν.
      { rootMargin: "0px 0px -12% 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- Countdown ---------------- */
  const target = new Date(W.date).getTime();
  const cd = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  function tick() {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    cd.d.textContent = d;
    cd.h.textContent = String(h).padStart(2, "0");
    cd.m.textContent = String(m).padStart(2, "0");
    cd.s.textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------- Add to calendar (.ics) ---------------- */
  $("#add-to-calendar").addEventListener("click", () => {
    const start = new Date(W.date);
    const end = new Date(start.getTime() + 8 * 36e5);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wedding//el", "BEGIN:VEVENT",
      `UID:${fmt(start)}@wedding`, `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:Γάμος ${W.couple.groom} & ${W.couple.bride}`,
      `LOCATION:${W.ceremony.name}\\, ${W.ceremony.address}`,
      `DESCRIPTION:Μυστήριο ${W.ceremony.time} · Δεξίωση ${W.reception.time} (${W.reception.name})`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "gamos-chania.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------------- Map helpers ---------------- */
  const hasLeaflet = typeof L !== "undefined";
  const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const ico = (name) => `<svg class="ico" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const pin = (cls, icon) => {
    const big = cls.includes("venue");
    const w = big ? 46 : 36;
    const h = w + 9; // + pointer
    return L.divIcon({
      className: "pin-wrap",
      html: `<div class="pin ${cls}">${ico(icon)}</div>`,
      iconSize: [w, h],
      iconAnchor: [w / 2, h],
      popupAnchor: [0, -h + 4],
    });
  };
  const meIcon = () => L.divIcon({ className: "pin-wrap", html: '<div class="me-dot"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
  const makeMap = (id, opts) => {
    const m = L.map(id, Object.assign({ scrollWheelZoom: false, zoomControl: true }, opts));
    L.tileLayer(TILES, { attribution: ATTR, maxZoom: 19 }).addTo(m);
    // Enable scroll zoom only after the user clicks the map (avoids scroll hijacking)
    m.on("click focus", () => m.scrollWheelZoom.enable());
    m.getContainer().addEventListener("mouseleave", () => m.scrollWheelZoom.disable());
    return m;
  };
  const gmapsDir = (dest, origin) => {
    const p = new URLSearchParams({ api: "1", destination: `${dest.lat},${dest.lng}`, travelmode: "driving" });
    if (origin) p.set("origin", `${origin.lat},${origin.lng}`);
    return `https://www.google.com/maps/dir/?${p}`;
  };

  /* ---------------- Directions map ---------------- */
  const venues = { ceremony: W.ceremony, reception: W.reception };
  let dirMap, routeLayer, originMarker;
  const currentDest = "ceremony"; // η δεξίωση είναι ~250 μ. δίπλα
  let currentOrigin = null;

  const routeInfo = $("#route-info");
  const routeMsg = $("#route-msg");
  const gmapsLink = $("#gmaps-link");

  const venuePopup = (v) =>
    `<strong>${esc(v.title)}</strong>${esc(v.name)}<br>${esc(v.time)} · ${esc(v.address)}<br><a href="${gmapsDir(v)}" target="_blank" rel="noopener">Οδηγίες στο Google Maps →</a>`;

  function initDirections() {
    if (!hasLeaflet) { $("#directions-map").textContent = "Ο χάρτης δεν φόρτωσε."; return; }
    dirMap = makeMap("directions-map");

    // Από μακριά: ένα κοινό pin. Από κοντά (zoom ≥ 15): εκκλησία και δεξίωση χωριστά.
    const mid = [(W.ceremony.lat + W.reception.lat) / 2, (W.ceremony.lng + W.reception.lng) / 2];
    const combined = L.marker(mid, { icon: pin("pin--venue", "heart"), zIndexOffset: 1000 }).bindPopup(
      `<strong>Ο γάμος μας</strong>${esc(W.ceremony.time)} · ${esc(W.ceremony.name)}<br>${esc(W.reception.time)} · ${esc(W.reception.name)}<br><small>~250 μ. μεταξύ τους</small><br><a href="${gmapsDir(W.ceremony)}" target="_blank" rel="noopener">Οδηγίες στο Google Maps →</a>`
    );
    const vMarkers = {
      ceremony: L.marker([W.ceremony.lat, W.ceremony.lng], { icon: pin("pin--venue", "church"), zIndexOffset: 1000 }).bindPopup(venuePopup(W.ceremony)),
      reception: L.marker([W.reception.lat, W.reception.lng], { icon: pin("pin--venue pin--venue-alt", "glass"), zIndexOffset: 1000 }).bindPopup(venuePopup(W.reception)),
    };
    const syncVenues = () => {
      const close = dirMap.getZoom() >= 15;
      if (close) { dirMap.removeLayer(combined); vMarkers.ceremony.addTo(dirMap); vMarkers.reception.addTo(dirMap); }
      else { vMarkers.ceremony.remove(); vMarkers.reception.remove(); combined.addTo(dirMap); }
    };

    W.origins.forEach((o) => {
      L.marker([o.lat, o.lng], { icon: pin("pin--origin", o.icon) }).addTo(dirMap).bindPopup(`<strong>${esc(o.label)}</strong>`);
    });
    const all = [mid, ...W.origins.map((p) => [p.lat, p.lng])];
    dirMap.fitBounds(all, { padding: [50, 50] });
    syncVenues();
    dirMap.on("zoomend", syncVenues);

    // Origin buttons
    const wrap = $("#origins");
    W.origins.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "origin";
      b.dataset.origin = o.id;
      b.innerHTML = `<span class="origin__icon">${ico(o.icon)}</span> Από ${esc(o.label)}`;
      b.addEventListener("click", () => selectOrigin(o, b));
      wrap.appendChild(b);
    });

    $("#from-me").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (!navigator.geolocation) { routeMsg.textContent = "Ο browser σας δεν υποστηρίζει εντοπισμό θέσης."; return; }
      routeMsg.textContent = "Εντοπίζουμε τη θέση σας…";
      navigator.geolocation.getCurrentPosition(
        (pos) => selectOrigin({ id: "me", label: "Η θέση μου", lat: pos.coords.latitude, lng: pos.coords.longitude }, btn),
        () => { routeMsg.textContent = "Δεν μπορέσαμε να βρούμε τη θέση σας. Δοκιμάστε ένα από τα παραπάνω σημεία."; },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

    const focusVenue = (key) => {
      dirMap.flyTo([venues[key].lat, venues[key].lng], 17, { duration: 0.9 });
      dirMap.once("moveend", () => vMarkers[key].openPopup());
    };
    $$("[data-focus-venue]").forEach((b) => b.addEventListener("click", () => focusVenue(b.dataset.focusVenue)));
    // "Δείτε τη διαδρομή" buttons in the program section
    $$("[data-show-route]").forEach((b) =>
      b.addEventListener("click", () => {
        $("#directions").scrollIntoView({ behavior: "smooth" });
        setTimeout(() => focusVenue(b.dataset.showRoute), 500);
      })
    );
  }

  function selectOrigin(o, btn) {
    currentOrigin = o;
    $$(".origin").forEach((x) => x.classList.toggle("is-active", x === btn));
    drawRoute();
  }

  async function drawRoute() {
    const dest = venues[currentDest];
    const o = currentOrigin;
    gmapsLink.href = gmapsDir(dest, o);
    routeInfo.hidden = false;
    routeMsg.textContent = "Υπολογίζουμε τη διαδρομή…";
    $("#route-dist").textContent = "–";
    $("#route-time").textContent = "–";

    if (routeLayer) dirMap.removeLayer(routeLayer);
    if (originMarker) { dirMap.removeLayer(originMarker); originMarker = null; }
    if (o.id === "me") {
      originMarker = L.marker([o.lat, o.lng], { icon: meIcon() }).addTo(dirMap).bindPopup("<strong>Είστε εδώ</strong>");
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const r = data.routes && data.routes[0];
      if (!r) throw new Error("no route");
      const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const lines = [
        L.polyline(coords, { color: "#fbf4ea", weight: 9, opacity: 0.9, className: "route-line" }),
        L.polyline(coords, { color: "#c4623f", weight: 5, opacity: 0.95, className: "route-line" }),
      ];
      routeLayer = L.layerGroup(lines).addTo(dirMap);
      // pathLength=1 lets CSS "draw" the line regardless of its pixel length
      lines.forEach((l) => l.getElement() && l.getElement().setAttribute("pathLength", "1"));
      dirMap.flyToBounds(L.latLngBounds(coords), { padding: [50, 50], duration: 0.9 });
      $("#route-dist").textContent = `${(r.distance / 1000).toFixed(1).replace(".", ",")} χλμ.`;
      const mins = Math.round(r.duration / 60);
      $("#route-time").textContent = mins >= 60 ? `${Math.floor(mins / 60)}ώ ${mins % 60}'` : `~${mins}'`;
      routeMsg.textContent = "Οι χρόνοι είναι ενδεικτικοί — το καλοκαίρι υπολογίστε λίγη κίνηση.";
    } catch (err) {
      routeLayer = L.polyline([[o.lat, o.lng], [dest.lat, dest.lng]], { color: "#c4623f", weight: 3, dashArray: "8 8" }).addTo(dirMap);
      dirMap.flyToBounds(routeLayer.getBounds(), { padding: [60, 60], duration: 0.9 });
      routeInfo.querySelector(".route-info__stats").hidden = true;
      routeMsg.textContent = "Ανοίξτε τη διαδρομή στο Google Maps για αναλυτικές οδηγίες.";
      return;
    }
    routeInfo.querySelector(".route-info__stats").hidden = false;
  }

  /* ---------------- Chania guide ---------------- */
  const CAT = {
    beach: { label: "Παραλία", icon: "beach" },
    sight: { label: "Αξιοθέατο", icon: "sight" },
    food: { label: "Φαγητό & ποτό", icon: "food" },
  };

  function initGuide() {
    const cardsEl = $("#cards");
    const entries = window.PLACES.map((p, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `card card--${p.category}`;
      card.innerHTML = `
        <span class="card__tag">${ico(CAT[p.category].icon)} ${CAT[p.category].label}</span>
        <h3>${esc(p.name)}</h3>
        <span class="card__area">${esc(p.area || "")}</span>
        <p>${esc(p.text)}</p>
        ${p.tip ? `<span class="card__tip">${esc(p.tip)}</span>` : ""}`;
      cardsEl.appendChild(card);
      return { p, card, marker: null, i };
    });

    let gMap = null;
    if (hasLeaflet) {
      gMap = makeMap("guide-map");
      entries.forEach((en) => {
        const p = en.p;
        en.marker = L.marker([p.lat, p.lng], { icon: pin(`pin--${p.category}`, CAT[p.category].icon) })
          .addTo(gMap)
          .bindPopup(`<strong>${esc(p.name)}</strong>${esc(p.area || "")}<br><a href="${gmapsDir(p)}" target="_blank" rel="noopener">Πώς θα πάω →</a>`);
        en.marker.on("click", () => activate(en, false));
      });
      L.marker([W.reception.lat, W.reception.lng], { icon: pin("pin--venue", "heart"), zIndexOffset: 1000 })
        .addTo(gMap).bindPopup(`<strong>${esc(W.reception.title)}</strong>${esc(W.reception.name)}`);
      fit(entries);
    } else {
      $("#guide-map").hidden = true;
    }

    function fit(list) {
      if (!gMap || !list.length) return;
      if (!gMap._loaded) return gMap.fitBounds(list.map((e) => [e.p.lat, e.p.lng]), { padding: [36, 36], maxZoom: 13 });
      gMap.flyToBounds(list.map((e) => [e.p.lat, e.p.lng]), { padding: [36, 36], duration: 0.8, maxZoom: 13 });
    }

    function activate(en, fly = true) {
      entries.forEach((x) => {
        x.card.classList.toggle("is-active", x === en);
        const el = x.marker && x.marker.getElement && x.marker.getElement();
        if (el) el.firstElementChild.classList.toggle("is-active", x === en);
      });
      if (gMap && en.marker) {
        if (fly) gMap.flyTo([en.p.lat, en.p.lng], 13, { duration: 0.8 });
        en.marker.openPopup();
      }
      if (!fly) en.card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    entries.forEach((en) =>
      en.card.addEventListener("click", () => {
        activate(en, true);
        // on mobile the map sits above the cards — bring it into view
        if (window.matchMedia("(max-width: 980px)").matches) $("#guide-map").scrollIntoView({ behavior: "smooth", block: "center" });
      })
    );

    $$(".chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        const f = chip.dataset.filter;
        $$(".chip").forEach((c) => {
          c.classList.toggle("is-active", c === chip);
          c.setAttribute("aria-selected", String(c === chip));
        });
        const visible = [];
        entries.forEach((en) => {
          const show = f === "all" || en.p.category === f;
          en.card.hidden = !show;
          en.card.classList.remove("pop");
          if (show) {
            en.card.style.setProperty("--i", visible.length);
            void en.card.offsetWidth; // restart animation
            en.card.classList.add("pop");
          }
          if (en.marker && gMap) {
            if (show) en.marker.addTo(gMap); else gMap.removeLayer(en.marker);
          }
          if (show) visible.push(en);
        });
        if (gMap) gMap.closePopup();
        fit(visible);
      })
    );
  }

  /* ---------------- RSVP ---------------- */
  function initRsvp() {
    const form = $("#rsvp-form");
    const note = $("#rsvp-note");
    const submit = $("#rsvp-submit");
    const thanks = $("#rsvp-thanks");
    const ifAttending = $("#if-attending");
    const cfg = W.rsvp;
    const demo = !cfg.formAction || cfg.formAction.includes("ΒΑΛΤΕ_ΤΟ_ID");

    /* ---- Steppers (+ / −) ---- */
    const steppers = {};
    $$(".stepper", form).forEach((st) => {
      const name = st.dataset.name;
      const out = $("output", st);
      const input = $("input", st);
      const api = {
        el: st,
        min: Number(st.dataset.min || 0),
        max: Number(st.dataset.max || 10),
        get value() { return Number(input.value); },
        set(v) {
          v = Math.max(this.min, Math.min(this.max, v));
          input.value = v;
          out.textContent = v;
          $('[data-step="-1"]', st).disabled = v <= this.min;
          $('[data-step="1"]', st).disabled = v >= this.max;
          st.classList.toggle("is-zero", v === 0);
        },
      };
      api.set(api.value);
      st.addEventListener("click", (e) => {
        const b = e.target.closest("[data-step]");
        if (!b) return;
        api.set(api.value + Number(b.dataset.step));
        out.classList.remove("bump"); void out.offsetWidth; out.classList.add("bump");
        update();
      });
      steppers[name] = api;
    });

    const totals = () => {
      const adults = 1 + steppers.extraAdults.value;
      const kids = steppers.children.value;
      return { adults, kids, people: adults + kids };
    };

    function update() {
      const { adults, kids, people } = totals();
      $("#guest-names-field").hidden = steppers.extraAdults.value === 0;
      $("#children-ages-field").hidden = kids === 0;

      const ad = adults === 1 ? "1 ενήλικας" : `${adults} ενήλικες`;
      const kd = kids === 0 ? "" : kids === 1 ? " + 1 παιδί" : ` + ${kids} παιδιά`;
      $("#party-summary").innerHTML = `Σύνολο: <strong>${people} ${people === 1 ? "άτομο" : "άτομα"}</strong> <span>(${ad}${kd})</span>`;
    }
    update();

    const isYes = () => {
      const r = form.querySelector('input[name="attending"]:checked');
      return r ? r.value.startsWith("Ναι") : null;
    };
    form.addEventListener("change", (e) => {
      if (e.target.name === "attending") {
        const yes = isYes();
        ifAttending.hidden = !yes;
        e.target.closest(".field").classList.remove("has-error");
        if (yes) {
          const r = e.target.closest(".pill").getBoundingClientRect();
          Petals.burst(40, { x: r.left + r.width / 2, y: r.top });
        }
      }
    });
    form.addEventListener("input", (e) => {
      const f = e.target.closest(".field");
      if (f) f.classList.remove("has-error");
    });

    function validate() {
      let ok = true;
      const name = $("#f-name");
      if (!name.value.trim()) { name.closest(".field").classList.add("has-error"); ok = false; }
      if (isYes() === null) { form.querySelector('input[name="attending"]').closest(".field").classList.add("has-error"); ok = false; }
      if (!ok) { const first = form.querySelector(".has-error"); if (first) first.scrollIntoView({ behavior: "smooth", block: "center" }); }
      return ok;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      note.classList.remove("is-error");
      note.textContent = "";
      if (!validate()) { note.textContent = "Συμπληρώστε τα πεδία με κόκκινο."; note.classList.add("is-error"); return; }

      const fd = new FormData(form);
      const yes = isYes();
      const body = new URLSearchParams();
      const add = (key, val) => { if (cfg.fields[key] && val != null && String(val).trim() !== "") body.append(cfg.fields[key], String(val).trim()); };
      add("name", fd.get("name"));
      add("phone", fd.get("phone"));
      add("attending", fd.get("attending"));
      if (yes) {
        add("extraAdults", fd.get("extraAdults"));
        if (Number(fd.get("extraAdults")) > 0) add("guestNames", fd.get("guestNames"));
        add("children", fd.get("children"));
        if (Number(fd.get("children")) > 0) add("childrenAges", fd.get("childrenAges"));
      }

      submit.disabled = true;
      submit.textContent = "Αποστολή…";
      try {
        if (demo) {
          console.info("[RSVP demo] Θα στέλναμε στο Google Form:", Object.fromEntries(body));
          await new Promise((r) => setTimeout(r, 700));
        } else {
          // Τα Google Forms δεν επιστρέφουν CORS headers, οπότε στέλνουμε σε no-cors
          await fetch(cfg.formAction, { method: "POST", mode: "no-cors", body });
        }
        showThanks(fd.get("name"), yes);
      } catch (err) {
        note.textContent = "Κάτι πήγε στραβά με την αποστολή. Δοκιμάστε ξανά ή πάρτε μας τηλέφωνο.";
        note.classList.add("is-error");
      } finally {
        submit.disabled = false;
        submit.textContent = "Αποστολή";
      }
    });

    function showThanks(name, yes) {
      const first = String(name).trim().split(/\s+/)[0];
      $("#thanks-title").textContent = yes ? `Σ' ευχαριστούμε, ${first}!` : `Θα μας λείψεις, ${first}!`;
      $("#thanks-text").textContent = yes
        ? "Ανυπομονούμε να γιορτάσουμε μαζί σου στα Χανιά! ☀︎"
        : "Ευχαριστούμε που μας ενημέρωσες. Θα σε σκεφτόμαστε!";
      if (demo) $("#thanks-text").textContent += " (Δοκιμαστική λειτουργία — η φόρμα δεν έχει συνδεθεί ακόμη με Google Form.)";
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus({ preventScroll: true });
      $("#rsvp").scrollIntoView({ behavior: "smooth" });
      if (yes) {
        setTimeout(() => {
          const r = thanks.getBoundingClientRect();
          Petals.burst(90, { x: innerWidth / 2, y: Math.max(80, r.top + 40) });
          Petals.burst(60);
        }, 450);
      }
    }

    $("#rsvp-again").addEventListener("click", () => {
      form.reset();
      Object.values(steppers).forEach((s) => s.set(0));
      ifAttending.hidden = true;
      update();
      thanks.hidden = true;
      form.hidden = false;
    });
  }

  initDirections();
  initGuide();
  initRsvp();
})();
