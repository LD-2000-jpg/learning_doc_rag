const fs=require('fs');
const R='C:/Users/LD/Desktop/ai_0511_knowledge_base-master/.ua/';
const b=require(R+'intermediate/batches.json').batches.find(x=>x.batchIndex===1);
const ex=require(R+'tmp/ua-file-extract-results-1.json');
const byPath={};for(const r of ex.results)byPath[r.path]=r;
const F={
'app/api/http/import_server.py':['FastAPI 导入服务入口，提供导入页面、文件上传和任务状态查询接口，并通过后台任务调用 LangGraph 导入流程。',['api-handler','entry-point','fastapi','后台任务','文件上传'],'moderate'],
'app/api/schema/import_schema.py':['定义导入接口的 Pydantic 响应模型，包括任务状态响应和上传响应结构。',['data-model','validation','pydantic','api-schema'],'simple'],
'app/process/import_/agent/main_graph.py':['构建并编译文档导入 LangGraph 状态图，串联入口、PDF 转 MD、图片增强、切分、商品名识别、向量化与 Milvus 入库节点，并按文件类型条件路由。',['langgraph','工作流编排','导入流程','条件路由','entry-point'],'moderate','模块级完成 StateGraph 的构建与 compile，导出 import_graph_app 供 API 与测试直接调用。'],
'app/process/import_/agent/nodes/node_bge_embedding.py':['导入图中的向量化节点，记录任务进度并调用嵌入服务为文本块生成 BGE-M3 向量。',['langgraph-node','embedding','导入流程','任务追踪'],'simple'],
'app/process/import_/agent/nodes/node_document_split.py':['导入图中的文档切分节点，记录任务进度并调用切分服务将 Markdown 切成文本块。',['langgraph-node','文本切分','导入流程','任务追踪'],'simple'],
'app/process/import_/agent/nodes/node_entry.py':['导入图入口节点，更新任务为处理中并调用入口服务识别输入文件类型。',['langgraph-node','entry-point','导入流程','任务追踪'],'simple'],
'app/process/import_/agent/nodes/node_import_milvus.py':['导入图的 Milvus 入库节点，调用索引服务写入向量块并将任务标记为完成。',['langgraph-node','milvus','向量入库','任务追踪'],'moderate'],
'app/process/import_/agent/nodes/node_md_img.py':['导入图的 Markdown 图片增强节点，调用图片增强服务为 MD 中的图片生成描述并替换链接。',['langgraph-node','markdown','图片处理','导入流程'],'simple'],
'app/process/import_/agent/nodes/node_pdf_to_md.py':['导入图的 PDF 解析节点，调用 MinerU 解析服务把 PDF 转换为 Markdown。',['langgraph-node','pdf-解析','导入流程','任务追踪'],'simple'],
'app/process/import_/agent/state.py':['定义导入流程共享状态 ImportGraphState（TypedDict）以及默认状态的创建函数。',['type-definition','state','langgraph','factory','导入流程'],'moderate'],
'app/process/query/agent/nodes/node_rrf.py':['查询图中的 RRF 融合节点，记录流式任务进度并调用 RRF 服务融合多路检索结果。',['langgraph-node','rrf','检索融合','查询流程'],'simple'],
'app/rag/import_/config.py':['导入流程常量配置，包括 MinerU 轮询/超时参数、输出目录、支持的图片扩展名以及文本切块大小与批量参数。',['config','常量','文本切分','mineru'],'simple'],
'app/rag/import_/embedding_service.py':['嵌入服务：校验状态中的文本块，按批次调用 BGE-M3 模型生成稠密与稀疏向量并写回状态。',['service','embedding','批处理','bge-m3'],'moderate'],
'app/rag/import_/enrich_markdown_images.py':['Markdown 图片增强服务：提取图片及上下文，调用视觉大模型生成图片摘要，上传图片到 MinIO 并用 URL 与摘要替换原 MD 内容后备份。',['service','多模态','minio','图片处理','markdown'],'complex'],
'app/rag/import_/entry_service.py':['入口服务：解析输入文件路径，判断是 PDF 还是 Markdown 并设置对应读取开关与文件标题。',['service','文件类型识别','validation','导入流程'],'simple'],
'app/rag/import_/index_service.py':['索引服务：准备/创建 Milvus chunks 集合（含稠密、稀疏向量字段与索引），并批量插入文本块向量数据。',['service','milvus','向量索引','schema-definition'],'moderate'],
'app/rag/import_/pdf_parse_service.py':['PDF 解析服务：上传 PDF 到 MinerU 云服务并轮询任务结果，下载 ZIP 解压出 Markdown 写回状态。',['service','pdf-解析','mineru','轮询','外部-api'],'complex'],
'app/rag/import_/split_service.py':['文档切分服务：按 Markdown 标题切分文档，对过长块递归二次切分、过短块合并，并将切块结果备份为 JSON。',['service','文本切分','chunking','markdown','langchain'],'complex'],
'app/rag/query/rrf_service.py':['RRF 服务：对向量检索、HyDE 检索等多路召回结果执行倒数排名融合并写回查询状态。',['service','rrf','检索融合','排序算法'],'moderate'],
'app/shared/runtime/logger.py':['基于 loguru 的全局日志工具，读取 .env 配置控制台/文件输出，修正调用位置，并提供节点日志与步骤日志装饰器。',['utility','logging','singleton','decorator','配置驱动'],'moderate','通过 inspect 穿透调用栈修正 loguru 的日志位置，并以装饰器形式为节点与步骤函数统一打点。'],
'app/shared/utils/rate_limit_utils.py':['基于滑动窗口的全局 API 速率限制工具，超过窗口内请求上限时阻塞等待。',['utility','rate-limit','滑动窗口','并发控制'],'simple'],
'tests/01_project_logger_output.py':['手动测试脚本，验证项目 logger 各级别日志的控制台与文件输出。',['test','logging','手动测试'],'simple'],
'tests/03_import_state_test.py':['手动测试脚本，验证导入流程默认状态的创建与打印。',['test','state','导入流程'],'simple'],
'tests/04_import_graph_test.py':['手动测试脚本，验证导入 LangGraph 图对象的构建与结构输出。',['test','langgraph','导入流程'],'simple'],
'tests/05_base64_byte_str.py':['演示脚本，测试图片与 Base64 字符串之间的编码与解码转换。',['test','base64','图片处理','演示'],'simple'],
'tests/09_test_import_graph_invoke.py':['端到端测试脚本，用示例 PDF 构造默认状态并 invoke 导入图，输出完整流程结果。',['test','端到端','langgraph','导入流程'],'simple'],
'tests/10_fastapi/01_fast_base_use.py':['FastAPI 基础用法学习示例，演示路径参数、查询参数、JSON 请求体、文件上传下载与流式响应。',['test','fastapi','示例','流式响应','教学'],'moderate'],
};
const FN={
'app/api/http/import_server.py':{return_html:'返回前端导入页面 import.html 文件响应。',return_status:'根据 task_id 查询运行中/已完成节点列表与任务状态并返回。',invoke_import_graph:'创建默认状态并调用导入图执行，更新任务的处理中/完成/失败状态。',upload_files:'接收上传文件保存到以任务ID命名的目录，并以后台任务启动导入流程。'},
'app/process/import_/agent/main_graph.py':{after_node_entry:'入口节点后的条件路由函数，根据 PDF/MD 读取开关决定跳转 node_pdf_to_md、node_md_img 或 END。'},
'app/process/import_/agent/nodes/node_bge_embedding.py':{node_bge_embedding:'向量化节点函数，包装 generate_chunk_embeddings 并记录任务节点进度。'},
'app/process/import_/agent/nodes/node_document_split.py':{node_document_split:'文档切分节点函数，包装 split_document 并记录任务节点进度。'},
'app/process/import_/agent/nodes/node_entry.py':{node_entry:'入口节点函数，标记任务处理中并调用 resolve_input_file 识别文件类型。'},
'app/process/import_/agent/nodes/node_import_milvus.py':{node_import_milvus:'Milvus 入库节点函数，调用 index_chunks 写入向量并标记任务完成。'},
'app/process/import_/agent/nodes/node_md_img.py':{node_md_img:'图片增强节点函数，包装 enrich_markdown_images 并记录任务节点进度。'},
'app/process/import_/agent/nodes/node_pdf_to_md.py':{node_pdf_to_md:'PDF 转 MD 节点函数，包装 parse_pdf_to_markdown 并记录任务节点进度。'},
'app/process/import_/agent/state.py':{create_default_state:'基于默认模板创建导入状态，并用传入参数覆盖对应字段。',get_default_state:'返回默认导入状态的副本。'},
'app/process/query/agent/nodes/node_rrf.py':{node_rrf:'RRF 节点函数，按会话记录流式进度并调用 fuse_by_rrf 融合检索结果。'},
'app/rag/import_/embedding_service.py':{get_data_and_validate:'从状态中取出文本块并校验非空。',batch_create_chunks_vector:'按批次调用嵌入模型为文本块生成稠密/稀疏向量。',generate_chunk_embeddings:'嵌入服务主入口：校验数据、批量生成向量并写回状态。'},
'app/rag/import_/enrich_markdown_images.py':{validate_data_and_paths:'校验 Markdown 路径与图片目录是否存在并读取内容。',extract_image_context_info:'扫描图片目录并在 MD 中定位图片引用，截取前后上下文。',call_vision_summary_images:'调用视觉大模型结合上下文为每张图片生成摘要（带速率限制）。',upload_to_minio_return_url:'清理旧对象后将图片上传到 MinIO 并返回访问 URL。',replace_old_md_content:'用图片摘要与 MinIO URL 替换 MD 中的原始图片引用。',backup_new_md_content:'将增强后的 Markdown 内容写入新文件备份。',enrich_markdown_images:'图片增强主流程：串联校验、上下文提取、摘要生成、上传与替换。'},
'app/rag/import_/entry_service.py':{resolve_input_file:'校验输入文件，按扩展名设置 PDF/MD 读取开关与文件标题。'},
'app/rag/import_/index_service.py':{get_data_and_validate:'从状态中取出带向量的文本块并校验。',prepare_chunks_milvus_collection:'检查并创建 Milvus chunks 集合的 schema 与稠密/稀疏向量索引。',insert_chunks_to_milvus:'将文本块数据批量插入 Milvus 并回填主键。',index_chunks:'索引服务主入口：准备集合并插入文本块。'},
'app/rag/import_/pdf_parse_service.py':{validate_data_and_paths:'校验 PDF 路径与输出目录。',upload_pdf_and_poll:'申请 MinerU 上传地址、上传 PDF 并轮询解析任务直到完成或超时。',download_zip_and_extract_md:'下载 MinerU 结果 ZIP，解压并定位输出的 Markdown 文件。',parse_pdf_to_markdown:'PDF 解析主入口：串联校验、上传轮询与下载解压。'},
'app/rag/import_/split_service.py':{validate_data_and_content:'校验并读取待切分的 Markdown 内容。',split_document_by_title:'按 Markdown 标题层级切分文档，跳过代码块中的伪标题。',_too_long_split:'对超长文本块使用 RecursiveCharacterTextSplitter 二次切分。',_too_short_merge:'将同标题下过短的相邻文本块合并。',refine_split_or_merge_chunks:'对切块结果统一执行过长切分与过短合并优化。',backup_chunks:'将切块结果以 JSON 格式备份到输出目录。',split_document:'切分服务主入口：校验、按标题切分、优化与备份。'},
'app/rag/query/rrf_service.py':{validate_and_get_data:'从查询状态中取出多路检索结果并校验。',reciprocal_rank_fusion:'实现倒数排名融合算法，按 1/(k+rank) 累加分数并排序。',fuse_by_rrf:'RRF 服务主入口：融合多路结果并写回状态。'},
'app/shared/runtime/logger.py':{init_logger:'按 .env 配置初始化 loguru 控制台与文件输出（轮转、保留、异步）。',fix_log_position:'loguru patcher，穿透调用栈修正日志记录的实际业务调用位置。',node_log:'图节点日志装饰器，记录节点开始、结束与异常。',step_log:'步骤日志装饰器，记录服务步骤的执行与耗时。'},
'app/shared/utils/rate_limit_utils.py':{apply_api_rate_limit:'滑动窗口限流：清理过期时间戳，超限时阻塞等待后记录当前请求。'},
'tests/10_fastapi/01_fast_base_use.py':{delete_product:'演示路径参数的删除接口。',find_product:'演示查询参数的商品查询接口。',save_product:'演示 JSON 请求体（BaseModel）的保存接口。',upload_image:'演示文件上传并保存到本地。',find_image:'演示以 FileResponse 返回图片文件。',generate_stream:'异步生成器，逐段产出流式数据。',stream_response:'演示 StreamingResponse 流式响应接口。'},
};
const CL={'app/api/schema/import_schema.py':{StatusResponseSchema:'任务状态查询响应模型，包含任务状态与运行/完成节点列表。',UploadResponseSchema:'上传接口响应模型，返回任务ID等信息。'},'app/process/import_/agent/state.py':{ImportGraphState:'导入流程全局状态 TypedDict，包含任务ID、文件路径、读取开关、MD 内容、文本块等字段。'}};
const nodes=[],edges=[];const E=(s,t,type,w)=>edges.push({source:s,target:t,type,direction:'forward',weight:w});
for(const f of b.files){const p=f.path,m=F[p];const id='file:'+p;
 const n={id,type:'file',name:p.split('/').pop(),filePath:p,summary:m[0],tags:m[1],complexity:m[2]};if(m[3])n.languageNotes=m[3];nodes.push(n);
 const r=byPath[p];
 for(const fn of (r.functions||[])){const s=(FN[p]||{})[fn.name];if(!s)continue;const fid=`function:${p}:${fn.name}`;
  nodes.push({id:fid,type:'function',name:fn.name,filePath:p,lineRange:[fn.startLine,fn.endLine],summary:s,tags:p.startsWith('tests/')?['test','fastapi','示例']:['function',...m[1].slice(0,2)],complexity:(fn.endLine-fn.startLine)>60?'complex':(fn.endLine-fn.startLine)>20?'moderate':'simple'});
  E(id,fid,'contains',1.0);if(!fn.name.startsWith('_'))E(id,fid,'exports',0.8);}
 for(const c of (r.classes||[])){const s=(CL[p]||{})[c.name];if(!s)continue;const cid=`class:${p}:${c.name}`;
  nodes.push({id:cid,type:'class',name:c.name,filePath:p,lineRange:[c.startLine,c.endLine],summary:s,tags:['data-model','type-definition','schema'],complexity:'simple'});E(id,cid,'contains',1.0);E(id,cid,'exports',0.8);}
 for(const t of (b.batchImportData[p]||[]))E(id,'file:'+t,'imports',0.7);
}
const C=(a,b)=>E(a,b,'calls',0.8);
const N='app/process/import_/agent/nodes/',S='app/rag/import_/',TU='app/shared/utils/task_utils.py';
[['node_bge_embedding','embedding_service.py','generate_chunk_embeddings'],['node_document_split','split_service.py','split_document'],['node_entry','entry_service.py','resolve_input_file'],['node_import_milvus','index_service.py','index_chunks'],['node_md_img','enrich_markdown_images.py','enrich_markdown_images'],['node_pdf_to_md','pdf_parse_service.py','parse_pdf_to_markdown']].forEach(([n,s,f])=>{const src=`function:${N}${n}.py:${n}`;C(src,`function:${S}${s}:${f}`);C(src,`function:${TU}:add_running_task`);C(src,`function:${TU}:add_done_task`);});
C(`function:${N}node_entry.py:node_entry`,`function:${TU}:update_task_status`);C(`function:${N}node_import_milvus.py:node_import_milvus`,`function:${TU}:update_task_status`);
const RR='app/process/query/agent/nodes/node_rrf.py:node_rrf';C('function:'+RR,'function:app/rag/query/rrf_service.py:fuse_by_rrf');C('function:'+RR,`function:${TU}:add_running_task`);C('function:'+RR,`function:${TU}:add_done_task`);
const IS='function:app/api/http/import_server.py:';C(IS+'invoke_import_graph','function:app/process/import_/agent/state.py:create_default_state');C(IS+'invoke_import_graph',`function:${TU}:update_task_status`);C(IS+'upload_files',IS+'invoke_import_graph');
['get_running_task_list','get_done_task_list','get_task_status'].forEach(x=>C(IS+'return_status',`function:${TU}:${x}`));
const EN='function:'+S+'enrich_markdown_images.py:';['validate_data_and_paths','extract_image_context_info','call_vision_summary_images','upload_to_minio_return_url','replace_old_md_content','backup_new_md_content'].forEach(x=>C(EN+'enrich_markdown_images',EN+x));C(EN+'call_vision_summary_images','function:app/shared/utils/rate_limit_utils.py:apply_api_rate_limit');C(EN+'call_vision_summary_images','function:app/shared/runtime/load_prompt.py:load_prompt');
const SP='function:'+S+'split_service.py:';['validate_data_and_content','split_document_by_title','refine_split_or_merge_chunks','backup_chunks'].forEach(x=>C(SP+'split_document',SP+x));C(SP+'refine_split_or_merge_chunks',SP+'_too_long_split');C(SP+'refine_split_or_merge_chunks',SP+'_too_short_merge');
const PD='function:'+S+'pdf_parse_service.py:';['validate_data_and_paths','upload_pdf_and_poll','download_zip_and_extract_md'].forEach(x=>C(PD+'parse_pdf_to_markdown',PD+x));
const IX='function:'+S+'index_service.py:';['get_data_and_validate','prepare_chunks_milvus_collection','insert_chunks_to_milvus'].forEach(x=>C(IX+'index_chunks',IX+x));
const EM='function:'+S+'embedding_service.py:';['get_data_and_validate','batch_create_chunks_vector'].forEach(x=>C(EM+'generate_chunk_embeddings',EM+x));
const RF='function:app/rag/query/rrf_service.py:';['validate_and_get_data','reciprocal_rank_fusion'].forEach(x=>C(RF+'fuse_by_rrf',RF+x));
const LG='function:app/shared/runtime/logger.py:';C(LG+'init_logger',LG+'fix_log_position');
const FA='function:tests/10_fastapi/01_fast_base_use.py:';C(FA+'stream_response',FA+'generate_stream');
const T=(p,t)=>E('file:'+p,'file:'+t,'tested_by',0.5);
T('app/shared/runtime/logger.py','tests/01_project_logger_output.py');T('app/process/import_/agent/state.py','tests/03_import_state_test.py');T('app/process/import_/agent/main_graph.py','tests/04_import_graph_test.py');T('app/process/import_/agent/main_graph.py','tests/09_test_import_graph_invoke.py');
const ids=new Set(nodes.map(n=>n.id));const ext=new Set();for(const [p,ns] of Object.entries(b.neighborMap))for(const n of ns){ext.add('file:'+n.path);for(const s of n.symbols){ext.add(`function:${n.path}:${s}`);ext.add(`class:${n.path}:${s}`);}}
for(const v of Object.values(b.batchImportData))for(const t of v)ext.add('file:'+t);
const bad=edges.filter(e=>!(ids.has(e.source)||ext.has(e.source))||!(ids.has(e.target)||ext.has(e.target)));if(bad.length){console.log('BAD',bad);process.exit(1);}
if(ids.size!==nodes.length){console.log('DUP');process.exit(1);}
const impSum=Object.values(b.batchImportData).reduce((a,v)=>a+v.length,0);console.log('imports',edges.filter(e=>e.type==='imports').length,impSum);
const parts=Math.ceil(Math.max(nodes.length/60,edges.length/120));console.log('nodes',nodes.length,'edges',edges.length,'parts',parts);
const files=b.files.map(f=>f.path).sort();const sz=Math.ceil(files.length/parts);
for(const f of fs.readdirSync(R+'intermediate'))if(/^batch-1(-part-\d+)?\.json$/.test(f))fs.unlinkSync(R+'intermediate/'+f);
if(parts<=1){fs.writeFileSync(R+'intermediate/batch-1.json',JSON.stringify({nodes,edges},null,1));}
else for(let k=0;k<parts;k++){const fs_=new Set(files.slice(k*sz,(k+1)*sz));const pn=nodes.filter(n=>fs_.has(n.filePath));const pid=new Set(pn.map(n=>n.id));const pe=edges.filter(e=>pid.has(e.source));
 fs.writeFileSync(R+`intermediate/batch-1-part-${k+1}.json`,JSON.stringify({nodes:pn,edges:pe},null,1));console.log('part',k+1,pn.length,pe.length);}
