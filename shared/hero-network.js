// Lightweight animated node-link network, used as the homepage hero backdrop.
// No external dependencies; degrades to a static frame if reduced-motion is set.
(function () {
  function initHero(canvas) {
    const ctx = canvas.getContext("2d");
    const colors = ["#4d8fd1", "#f2a93b", "#7a5cc5", "#34b3a8", "#e0637a"];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width, height, nodes;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width * devicePixelRatio;
      height = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const count = Math.max(28, Math.round((rect.width * rect.height) / 26000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        r: (Math.random() * 1.6 + 1.2) * devicePixelRatio,
        c: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 130 * devicePixelRatio;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > width) a.vx *= -1;
          if (a.y < 0 || a.y > height) a.vy *= -1;
        }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = `rgba(255,255,255,${0.12 * (1 - dist / linkDist)})`;
            ctx.lineWidth = devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = n.c;
        ctx.globalAlpha = 0.85;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    step();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".snuc-hero canvas.hero-network").forEach(initHero);
  });
})();
