function parseMatrix(input: string): number[][] {
  return input
    .trim()
    .split("\n")
    .map(row =>
      row
        .trim()
        .split(",")
        .map(val => parseFloat(val.trim()))
    );
}

function primMST(graph: number[][]): string {
  const V = graph.length;
  const key: number[] = Array(V).fill(Infinity);
  const parent: number[] = Array(V).fill(-1);
  const mstSet: boolean[] = Array(V).fill(false);

  key[0] = 0;

  for (let count = 0; count < V - 1; count++) {
    let u = -1;
    let min = Infinity;

    for (let v = 0; v < V; v++) {
      if (!mstSet[v] && key[v] < min) {
        min = key[v];
        u = v;
      }
    }

    if (u === -1) break;
    mstSet[u] = true;

    for (let v = 0; v < V; v++) {
      if (graph[u][v] && !mstSet[v] && graph[u][v] < key[v]) {
        parent[v] = u;
        key[v] = graph[u][v];
      }
    }
  }

  let result = "Edge \tWeight\n";
  let totalWeight = 0;

  for (let i = 1; i < V; i++) {
    if (parent[i] !== -1) {
      result += `${parent[i]} - ${i} \t${graph[i][parent[i]]}\n`;
      totalWeight += graph[i][parent[i]];
    }
  }

  result += `\nTotal Weight: ${totalWeight}`;
  return result;
}

function setup(): void {
  const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
  const matrixInput = document.getElementById("matrixInput") as HTMLTextAreaElement;
  const output = document.getElementById("output") as HTMLElement;

  runBtn.addEventListener("click", () => {
    try {
      const matrix = parseMatrix(matrixInput.value);
      const result = primMST(matrix);
      output.textContent = result;
    } catch (err) {
      output.textContent = "Invalid matrix format.";
    }
  });
}

document.addEventListener("DOMContentLoaded", setup);
