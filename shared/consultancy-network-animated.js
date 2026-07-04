// Lazega Lawyers with Meaningful Node Sizes and Shapes
(function () {
  function initConsultancyNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    let width, height, nodes, edges, distMatrix, time = 0, layoutIterations = 0;

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

    function calculateDistanceMatrix() {
      const n = lazega.nodes.length;
      const dist = Array(n).fill(0).map(() => Array(n).fill(Infinity));

      for (let i = 0; i < n; i++) dist[i][i] = 0;

      lazega.edges.forEach(([a, b]) => {
        if (a <= 40 && b <= 40) dist[a-1][b-1] = 1;
      });

      for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
          }
        }
      }

      return dist;
    }

    function stressIteration() {
      const n = nodes.length;
      const k = 3.5;

      for (let i = 0; i < n; i++) {
        const ni = nodes[i];
        let fx = 0, fy = 0;

        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const nj = nodes[j];
          const dx = nj.x - ni.x;
          const dy = nj.y - ni.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const dij = distMatrix[i][j];

          if (dij < Infinity) {
            const force = k * (d - dij) / dij;
            fx += force * (dx / d);
            fy += force * (dy / d);
          }
        }

        ni.vx = fx * 0.1;
        ni.vy = fy * 0.1;
      }

      for (let i = 0; i < n; i++) {
        nodes[i].x += nodes[i].vx;
        nodes[i].y += nodes[i].vy;
      }
    }

    function resize() {
      // Use fixed canvas size (340x340) as defined by CSS max-width/max-height
      const size = 340;

      width = canvas.width = size * devicePixelRatio;
      height = canvas.height = size * devicePixelRatio;
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = 340 * devicePixelRatio * 0.32;

      nodes = lazega.nodes.map((n, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * scale;
        return {
          id: n.id,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          degree: 0,
          pulse: Math.random() * Math.PI * 2,
        };
      });

      lazega.edges.forEach(([a, b]) => {
        if (a <= 40) nodes[a - 1].degree++;
      });

      distMatrix = calculateDistanceMatrix();

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

      layoutIterations = 0;
    }

    function drawNode(n) {
      // Size by degree: logarithmic scale
      const sizeScale = Math.log(n.degree + 2) / Math.log(25);
      const baseR = (3.2 + sizeScale * 5.2) * devicePixelRatio;
      const pulse = 1 + 0.12 * Math.sin(time + n.pulse);
      const r = baseR * pulse;

      // Determine role by degree
      const degreePercentile = n.degree / 20;
      let nodeType = 'peripheral';
      if (degreePercentile > 0.65) nodeType = 'partner'; // high degree = partner
      else if (degreePercentile > 0.3) nodeType = 'counsel'; // medium

      // Glow
      ctx.beginPath();
      ctx.fillStyle = `rgba(122, 92, 197, ${0.15 + 0.1 * degreePercentile})`;
      ctx.arc(n.x, n.y, r * 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Gold glow for partners
      if (nodeType === 'partner') {
        ctx.beginPath();
        ctx.fillStyle = `rgba(242, 169, 59, ${0.08 * degreePercentile})`;
        ctx.arc(n.x, n.y, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Gradient
      const g = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r);
      g.addColorStop(0, "#b8a6e0");
      g.addColorStop(0.6, "#7a5cc5");
      g.addColorStop(1, "#5a3fa5");
      ctx.fillStyle = g;

      // Node shape: partner=diamond, counsel=square, associate=circle
      if (nodeType === 'partner') {
        ctx.beginPath();
        ctx.moveTo(n.x + r * 1.1, n.y);
        ctx.lineTo(n.x, n.y + r * 1.1);
        ctx.lineTo(n.x - r * 1.1, n.y);
        ctx.lineTo(n.x, n.y - r * 1.1);
        ctx.closePath();
        ctx.fill();
      } else if (nodeType === 'counsel') {
        ctx.fillRect(n.x - r * 0.95, n.y - r * 0.95, r * 1.9, r * 1.9);
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Border
      ctx.strokeStyle = `rgba(242, 169, 59, ${0.5 + 0.5 * degreePercentile})`;
      ctx.lineWidth = (1.2 + degreePercentile * 1.8) * devicePixelRatio;
      ctx.stroke();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      if (!reduceMotion) time += 0.016;

      if (!reduceMotion && layoutIterations < 350) {
        stressIteration();
        layoutIterations++;
      }

      // Draw edges
      edges.forEach(([a, b]) => {
        const n1 = nodes[a];
        const n2 = nodes[b];
        const strength = Math.min(n1.degree, n2.degree) / 20;
        const alpha = 0.13 + 0.17 * strength;

        ctx.strokeStyle = `rgba(122, 92, 197, ${alpha})`;
        ctx.lineWidth = (0.8 + 0.7 * strength) * devicePixelRatio;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });

      // Draw all nodes
      nodes.forEach(drawNode);

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
