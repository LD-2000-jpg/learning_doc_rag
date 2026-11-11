const fs=require('fs');
const N=[],E=[];
const e=(s,t,type,w)=>E.push({source:s,target:t,type,direction:'forward',weight:w});
const MP='app/infra/model/model_providers.py',IN='app/shared/model/__init__.py',EM='app/shared/model/embedding_utils.py',LM='app/shared/model/lm_utils.py',RR='app/shared/model/reranker_utils.py';
N.push({id:'file:'+MP,type:'file',name:'model_providers.py',filePath:MP,summary:'基础设施层的模型统一提供者，封装 LLM、视觉模型、BGE-M3 嵌入向量生成、Reranker 打分及 token 计数，并导出全局单例 model_provider 供 RAG 导入与查询服务调用。',tags:['facade','singleton','model-provider','service'],complexity:'simple',languageNotes:'模块级实例 model_provider 充当单例，调用方通过同一对象访问所有模型能力。'});
N.push({id:'class:'+MP+':ModelProvider',type:'class',name:'ModelProvider',filePath:MP,lineRange:[7,29],summary:'模型能力门面类，提供 llm_model、vision_model、create_embeddings、compute_scores、compute_token_number 五个方法，委托给 shared/model 下的工具函数。',tags:['facade','llm','embedding','reranker'],complexity:'simple'});
N.push({id:'file:'+IN,type:'file',name:'__init__.py',filePath:IN,summary:'共享模型包的统一出口，重新导出 generate_embeddings、get_bge_m3_ef、get_llm_client、get_reranker_model。',tags:['entry-point','barrel','python-package'],complexity:'simple'});
N.push({id:'file:'+EM,type:'file',name:'embedding_utils.py',filePath:EM,summary:'BGE-M3 嵌入模型工具模块，以单例方式加载模型并为文本批量生成稠密+稀疏混合向量，将 CSR 稀疏矩阵解析为可序列化的字典列表以适配 Milvus。',tags:['embedding','singleton','utility','vector'],complexity:'moderate',languageNotes:'通过 indptr/indices/data 切片拆分 scipy CSR 稀疏矩阵，并用 tolist() 将 numpy 类型转为原生 Python 类型。'});
N.push({id:'function:'+EM+':get_bge_m3_ef',type:'function',name:'get_bge_m3_ef',filePath:EM,lineRange:[14,54],summary:'懒加载并缓存 BGEM3EmbeddingFunction 单例，按配置选择模型路径、设备与 fp16，并开启原生 L2 归一化。',tags:['singleton','lazy-loading','embedding','factory'],complexity:'simple'});
N.push({id:'function:'+EM+':generate_embeddings',type:'function',name:'generate_embeddings',filePath:EM,lineRange:[57,125],summary:'校验文本列表后调用 BGE-M3 编码，返回 {dense, sparse} 结构的混合向量结果，稀疏部分转换为 {特征索引: 权重} 字典。',tags:['embedding','validation','serialization','vector'],complexity:'moderate'});
N.push({id:'file:'+LM,type:'file',name:'lm_utils.py',filePath:LM,summary:'大语言模型客户端工具模块，按 (模型名, JSON 模式) 缓存 LangChain ChatOpenAI 实例，适配千问等 OpenAI 兼容 API。',tags:['llm','cache','factory','langchain'],complexity:'moderate'});
N.push({id:'function:'+LM+':get_llm_client',type:'function',name:'get_llm_client',filePath:LM,lineRange:[29,87],summary:'获取带缓存的 ChatOpenAI 客户端：校验 API 密钥与基础地址，可选开启 json_object 响应格式，并通过 extra_body 关闭千问思考链。',tags:['llm','factory','cache','configuration'],complexity:'moderate'});
N.push({id:'file:'+RR,type:'file',name:'reranker_utils.py',filePath:RR,summary:'重排模型工具模块，以单例方式懒加载 FlagEmbedding 的 FlagReranker，供检索结果打分重排使用。',tags:['reranker','singleton','utility'],complexity:'simple'});
N.push({id:'function:'+RR+':get_reranker_model',type:'function',name:'get_reranker_model',filePath:RR,lineRange:[12,28],summary:'根据 reranker 配置（模型路径、设备、fp16）首次初始化并返回 FlagReranker 单例。',tags:['singleton','lazy-loading','reranker','factory'],complexity:'simple'});
e('file:'+MP,'class:'+MP+':ModelProvider','contains',1.0);e('file:'+MP,'class:'+MP+':ModelProvider','exports',0.8);
for(const[f,fn]of[[EM,'get_bge_m3_ef'],[EM,'generate_embeddings'],[LM,'get_llm_client'],[RR,'get_reranker_model']]){e('file:'+f,'function:'+f+':'+fn,'contains',1.0);e('file:'+f,'function:'+f+':'+fn,'exports',0.8);}
const imp={[MP]:[EM,LM,RR],[IN]:[EM,LM,RR],[EM]:['app/shared/config/embedding_config.py','app/shared/runtime/logger.py'],[LM]:['app/shared/config/lm_config.py','app/shared/runtime/logger.py'],[RR]:['app/shared/config/reranker_config.py','app/shared/runtime/logger.py']};
for(const k in imp)for(const t of imp[k])e('file:'+k,'file:'+t,'imports',0.7);
const C='class:'+MP+':ModelProvider';
e(C,'function:'+LM+':get_llm_client','calls',0.8);e(C,'function:'+EM+':generate_embeddings','calls',0.8);e(C,'function:'+RR+':get_reranker_model','calls',0.8);
e('function:'+EM+':generate_embeddings','function:'+EM+':get_bge_m3_ef','calls',0.8);
for(const f of [IN]){e('file:'+f,'function:'+EM+':generate_embeddings','exports',0.8);e('file:'+f,'function:'+EM+':get_bge_m3_ef','exports',0.8);e('file:'+f,'function:'+LM+':get_llm_client','exports',0.8);e('file:'+f,'function:'+RR+':get_reranker_model','exports',0.8);}
e('file:'+EM,'class:app/shared/config/embedding_config.py:EmbeddingConfig','depends_on',0.6);
e('file:'+LM,'class:app/shared/config/lm_config.py:LLMConfig','depends_on',0.6);
e('file:'+RR,'class:app/shared/config/reranker_config.py:RerankerConfig','depends_on',0.6);
fs.writeFileSync('.ua/intermediate/batch-5.json',JSON.stringify({nodes:N,edges:E},null,1));
console.log(N.length,E.length,E.filter(x=>x.type==='imports').length);
