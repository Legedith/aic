(() => {
  "use strict";
  const start = () => {
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
