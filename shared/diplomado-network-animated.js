// Subtle animated learning network for Diplomado section
(function () {
  function initDiplomadoNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const colors = ["#f2a93b", "#4d8fd1", "#7a5cc5"];
    const reduceMotion = window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    let width, height, nodes, time = 0;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width * devicePixelRatio;
      height = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;

      nodes = Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          r: (Math.random() * 1.2 + 1.8) * devicePixelRatio,
          c: colors[i % colors.length],
          angle: angle,
          centerX,
          centerY,
          radius,
        };
      });
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      if (!reduceMotion) time += 0.02;

      const linkDist = 90 * devicePixelRatio;

      // Update positions with subtle orbital motion
      for (const n of nodes) {
        const orbitAngle = n.angle + time * 0.15;
        n.x = n.centerX + Math.cos(orbitAngle) * n.radius * (1 + 0.08 * Math.sin(time + n.angle));
        n.y = n.centerY + Math.sin(orbitAngle) * n.radius * (1 + 0.08 * Math.sin(time + n.angle));
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < linkDist) {
            const alpha = 0.18 * (1 - dist / linkDist);
            ctx.strokeStyle = `rgba(242,169,59,${alpha})`;
            ctx.lineWidth = devicePixelRatio * 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with gentle pulsing
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = 0.9 + 0.1 * Math.sin(time * 1.5 + i);
        ctx.beginPath();
        ctx.fillStyle = n.c;
        ctx.globalAlpha = 0.75 * pulse;
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
    document.querySelectorAll("canvas.diplomado-network").forEach(initDiplomadoNetwork);
  });
})();
