// Subtle animated organizational analysis network for Consultancy section
(function () {
  function initConsultancyNetwork(canvas) {
    const ctx = canvas.getContext("2d");
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

      nodes = [
        // Central hub
        { x: centerX, y: centerY, r: 3.5 * devicePixelRatio, c: "#0a1f44", type: "hub", centerX, centerY },
        // Org structure layer (navy) - expanded
        { x: centerX - 45, y: centerY - 35, r: 2.4 * devicePixelRatio, c: "#0a1f44", type: "org", centerX, centerY },
        { x: centerX + 45, y: centerY - 35, r: 2.4 * devicePixelRatio, c: "#0a1f44", type: "org", centerX, centerY },
        { x: centerX - 50, y: centerY, r: 2.4 * devicePixelRatio, c: "#0a1f44", type: "org", centerX, centerY },
        { x: centerX + 50, y: centerY, r: 2.4 * devicePixelRatio, c: "#0a1f44", type: "org", centerX, centerY },
        { x: centerX - 35, y: centerY + 40, r: 2.4 * devicePixelRatio, c: "#0a1f44", type: "org", centerX, centerY },
        { x: centerX + 35, y: centerY + 40, r: 2.4 * devicePixelRatio, c: "#0a1f44", type: "org", centerX, centerY },
        { x: centerX, y: centerY + 50, r: 2.4 * devicePixelRatio, c: "#0a1f44", type: "org", centerX, centerY },
        // Insight layer (purple - analysis/discoveries)
        { x: centerX - 20, y: centerY - 45, r: 2.2 * devicePixelRatio, c: "#7a5cc5", type: "insight", centerX, centerY },
        { x: centerX + 20, y: centerY - 45, r: 2.2 * devicePixelRatio, c: "#7a5cc5", type: "insight", centerX, centerY },
        { x: centerX - 55, y: centerY - 15, r: 2.2 * devicePixelRatio, c: "#7a5cc5", type: "insight", centerX, centerY },
        { x: centerX + 55, y: centerY - 15, r: 2.2 * devicePixelRatio, c: "#7a5cc5", type: "insight", centerX, centerY },
        { x: centerX - 50, y: centerY + 30, r: 2.2 * devicePixelRatio, c: "#7a5cc5", type: "insight", centerX, centerY },
        { x: centerX + 50, y: centerY + 30, r: 2.2 * devicePixelRatio, c: "#7a5cc5", type: "insight", centerX, centerY },
      ];
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      if (!reduceMotion) time += 0.016;

      // Draw organizational connections (static)
      for (const n of nodes) {
        if (n.type === "org" || n.type === "insight") {
          ctx.strokeStyle = n.type === "org"
            ? "rgba(10,31,68,0.25)"
            : "rgba(122,92,197,0.3)";
          ctx.lineWidth = devicePixelRatio * 0.8;
          ctx.beginPath();
          ctx.moveTo(n.centerX, n.centerY);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        if (n.type === "insight") {
          // Insight nodes pulse and glow
          const pulse = 0.8 + 0.2 * Math.sin(time * 1.8 + i);
          ctx.beginPath();
          ctx.fillStyle = n.c;
          ctx.globalAlpha = 0.8 * pulse;
          ctx.arc(n.x, n.y, n.r * (1 + 0.3 * pulse), 0, Math.PI * 2);
          ctx.fill();

          // Glow ring
          ctx.strokeStyle = `rgba(242,169,59,${0.2 * pulse})`;
          ctx.lineWidth = devicePixelRatio;
          ctx.stroke();
        } else {
          // Org nodes (stable)
          ctx.beginPath();
          ctx.fillStyle = n.c;
          ctx.globalAlpha = 0.85;
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    step();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("canvas.consultancy-network").forEach(initConsultancyNetwork);
  });
})();
