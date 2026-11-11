const fs=require('fs');
try{
const inp=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const nodes=inp.nodes,layers=inp.layers;const ids=new Set(nodes.map(n=>n.id));
const byPath={};nodes.forEach(n=>{if(n.filePath)byPath[n.filePath]=n.id;});
function norm(id){if(ids.has(id))return id;const m=id.match(/^[a-z]+:(.+?)(:[^:\/]+)?$/);if(m){if(byPath[m[1]])return byPath[m[1]];}return null;}
const edges=[];for(const e of inp.edges){if(e.type==='contains')continue;const s=norm(e.source),t=norm(e.target);if(s&&t&&s!==t)edges.push({source:s,target:t,type:e.type});}
const fin={},fout={},inS={},outS={};nodes.forEach(n=>{inS[n.id]=new Set();outS[n.id]=new Set();});
edges.forEach(e=>{outS[e.source].add(e.target);inS[e.target].add(e.source);});
nodes.forEach(n=>{fin[n.id]=inS[n.id].size;fout[n.id]=outS[n.id].size;});
const nm=id=>nodes.find(n=>n.id===id).name;
const fanInRanking=nodes.map(n=>({id:n.id,fanIn:fin[n.id],name:n.name})).sort((a,b)=>b.fanIn-a.fanIn).slice(0,20);
const fanOutRanking=nodes.map(n=>({id:n.id,fanOut:fout[n.id],name:n.name})).sort((a,b)=>b.fanOut-a.fanOut).slice(0,20);
const fo=Object.values(fout).sort((a,b)=>a-b),fi=Object.values(fin).sort((a,b)=>a-b);
const fo90=fo[Math.floor(fo.length*0.9)],fi25=fi[Math.floor(fi.length*0.25)];
const EP=['index.ts','index.js','main.ts','main.js','app.ts','app.js','server.ts','server.js','main.py','app.py','manage.py','__main__.py','run.py','wsgi.py','asgi.py'];
const cands=nodes.map(n=>{let s=0;const fp=n.filePath||'';const depth=fp.split('/').length-1;
if(n.type==='document'){if(/^readme\.md$/i.test(fp))s+=5;else if(depth===0&&fp.endsWith('.md'))s+=2;}
else if(n.type==='file'){if(EP.includes(n.name)||/_server\.py$/.test(n.name))s+=3;if(depth<=1)s+=1;if(fout[n.id]>=fo90&&fout[n.id]>0)s+=1;if(fin[n.id]<=fi25)s+=1;}
return {id:n.id,score:s,name:n.name,summary:n.summary};}).sort((a,b)=>b.score-a.score||fout[b.id]-fout[a.id]).slice(0,5);
const start=cands.find(c=>!c.id.startsWith('document:'));
const depthMap={},order=[];if(start){const q=[start.id];depthMap[start.id]=0;while(q.length){const c=q.shift();order.push(c);for(const e of edges)if(e.source===c&&(e.type==='imports'||e.type==='calls')&&!(e.target in depthMap)){depthMap[e.target]=depthMap[c]+1;q.push(e.target);}}}
const byDepth={};order.forEach(id=>{(byDepth[depthMap[id]]=byDepth[depthMap[id]]||[]).push(id);});
const cat=t=>t==='document'?'documentation':['service','pipeline','resource'].includes(t)?'infrastructure':['table','schema','endpoint'].includes(t)?'data':t==='config'?'config':null;
const nonCodeFiles={documentation:[],infrastructure:[],data:[],config:[]};nodes.forEach(n=>{const c=cat(n.type);if(c)nonCodeFiles[c].push({id:n.id,name:n.name,type:n.type,summary:n.summary});});
const pairs=[];const seen=new Set();edges.forEach(e=>{if(outS[e.target].has(e.source)){const k=[e.source,e.target].sort().join('|');if(!seen.has(k)){seen.add(k);pairs.push(k.split('|'));}}});
const clusters=pairs.map(p=>{const c=new Set(p);for(const n of nodes){if(c.size>=5)break;if(c.has(n.id))continue;let k=0;c.forEach(m=>{if(outS[n.id].has(m)||inS[n.id].has(m))k++;});if(k>=2)c.add(n.id);}
const arr=[...c];let ec=0;edges.forEach(e=>{if(c.has(e.source)&&c.has(e.target))ec++;});return {nodes:arr,edgeCount:ec};}).sort((a,b)=>b.edgeCount-a.edgeCount).slice(0,10);
const nodeSummaryIndex={};nodes.forEach(n=>nodeSummaryIndex[n.id]={name:n.name,type:n.type,summary:n.summary});
fs.writeFileSync(process.argv[3],JSON.stringify({scriptCompleted:true,entryPointCandidates:cands,fanInRanking,fanOutRanking,bfsTraversal:{startNode:start&&start.id,order,depthMap,byDepth},nonCodeFiles,clusters,layers:{count:layers.length,list:layers},nodeSummaryIndex,totalNodes:nodes.length,totalEdges:inp.edges.length},null,1));
}catch(err){console.error(err.stack);process.exit(1);}
