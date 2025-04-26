function runPrim() {
  const input = document.getElementById('input').value.trim();
  const lines = input.split('\n');
  const graph = lines.map(line => line.split(/\s+/).map(Number));

  const n = graph.length;
  const selected = Array(n).fill(false);
  const result = [];
  let edgeCount = 0;
  selected[0] = true;

  while (edgeCount < n - 1) {
    let min = Infinity;
    let x = 0, y = 0;

    for (let i = 0; i < n; i++) {
      if (selected[i]) {
        for (let j = 0; j < n; j++) {
          if (!selected[j] && graph[i][j]) {
            if (min > graph[i][j]) {
              min = graph[i][j];
              x = i;
              y = j;
            }
          }
        }
      }
    }

    result.push(`Edge: ${x} - ${y} | Weight: ${graph[x][y]}`);
    selected[y] = true;
    edgeCount++;
  }

  document.getElementById('output').textContent = result.join('\n');
}