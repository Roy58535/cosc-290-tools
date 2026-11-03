(function(root){
 'use strict';
 function analyzePermutation(values){
  const n=values.length;
  if(n<1||n>8||new Set(values).size!==n||values.some(v=>!Number.isInteger(v)||v<1||v>n))throw new Error('Use each integer from 1 through n exactly once, with 1 ≤ n ≤ 8.');
  const seen=new Set(),cycles=[];
  for(let i=1;i<=n;i++)if(!seen.has(i)){const cycle=[];for(let j=i;!seen.has(j);j=values[j-1]){seen.add(j);cycle.push(j);}cycles.push(cycle);}
  const state=Array.from({length:n},(_,i)=>i+1),steps=[{values:[...state],positions:[]}];
  for(const cycle of cycles)for(let j=cycle.length-1;j>=1;j--){const a=cycle[0]-1,b=cycle[j]-1;[state[a],state[b]]=[state[b],state[a]];steps.push({values:[...state],positions:[a+1,b+1]});}
  return {cycles,steps,fixed:cycles.filter(c=>c.length===1).map(c=>c[0]),distance:n-cycles.length};
 }
 root.analyzePermutation=analyzePermutation;
 if(typeof module!=='undefined')module.exports={analyzePermutation};
})(typeof window!=='undefined'?window:globalThis);
