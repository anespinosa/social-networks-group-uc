// Premium Krackhardt-style network visualization with sophisticated interactions.
// Animated flowing connections, proximity lighting, and refined force-directed layout.
(function () {
  function initHero(canvas) {
    const ctx = canvas.getContext("2d");
    const colors = ["#4d8fd1", "#f2a93b", "#7a5cc5", "#34b3a8", "#e0637a"];
    const reduceMotion = window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    let width, height, nodes, animationTime = 0;
    let mouseX = -1, mouseY = -1;
    let hoveredNodeIndex = -1;
    const hoverRadius = 50;
    const proximityRadius = 200;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width * devicePixelRatio;
      height = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const count = Math.max(50, Math.round((rect.width * rect.height) / 20000));
      nodes = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.32;
        const centerX = width / 2;
        const centerY = height / 2;
        return {
          x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 120,
          y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 120,
          vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
          vy: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
          r: (Math.random() * 2.0 + 2.8) * devicePixelRatio,
          c: colors[Math.floor(Math.random() * colors.length)],
          pulse: Math.random() * Math.PI * 2,
        };
      });
    }

    function applyForces() {
      const centerX = width / 2;
      const centerY = height / 2;
      const repelDist = 120 * devicePixelRatio;
      const repelForce = 1.0;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let fx = 0, fy = 0;

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

        const toCenterX = centerX - n.x;
        const toCenterY = centerY - n.y;
        const toCenterDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY) || 1;
        fx += (toCenterX / toCenterDist) * 0.06;
        fy += (toCenterY / toCenterDist) * 0.06;

        n.vx += fx;
        n.vy += fy;
        n.vx *= 0.93;
        n.vy *= 0.93;
      }
    }

    function drawNodeGlow(n, glowAlpha) {
      if (glowAlpha < 0.02) return;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${glowAlpha * 0.2})`;
      ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${glowAlpha * 0.1})`;
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      if (!reduceMotion) animationTime += 0.016;

      const linkDist = 180 * devicePixelRatio;

      if (!reduceMotion) {
        applyForces();
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -50) n.x = width + 50;
          else if (n.x > width + 50) n.x = -50;
          if (n.y < -50) n.y = height + 50;
          else if (n.y > height + 50) n.y = -50;
        }
      }

      // Draw edges with flowing animation
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < linkDist) {
            const baseAlpha = 0.12 * (1 - dist / linkDist);

            // Proximity lighting from mouse
            let proximityAlpha = 0;
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const dxMouse = midX - mouseX;
            const dyMouse = midY - mouseY;
            const distToMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            if (distToMouse < proximityRadius && mouseX > -1) {
              proximityAlpha = (1 - distToMouse / proximityRadius) * 0.35;
            }

            // Hover edge lighting
            const isHoverEdge = (i === hoveredNodeIndex || j === hoveredNodeIndex);
            let edgeAlpha = baseAlpha + proximityAlpha;
            if (isHoverEdge) edgeAlpha += 0.2;

            // Animated flowing glow along edge
            const flowOffset = (animationTime * 0.5) % 1;
            const t = (flowOffset * 2 - 1) % 1;
            const flowGlowAlpha = Math.max(0, 1 - Math.abs(t * 2 - 1)) * 0.15;

            ctx.strokeStyle = isHoverEdge
              ? `rgba(242,169,59,${edgeAlpha + flowGlowAlpha})`
              : `rgba(255,255,255,${edgeAlpha + flowGlowAlpha * 0.6})`;
            ctx.lineWidth = isHoverEdge ? devicePixelRatio * 1.8 : devicePixelRatio * 1.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with halos and pulsing glow
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = i === hoveredNodeIndex;

        // Proximity glow intensity
        let proximityGlow = 0;
        const dxMouse = n.x - mouseX;
        const dyMouse = n.y - mouseY;
        const distToMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distToMouse < proximityRadius && mouseX > -1) {
          proximityGlow = (1 - distToMouse / proximityRadius) * 0.6;
        }

        // Subtle pulsing glow
        const pulse = Math.sin(animationTime + n.pulse) * 0.15 + 0.85;
        const glowAlpha = isHovered ? 1.0 : (0.7 + proximityGlow * 0.3) * pulse;

        // Draw outer halos
        drawNodeGlow(n, glowAlpha);

        // Draw node core
        ctx.beginPath();
        ctx.fillStyle = n.c;
        ctx.globalAlpha = glowAlpha;
        const nodeRadius = isHovered ? n.r * 1.6 : n.r * (1 + proximityGlow * 0.4);
        ctx.arc(n.x, n.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bright rim on hover/proximity
        if (isHovered || proximityGlow > 0.3) {
          ctx.strokeStyle = isHovered
            ? `rgba(242,169,59,${0.6 + proximityGlow * 0.4})`
            : `rgba(255,255,255,${proximityGlow * 0.3})`;
          ctx.lineWidth = devicePixelRatio * 1.5;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      if (!reduceMotion) requestAnimationFrame(step);
    }

    // Smooth mouse tracking
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
