// Organic organizational network inspired by Krackhardt-style structures
(function () {
  function initConsultancyNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    let width, height, nodes, time = 0;

    function initializeNetwork() {
      const centerX = width / 2;
      const centerY = height / 2;

      // Define organizational clusters
      const clusters = [
        { x: centerX - 75, y: centerY - 50, type: "dept", name: "Product", size: 8 },
        { x: centerX + 75, y: centerY - 50, type: "dept", name: "Research", size: 7 },
        { x: centerX - 70, y: centerY + 70, type: "dept", name: "Operations", size: 8 },
        { x: centerX + 70, y: centerY + 70, type: "dept", name: "Strategy", size: 6 },
      ];

      nodes = [];

      // Create organizational nodes with realistic connections
      clusters.forEach((cluster) => {
        for (let i = 0; i < cluster.size; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = (Math.random() * 40 + 15) * devicePixelRatio;
          const isManager = i === 0; // First node in cluster is manager

          nodes.push({
            x: cluster.x + Math.cos(angle) * distance,
            y: cluster.y + Math.sin(angle) * distance,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            r: (isManager ? 3.2 : 2.2 + Math.random() * 0.8) * devicePixelRatio,
            baseR: (isManager ? 3.2 : 2.2 + Math.random() * 0.8) * devicePixelRatio,
            color: isManager ? "#0a1f44" : "#1a3d6e",
            type: isManager ? "manager" : "org",
            isManager,
            cluster: cluster.name,
            degree: 0,
            pulse: Math.random() * Math.PI * 2,
            targetX: cluster.x,
            targetY: cluster.y,
          });
        }
      });

      // Add insight nodes (analysis/findings)
      const insightCluster = { x: centerX, y: centerY };
      for (let i = 0; i < 7; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 * devicePixelRatio;
        nodes.push({
          x: insightCluster.x + Math.cos(angle) * distance,
          y: insightCluster.y + Math.sin(angle) * distance,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          r: 2.4 * devicePixelRatio,
          baseR: 2.4 * devicePixelRatio,
          color: "#7a5cc5",
          type: "insight",
          isInsight: true,
          degree: 0,
          pulse: Math.random() * Math.PI * 2,
          targetX: insightCluster.x,
          targetY: insightCluster.y,
        });
      }

      // Build connections: within clusters (strong), across clusters (weak), to insights
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          let connectionProb = 0;

          if (n1.isInsight || n2.isInsight) {
            // Strong connection to insights if high degree
            connectionProb = 0.3; // insights connect to high-degree nodes
          } else if (n1.cluster === n2.cluster) {
            // Within cluster: strong connectivity, especially to managers
            connectionProb = n1.isManager || n2.isManager ? 0.6 : 0.35;
          } else {
            // Cross-cluster: sparse, mainly through managers
            connectionProb = (n1.isManager || n2.isManager) ? 0.15 : 0.02;
          }

          if (Math.random() < connectionProb) {
            n1.degree++;
            n2.degree++;
          }
        }
      }
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width * devicePixelRatio;
      height = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      initializeNetwork();
    }

    function applyForces() {
      const repelDist = 70 * devicePixelRatio;
      const cohesion = 0.05;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let fx = 0, fy = 0;

        // Cluster cohesion
        const dx = n.targetX - n.x;
        const dy = n.targetY - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        fx += (dx / dist) * cohesion;
        fy += (dy / dist) * cohesion;

        // Repulsion
        for (let j = 0; j < nodes.length; j++) {
          if (i !== j) {
            const dx2 = n.x - nodes[j].x;
            const dy2 = n.y - nodes[j].y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
            if (dist2 < repelDist) {
              fx += (dx2 / dist2) * 0.7;
              fy += (dy2 / dist2) * 0.7;
            }
          }
        }

        n.vx += fx;
        n.vy += fy;
        n.vx *= 0.87;
        n.vy *= 0.87;
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      if (!reduceMotion) time += 0.016;

      if (!reduceMotion) {
        applyForces();
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
        }
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160 * devicePixelRatio;

          if (dist < maxDist) {
            const isInsightEdge = n1.isInsight || n2.isInsight;
            const sameCluster = n1.cluster === n2.cluster;
            let alpha = 0.08;
            let strokeColor = "rgba(10, 31, 68, ";

            if (isInsightEdge) {
              alpha = 0.25;
              strokeColor = "rgba(122, 92, 197, ";
            } else if (sameCluster) {
              alpha = 0.2;
            } else if (n1.isManager || n2.isManager) {
              alpha = 0.12;
            }

            ctx.strokeStyle = strokeColor + alpha + ")";
            ctx.lineWidth = (0.8 + 0.5 * (1 - dist / maxDist)) * devicePixelRatio;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Draw organizational nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.isInsight) continue;

        const degreeScale = 1 + (n.degree || 0) * 0.08;
        const pulse = n.isManager ? 1 + 0.15 * Math.sin(time + n.pulse) : 1;
        const nodeR = n.baseR * degreeScale * pulse;

        // Glow
        ctx.beginPath();
        ctx.fillStyle = `${n.color}15`;
        ctx.arc(n.x, n.y, nodeR * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Node
        const g = ctx.createRadialGradient(n.x - nodeR * 0.3, n.y - nodeR * 0.3, 0, n.x, n.y, nodeR);
        g.addColorStop(0, `${n.isManager ? "#2a5fa5" : "#1a3d6e"}ff`);
        g.addColorStop(0.7, n.color);
        g.addColorStop(1, `${n.color}88`);
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `${n.color}dd`;
        ctx.lineWidth = 1.2 * devicePixelRatio;
        ctx.stroke();
      }

      // Draw insight nodes (pulsing)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.isInsight) continue;

        const pulse = 1 + 0.4 * Math.sin(time * 1.3 + n.pulse);
        const nodeR = n.baseR * pulse;

        // Bright outer glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(242, 169, 59, ${0.2 * pulse})`;
        ctx.arc(n.x, n.y, nodeR * 3, 0, Math.PI * 2);
        ctx.fill();

        // Purple glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(122, 92, 197, ${0.25 * pulse})`;
        ctx.arc(n.x, n.y, nodeR * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Node
        const g = ctx.createRadialGradient(n.x - nodeR * 0.4, n.y - nodeR * 0.4, 0, n.x, n.y, nodeR);
        g.addColorStop(0, "#b8a6e0ff");
        g.addColorStop(0.6, "#7a5cc5dd");
        g.addColorStop(1, "#5a3fa599");
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(242, 169, 59, ${0.6 * pulse})`;
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
