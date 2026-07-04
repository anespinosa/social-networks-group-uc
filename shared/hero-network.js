// Interactive Krackhardt-style network visualization with force-directed layout.
// Responsive, no external dependencies; includes hover interactions and reduced-motion support.
(function () {
  function initHero(canvas) {
    const ctx = canvas.getContext("2d");
    const colors = ["#4d8fd1", "#f2a93b", "#7a5cc5", "#34b3a8", "#e0637a"];
    const reduceMotion = window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    let width, height, nodes;
    let hoveredNodeIndex = -1;
    let mouseX = -1, mouseY = -1;
    const hoverRadius = 40;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width * devicePixelRatio;
      height = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const count = Math.max(45, Math.round((rect.width * rect.height) / 22000));
      nodes = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.3;
        const centerX = width / 2;
        const centerY = height / 2;
        return {
          x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
          y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 0.2 * devicePixelRatio,
          vy: (Math.random() - 0.5) * 0.2 * devicePixelRatio,
          r: (Math.random() * 1.8 + 2.2) * devicePixelRatio,
          c: colors[Math.floor(Math.random() * colors.length)],
        };
      });
    }

    function applyForces() {
      const centerX = width / 2;
      const centerY = height / 2;
      const repelDist = 100 * devicePixelRatio;
      const repelForce = 0.8;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let fx = 0, fy = 0;

        // Repulsion from other nodes
        for (let j = 0; j < nodes.length; j++) {
          if (i !== j) {
            const dx = n.x - nodes[j].x;
            const dy = n.y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < repelDist) {
              fx += (dx / dist) * repelForce;
              fy += (dy / dist) * repelForce;
            }
          }
        }

        // Weak attraction to center
        const toCenterX = centerX - n.x;
        const toCenterY = centerY - n.y;
        const toCenterDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY) || 1;
        fx += (toCenterX / toCenterDist) * 0.08;
        fy += (toCenterY / toCenterDist) * 0.08;

        n.vx += fx;
        n.vy += fy;
        n.vx *= 0.92;
        n.vy *= 0.92;
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 160 * devicePixelRatio;

      // Apply forces for Krackhardt layout
      if (!reduceMotion) {
        applyForces();
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          // Soft boundary wrapping
          if (n.x < -50) n.x = width + 50;
          else if (n.x > width + 50) n.x = -50;
          if (n.y < -50) n.y = height + 50;
          else if (n.y > height + 50) n.y = -50;
        }
      }

      // Draw edges (connections)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            const alpha = 0.15 * (1 - dist / linkDist);
            const isHoverEdge = (i === hoveredNodeIndex || j === hoveredNodeIndex);
            ctx.strokeStyle = isHoverEdge
              ? `rgba(242,169,59,${alpha + 0.25})`
              : `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = isHoverEdge ? devicePixelRatio * 1.5 : devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = i === hoveredNodeIndex;
        ctx.beginPath();
        ctx.fillStyle = n.c;
        ctx.globalAlpha = isHovered ? 1.0 : 0.82;
        ctx.arc(n.x, n.y, isHovered ? n.r * 1.4 : n.r, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect on hover
        if (isHovered) {
          ctx.strokeStyle = `rgba(242,169,59,0.4)`;
          ctx.lineWidth = devicePixelRatio * 2;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      if (!reduceMotion) requestAnimationFrame(step);
    }

    // Mouse tracking for interactivity
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * devicePixelRatio;
      mouseY = (e.clientY - rect.top) * devicePixelRatio;

      hoveredNodeIndex = -1;
      for (let i = 0; i < nodes.length; i++) {
        const dx = nodes[i].x - mouseX;
        const dy = nodes[i].y - mouseY;
        if (Math.sqrt(dx * dx + dy * dy) < hoverRadius) {
          hoveredNodeIndex = i;
          break;
        }
      }
    });

    canvas.addEventListener("mouseleave", () => {
      hoveredNodeIndex = -1;
      mouseX = -1;
      mouseY = -1;
    });

    resize();
    window.addEventListener("resize", resize);
    step();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".snuc-hero canvas.hero-network").forEach(initHero);
  });
})();
