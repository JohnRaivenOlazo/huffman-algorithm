const graphUtils = {
    drawGraph: function (edges, nodeCount, labels) {
        var canvas = document.getElementById("graphCanvas");
        var ctx = canvas.getContext("2d");
        var radius = Math.min(30, Math.max(15, 200 / nodeCount));
        var graphRadius = Math.min(canvas.width, canvas.height) * 0.4;
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var angleStep = (2 * Math.PI) / nodeCount;
        var positions = [];
        
        // Clear canvas with background
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate total weight
        const totalWeight = edges.reduce((sum, edge) => sum + edge.weight, 0);
        
        // Calculate node positions FIRST
        for (var i = 0; i < nodeCount; i++) {
            var angle = i * angleStep - Math.PI / 2;
            var x = centerX + graphRadius * Math.cos(angle);
            var y = centerY + graphRadius * Math.sin(angle);
            positions.push({ x: x, y: y });
        }

        // Then draw edges
        ctx.strokeStyle = "#00bfff";
        ctx.lineWidth = 2;
        edges.forEach(function (edge) {
            var from = positions[edge.from];
            var to = positions[edge.to];
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });

        // Draw edge weights with better visibility
        edges.forEach(function (edge) {
            var from = positions[edge.from];
            var to = positions[edge.to];
            var midX = (from.x + to.x) / 2;
            var midY = (from.y + to.y) / 2;
            
            var weightText = edge.weight.toString();
            ctx.font = "14px sans-serif";
            var textMetrics = ctx.measureText(weightText);
            var padding = 6;
            
            // Draw text background
            ctx.fillStyle = "#1e1e1e";
            var textWidth = textMetrics.width;
            var textHeight = 16;
            ctx.fillRect(
                midX - textWidth/2 - padding,
                midY - textHeight/2 - padding/2,
                textWidth + padding * 2,
                textHeight + padding
            );
            
            // Draw border around background
            ctx.strokeStyle = "#444444";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                midX - textWidth/2 - padding,
                midY - textHeight/2 - padding/2,
                textWidth + padding * 2,
                textHeight + padding
            );
            
            // Draw text
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(weightText, midX, midY);
        });

        // Draw nodes on top
        positions.forEach(function (pos, i) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = "#4444aa";
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw node labels with background
            var label = labels[i];
            ctx.font = "14px sans-serif";
            var textMetrics = ctx.measureText(label);
            var padding = 4;
            
            // Draw text background
            ctx.fillStyle = "#4444aa";
            var textWidth = textMetrics.width;
            var textHeight = 16;
            ctx.fillRect(
                pos.x - textWidth/2 - padding,
                pos.y - textHeight/2 - padding/2,
                textWidth + padding * 2,
                textHeight + padding
            );
            
            // Draw text
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, pos.x, pos.y);
        });

        // Draw total weight on top with background
        ctx.font = "20px sans-serif";
        var weightTitle = `Total MST Weight: ${totalWeight}`;
        var titleMetrics = ctx.measureText(weightTitle);
        var titlePadding = 10;
        
        // Draw title background
        ctx.fillStyle = "#1e1e1e";
        var titleWidth = titleMetrics.width;
        var titleHeight = 24;
        ctx.fillRect(
            centerX - titleWidth/2 - titlePadding,
            20 - titleHeight/2,
            titleWidth + titlePadding * 2,
            titleHeight + titlePadding
        );
        
        // Draw border around title
        ctx.strokeStyle = "#00bfff";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            centerX - titleWidth/2 - titlePadding,
            20 - titleHeight/2,
            titleWidth + titlePadding * 2,
            titleHeight + titlePadding
        );
        
        // Draw title text
        ctx.fillStyle = "#00bfff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(weightTitle, centerX, 20);
    },
    runPrimAlgorithm: function(edges) {
        if (edges.length === 0) return [];

        const nodeCount = Math.max(...edges.flatMap(e => [e.from, e.to])) + 1;
        const graph = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(Infinity));

        // Build adjacency matrix from edges
        edges.forEach(edge => {
            graph[edge.from][edge.to] = edge.weight;
            graph[edge.to][edge.from] = edge.weight; // Make sure it's undirected
        });

        const parent = Array(nodeCount).fill(-1);
        const key = Array(nodeCount).fill(Infinity);
        const mstSet = Array(nodeCount).fill(false);
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
                if (graph[minIndex][v] !== Infinity && 
                    !mstSet[v] && 
                    graph[minIndex][v] < key[v]) {
                    parent[v] = minIndex;
                    key[v] = graph[minIndex][v];
                }
            }
        }

        // Construct MST edges
        const result = [];
        for (let i = 1; i < nodeCount; i++) {
            if (parent[i] !== -1) {
                result.push({
                    from: parent[i],
                    to: i,
                    weight: graph[i][parent[i]]
                });
            }
        }

        return result;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("graphCanvas");
    const matrixInput = document.getElementById("matrixInput");
    const runButton = document.getElementById("runBtn");
    let currentEdges = [];
    let currentLabels = [];

    function parseMatrixInput(input) {
        const edges = [];
        const lines = input.trim().split('\n').filter(line => line.trim().length > 0);
        
        // Check if first line contains labels
        const firstLine = lines[0].split(/[, \t]+/).map(v => v.trim()).filter(v => v.length > 0);
        const hasLabels = firstLine.some(v => isNaN(parseInt(v)));
        let labels = [];
        let dataLines = lines;

        if (hasLabels) {
            labels = firstLine;
            dataLines = lines.slice(1);
        } else {
            labels = Array.from({ length: lines.length }, (_, i) => String.fromCharCode(65 + i));
        }

        // Process matrix data - only add each edge once
        for (let i = 0; i < dataLines.length; i++) {
            const values = dataLines[i].split(/[, \t]+/)
                .map(v => v.trim())
                .filter(v => v.length > 0)
                .map(v => parseInt(v));

            for (let j = i + 1; j < values.length; j++) {  // Start from i+1 to avoid duplicates
                if (!isNaN(values[j]) && values[j] > 0) {
                    edges.push({
                        from: i,
                        to: j,
                        weight: values[j]
                    });
                }
            }
        }

        return { edges, labels };
    }

    function updateGraph() {
        try {
            const result = parseMatrixInput(matrixInput.value);
            currentEdges = result.edges;
            currentLabels = result.labels;
        }
        catch (error) {
            console.error('Invalid input format');
        }
    }

    runButton.addEventListener('click', function () {
        if (currentEdges.length > 0) {
            const nodeCount = currentLabels.length;
            const result = graphUtils.runPrimAlgorithm(currentEdges);
            graphUtils.drawGraph(result, nodeCount, currentLabels);
        }
    });

    matrixInput.addEventListener('input', updateGraph);
});
