// Add prompt -> service `related` edges that the per-batch analyzers could not see (load_prompt("<name>") calls)
const fs = require('fs');
const p = process.argv[2];
const g = JSON.parse(fs.readFileSync(p, 'utf8'));
const add = [
  ['file:app/resources/prompts/image_summary.prompt', 'file:app/rag/import_/enrich_markdown_images.py', '图片摘要提示词由 enrich_markdown_images 通过 load_prompt("image_summary") 加载'],
  ['file:app/resources/prompts/rerank_text_refine.prompt', 'file:app/rag/query/rerank_service.py', '重排文本精炼提示词由 rerank_service 通过 load_prompt("rerank_text_refine") 加载'],
  ['file:app/resources/prompts/rewritten_query_and_itemnames.prompt', 'file:app/rag/query/item_name_confirm_service.py', '问题改写与主体提取提示词由 item_name_confirm_service 通过 load_prompt("rewritten_query_and_itemnames") 加载'],
];
const ids = new Set(g.nodes.map(n => n.id));
const have = new Set(g.edges.map(e => `${e.source}|${e.target}|${e.type}`));
let n = 0;
for (const [source, target, description] of add) {
  if (!ids.has(source) || !ids.has(target)) { console.log('skip, missing node', source, target); continue; }
  if (have.has(`${source}|${target}|related`)) continue;
  g.edges.push({ source, target, type: 'related', direction: 'forward', weight: 0.5, description });
  n++;
}
fs.writeFileSync(p, JSON.stringify(g, null, 2));
console.log('added', n, 'edges; total', g.edges.length);
