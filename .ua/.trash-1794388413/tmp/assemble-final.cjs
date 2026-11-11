// Normalize tour, then assemble the full KnowledgeGraph into intermediate/assembled-graph.json
const fs = require('fs');
const path = require('path');
const ua = process.argv[2];
const inter = path.join(ua, 'intermediate');
const g = JSON.parse(fs.readFileSync(path.join(inter, 'assembled-graph.json'), 'utf8'));
const s = JSON.parse(fs.readFileSync(path.join(inter, 'scan-result.json'), 'utf8'));
const layers = JSON.parse(fs.readFileSync(path.join(ua, 'tmp', 'layers-normalized.json'), 'utf8'));
let T = JSON.parse(fs.readFileSync(path.join(inter, 'tour.json'), 'utf8'));
if (!Array.isArray(T) && T.steps) T = T.steps;

const ids = new Set(g.nodes.map(n => n.id));
const pre = /^(file|config|document|service|pipeline|table|schema|resource|endpoint):/;
T = T.map(t => {
  const o = {
    order: t.order,
    title: t.title,
    description: t.description ?? t.whyItMatters,
    nodeIds: (t.nodeIds || t.nodesToInspect || [])
      .map(x => (pre.test(x) ? x : 'file:' + x))
      .filter(x => ids.has(x)),
  };
  if (t.languageLesson) o.languageLesson = t.languageLesson;
  return o;
}).sort((a, b) => a.order - b.order);

const ts = fs.readFileSync(path.join(ua, 'tmp', 'analysis_timestamp.txt'), 'utf8').trim();
const kg = {
  version: '1.0.0',
  project: {
    name: s.name,
    languages: s.languages,
    frameworks: s.frameworks,
    description: s.description,
    analyzedAt: new Date().toISOString(),
    gitCommitHash: 'no-git-' + ts,
  },
  nodes: g.nodes,
  edges: g.edges,
  layers,
  tour: T,
};
fs.writeFileSync(path.join(inter, 'assembled-graph.json'), JSON.stringify(kg, null, 2));
console.log('tour steps', T.length, 'nodeIds per step', T.map(t => t.nodeIds.length).join(','));
