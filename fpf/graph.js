(function (root) {
  'use strict';
  function buildGraph(n) {
    if (!Number.isInteger(n) || n < 1 || n > 6) throw new RangeError('Choose an integer from 1 to 6.');
    const nodes = [], edges = [], byKey = new Map(), layers = Array.from({length: n}, () => []);
    function permute(prefix, remaining) {
      if (!remaining.length) {
        const visited = new Set(); let cycles = 0;
        for (let i = 0; i < n; i++) {
          if (visited.has(i)) continue;
          cycles++;
          for (let j = i; !visited.has(j); j = prefix[j] - 1) visited.add(j);
        }
        const node = {id: nodes.length, values: prefix, depth: n - cycles, fpf: prefix.every((v, i) => v !== i + 1), neighbors: []};
        nodes.push(node); byKey.set(prefix.join(','), node); layers[node.depth].push(node); return;
      }
      remaining.forEach((v, i) => permute([...prefix, v], remaining.filter((_, j) => j !== i)));
    }
    permute([], Array.from({length: n}, (_, i) => i + 1));
    for (const node of nodes) for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const values = [...node.values]; [values[i], values[j]] = [values[j], values[i]];
      const other = byKey.get(values.join(',')); node.neighbors.push(other.id);
      if (node.id < other.id) edges.push({source: node.id, target: other.id, positions: [i + 1, j + 1]});
    }
    return {nodes, edges, layers};
  }
  root.buildGraph = buildGraph;
  if (typeof module !== 'undefined') module.exports = {buildGraph};
})(typeof window !== 'undefined' ? window : globalThis);
