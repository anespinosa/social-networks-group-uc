// Premium professional organizational analysis network with sophisticated layering
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

      // Organizational nodes (navy, larger, more stable)
      const orgNodes = [
        { x: centerX, y: centerY, r: 4.2 * devicePixelRatio, c: "#0a1f44", type: "hub", importance: 1 },
        { x: centerX - 55, y: centerY - 40, r: 3.2 * devicePixelRatio, c: "#0a1f44", type: "org", importance: 0.85 },
        { x: centerX + 55, y: centerY - 40, r: 3.2 * devicePixelRatio, c: "#0a1f44", type: "org", importance: 0.85 },
        { x: centerX - 60, y: centerY, r: 3.2 * devicePixelRatio, c: "#0a1f44", type: "org", importance: 0.8 },
        { x: centerX + 60, y: centerY, r: 3.2 * devicePixelRatio, c: "#0a1f44", type: "org", importance: 0.8 },
        { x: centerX - 45, y: centerY + 45, r: 3 * devicePixelRatio, c: "#0a1f44", type: "org", importance: 0.75 },
        { x: centerX + 45, y: centerY + 45, r: 3 * devicePixelRatio, c: "#0a1f44", type: "org", importance: 0.75 },
        { x: centerX, y: centerY + 55, r: 2.8 * devicePixelRatio, c: "#0a1f44", type: "org", importance: 0.7 },
      ];

      // Insight nodes (purple, pulsing, showing detected patterns)
      const insightNodes = [
        { x: centerX - 25, y: centerY - 50, r: 2.8 * devicePixelRatio, c: "#7a5cc5", type: "insight", importance: 0.9 },
        { x: centerX + 25, y: centerY - 50, r: 2.8 * devicePixelRatio, c: "#7a5cc5", type: "insight", importance: 0.9 },
        { x: centerX - 70, y: centerY - 20, r: 2.6 * devicePixelRatio, c: "#7a5cc5", type: "insight", importance: 0.75 },
        { x: centerX + 70, y: centerY - 20, r: 2.6 * devicePixelRatio, c: "#7a5cc5", type: "insight", importance: 0.75 },
        { x: centerX - 65, y: centerY + 30, r: 2.4 * devicePixelRatio, c: "#7a5cc5", type: "insight", importance: 0.7 },
        { x: centerX + 65, y: centerY + 30, r: 2.4 * devicePixelRatio, c: "#7a5cc5", type: "insight", importance: 0.7 },
        { x: centerX - 15, y: centerY + 60, r: 2.2 * devicePixelRatio, c: "#7a5cc5", type: "insight", importance: 0.65 },
        { x: centerX + 15, y: centerY + 60, r: 2.2 * devicePixelRatio, c: "#7a5cc5", type: "insight", importance: 0.65 },
      ];

      nodes = [...orgNodes, ...insightNodes];
      nodes.forEach(n => {
        n.centerX = centerX;
        n.centerY = centerY;
        n.pulse = Math.random() * Math.PI * 2;
        n.baseR = n.r;
      });
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      if (!reduceMotion) time += 0.016;

      // Draw organizational connections (stable structure)
      for (let i = 0; i < 8; i++) {
        const n = nodes[i];
        const gradient = ctx.createLinearGradient(n.centerX, n.centerY, n.x, n.y);
        gradient.addColorStop(0, "rgba(10, 31, 68, 0.15)");
        gradient.addColorStop(1, "rgba(10, 31, 68, 0.05)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.8 * devicePixelRatio;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(n.centerX, n.centerY);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      }

      // Draw insight connections (analysis flows)
      for (let i = 8; i < nodes.length; i++) {
        const n = nodes[i];
        const gradient = ctx.createLinearGradient(n.centerX, n.centerY, n.x, n.y);
        gradient.addColorStop(0, "rgba(122, 92, 197, 0.3)");
        gradient.addColorStop(1, "rgba(122, 92, 197, 0.05)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.2 * devicePixelRatio;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(n.centerX, n.centerY);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      }

      // Draw organizational nodes (navy, stable)
      for (let i = 0; i < 8; i++) {
        const n = nodes[i];

        // Outer glow for depth
        ctx.beginPath();
        ctx.fillStyle = "rgba(10, 31, 68, 0.12)";
        ctx.arc(n.x, n.y, n.baseR * 2, 0, Math.PI * 2);
        ctx.fill();

        // Main node with gradient
        const nodeGradient = ctx.createRadialGradient(
          n.x - n.baseR * 0.3,
          n.y - n.baseR * 0.3,
          0,
          n.x,
          n.y,
          n.baseR
        );
        nodeGradient.addColorStop(0, "#1a3d6e");
        nodeGradient.addColorStop(0.7, "#0a1f44");
        nodeGradient.addColorStop(1, "#040c1a");

        ctx.beginPath();
        ctx.fillStyle = nodeGradient;
        ctx.arc(n.x, n.y, n.baseR, 0, Math.PI * 2);
        ctx.fill();

        // Subtle rim
        ctx.strokeStyle = "rgba(242, 169, 59, 0.2)";
        ctx.lineWidth = 1.4 * devicePixelRatio;
        ctx.stroke();
      }

      // Draw insight nodes (purple, pulsing, glowing)
      for (let i = 8; i < nodes.length; i++) {
        const n = nodes[i];
        const importancePulse = 0.8 + 0.2 * n.importance;
        const basePulse = 1 + 0.35 * Math.sin(time * 1.5 + n.pulse);
        const pulseEffect = importancePulse * basePulse;

        // Bright outer glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(242, 169, 59, ${0.15 * pulseEffect})`;
        ctx.arc(n.x, n.y, n.baseR * 3 * pulseEffect, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring
        ctx.beginPath();
        ctx.fillStyle = `rgba(122, 92, 197, ${0.2 * pulseEffect})`;
        ctx.arc(n.x, n.y, n.baseR * 2.2 * pulseEffect, 0, Math.PI * 2);
        ctx.fill();

        // Main node with gradient
        const nodeGradient = ctx.createRadialGradient(
          n.x - n.baseR * 0.4,
          n.y - n.baseR * 0.4,
          0,
          n.x,
          n.y,
          n.baseR * pulseEffect
        );
        nodeGradient.addColorStop(0, "#b8a6e0");
        nodeGradient.addColorStop(0.6, "#7a5cc5");
        nodeGradient.addColorStop(1, "#5a3fa5");

        ctx.beginPath();
        ctx.fillStyle = nodeGradient;
        ctx.arc(n.x, n.y, n.baseR * pulseEffect, 0, Math.PI * 2);
        ctx.fill();

        // Bright rim showing activity
        ctx.strokeStyle = `rgba(242, 169, 59, ${0.5 * pulseEffect})`;
        ctx.lineWidth = 1.8 * devicePixelRatio;
        ctx.stroke();
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
