// Lazega Lawyers Network (real dataset: collaboration ties, 40-lawyer subset)
// Layout: stress majorization — geometric distances fit to graph-theoretic distances.
(function () {
  function initConsultancyNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width, height, nodes, edges, distMatrix, maxDist, time = 0, iterations = 0;
    const MAX_ITERATIONS = 400;

    const lazega = {
      n: 40,
      edges: [
        [1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10],
        [2,3],[2,5],[2,6],[2,7],[2,8],[2,10],[2,11],[2,12],[2,13],[2,14],
        [3,4],[3,7],[3,8],[3,9],[3,15],[3,16],
        [4,9],[4,10],[4,17],[4,18],
        [5,6],[5,7],[5,8],[5,11],[5,12],[5,13],[5,19],[5,20],
        [6,7],[6,8],[6,12],[6,14],[6,21],[6,22],
        [7,8],[7,14],[7,23],[7,24],
        [8,9],[8,10],[8,12],[8,25],[8,26],
        [9,10],[9,17],[9,18],[9,27],[9,28],
        [10,11],[10,29],[10,30],
        [11,12],[11,13],[11,19],[11,31],
        [12,13],[12,14],[12,32],
        [13,14],[13,15],[13,33],
        [14,16],[14,34],
        [15,16],[15,17],[15,35],
        [16,36],
        [17,18],[17,37],
        [18,38],
        [19,20],[19,39],
        [20,40],
        [21,22],
        [23,24],
        [25,26],
        [27,28],
        [29,30]
      ],
      // Status: 1 = partner (senior core), 0 = associate
      partner: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // Practice area: 0 = litigation, 1 = corporate
      practice: [0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0]
    };

    // Practice palette: litigation = purple, corporate = teal
    const practiceColors = [
      { light: "#b8a6e0", mid: "#7a5cc5", dark: "#5a3fa5" },
      { light: "#7fd1c5", mid: "#2a9d8f", dark: "#1d7168" }
    ];

    function computeDistances() {
      const n = lazega.n;
      const dist = Array.from({ length: n }, () => Array(n).fill(Infinity));
      for (let i = 0; i < n; i++) dist[i][i] = 0;
      lazega.edges.forEach(([a, b]) => {
        dist[a - 1][b - 1] = 1;
        dist[b - 1][a - 1] = 1;
      });
      for (let k = 0; k < n; k++)
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++)
            if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
      maxDist = 0;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
          if (dist[i][j] < Infinity && dist[i][j] > maxDist) maxDist = dist[i][j];
      return dist;
    }

    // One sweep of stress majorization with pixel-scaled target distances.
    function stressStep(alpha) {
      const n = nodes.length;
      const L = (Math.min(width, height) * 1.3) / maxDist; // pixels per graph-hop (core–periphery: stretch, clamp absorbs tails)
      for (let i = 0; i < n; i++) {
        const ni = nodes[i];
        let sumW = 0, tx = 0, ty = 0;
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const nj = nodes[j];
          const dij = distMatrix[i][j];
          if (!isFinite(dij) || dij === 0) continue;
          const target = dij * L;
          const w = 1 / (dij * dij);
          let dx = ni.x - nj.x;
          let dy = ni.y - nj.y;
          let d = Math.sqrt(dx * dx + dy * dy);
          if (d < 1e-3) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d = 1; }
          tx += w * (nj.x + (dx / d) * target);
          ty += w * (nj.y + (dy / d) * target);
          sumW += w;
        }
        if (sumW > 0) {
          ni.x += alpha * (tx / sumW - ni.x);
          ni.y += alpha * (ty / sumW - ni.y);
        }
      }
      let cx = 0, cy = 0;
      nodes.forEach(nd => { cx += nd.x; cy += nd.y; });
      cx = width / 2 - cx / n; cy = height / 2 - cy / n;
      const margin = 22 * devicePixelRatio;
      nodes.forEach(nd => {
        nd.x = Math.max(margin, Math.min(width - margin, nd.x + cx));
        nd.y = Math.max(margin, Math.min(height - margin, nd.y + cy));
      });
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width * devicePixelRatio;
      height = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      const centerX = width / 2, centerY = height / 2;
      nodes = Array.from({ length: lazega.n }, (_, i) => {
        const angle = (i / lazega.n) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.32;
        return {
          id: i + 1,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          degree: 0,
          pulse: Math.random() * Math.PI * 2,
        };
      });

      lazega.edges.forEach(([a, b]) => {
        nodes[a - 1].degree++;
        nodes[b - 1].degree++;
      });
      distMatrix = computeDistances();

      edges = lazega.edges.map(([a, b]) => [a - 1, b - 1]);

      iterations = 0;
      if (reduceMotion) {
        for (let s = 0; s < MAX_ITERATIONS; s++) stressStep(0.25);
      }
    }

    const maxDegree = 14;

    function drawNode(n, idx) {
      const pct = Math.min(1, n.degree / maxDegree);
      const sizeScale = Math.log(n.degree + 2) / Math.log(maxDegree + 2);
      const pulse = 1 + 0.1 * Math.sin(time + n.pulse);
      const r = (3 + sizeScale * 5.5) * devicePixelRatio * pulse;

      const isPartner = lazega.partner[idx] === 1;
      const c = practiceColors[lazega.practice[idx]];
      // Shape by status: diamond = partner, circle = associate
      const shape = isPartner ? "diamond" : "circle";

      // Glow (partners glow gold)
      ctx.beginPath();
      ctx.fillStyle = isPartner
        ? "rgba(242, 169, 59, " + (0.14 + 0.1 * pct) + ")"
        : "rgba(10, 31, 68, " + (0.05 + 0.06 * pct) + ")";
      ctx.arc(n.x, n.y, r * 2.3, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r * 1.2);
      g.addColorStop(0, c.light);
      g.addColorStop(0.6, c.mid);
      g.addColorStop(1, c.dark);
      ctx.fillStyle = g;

      ctx.beginPath();
      if (shape === "diamond") {
        ctx.moveTo(n.x, n.y - r * 1.3);
        ctx.lineTo(n.x + r * 1.3, n.y);
        ctx.lineTo(n.x, n.y + r * 1.3);
        ctx.lineTo(n.x - r * 1.3, n.y);
        ctx.closePath();
      } else {
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = (0.8 + pct) * devicePixelRatio;
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      edges.forEach(([a, b]) => {
        const n1 = nodes[a], n2 = nodes[b];
        const s = Math.min(n1.degree, n2.degree) / maxDegree;
        ctx.strokeStyle = "rgba(10, 31, 68, " + (0.08 + 0.12 * s) + ")";
        ctx.lineWidth = (0.7 + 0.6 * s) * devicePixelRatio;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });
      nodes.forEach((n, idx) => drawNode(n, idx));
    }

    function step() {
      time += 0.016;
      if (iterations < MAX_ITERATIONS) {
        stressStep(iterations < 60 ? 0.12 : 0.2);
        iterations++;
      }
      draw();
      requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) { draw(); } else { step(); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("canvas.consultancy-network").forEach(initConsultancyNetwork);
  });
})();
