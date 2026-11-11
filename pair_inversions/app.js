/* Pure helpers also export to Node for verification; the page needs no server. */
function permutations(values) {
  if (!values.length) return [[]];
  return values.flatMap((v, i) => permutations(values.filter((_, j) => j !== i)).map(tail => [v, ...tail]));
}
function inversionPairs(p) {
  const pairs = [];
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) pairs.push([p[i], p[j]]);
  return pairs;
}
function makeRows(n) {
  const values = Array.from({length:n}, (_, i) => i + 1);
  const columns = values.map(k => permutations(values.filter(v => v !== k)).map(tail => [k, ...tail]));
  return columns[0].map((_, r) => columns.map(column => ({p: column[r], x: inversionPairs(column[r]).length})));
}
function arrangeRows(rows, view) {
  if (view === 'lex') return rows.map(row => row.map(entry => [entry]));
  const sorted = [...rows].sort((a, b) => a[0].x - b[0].x);
  if (view === 'sorted') return sorted.map(row => row.map(entry => [entry]));
  const groups = [];
  for (const row of sorted) {
    const t = row[0].x;
    if (!groups[t]) groups[t] = row.map(() => []);
    row.forEach((entry, c) => groups[t][c].push(entry));
  }
  return groups;
}
if (typeof module !== 'undefined') module.exports = { permutations, inversionPairs, makeRows, arrangeRows };
if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  let rows = [], active = null, selected = null, maximum = 0, view = 'lex';
  const descriptions = {
    lex: 'Original order: permutations increase lexicographically across rows and down each starting-number group. Tail inversion counts can decrease, breaking the strips.',
    sorted: 'Rows are sorted by tail inversion count, with lexicographic order breaking ties. Equal-X bands form continuous stair steps; repeated tail counts give different band widths.',
    grouped: 'One equal-height row per tail inversion count t. Each cell contains all matching permutations, with X = t + k - 1. Equal counts now form straight diagonals. Scroll inside a cell to inspect its permutations.'
  };
  const color = x => `hsl(${Math.round(45 + 265 * x / Math.max(1, maximum))} 55% 85%)`;
  function paint() {
    document.querySelectorAll('td[data-x]').forEach(cell => {
      const x = Number(cell.dataset.x);
      cell.style.backgroundColor = $('colors').checked ? color(x) : '';
      cell.classList.toggle('dim', active !== null && x !== active);
      cell.classList.toggle('selected', cell.dataset.key === selected);
    });
    document.querySelectorAll('#legend button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.x) === active)));
    const count = rows.flat(2).filter(entry => entry.x === active).length;
    $('filter-status').textContent = active === null ? 'Showing all inversion counts.' : `${count.toLocaleString()} permutations with X = ${active}.`;
  }
  function render() {
    const n = Number($('size').value);
    rows = arrangeRows(makeRows(n), view); maximum = n * (n - 1) / 2; selected = null;
    if (active > maximum) active = null;
    $('view-description').textContent = descriptions[view];
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    $('permutations').classList.toggle('grouped', view === 'grouped');
    $('permutations').querySelector('thead').innerHTML = `<tr><th rowspan="2" class="rank" scope="col">Row</th>${rows[0].map((_, i) => `<th class="group" colspan="2" scope="colgroup">Starts with ${i+1}</th>`).join('')}</tr><tr>${rows[0].map(() => '<th scope="col">Permutation</th><th scope="col">X</th>').join('')}</tr>`;
    $('stats').textContent = `${rows.flat(2).length.toLocaleString()} permutations / ${n} groups / ${rows.length} rows`;
    $('permutations').querySelector('thead .rank').textContent = view === 'grouped' ? 'Tail t' : 'Row';
    $('permutations').querySelector('caption').textContent = view === 'grouped' ? 'Grouped by tail inversions. Every row has equal height; cell lists scroll independently.' : view === 'sorted' ? 'Sorted by tail inversions, then lexicographically within ties.' : 'Permutations in lexicographic order within each starting-number column.';
    $('permutations').querySelector('tbody').innerHTML = rows.map((row, r) => `<tr><td class="rank">${view === 'grouped' ? r : r+1}</td>${row.map((entries, c) => {
      const x = entries[0].x;
      const buttons = entries.map(({p}, i) => `<button data-row="${r}" data-col="${c}" data-entry="${i}" aria-label="${p.join(' ')}; ${x} inversions. Inspect pairs.">${p.join(' ')}</button>`).join('');
      return `<td class="perm" data-x="${x}" data-key="${r}:${c}">${view === 'grouped' ? `<div class="cell-total">${entries.length} permutation${entries.length === 1 ? '' : 's'}</div><div class="cell-list" tabindex="0" role="region" aria-label="Tail ${r}, starts with ${c+1}">${buttons}</div>` : buttons}</td><td class="count" data-x="${x}" data-key="${r}:${c}">${x}</td>`;
    }).join('')}</tr>`).join('');
    $('legend').innerHTML = Array.from({length:maximum+1}, (_, x) => `<button type="button" data-x="${x}" aria-pressed="false" aria-label="Highlight X equals ${x}" style="background:${color(x)}">${x}</button>`).join('');
    $('detail').innerHTML = '<span class="detail-label">PAIR INSPECTOR</span><p>Select any permutation below.</p>';
    paint();
  }
  $('legend').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    const x = Number(button.dataset.x); active = active === x ? null : x; paint();
  });
  $('permutations').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    const {p,x} = rows[Number(button.dataset.row)][Number(button.dataset.col)][Number(button.dataset.entry)];
    selected = `${button.dataset.row}:${button.dataset.col}`;
    const pairs = inversionPairs(p);
    $('detail').innerHTML = `<span class="detail-label">PAIR INSPECTOR</span><p><strong>${p.join(' ')} &nbsp; → &nbsp; X = ${x}</strong><br>${pairs.length ? pairs.map(([a,b]) => `(${a}, ${b})`).join(' · ') : 'No inverted pairs.'} &nbsp; | &nbsp; Tail: ${x-p[0]+1} + first element: ${p[0]-1} = ${x}</p>`;
    paint();
  });
  document.querySelector('.view-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-view]'); if (!button) return;
    view = button.dataset.view; render();
  });
  $('size').addEventListener('change', render);
  $('colors').addEventListener('change', paint);
  $('clear').addEventListener('click', () => { active = null; paint(); });
  render();
}
