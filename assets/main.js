(() => {
  "use strict";
  const start = () => {
    const toggle = document.getElementById("theme-toggle");
    const label = document.getElementById("theme-toggle-label");
    const root = document.documentElement;
    const themeColor = document.querySelector('meta[name="theme-color"]');

    const updateThemeControl = () => {
      const light = root.getAttribute("data-theme") === "light";
      if (label) label.textContent = light ? "Dark mode" : "Light mode";
      if (toggle) {
        toggle.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
        toggle.setAttribute("title", light ? "Switch to dark mode" : "Switch to light mode");
      }
      if (themeColor) themeColor.setAttribute("content", light ? "#faf9f5" : "#0c1115");
    };
    if (toggle) {
      toggle.addEventListener("click", () => {
        const light = root.getAttribute("data-theme") === "light";
        const next = light ? "dark" : "light";
        root.setAttribute("data-theme", next);
        try { window.localStorage.setItem("aic-color-theme", next); }
        catch (_) { /* Theme still works when storage is blocked. */ }
        updateThemeControl();
      });
    }
    updateThemeControl();
    const progress = document.getElementById("read-progress");
    const updateProgress = () => {
      if (!progress) return;
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.width = Math.min(100, Math.max(0, window.scrollY / available * 100)) + "%";
    };
    let pending = false;
    window.addEventListener("scroll", () => {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        pending = false;
      });
    }, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    const links = [...document.querySelectorAll("[data-rail]")];
    if ("IntersectionObserver" in window && links.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          links.forEach(link => link.classList.toggle(
            "is-current", link.getAttribute("href") === "#" + entry.target.id
          ));
        });
      }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
      links.forEach(link => {
        const id = link.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (target) observer.observe(target);
      });
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
