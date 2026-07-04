// Premium professional learning network visualization with sophisticated styling
(function () {
  function initDiplomadoNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const communityColors = [
      { main: "#f2a93b", glow: "rgba(242, 169, 59, 0.3)" },
      { main: "#4d8fd1", glow: "rgba(77, 143, 209, 0.3)" },
      { main: "#7a5cc5", glow: "rgba(122, 92, 197, 0.3)" },
      { main: "#34b3a8", glow: "rgba(52, 179, 168, 0.3)" },
    ];
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
      const radius = Math.min(width, height) * 0.35;

      nodes = Array.from({ length: 35 }, (_, i) => {
        const community = i % 4;
        const color = communityColors[community];
        const angle = (i / 35) * Math.PI * 2;
        const r = (Math.random() * 0.8 + 0.6) * (3 + Math.random() * 2);

        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          r: r * devicePixelRatio,
          baseR: r * devicePixelRatio,
          color: color.main,
          glowColor: color.glow,
          community,
          angle,
          centerX,
          centerY,
          radius,
          importance: Math.random(),
          pulse: Math.random() * Math.PI * 2,
        };
      });
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      if (!reduceMotion) time += 0.014;

      const linkDist = 100 * devicePixelRatio;

      // Update positions with organic orbital motion
      for (const n of nodes) {
        const orbitAngle = n.angle + time * 0.08;
        const wobble = 0.12 * Math.sin(time * 0.8 + n.angle);
        n.x = n.centerX + Math.cos(orbitAngle) * n.radius * (1 + wobble);
        n.y = n.centerY + Math.sin(orbitAngle) * n.radius * (1 + wobble);
      }

      // Draw edges with sophisticated styling
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < linkDist) {
            const connectionStrength = 1 - dist / linkDist;
            const sameComm = a.community === b.community ? 1.2 : 0.6;
            const alpha = 0.2 * connectionStrength * sameComm;

            // Gradient connection effect
            const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            gradient.addColorStop(0, `${a.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${b.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = (1 + connectionStrength * 0.8) * devicePixelRatio;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with sophisticated effects
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Subtle pulsing based on importance
        const importancePulse = 0.8 + 0.15 * n.importance;
        const basePulse = 1 + 0.25 * Math.sin(time + n.pulse);
        const pulseEffect = importancePulse * basePulse;

        // Outer glow for depth
        ctx.beginPath();
        ctx.fillStyle = n.glowColor;
        ctx.arc(n.x, n.y, n.baseR * 2.2 * pulseEffect, 0, Math.PI * 2);
        ctx.fill();

        // Main node with gradient
        const nodeGradient = ctx.createRadialGradient(
          n.x - n.baseR * 0.3,
          n.y - n.baseR * 0.3,
          0,
          n.x,
          n.y,
          n.baseR * pulseEffect
        );
        nodeGradient.addColorStop(0, `${n.color}ff`);
        nodeGradient.addColorStop(0.7, `${n.color}dd`);
        nodeGradient.addColorStop(1, `${n.color}88`);

        ctx.beginPath();
        ctx.fillStyle = nodeGradient;
        ctx.arc(n.x, n.y, n.baseR * pulseEffect, 0, Math.PI * 2);
        ctx.fill();

        // Bright rim
        ctx.strokeStyle = `${n.color}cc`;
        ctx.lineWidth = 1.2 * devicePixelRatio;
        ctx.stroke();
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
