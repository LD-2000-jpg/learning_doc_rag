const fs=require('fs');
try{
const inp=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const nodes=inp.fileNodes, ids=new Set(nodes.map(n=>n.id));
const P={routes:'api',api:'api',controllers:'api',endpoints:'api',handlers:'api',services:'service',core:'service',lib:'service',domain:'service',logic:'service',models:'data',model:'data',db:'data',data:'data',components:'ui',views:'ui',pages:'ui',ui:'ui',middleware:'middleware',utils:'utility',helpers:'utility',common:'utility',shared:'utility',tools:'utility',config:'config',constants:'config',env:'config',settings:'config',tests:'test',test:'test',__tests__:'test',types:'types',schemas:'types',schema:'data',docs:'documentation',notes:'documentation',assets:'assets',static:'assets',public:'assets',infra:'infrastructure'};
const grp=p=>{const s=p.split('/');if(s.length===1)return 'root';if(s[0]==='app'&&s.length>2)return s[0]+'/'+s[1];return s[0];};
const dg={},nt={},g={};
for(const n of nodes){const k=grp(n.filePath||n.id.split(':').slice(1).join(':'));g[n.id]=k;(dg[k]=dg[k]||[]).push(n.id);(nt[n.type]=nt[n.type]||[]).push(n.id);}
const fi={},fo={},ig={},intra={};
for(const e of inp.importEdges){if(!ids.has(e.source)||!ids.has(e.target))continue;fo[e.source]=(fo[e.source]||0)+1;fi[e.target]=(fi[e.target]||0)+1;
const a=g[e.source],b=g[e.target];intra[a]=intra[a]||{internalEdges:0,totalEdges:0};intra[b]=intra[b]||{internalEdges:0,totalEdges:0};
if(a===b){intra[a].internalEdges++;intra[a].totalEdges++;}else{intra[a].totalEdges++;intra[b].totalEdges++;const k=a+'->'+b;ig[k]=(ig[k]||0)+1;}}
for(const k in intra)intra[k].density=+(intra[k].internalEdges/(intra[k].totalEdges||1)).toFixed(2);
const tmap=Object.fromEntries(nodes.map(n=>[n.id,n.type]));const cc={};
for(const e of inp.allEdges){if(!tmap[e.source]||!tmap[e.target])continue;if(tmap[e.source]===tmap[e.target]&&tmap[e.source]==='file')continue;const k=tmap[e.source]+'|'+tmap[e.target]+'|'+e.type;cc[k]=(cc[k]||0)+1;}
const igl=Object.entries(ig).map(([k,c])=>{const[f,t]=k.split('->');return{from:f,to:t,count:c}}).sort((x,y)=>y.count-x.count);
const dd=[];for(const x of igl){const r=ig[x.to+'->'+x.from]||0;if(x.count>r||(x.count===r&&x.from<x.to))dd.push({dependent:x.from,dependsOn:x.to});}
const pm={};for(const k in dg){const last=k.split('/').pop();pm[k]=P[last]||null;}
const paths=nodes.map(n=>n.filePath||'');
const docs=new Set(paths.filter(p=>/\.(md|rst)$/i.test(p)).map(p=>grp(p)));
const out={scriptCompleted:true,directoryGroups:dg,nodeTypeGroups:nt,
crossCategoryEdges:Object.entries(cc).map(([k,c])=>{const[a,b,t]=k.split('|');return{fromType:a,toType:b,edgeType:t,count:c}}),
interGroupImports:igl,intraGroupDensity:intra,patternMatches:pm,
deploymentTopology:{hasDockerfile:paths.some(p=>/Dockerfile/.test(p)),hasCompose:paths.some(p=>/docker-compose/.test(p)),hasK8s:false,hasTerraform:paths.some(p=>/\.tf$/.test(p)),hasCI:paths.some(p=>/\.github\/workflows|gitlab-ci|Jenkinsfile/.test(p)),infraFiles:paths.filter(p=>/Dockerfile|docker-compose|\.tf$|\.github\/|Makefile/.test(p))},
dataPipeline:{schemaFiles:paths.filter(p=>/\.(sql|graphql|proto)$|schema/.test(p)),migrationFiles:paths.filter(p=>/migrations\//.test(p)),dataModelFiles:paths.filter(p=>/models?\//.test(p)),apiHandlerFiles:paths.filter(p=>/api\/http\//.test(p))},
docCoverage:{groupsWithDocs:docs.size,totalGroups:Object.keys(dg).length,coverageRatio:+(docs.size/Object.keys(dg).length).toFixed(2),undocumentedGroups:Object.keys(dg).filter(k=>!docs.has(k))},
dependencyDirection:dd,fileStats:{totalFileNodes:nodes.length,filesPerGroup:Object.fromEntries(Object.entries(dg).map(([k,v])=>[k,v.length])),nodeTypeCounts:Object.fromEntries(Object.entries(nt).map(([k,v])=>[k,v.length]))},fileFanIn:fi,fileFanOut:fo};
fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));process.exit(0);
}catch(e){console.error(e.stack);process.exit(1);}
