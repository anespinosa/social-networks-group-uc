// Progressive UX polish: scroll-reveal + reading-progress bar.
// Everything is opt-in via a class on <html> so that, with JS disabled or
// reduced motion requested, all content renders normally and fully visible.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  root.classList.add("js-reveal");

  function setupReveal() {
    // Elements worth animating as they enter the viewport.
    var selectors = [
      ".snuc-card",
      ".snuc-project",
      ".snuc-person",
      ".snuc-keynote",
      ".snuc-org-section",
      ".snuc-callout",
      ".snuc-alliance",
      ".snuc-org-alliance",
      ".snuc-stats",
      ".snuc-pillars",
      "main.content > h2",
      ".snuc-pubs h3"
    ];
    var nodes = document.querySelectorAll(selectors.join(","));
    if (!("IntersectionObserver" in window) || !nodes.length) {
      // Fallback: reveal everything immediately.
      root.classList.remove("js-reveal");
      return;
    }

    nodes.forEach(function (n, i) {
      n.classList.add("reveal");
      // Small stagger for items sharing a row/grid.
      var delay = (i % 4) * 60;
      n.style.setProperty("--reveal-delay", delay + "ms");
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    nodes.forEach(function (n) { io.observe(n); });
  }

  function setupProgressBar() {
    var bar = document.createElement("div");
    bar.className = "snuc-progress";
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var scrollable = h.scrollHeight - h.clientHeight;
      var pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
      bar.style.width = pct + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  function init() {
    setupReveal();
    setupProgressBar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
