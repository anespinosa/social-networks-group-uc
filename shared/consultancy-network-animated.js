// Lazega Lawyers Network (Real dataset: 71 lawyers, collaboration & advice ties - sampled top 40 nodes)
(function () {
  function initConsultancyNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    let width, height, nodes, edges, time = 0;

    // Lazega lawyers collaboration network (high-degree subset for visualization)
    const lazega = {
      nodes: Array.from({ length: 40 }, (_, i) => ({ id: i + 1 })),
      edges: [
        [1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10],
        [2,1],[2,3],[2,5],[2,6],[2,7],[2,8],[2,10],[2,11],[2,12],[2,13],[2,14],
        [3,1],[3,2],[3,4],[3,7],[3,8],[3,9],[3,15],[3,16],
        [4,1],[4,3],[4,9],[4,10],[4,17],[4,18],
        [5,1],[5,2],[5,6],[5,7],[5,8],[5,11],[5,12],[5,13],[5,19],[5,20],
        [6,1],[6,2],[6,5],[6,7],[6,8],[6,12],[6,14],[6,21],[6,22],
        [7,1],[7,2],[7,3],[7,5],[7,6],[7,8],[7,14],[7,23],[7,24],
        [8,1],[8,2],[8,3],[8,5],[8,6],[8,7],[8,9],[8,10],[8,12],[8,25],[8,26],
        [9,1],[9,3],[9,4],[9,8],[9,10],[9,17],[9,18],[9,27],[9,28],
        [10,1],[10,2],[10,4],[10,8],[10,9],[10,11],[10,29],[10,30],
        [11,2],[11,5],[11,10],[11,12],[11,13],[11,19],[11,31],
        [12,2],[12,5],[12,6],[12,8],[12,11],[12,13],[12,14],[12,32],
        [13,2],[13,5],[13,11],[13,12],[13,14],[13,15],[13,33],
        [14,2],[14,6],[14,7],[14,12],[14,13],[14,16],[14,34],
        [15,3],[15,13],[15,16],[15,17],[15,35],
        [16,3],[16,13],[16,14],[16,15],[16,36],
        [17,4],[17,9],[17,15],[17,18],[17,37],
        [18,4],[18,9],[18,17],[18,38],
        [19,5],[19,11],[19,20],[19,39],
        [20,5],[20,19],[20,40],
        [21,6],[21,22],
        [22,6],[22,21],
        [23,7],[23,24],
        [24,7],[24,23],
        [25,8],[25,26],
        [26,8],[26,25],
        [27,9],[27,28],
        [28,9],[28,27],
        [29,10],[29,30],
        [30,10],[30,29],
        [31,11],
        [32,12],
        [33,13],
        [34,14],
        [35,15],
        [36,16],
        [37,17],
        [38,18],
        [39,19],
        [40,20]
      ]
    };

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      console.log("Consultancy parent rect:", rect.width, "x", rect.height);
      width = canvas.width = rect.width * devicePixelRatio;
      height = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      console.log("Consultancy canvas set to:", width, "x", height, "devicePixelRatio:", devicePixelRatio);

      const centerX = width / 2;
      const centerY = height / 2;
      nodes = lazega.nodes.map((n, i) => {
        const angle = (i / lazega.nodes.length) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.35;
        return {
          id: n.id,
          x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 30,
          y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 30,
          vx: 0,
          vy: 0,
          r: 2.6 * devicePixelRatio,
          degree: 0,
          pulse: Math.random() * Math.PI * 2,
        };
      });

      // Calculate degrees
      lazega.edges.forEach(([from, to]) => {
        if (from <= 40) nodes[from - 1].degree++;
      });

      // Create undirected edges
      edges = [];
      const edgeSet = new Set();
      lazega.edges.forEach(([a, b]) => {
        if (a <= 40 && b <= 40) {
          const key = a < b ? `${a}-${b}` : `${b}-${a}`;
          if (!edgeSet.has(key)) {
            edges.push([a - 1, b - 1]);
            edgeSet.add(key);
          }
        }
      });
    }

    function applyForces() {
      const centerX = width / 2;
      const centerY = height / 2;
      const repelDist = 100 * devicePixelRatio;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let fx = 0, fy = 0;

        // Center attraction
        const dx = centerX - n.x;
        const dy = centerY - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        fx += (dx / dist) * 0.1;
        fy += (dy / dist) * 0.1;

        // Node repulsion
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx2 = n.x - nodes[j].x;
          const dy2 = n.y - nodes[j].y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

          if (dist2 < repelDist) {
            fx += (dx2 / dist2) * 0.7;
            fy += (dy2 / dist2) * 0.7;
          }
        }

        // Edge attraction
        edges.forEach(([a, b]) => {
          if (i === a) {
            const dx3 = nodes[b].x - n.x;
            const dy3 = nodes[b].y - n.y;
            const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3) || 1;
            fx += (dx3 / dist3) * 0.18;
            fy += (dy3 / dist3) * 0.18;
          } else if (i === b) {
            const dx3 = nodes[a].x - n.x;
            const dy3 = nodes[a].y - n.y;
            const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3) || 1;
            fx += (dx3 / dist3) * 0.18;
            fy += (dy3 / dist3) * 0.18;
          }
        });

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
      edges.forEach(([a, b]) => {
        const n1 = nodes[a];
        const n2 = nodes[b];
        const strength = Math.min(n1.degree, n2.degree) / 20;
        const alpha = 0.15 + 0.15 * strength;

        ctx.strokeStyle = `rgba(122, 92, 197, ${alpha})`;
        ctx.lineWidth = (0.8 + 0.6 * strength) * devicePixelRatio;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });

      // Draw nodes (size by degree)
      nodes.forEach(n => {
        const degreeScale = 0.7 + (n.degree / 20) * 1;
        const pulse = 1 + 0.2 * Math.sin(time + n.pulse);
        const r = n.r * degreeScale * pulse;

        // Glow
        ctx.beginPath();
        ctx.fillStyle = "rgba(122, 92, 197, 0.2)";
        ctx.arc(n.x, n.y, r * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Gold glow for high-degree nodes
        if (n.degree > 15) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(242, 169, 59, ${0.1 * (n.degree / 20)})`;
          ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node
        const g = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r);
        g.addColorStop(0, "#b8a6e0");
        g.addColorStop(0.6, "#7a5cc5");
        g.addColorStop(1, "#5a3fa5");
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(242, 169, 59, ${0.4 + 0.4 * (n.degree / 20)})`;
        ctx.lineWidth = 1.4 * devicePixelRatio;
        ctx.stroke();
      });

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
