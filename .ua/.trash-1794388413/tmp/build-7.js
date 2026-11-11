const fs=require('fs');
const I='app/process/import_/agent/', Q='app/process/query/agent/';
const files=[
['notes/day06_掌柜智库_项目介绍和搭建.txt','第6天开发笔记：介绍掌柜智库的导入流程、三路检索流程（向量检索、HyDE 假设答案检索、联网 MCP 检索）与 Milvus 向量库设计，并讲解 uv 依赖管理、项目分层结构、日志工具与 node_log 装饰器、提示词加载等基础搭建。',['documentation','项目搭建','项目结构','日志','开发笔记'],'complex',['app/shared/runtime/logger.py','app/shared/runtime/load_prompt.py','app/shared/config/milvus_config.py','app/infra/config/providers.py']],
['notes/day07_掌柜智库_导入架构和pdf处理.txt','第7天开发笔记：回顾导入流程并搭建 LangGraph 导入主图，分析 ImportGraphState 属性，注册 7 个导入节点并用条件边按文件类型（pdf/md）路由，同时说明文档级 item_name 集合的向量库设计。',['documentation','langgraph','导入流程','状态图','开发笔记'],'complex',[I+'main_graph.py',I+'state.py',I+'nodes/node_entry.py',I+'nodes/node_pdf_to_md.py']],
['notes/day08_掌柜智库_完善pdf和图片处理节点.txt','第8天开发笔记：详解 node_pdf_to_md 通过 MinerU API 申请上传、轮询解析结果并下载解压 Markdown 的实现，讲解 requests 用法，并开始设计 node_md_img 图片处理节点与 MinIO 文件服务器的部署使用。',['documentation','pdf解析','mineru','minio','开发笔记'],'complex',[I+'nodes/node_pdf_to_md.py','app/rag/import_/pdf_parse_service.py','app/rag/import_/config.py',I+'nodes/node_md_img.py','app/shared/clients/minio_utils.py']],
['notes/day09_掌柜智库_继续图片处理节点.txt','第9天开发笔记：继续实现 node_md_img，包括参数校验、用正则定位图片并截取上下文、调用 Qwen 视觉模型生成图片语义、上传 MinIO 并替换 Markdown 图片链接。',['documentation','图片处理','视觉模型','minio','开发笔记'],'moderate',[I+'nodes/node_md_img.py','app/rag/import_/enrich_markdown_images.py','app/infra/minio/ObjectStore.py','app/infra/model/model_providers.py']],
['notes/day10_掌柜智库_图片处理总结和文档切割.txt','第10天开发笔记：总结 node_md_img 图片处理全流程（上下文提取、视觉识别、上传替换、备份），并引入 node_document_split 文档智能切割节点的设计。',['documentation','图片处理','文档切割','开发笔记'],'complex',[I+'nodes/node_md_img.py',I+'nodes/node_document_split.py','app/rag/import_/split_service.py']],
['notes/day11_掌柜智库_数据入口和导入web模块.txt','第11天开发笔记：总结文档切割四原则（语义优先、长度可控、边界清晰、可追溯），讲解 node_item_name_recognition 主体识别、BGE-M3 模型下载与加载、Milvus 部署及 MilvusGateway 客户端封装。',['documentation','文档切割','主体识别','embedding','milvus'],'complex',[I+'nodes/node_document_split.py',I+'nodes/node_item_name_recognition.py','app/rag/import_/item_name_service.py','app/shared/tool/download_bgem3.py','app/shared/model/embedding_utils.py','app/infra/model/model_providers.py','app/shared/clients/milvus_utils.py','app/infra/milvus/VectorStore.py']],
['notes/day12_掌柜智库_导入收尾和web模块集成.txt','第12天开发笔记：实现 node_bge_embedding 批量向量化与 node_import_milvus 先删后插入库，串联导入全流程测试，回顾 FastAPI 参数/响应/后台任务用法并实现导入 Web 接口。',['documentation','向量化','milvus','fastapi','开发笔记'],'moderate',[I+'nodes/node_bge_embedding.py',I+'nodes/node_import_milvus.py',I+'main_graph.py','app/api/http/import_server.py']],
['notes/day13_掌柜智库_查询模块图定义和web实现.txt','第13天开发笔记：定义查询模块的 state、7 对节点与业务函数及查询主图，讲解 SSE 推送机制与 task_utils/sse_utils 的队列设计，并实现查询 Web 接口的流式与非流式调用。',['documentation','查询流程','sse','langgraph','开发笔记'],'complex',[Q+'state.py',Q+'main_graph.py','app/shared/utils/task_utils.py','app/shared/utils/sse_utils.py','app/api/http/query_server.py']],
['notes/day14_掌柜智库_web实现和意图识别.txt','第14天开发笔记：完善查询 Web 模块的 SSE 问题修复（队列创建、final 事件过早关闭、error 事件处理），引入 MongoDB 聊天历史与 node_item_name_confirm 意图识别节点设计。',['documentation','sse','意图识别','mongodb','开发笔记'],'complex',['app/api/http/query_server.py','app/shared/utils/sse_utils.py','app/shared/utils/task_utils.py',Q+'nodes/node_item_name_confirm.py','app/shared/clients/mongo_history_utils.py']],
['notes/day15_掌柜智库_意图识别和多路检索.txt','第15天开发笔记：实现历史聊天记录接口与 node_item_name_confirm（问题重写、item_name 提取与 Milvus 混合检索置信度判定），并讲解向量检索、HyDE 检索与联网 MCP 检索三路召回节点。',['documentation','意图识别','多路检索','mcp','hyde'],'complex',[Q+'nodes/node_item_name_confirm.py','app/rag/query/item_name_confirm_service.py','app/shared/clients/mongo_history_utils.py',Q+'nodes/node_search_embedding.py',Q+'nodes/node_search_embedding_hyde.py',Q+'nodes/node_web_search_mcp.py','app/rag/query/web_search_service.py','app/rag/query/hyde_search_service.py']],
['notes/day16_掌柜智库_数据重排和结果输出.txt','第16天开发笔记：讲解 node_rrf 多路结果加权 RRF 融合、node_rerank 使用 BGE Reranker 打分与动态断崖截断，以及 node_answer_output 最终答案生成输出。',['documentation','rrf','rerank','答案生成','开发笔记'],'moderate',[Q+'nodes/node_rrf.py','app/rag/query/rrf_service.py',Q+'nodes/node_rerank.py','app/rag/query/rerank_service.py','app/shared/model/reranker_utils.py','app/shared/tool/download_reranker.py',Q+'nodes/node_answer_output.py','app/rag/query/answer_service.py']],
];
const nodes=[],edges=[];
for(const [p,s,t,c,docs] of files){
 for(const d of docs) if(!fs.existsSync(d)) throw new Error('missing '+d);
 const id='document:'+p;
 nodes.push({id,type:'document',name:p.split('/').pop(),filePath:p,summary:s,tags:t,complexity:c});
 for(const d of docs) edges.push({source:id,target:'file:'+d,type:'documents',direction:'forward',weight:0.5});
}
for(let i=0;i+1<files.length;i++) edges.push({source:'document:'+files[i][0],target:'document:'+files[i+1][0],type:'related',direction:'forward',weight:0.5});
fs.writeFileSync('.ua/intermediate/batch-7.json',JSON.stringify({nodes,edges},null,1));
console.log(nodes.length,edges.length);
