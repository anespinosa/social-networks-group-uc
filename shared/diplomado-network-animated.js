// Krackhardt High-Tech Managers Network (real dataset: 21 managers, advice-seeking ties)
// Layout: stress majorization — geometric distances fit to graph-theoretic distances.
(function () {
  function initDiplomadoNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width, height, nodes, edges, distMatrix, maxDist, time = 0, iterations = 0;
    const MAX_ITERATIONS = 400;

    const krackhardt = {
      n: 21,
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
      ],
      // Real attributes from the dataset: hierarchical level (1=CEO, 2=VP, 3=manager) and department (0=CEO)
      level: [3,2,3,3,3,3,1,3,3,3,3,3,3,2,3,3,3,2,3,3,2],
      dept:  [4,4,2,4,2,1,0,1,2,3,3,1,2,2,2,4,1,3,2,2,1]
    };

    // Department palette (CEO = gold)
    const deptColors = {
      0: { light: "#f7c67e", mid: "#f2a93b", dark: "#c07f1f" },
      1: { light: "#7fd1c5", mid: "#2a9d8f", dark: "#1d7168" },
      2: { light: "#8fabd1", mid: "#4a6fa5", dark: "#345078" },
      3: { light: "#efa993", mid: "#e07a5f", dark: "#b35540" },
      4: { light: "#c6a3d8", mid: "#9c6bb3", dark: "#714a86" }
    };

    function computeDistances() {
      const n = krackhardt.n;
      const dist = Array.from({ length: n }, () => Array(n).fill(Infinity));
      for (let i = 0; i < n; i++) dist[i][i] = 0;
      krackhardt.edges.forEach(([a, b]) => {
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

    // One sweep of stress majorization: move each node toward the position that
    // best satisfies pixel-scaled graph distances (weight 1/d_ij^2, localized moves).
    function stressStep(alpha) {
      const n = nodes.length;
      const L = (Math.min(width, height) * 0.82) / maxDist; // pixels per graph-hop
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
          // Ideal position for i relative to j at the target distance
          tx += w * (nj.x + (dx / d) * target);
          ty += w * (nj.y + (dy / d) * target);
          sumW += w;
        }
        if (sumW > 0) {
          ni.x += alpha * (tx / sumW - ni.x);
          ni.y += alpha * (ty / sumW - ni.y);
        }
      }
      // Keep centered and inside the canvas
      let cx = 0, cy = 0;
      nodes.forEach(n => { cx += n.x; cy += n.y; });
      cx = width / 2 - cx / n; cy = height / 2 - cy / n;
      const margin = 26 * devicePixelRatio;
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
      nodes = Array.from({ length: krackhardt.n }, (_, i) => {
        const angle = (i / krackhardt.n) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.3;
        return {
          id: i + 1,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          degree: 0,
          pulse: Math.random() * Math.PI * 2,
        };
      });

      krackhardt.edges.forEach(([a]) => { nodes[a - 1].degree++; });
      distMatrix = computeDistances();

      edges = [];
      const seen = new Set();
      krackhardt.edges.forEach(([a, b]) => {
        const key = a < b ? a + "-" + b : b + "-" + a;
        if (!seen.has(key)) { edges.push([a - 1, b - 1]); seen.add(key); }
      });

      iterations = 0;
      if (reduceMotion) {
        // No animation: converge immediately, draw once
        for (let s = 0; s < MAX_ITERATIONS; s++) stressStep(0.25);
      }
    }

    const maxDegree = 25;

    function drawNode(n, idx) {
      const pct = n.degree / maxDegree;
      const sizeScale = Math.log(n.degree + 2) / Math.log(maxDegree);
      const pulse = 1 + 0.1 * Math.sin(time + n.pulse);
      const r = (3.2 + sizeScale * 5.8) * devicePixelRatio * pulse;

      const level = krackhardt.level[idx];
      const c = deptColors[krackhardt.dept[idx]];
      // Shape by hierarchy: diamond = CEO, square = VP, circle = manager
      const shape = level === 1 ? "diamond" : level === 2 ? "square" : "circle";

      // Glow (CEO and VPs glow gold)
      ctx.beginPath();
      ctx.fillStyle = level < 3
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
      } else if (shape === "square") {
        ctx.rect(n.x - r * 0.9, n.y - r * 0.9, r * 1.8, r * 1.8);
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
        // Ease the layout in: watching it untangle is part of the effect
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
    document.querySelectorAll("canvas.diplomado-network").forEach(initDiplomadoNetwork);
  });
})();
