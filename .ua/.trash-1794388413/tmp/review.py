import json,glob,collections,sys
d='C:/Users/LD/Desktop/ai_0511_knowledge_base-master/.ua/intermediate/'
g=json.load(open(d+'assembled-graph.json',encoding='utf-8'))
ns=g['nodes'];es=g['edges']
ids={n['id'] for n in ns}
print('nodes',len(ns),'edges',len(es))
print(collections.Counter(n.get('type') for n in ns))
print(collections.Counter(n.get('complexity') for n in ns))
print(collections.Counter(e.get('type') for e in es))
print('noid',[n for n in ns if not n.get('id')])
print('dangling',[e for e in es if e['source'] not in ids or e['target'] not in ids])
for e in es:
    if 'tester.py' in e['source'] and 'runner' in e['target']: print(e['source'],e['type'],e['target'])
# batch dropped edges
be=[]
for f in glob.glob(d+'batch-*.json'):
    b=json.load(open(f,encoding='utf-8'))
    for e in b.get('edges',[]):
        if e.get('source') not in ids or e.get('target') not in ids: print('DROP',f[-20:],e.get('source'),e.get('type'),e.get('target'))
sr=json.load(open(d+'scan-result.json',encoding='utf-8'))
im=sr['importMap']
fileids={n.get('filePath'):n['id'] for n in ns if n.get('type')=='file'}
imp={(e['source'],e['target']) for e in es if e['type']=='imports'}
miss=[]
for src,tgts in im.items():
    for t in tgts:
        s=fileids.get(src) or 'file:'+src; tt=fileids.get(t) or 'file:'+t
        if (s,tt) not in imp: miss.append((s,tt,s in ids,tt in ids))
print('missing imports',len(miss),miss[:20])
