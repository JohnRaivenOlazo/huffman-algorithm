interface Edge {
    from: number;
    to: number;
    weight: number;
}

interface Position {
    x: number;
    y: number;
}

const graphUtilities = {
    drawGraph: function (edges: Edge[], nodeCount: number, labels: string[]): void {
        const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const radius = Math.min(30, Math.max(15, 200 / nodeCount));
        const graphRadius = Math.min(canvas.width, canvas.height) * 0.4;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angleStep = (2 * Math.PI) / nodeCount;
        const positions: Position[] = [];

        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const totalWeight = edges.reduce((sum, edge) => sum + edge.weight, 0);

        for (let i = 0; i < nodeCount; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + graphRadius * Math.cos(angle);
            const y = centerY + graphRadius * Math.sin(angle);
            positions.push({ x, y });
        }

        ctx.strokeStyle = "#00bfff";
        ctx.lineWidth = 2;
        edges.forEach(edge => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });

        edges.forEach(edge => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            const weightText = edge.weight.toString();
            ctx.font = "14px sans-serif";
            const textMetrics = ctx.measureText(weightText);
            const padding = 6;

            const textWidth = textMetrics.width;
            const textHeight = 16;
            ctx.fillStyle = "#1e1e1e";
            ctx.fillRect(midX - textWidth / 2 - padding, midY - textHeight / 2 - padding / 2, textWidth + padding * 2, textHeight + padding);
            ctx.strokeStyle = "#444444";
            ctx.lineWidth = 1;
            ctx.strokeRect(midX - textWidth / 2 - padding, midY - textHeight / 2 - padding / 2, textWidth + padding * 2, textHeight + padding);
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(weightText, midX, midY);
        });

        positions.forEach((pos, i) => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = "#4444aa";
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();

            const label = labels[i];
            ctx.font = "14px sans-serif";
            const textMetrics = ctx.measureText(label);
            const padding = 4;

            const textWidth = textMetrics.width;
            const textHeight = 16;
            ctx.fillStyle = "#4444aa";
            ctx.fillRect(pos.x - textWidth / 2 - padding, pos.y - textHeight / 2 - padding / 2, textWidth + padding * 2, textHeight + padding);
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, pos.x, pos.y);
        });

        ctx.font = "20px sans-serif";
        const weightTitle = `Total MST Weight: ${totalWeight}`;
        const titleMetrics = ctx.measureText(weightTitle);
        const titlePadding = 10;

        const titleWidth = titleMetrics.width;
        const titleHeight = 24;
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(centerX - titleWidth / 2 - titlePadding, 20 - titleHeight / 2, titleWidth + titlePadding * 2, titleHeight + titlePadding);
        ctx.strokeStyle = "#00bfff";
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - titleWidth / 2 - titlePadding, 20 - titleHeight / 2, titleWidth + titlePadding * 2, titleHeight + titlePadding);
        ctx.fillStyle = "#00bfff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(weightTitle, centerX, 20);
    },

    runPrimAlgorithm: function (edges: Edge[]): Edge[] {
        if (edges.length === 0) return [];

        const nodeCount = Math.max(...edges.flatMap(e => [e.from, e.to])) + 1;
        const graph: number[][] = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(Infinity));

        edges.forEach(edge => {
            graph[edge.from][edge.to] = edge.weight;
            graph[edge.to][edge.from] = edge.weight;
        });

        const parent: number[] = Array(nodeCount).fill(-1);
        const key: number[] = Array(nodeCount).fill(Infinity);
        const mstSet: boolean[] = Array(nodeCount).fill(false);
        key[0] = 0;

        for (let count = 0; count < nodeCount - 1; count++) {
            let minKey = Infinity;
            let minIndex = -1;

            for (let v = 0; v < nodeCount; v++) {
                if (!mstSet[v] && key[v] < minKey) {
                    minKey = key[v];
                    minIndex = v;
                }
            }

            mstSet[minIndex] = true;

            for (let v = 0; v < nodeCount; v++) {
                if (graph[minIndex][v] !== Infinity && !mstSet[v] && graph[minIndex][v] < key[v]) {
                    parent[v] = minIndex;
                    key[v] = graph[minIndex][v];
                }
            }
        }

        const result: Edge[] = [];
        for (let i = 1; i < nodeCount; i++) {
            if (parent[i] !== -1) {
                result.push({ from: parent[i], to: i, weight: graph[i][parent[i]] });
            }
        }

        return result;
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const matrixInput = document.getElementById("matrixInput") as HTMLTextAreaElement;
    const runButton = document.getElementById("runBtn") as HTMLButtonElement;
    let currentEdges: Edge[] = [];
    let currentLabels: string[] = [];

    function parseMatrixInput(input: string): { edges: Edge[], labels: string[] } {
        const edges: Edge[] = [];
        const lines = input.trim().split("\n").filter(line => line.trim().length > 0);

        const firstLine = lines[0].split(/[, \t]+/).map(v => v.trim()).filter(v => v.length > 0);
        const hasLabels = firstLine.some(v => isNaN(parseInt(v)));
        let labels: string[] = [];
        let dataLines = lines;

        if (hasLabels) {
            labels = firstLine;
            dataLines = lines.slice(1);
        } else {
            labels = Array.from({ length: lines.length }, (_, i) => String.fromCharCode(65 + i));
        }

        for (let i = 0; i < dataLines.length; i++) {
            const values = dataLines[i].split(/[, \t]+/)
                .map(v => v.trim())
                .filter(v => v.length > 0)
                .map(v => parseInt(v));

            for (let j = i + 1; j < values.length; j++) {
                if (!isNaN(values[j]) && values[j] > 0) {
                    edges.push({ from: i, to: j, weight: values[j] });
                }
            }
        }

        return { edges, labels };
    }

    function updateGraph(): void {
        try {
            const result = parseMatrixInput(matrixInput.value);
            currentEdges = result.edges;
            currentLabels = result.labels;
        } catch (error) {
            console.error("Invalid input format");
        }
    }

    runButton.addEventListener("click", function () {
        if (currentEdges.length > 0) {
            const nodeCount = currentLabels.length;
            const result = graphUtils.runPrimAlgorithm(currentEdges);
            graphUtilities.drawGraph(result, nodeCount, currentLabels);
        }
    });

    matrixInput.addEventListener("input", updateGraph);
});
