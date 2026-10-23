/* Interactive diagrams for Jatin Dheniwal's AI for Industry story.
   All geometry is illustrative; no challenge processes or internal assets are used. */
(() => {
  "use strict";
  const ready = (fn) => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true }) : fn();
  const byId = (id) => document.getElementById(id);
  const reducedMotion = () => window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  ready(() => {
    const init = (name, fn) => {
      try { fn(); }
      catch (error) { console.error("Could not initialize " + name, error); }
    };

    init("reading progress", () => {
      const line = byId("read-progress");
      if (!line) return;
      let queued = false;
      const update = () => {
        const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        line.style.width = Math.max(0, Math.min(100, window.scrollY / total * 100)) + "%";
        queued = false;
      };
      window.addEventListener("scroll", () => {
        if (!queued) { queued = true; window.requestAnimationFrame(update); }
      }, { passive: true });
      window.addEventListener("resize", update);
      update();
    });

    init("article navigation", () => {
      const links = [...document.querySelectorAll("[data-rail]")];
      if (!links.length || !("IntersectionObserver" in window)) return;
      const sections = links.map(a => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          links.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id));
        }
      }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
      sections.forEach(section => observer.observe(section));
    });

    init("engineering studio", () => {
      const stages = [...document.querySelectorAll("#harness-graph .harness-node")];
      const button = byId("harness-play");
      if (!stages.length) return;
      let active = 0, playing = !reducedMotion();
      const paint = () => {
        stages.forEach((node, i) => node.classList.toggle("is-active", i === active));
        if (button) {
          button.textContent = playing ? "Pause animation Ⅱ" : "Play animation ▶";
          button.setAttribute("aria-label", playing ? "Pause engineering loop animation" : "Play engineering loop animation");
          button.setAttribute("aria-pressed", String(playing));
        }
      };
      const next = () => { active = (active + 1) % stages.length; paint(); };
      button?.addEventListener("click", () => {
        playing = !playing;
        if (playing) next();
        else paint();
      });
      window.setInterval(() => { if (playing && !document.hidden) next(); }, 1500);
      paint();
    });

    init("geometric fusion", () => {
      const root = document.querySelector(".scan-module");
      const buttons = [...document.querySelectorAll("[data-scan-mode]")];
      const description = byId("scan-explain");
      if (!root || !buttons.length) return;
      const choose = (mode) => {
        const fused = mode === "fused";
        root.classList.toggle("is-fused", fused);
        for (const button of buttons) {
          const selected = button.dataset.scanMode === mode;
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
        }
        if (description) description.textContent = fused
          ? "Known rail spacing and common card orientation reconcile inconsistent detections into a coherent board model. This diagram is illustrative, not measured data."
          : "Individual pose estimates can disagree in position and rotation. Their errors are exaggerated here to make the geometric problem visible.";
      };
      buttons.forEach(button => button.addEventListener("click", () => choose(button.dataset.scanMode)));
      choose("raw");
    });

    init("contact search patterns", () => {
      const path = byId("search-path");
      const shadow = byId("search-path-shadow");
      const tip = byId("search-tip");
      const description = byId("search-explain");
      const buttons = [...document.querySelectorAll("[data-search]")];
      if (!path || !tip || !buttons.length) return;
      let fullLength = 0, start = performance.now();
      let cycle = 13000;
      const descriptions = {
        lissajous: "Two sinusoidal motions at different frequencies trace a continuous search across the rectangular contact region.",
        spiral: "An outward-growing spiral first probes near the estimated opening, then searches progressively further away.",
        raster: "Alternating horizontal sweeps systematically visit successive bands of the search region."
      };
      const draw = (kind) => {
        const points = [];
        if (kind === "raster") {
          for (let row = 0; row < 12; row++) for (let step = 0; step <= 45; step++) {
            const fraction = step / 45;
            points.push([row % 2 ? 565 - fraction * 368 : 197 + fraction * 368,
                         89 + row / 11 * 176]);
          }
        } else for (let i = 0; i <= 650; i++) {
          const u = i / 650;
          if (kind === "spiral") {
            const t = u * 11 * Math.PI;
            points.push([381 + 183 * u * Math.cos(t), 177 + 84 * u * Math.sin(t)]);
          } else {
            const t = u * Math.PI * 2;
            points.push([381 + 183 * Math.sin(3 * t), 177 + 84 * Math.sin(4 * t + .55)]);
          }
        }
        const d = points.map((point, i) => (i ? "L" : "M") + point[0].toFixed(2) + " " + point[1].toFixed(2)).join(" ");
        path.setAttribute("d", d);
        shadow?.setAttribute("d", d);
        fullLength = typeof path.getTotalLength === "function" ? path.getTotalLength() : 0;
        tip.setAttribute("cx", String(points[0][0]));
        tip.setAttribute("cy", String(points[0][1]));
        start = performance.now();
        cycle = kind === "raster" ? 17500 : 13000;
      };
      const choose = (kind) => {
        if (!(kind in descriptions)) return;
        buttons.forEach(button => {
          const selected = button.dataset.search === kind;
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
        });
        draw(kind);
        if (description) description.textContent = descriptions[kind] + " Illustrative path, not a claim about the exact final policy.";
      };
      buttons.forEach(button => button.addEventListener("click", () => choose(button.dataset.search)));
      choose("lissajous");
      if (!reducedMotion() && fullLength && typeof path.getPointAtLength === "function") {
        const animate = (now) => {
          if (!document.hidden && fullLength > 0) {
            const progress = ((now - start) % cycle) / cycle;
            const point = path.getPointAtLength(fullLength * progress);
            tip.setAttribute("cx", point.x.toFixed(2));
            tip.setAttribute("cy", point.y.toFixed(2));
          }
          window.requestAnimationFrame(animate);
        };
        window.requestAnimationFrame(animate);
      }
    });

    init("virtual spring", () => {
      const lead = byId("spring-lead"), stiffness = byId("spring-k");
      const leadValue = byId("spring-lead-val"), kValue = byId("spring-k-val"),
        forceValue = byId("spring-force"), springPath = byId("spring-line"),
        target = byId("spring-target");
      if (!lead || !stiffness || !leadValue || !kValue || !forceValue || !springPath || !target) return;
      const update = () => {
        const millimetres = Number(lead.value) / 10;
        const k = Number(stiffness.value);
        const x = 325 + millimetres * 45;
        leadValue.textContent = millimetres.toFixed(1) + " mm";
        kValue.textContent = k.toFixed(0) + " N/m";
        forceValue.textContent = (k * millimetres / 1000).toFixed(2) + " N";
        target.setAttribute("transform", "translate(" + (x - 355).toFixed(2) + " 0)");
        const zigzag = ["M325 175"];
        for (let i = 1; i < 15; i++) zigzag.push("L" + (325 + (x - 325) * i / 15).toFixed(2) + " " + (i % 2 ? 183 : 167));
        zigzag.push("L" + x.toFixed(2) + " 175");
        springPath.setAttribute("d", zigzag.join(" "));
      };
      lead.addEventListener("input", update);
      stiffness.addEventListener("input", update);
      update();
    });

    document.documentElement.dataset.interactionsReady = "true";
  });
})();
