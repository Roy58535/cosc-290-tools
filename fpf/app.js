'use strict';
const $ = id => document.getElementById(id);
const svg = $('graph'), viewport = $('viewport');
const colors = ['#60758b','#cc6b28','#168477','#8056b5','#bb4979','#3671bc'];
let graph, selected = null, scale = 1, panX = 0, panY = 0, drawing, width, height;
const ns = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text) {const e = document.createElementNS(ns, tag); for (const [k,v] of Object.entries(attrs)) e.setAttribute(k,v); if(text !== undefined)e.textContent=text; parent.append(e); return e;}
function transform(){drawing.setAttribute('transform',`translate(${panX},${panY}) scale(${scale})`);}
function fit(){scale=Math.min(viewport.clientWidth/width,viewport.clientHeight/height,1.4)*.94;panX=(viewport.clientWidth-width*scale)/2;panY=(viewport.clientHeight-height*scale)/2;transform();}
function zoom(factor,x=viewport.clientWidth/2,y=viewport.clientHeight/2){const next=Math.max(.08,Math.min(5,scale*factor));panX=x-(x-panX)*next/scale;panY=y-(y-panY)*next/scale;scale=next;transform();}
function select(id){
  selected=id;const near=new Set(id===null?[]:[id,...graph.nodes[id].neighbors]);
  for(const node of graph.nodes){node.element.classList.toggle('dim',id!==null&&!near.has(node.id));node.element.classList.toggle('selected',node.id===id);node.element.setAttribute('aria-pressed',String(node.id===id));}
  for(const edge of graph.edges){const active=edge.source===id||edge.target===id;edge.element.classList.toggle('active',active);edge.element.classList.toggle('dim',id!==null&&!active);edge.element.style.display=($('edges').checked||active)?'':'none';if(active)edge.element.parentNode.append(edge.element);}
  if(id===null){$('selection').textContent='Select a node to highlight all permutations one swap away.';return;}
  const node=graph.nodes[id];const fixed=node.values.flatMap((v,i)=>v===i+1?[i+1]:[]);
  $('selection').textContent=`[${node.values.join(' ')}] · ${node.depth} minimum swap${node.depth===1?'':'s'} · ${node.fpf?'Fixed-point-free':`Fixed positions: ${fixed.join(', ')}`} · ${node.neighbors.length} neighbors`;
}
function render(n){
  graph=buildGraph(n);selected=null;svg.replaceChildren();
  const nodeW=30+n*12, step=nodeW+14, maxCount=Math.max(...graph.layers.map(l=>l.length));
  // Wrap large layers into bands so labels remain readable when zoomed in.
  const columns=Math.min(maxCount,n<=4?12:24);width=Math.max(620,columns*step+150);
  let y=60;
  drawing=el('g',{},svg);const guides=el('g',{},drawing),edgeGroup=el('g',{},drawing),nodeGroup=el('g',{},drawing);
  graph.layers.forEach((layer,d)=>{
    const rows=Math.ceil(layer.length/columns), bandH=Math.max(66,rows*45);
    el('text',{x:15,y:y+4,class:'layer-label'},guides,`${d} swap${d===1?'':'s'}`);
    el('text',{x:15,y:y+22,class:'layer-count'},guides,`${layer.length} nodes`);
    el('line',{x1:105,x2:width-15,y1:y-27,y2:y-27,class:'layer-line'},guides);
    layer.forEach((node,i)=>{const row=Math.floor(i/columns),count=Math.min(columns,layer.length-row*columns);node.x=115+(width-130-count*step)/2+(i%columns)*step+nodeW/2;node.y=y+row*45;});y+=bandH+65;
  });height=y-30;
  for(const edge of graph.edges){const a=graph.nodes[edge.source],b=graph.nodes[edge.target];edge.element=el('path',{d:`M ${a.x} ${a.y} L ${b.x} ${b.y}`,class:'edge'},edgeGroup);}
  for(const node of graph.nodes){const g=el('g',{transform:`translate(${node.x},${node.y})`,class:'node',tabindex:node.id===0?'0':'-1',role:'button','aria-label':`Permutation ${node.values.join(', ')}, ${node.depth} swaps${node.fpf?', fixed-point-free':''}`,'aria-pressed':'false'},nodeGroup);node.element=g;
    el('rect',{x:-nodeW/2,y:-15,width:nodeW,height:30,rx:7,fill:node.fpf?colors[node.depth]:colors[0]},g);
    el('text',{'text-anchor':'middle','dominant-baseline':'central'},g,node.values.join(' '));
    el('title',{},g,`[${node.values.join(' ')}]${node.fpf?' · FPF':''}\nMinimum swaps: ${node.depth}`);
    g.addEventListener('click',()=>{if(!dragged)select(selected===node.id?null:node.id);});
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(selected===node.id?null:node.id);}if(e.key.startsWith('Arrow')){e.preventDefault();const next=graph.nodes[(node.id+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+graph.nodes.length)%graph.nodes.length];g.setAttribute('tabindex','-1');next.element.setAttribute('tabindex','0');next.element.focus();}});
  }
  $('stats').innerHTML=`<strong>${graph.nodes.length}</strong> permutations &nbsp;·&nbsp; <strong>${graph.edges.length}</strong> swaps &nbsp;·&nbsp; <strong>${graph.nodes.filter(v=>v.fpf).length}</strong> FPF &nbsp;·&nbsp; <strong>${n}</strong> layers`;
  $('legend').replaceChildren();for(const [label,color] of [['Non-FPF',colors[0]],...graph.layers.flatMap((l,d)=>l.some(v=>v.fpf)?[[`FPF · ${d} swap${d===1?'':'s'}`,colors[d]]]:[])]){const span=document.createElement('span');const dot=document.createElement('i');dot.className='swatch';dot.style.background=color;span.append(dot,document.createTextNode(label));$('legend').append(span);}
  select(null);fit();
}
let drag=null,dragged=false;
viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,px:panX,py:panY};dragged=false;});
window.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>4)dragged=true;if(dragged){panX=drag.px+dx;panY=drag.py+dy;transform();}});
window.addEventListener('pointerup',()=>{drag=null;});
viewport.addEventListener('wheel',e=>{e.preventDefault();const r=viewport.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.001),e.clientX-r.left,e.clientY-r.top);},{passive:false});
$('controls').addEventListener('submit',e=>{e.preventDefault();if($('controls').reportValidity())render(Number($('size').value));});
$('edges').addEventListener('change',()=>select(selected));$('zoom-in').onclick=()=>zoom(1.25);$('zoom-out').onclick=()=>zoom(.8);$('fit').onclick=fit;$('clear').onclick=()=>select(null);
window.addEventListener('resize',fit);render(4);
