// Krackhardt High-Tech Managers Network (Real dataset: 21 nodes, advice-seeking ties)
(function () {
  function initDiplomadoNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    let width, height, nodes, edges, time = 0;

    // Krackhardt network: 21 managers, advice-seeking relationships
    const krackhardt = {
      nodes: Array.from({ length: 21 }, (_, i) => ({ id: i + 1 })),
      edges: [
        [1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10],[1,11],[1,12],
        [2,1],[2,3],[2,4],[2,5],[2,6],[2,8],[2,9],[2,10],[2,11],[2,12],[2,13],[2,14],[2,15],[2,16],[2,17],[2,18],[2,19],[2,20],[2,21],
        [3,1],[3,2],[3,5],[3,7],[3,8],[3,9],[3,12],[3,13],[3,18],[3,19],
        [4,1],[4,5],[4,8],[4,9],[4,12],[4,13],[4,17],
        [5,1],[5,2],[5,3],[5,4],[5,6],[5,7],[5,8],[5,9],[5,10],[5,11],[5,12],[5,13],[5,16],[5,17],[5,20],
        [6,1],[6,2],[6,5],[6,7],[6,8],[6,11],[6,17],[6,20],
        [7,1],[7,3],[7,5],[7,6],[7,8],[7,11],[7,13],[7,15],[7,16],[7,19],[7,20],
        [8,1],[8,2],[8,3],[8,4],[8,5],[8,6],[8,7],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[8,16],[8,17],[8,18],[8,19],
        [9,1],[9,2],[9,3],[9,4],[9,5],[9,8],[9,10],[9,11],[9,12],[9,13],[9,14],[9,15],[9,16],[9,17],[9,18],[9,19],[9,20],
        [10,1],[10,2],[10,5],[10,8],[10,9],[10,11],[10,12],[10,14],[10,16],[10,17],[10,19],
        [11,1],[11,2],[11,5],[11,6],[11,7],[11,8],[11,9],[11,10],[11,13],[11,16],[11,18],[11,19],[11,20],
        [12,1],[12,2],[12,3],[12,4],[12,5],[12,8],[12,9],[12,10],[12,13],[12,14],[12,15],[12,16],[12,17],[12,18],[12,19],
        [13,2],[13,3],[13,4],[13,5],[13,8],[13,9],[13,12],[13,14],[13,15],[13,17],[13,18],[13,19],[13,20],[13,21],
        [14,2],[14,8],[14,9],[14,10],[14,12],[14,13],[14,15],[14,17],[14,18],[14,19],
        [15,2],[15,7],[15,9],[15,12],[15,13],[15,14],[15,17],[15,19],
        [16,2],[16,5],[16,7],[16,8],[16,9],[16,10],[16,11],[16,12],[16,17],[16,18],[16,19],[16,20],[16,21],
        [17,2],[17,4],[17,5],[17,6],[17,8],[17,9],[17,10],[17,12],[17,13],[17,14],[17,15],[17,16],[17,18],[17,19],[17,20],
        [18,2],[18,3],[18,8],[18,11],[18,12],[18,13],[18,14],[18,16],[18,17],[18,19],[18,21],
        [19,2],[19,3],[19,7],[19,8],[19,9],[19,10],[19,11],[19,12],[19,13],[19,14],[19,15],[19,16],[19,17],[19,18],
        [20,2],[20,5],[20,6],[20,7],[20,11],[20,13],[20,16],[20,17],[20,21],
        [21,2],[21,13],[21,16],[21,18],[21,20]
      ]
    };

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      console.log("Diplomado parent rect:", rect.width, "x", rect.height);
      width = canvas.width = rect.width * devicePixelRatio;
      height = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      console.log("Diplomado canvas set to:", width, "x", height, "devicePixelRatio:", devicePixelRatio);

      // Initialize nodes with force-directed layout
      const centerX = width / 2;
      const centerY = height / 2;
      nodes = krackhardt.nodes.map((n, i) => {
        const angle = (i / krackhardt.nodes.length) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.32;
        return {
          id: n.id,
          x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
          y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
          vx: 0,
          vy: 0,
          r: 2.8 * devicePixelRatio,
          degree: 0,
          pulse: Math.random() * Math.PI * 2,
        };
      });

      // Calculate degrees
      krackhardt.edges.forEach(([from, to]) => {
        nodes[from - 1].degree++;
      });

      // Create undirected edges
      edges = [];
      const edgeSet = new Set();
      krackhardt.edges.forEach(([a, b]) => {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (!edgeSet.has(key)) {
          edges.push([a - 1, b - 1]);
          edgeSet.add(key);
        }
      });
    }

    function applyForces() {
      const centerX = width / 2;
      const centerY = height / 2;
      const repelDist = 80 * devicePixelRatio;
      const attractDist = 150 * devicePixelRatio;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let fx = 0, fy = 0;

        // Center attraction
        const dx = centerX - n.x;
        const dy = centerY - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        fx += (dx / dist) * 0.08;
        fy += (dy / dist) * 0.08;

        // Node repulsion and edge attraction
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx2 = n.x - nodes[j].x;
          const dy2 = n.y - nodes[j].y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

          if (dist2 < repelDist) {
            fx += (dx2 / dist2) * 0.6;
            fy += (dy2 / dist2) * 0.6;
          }
        }

        // Edge-based attraction
        edges.forEach(([a, b]) => {
          if (i === a) {
            const dx3 = nodes[b].x - n.x;
            const dy3 = nodes[b].y - n.y;
            const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3) || 1;
            fx += (dx3 / dist3) * 0.15;
            fy += (dy3 / dist3) * 0.15;
          } else if (i === b) {
            const dx3 = nodes[a].x - n.x;
            const dy3 = nodes[a].y - n.y;
            const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3) || 1;
            fx += (dx3 / dist3) * 0.15;
            fy += (dy3 / dist3) * 0.15;
          }
        });

        n.vx += fx;
        n.vy += fy;
        n.vx *= 0.9;
        n.vy *= 0.9;
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
      edges.forEach(([a, b]) => {
        const n1 = nodes[a];
        const n2 = nodes[b];
        const alpha = 0.15 + 0.1 * (Math.min(n1.degree, n2.degree) / 21);

        ctx.strokeStyle = `rgba(242, 169, 59, ${alpha})`;
        ctx.lineWidth = (0.8 + 0.4 * (Math.min(n1.degree, n2.degree) / 21)) * devicePixelRatio;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });

      // Draw nodes (size by degree)
      nodes.forEach(n => {
        const degreeScale = 0.8 + (n.degree / 21) * 0.8;
        const pulse = 1 + 0.15 * Math.sin(time + n.pulse);
        const r = n.r * degreeScale * pulse;

        // Glow
        ctx.beginPath();
        ctx.fillStyle = "rgba(242, 169, 59, 0.15)";
        ctx.arc(n.x, n.y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Node
        const g = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r);
        g.addColorStop(0, "#f2aa55");
        g.addColorStop(0.6, "#f2a93b");
        g.addColorStop(1, "#d48c2a");
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(242, 169, 59, 0.8)";
        ctx.lineWidth = 1.2 * devicePixelRatio;
        ctx.stroke();
      });

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
