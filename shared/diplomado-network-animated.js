// Organic clustered learning network inspired by real social network structures
(function () {
  function initDiplomadoNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const communityColors = {
      0: { main: "#f2a93b", name: "Innovation" },
      1: { main: "#4d8fd1", name: "Management" },
      2: { main: "#7a5cc5", name: "Strategy" },
      3: { main: "#34b3a8", name: "Operations" },
    };
    const reduceMotion = window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    let width, height, nodes, time = 0;

    function initializeNetwork() {
      const centerX = width / 2;
      const centerY = height / 2;

      const clusterCenters = [
        { x: centerX - 80, y: centerY - 60, community: 0, label: "Innovation" },
        { x: centerX + 80, y: centerY - 60, community: 1, label: "Management" },
        { x: centerX - 70, y: centerY + 70, community: 2, label: "Strategy" },
        { x: centerX + 90, y: centerY + 60, community: 3, label: "Operations" },
        { x: centerX, y: centerY, community: -1, label: "Hub" }, // Bridge node
      ];

      nodes = [];

      // Create cluster nodes around each center
      clusterCenters.forEach((center, clusterIdx) => {
        const nodeCount = clusterIdx === 4 ? 3 : Math.floor(Math.random() * 4) + 6; // Hub gets fewer nodes

        for (let i = 0; i < nodeCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = (Math.random() * 35 + 15) * devicePixelRatio;
          const community = center.community;
          const color = communityColors[community] || communityColors[0];

          nodes.push({
            x: center.x + Math.cos(angle) * distance,
            y: center.y + Math.sin(angle) * distance,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            r: (Math.random() * 1.2 + 2) * devicePixelRatio,
            baseR: (Math.random() * 1.2 + 2) * devicePixelRatio,
            color: color.main,
            community,
            degree: 0,
            pulse: Math.random() * Math.PI * 2,
            targetX: center.x,
            targetY: center.y,
            clusterIdx,
          });
        }
      });

      // Build edges (preferential attachment within clusters, some bridges)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const sameCluster = nodes[i].community === nodes[j].community;
          const connectionProb = sameCluster ? 0.4 : 0.08;

          if (Math.random() < connectionProb) {
            nodes[i].connections = (nodes[i].connections || 0) + 1;
            nodes[j].connections = (nodes[j].connections || 0) + 1;
            nodes[i].degree++;
            nodes[j].degree++;
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
      const repelDist = 60 * devicePixelRatio;
      const cohesion = 0.04;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let fx = 0, fy = 0;

        // Cohesion toward cluster center
        const dx = n.targetX - n.x;
        const dy = n.targetY - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        fx += (dx / dist) * cohesion;
        fy += (dy / dist) * cohesion;

        // Repulsion from nearby nodes
        for (let j = 0; j < nodes.length; j++) {
          if (i !== j) {
            const dx2 = n.x - nodes[j].x;
            const dy2 = n.y - nodes[j].y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
            if (dist2 < repelDist) {
              fx += (dx2 / dist2) * 0.6;
              fy += (dy2 / dist2) * 0.6;
            }
          }
        }

        n.vx += fx;
        n.vy += fy;
        n.vx *= 0.88;
        n.vy *= 0.88;
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
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150 * devicePixelRatio;

          if (dist < maxDist) {
            const sameComm = nodes[i].community === nodes[j].community;
            const alpha = sameComm ? 0.25 : 0.08;
            const color1 = communityColors[nodes[i].community]?.main || "#f2a93b";
            const color2 = communityColors[nodes[j].community]?.main || "#f2a93b";

            const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            gradient.addColorStop(0, `${color1}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${color2}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = (0.8 + 0.4 * (1 - dist / maxDist)) * devicePixelRatio;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes sized by degree (connectivity)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const degreeScale = 1 + (n.degree || 0) * 0.15;
        const pulse = 1 + 0.2 * Math.sin(time + n.pulse);
        const nodeR = n.baseR * degreeScale * pulse;

        // Glow based on degree
        ctx.beginPath();
        ctx.fillStyle = `${n.color}22`;
        ctx.arc(n.x, n.y, nodeR * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node
        const g = ctx.createRadialGradient(n.x - nodeR * 0.3, n.y - nodeR * 0.3, 0, n.x, n.y, nodeR);
        g.addColorStop(0, `${n.color}ff`);
        g.addColorStop(0.7, `${n.color}dd`);
        g.addColorStop(1, `${n.color}88`);
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
        ctx.fill();

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
