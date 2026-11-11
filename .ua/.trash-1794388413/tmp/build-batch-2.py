import json, math
R = 'C:/Users/LD/Desktop/ai_0511_knowledge_base-master'
inp = json.load(open(R+'/.ua/tmp/ua-file-analyzer-input-2.json', encoding='utf-8'))
ext = json.load(open(R+'/.ua/tmp/ua-file-extract-results-2.json', encoding='utf-8'))
lr = {}
for f in ext['results']:
    for fn in f.get('functions') or []: lr[(f['path'], fn['name'])] = [fn['startLine'], fn['endLine']]
    for c in f.get('classes') or []: lr[(f['path'], c['name'])] = [c['startLine'], c['endLine']]

F = {
'app/api/http/query_server.py': ("基于 FastAPI 的查询服务入口，提供健康检查、聊天页面、SSE 流式通道、问答提交（同步/流式）以及历史记录查询与清理接口，并在后台调用 LangGraph 查询图。", ["api-handler","entry-point","fastapi","sse","查询服务"], "moderate"),
'app/api/schema/query_schema.py': ("定义查询服务的 Pydantic 请求/响应模型，包括问答请求、同步/异步响应、清空历史与历史检索结果结构。", ["data-model","type-definition","pydantic","api-schema"], "simple"),
'app/process/query/agent/main_graph.py': ("构建并编译 LangGraph 查询工作流：先确认主体名称，再并行执行向量检索、HyDE 检索与网络搜索，经 RRF 融合与重排后生成答案。", ["langgraph","workflow","orchestration","rag","entry-point"], "moderate"),
'app/process/query/agent/nodes/node_answer_output.py': ("查询图的答案输出节点，记录任务进度并调用答案生成服务产出最终回答。", ["langgraph-node","answer-generation","task-tracking"], "simple"),
'app/process/query/agent/nodes/node_item_name_confirm.py': ("查询图入口节点，调用主体名称确认服务识别用户问题涉及的产品并改写查询。", ["langgraph-node","item-name","query-rewrite"], "simple"),
'app/process/query/agent/nodes/node_rerank.py': ("查询图的重排序节点，使用 Cross-Encoder 对 RRF 融合结果与网络搜索结果进行精确打分重排，附带本地模拟测试入口。", ["langgraph-node","rerank","cross-encoder"], "simple"),
'app/process/query/agent/nodes/node_search_embedding.py': ("查询图的向量检索节点，基于改写后的问题在 Milvus 中进行混合检索召回切片。", ["langgraph-node","vector-search","milvus"], "simple"),
'app/process/query/agent/nodes/node_search_embedding_hyde.py': ("查询图的 HyDE 检索节点，先生成假设性答案文档再进行向量检索召回切片。", ["langgraph-node","hyde","vector-search"], "simple"),
'app/process/query/agent/nodes/node_web_search_mcp.py': ("查询图的网络搜索节点，通过百炼 MCP 网络搜索服务补充外部资料。", ["langgraph-node","web-search","mcp"], "simple"),
'app/process/query/agent/state.py': ("定义查询图共享状态 QueryGraphState（会话、改写问题、主体名称、多路召回结果、答案等字段），并提供默认状态创建与深拷贝工具。", ["state","type-definition","langgraph","data-model"], "moderate"),
'app/rag/query/answer_service.py': ("答案生成服务：校验状态、拼装历史消息与检索上下文构造提示词，调用大模型（支持流式推送 SSE）生成回答，并提取文档中的图片链接。", ["service","llm","answer-generation","sse","prompt"], "moderate"),
'app/rag/query/config.py': ("查询流程全局参数配置，包括历史条数、主体名称确认/候选阈值、混合检索数量与权重、重排动态 Top-K 与断崖判定参数、支持的图片扩展名。", ["configuration","constants","rag","rerank"], "simple"),
'app/rag/query/embedding_search_service.py': ("向量检索服务：对改写问题生成稠密/稀疏向量，按主体名称过滤在 Milvus 中混合检索，并规范化召回切片写回状态。", ["service","vector-search","milvus","hybrid-search"], "moderate"),
'app/rag/query/hyde_search_service.py': ("HyDE 检索服务：调用大模型生成假设性答案文档，并以其向量在 Milvus 中混合检索相关切片。", ["service","hyde","vector-search","llm"], "moderate"),
'app/rag/query/item_name_confirm_service.py': ("主体名称确认服务：结合历史消息让大模型抽取产品名并改写问题，在 Milvus 主体名称库中检索打分，按阈值直接确认、给出候选或提示用户补充。", ["service","item-name","llm","milvus","query-rewrite"], "complex"),
'app/rag/query/rerank_service.py': ("重排序服务：合并 RRF 与网络搜索结果，构造问答对并按 token 窗口截断，调用 Reranker 计算分数排序，再基于断崖检测动态截取 Top-K。", ["service","rerank","dynamic-top-k","cross-encoder"], "moderate"),
'app/rag/query/web_search_service.py': ("网络搜索服务：通过阿里百炼 MCP 客户端调用联网搜索工具，并将结果解析为统一文档结构写回状态。", ["service","web-search","mcp","async"], "moderate"),
'app/shared/runtime/load_prompt.py': ("提示词加载工具，按名称与目录读取 prompts 模板文件并进行参数格式化。", ["utility","prompt","template"], "simple"),
'app/shared/utils/sse_utils.py': ("SSE 工具模块：维护按 session 划分的内存队列，定义事件类型并提供推送消息与异步事件流生成器，支持断线检测。", ["utility","sse","streaming","queue"], "moderate"),
'app/shared/utils/task_utils.py': ("内存态任务追踪工具：记录各会话运行中/已完成节点与任务状态，提供节点中文名映射，并在流式模式下通过 SSE 推送进度。", ["utility","task-tracking","state-management","sse"], "moderate"),
'tests/02_project_load_prompt.py': ("手工测试脚本，验证 load_prompt 能正确加载并格式化图片摘要提示词。", ["test","prompt","script"], "simple"),
'tests/11_query_graph_test.py': ("查询图端到端测试脚本：构造默认状态调用 query_graph_app 并打印结果与图结构 ASCII。", ["test","langgraph","integration-test"], "simple"),
}

S = {
('app/api/http/query_server.py','return_html'): ("返回前端 chat.html 聊天页面文件。",["api-handler","static-file"],"simple"),
('app/api/http/query_server.py','stream'): ("为指定会话建立 SSE 流式响应通道。",["api-handler","sse","streaming"],"simple"),
('app/api/http/query_server.py','invoke_query_graph'): ("后台同步执行查询图，更新任务状态并在流式模式下推送最终结果或错误事件。",["workflow","task-tracking","error-handling"],"moderate"),
('app/api/http/query_server.py','query_question'): ("问答提交接口，创建默认状态后按 is_stream 选择后台异步执行或同步返回答案。",["api-handler","query","background-task"],"moderate"),
('app/api/http/query_server.py','clear_history_api'): ("清空指定会话在 MongoDB 中的历史消息。",["api-handler","history","mongodb"],"simple"),
('app/api/http/query_server.py','search_history_api'): ("查询会话最近历史消息并转换为响应模型列表。",["api-handler","history","mongodb"],"simple"),
('app/api/schema/query_schema.py','QueryRequestSchema'): ("问答请求模型，包含问题、会话 ID 与是否流式。",["data-model","request"],"simple"),
('app/api/schema/query_schema.py','AsyncQueryResponseSchema'): ("异步（流式）问答的响应模型。",["data-model","response"],"simple"),
('app/api/schema/query_schema.py','SyncQueryResponseSchema'): ("同步问答的响应模型，包含答案等字段。",["data-model","response"],"simple"),
('app/api/schema/query_schema.py','ClearHistoryResponseSchema'): ("清空历史接口的响应模型。",["data-model","response"],"simple"),
('app/api/schema/query_schema.py','SearchHistoryItemResponseSchema'): ("单条历史消息的响应模型。",["data-model","history"],"simple"),
('app/api/schema/query_schema.py','SearchHistoryResultResponseSchema'): ("历史检索结果列表的响应模型。",["data-model","history"],"simple"),
('app/process/query/agent/main_graph.py','after_node_item_name_confirm'): ("条件边路由：若已有答案直接跳到输出节点，否则并行分发到三路召回节点。",["routing","conditional-edge","langgraph"],"simple"),
('app/process/query/agent/nodes/node_answer_output.py','node_answer_output'): ("答案输出节点函数，包裹任务进度记录并调用 generate_answer。",["langgraph-node","answer-generation"],"simple"),
('app/process/query/agent/nodes/node_item_name_confirm.py','node_item_name_confirm'): ("主体名称确认节点函数，调用 confirm_item_name 并记录任务进度。",["langgraph-node","item-name"],"simple"),
('app/process/query/agent/nodes/node_rerank.py','node_rerank'): ("重排序节点函数，调用 rerank_documents 并记录任务进度。",["langgraph-node","rerank"],"simple"),
('app/process/query/agent/nodes/node_search_embedding.py','node_search_embedding'): ("向量检索节点函数，调用 search_by_embedding 并记录任务进度。",["langgraph-node","vector-search"],"simple"),
('app/process/query/agent/nodes/node_search_embedding_hyde.py','node_search_embedding_hyde'): ("HyDE 检索节点函数，调用 search_by_hyde 并记录任务进度。",["langgraph-node","hyde"],"simple"),
('app/process/query/agent/nodes/node_web_search_mcp.py','node_web_search_mcp'): ("网络搜索节点函数，调用 search_by_web 并记录任务进度。",["langgraph-node","web-search"],"simple"),
('app/process/query/agent/state.py','QueryGraphState'): ("查询图的 TypedDict 状态定义，涵盖会话、查询改写、主体名称、各路召回、重排及答案字段。",["state","type-definition","typeddict"],"simple"),
('app/process/query/agent/state.py','create_query_default_state'): ("基于默认模板创建新的查询状态，并合并传入的覆盖字段。",["factory","state"],"simple"),
('app/process/query/agent/state.py','get_query_default_state'): ("返回默认查询状态模板的深拷贝。",["factory","state"],"simple"),
('app/process/query/agent/state.py','copy_query_state'): ("深拷贝查询状态，避免节点间共享可变对象。",["utility","state"],"simple"),
('app/rag/query/answer_service.py','has_answer_in_state'): ("判断状态中是否已有答案（如主体确认阶段已生成）。",["validation","state"],"simple"),
('app/rag/query/answer_service.py','get_data_and_validate'): ("从状态中提取问题、重排文档与历史等数据并校验。",["validation","state"],"simple"),
('app/rag/query/answer_service.py','create_model_prompt'): ("拼接检索上下文、历史消息与问题，加载提示词模板构造模型输入。",["prompt","context-building"],"moderate"),
('app/rag/query/answer_service.py','call_model_create_answer'): ("调用大模型生成回答，流式模式下逐段推送 delta 事件到 SSE。",["llm","streaming","sse"],"moderate"),
('app/rag/query/answer_service.py','extract_image_urls_in_docs'): ("从重排文档内容中提取图片链接，用于前端展示。",["utility","image","regex"],"simple"),
('app/rag/query/answer_service.py','generate_answer'): ("答案生成主流程：校验、构造提示词、调用模型、提取图片并写回状态。",["service","answer-generation","orchestration"],"moderate"),
('app/rag/query/embedding_search_service.py','get_data_and_validate'): ("提取并校验改写问题与主体名称。",["validation","state"],"simple"),
('app/rag/query/embedding_search_service.py','search_chunks_by_rewritten'): ("为改写问题生成稠密+稀疏向量并按主体名称过滤在 Milvus 中混合检索。",["milvus","hybrid-search","embedding"],"moderate"),
('app/rag/query/embedding_search_service.py','normalize_retrieved_chunk'): ("将 Milvus 命中结果规范化为统一的切片字典结构。",["serialization","normalization"],"simple"),
('app/rag/query/embedding_search_service.py','search_by_embedding'): ("向量检索主流程，将召回切片写入状态。",["service","vector-search"],"simple"),
('app/rag/query/hyde_search_service.py','get_data_and_validate'): ("提取并校验改写问题与主体名称。",["validation","state"],"simple"),
('app/rag/query/hyde_search_service.py','search_chunks_by_rewritten'): ("以 HyDE 假设性文档生成向量，在 Milvus 中混合检索切片。",["milvus","hybrid-search","embedding"],"moderate"),
('app/rag/query/hyde_search_service.py','normalize_retrieved_chunk'): ("将 Milvus 命中结果规范化为统一切片结构。",["serialization","normalization"],"simple"),
('app/rag/query/hyde_search_service.py','call_model_create_answer'): ("加载 HyDE 提示词调用大模型生成假设性答案文档。",["llm","hyde","prompt"],"simple"),
('app/rag/query/hyde_search_service.py','search_by_hyde'): ("HyDE 检索主流程：生成假设文档、检索并写回状态。",["service","hyde"],"simple"),
('app/rag/query/item_name_confirm_service.py','get_data_and_validate'): ("提取并校验原始问题与会话 ID。",["validation","state"],"simple"),
('app/rag/query/item_name_confirm_service.py','get_valid_history_messages'): ("从 MongoDB 获取最近的有效历史消息。",["history","mongodb"],"simple"),
('app/rag/query/item_name_confirm_service.py','call_model_extract_item_names_and_rewritten_query'): ("调用大模型结合历史抽取主体名称列表并改写问题，解析 JSON 输出。",["llm","query-rewrite","json-parsing"],"moderate"),
('app/rag/query/item_name_confirm_service.py','query_milvus_item_names'): ("对抽取的主体名称生成向量，在 Milvus 主体名称集合中检索候选及分数。",["milvus","vector-search","item-name"],"moderate"),
('app/rag/query/item_name_confirm_service.py','select_item_names'): ("按确认阈值与候选阈值筛选主体名称，区分已确认与待用户选择的候选。",["decision-logic","threshold","item-name"],"moderate"),
('app/rag/query/item_name_confirm_service.py','modify_state_by_dict'): ("根据筛选结果更新状态：写入确认的主体名称或生成提示用户选择的答案。",["state","item-name"],"moderate"),
('app/rag/query/item_name_confirm_service.py','confirm_item_name'): ("主体名称确认主流程，串联历史获取、模型抽取、Milvus 检索、筛选与状态更新。",["service","orchestration","item-name"],"moderate"),
('app/rag/query/rerank_service.py','get_data_and_validate'): ("提取并校验改写问题、RRF 切片与网络文档。",["validation","state"],"simple"),
('app/rag/query/rerank_service.py','merge_rrf_and_web'): ("合并 RRF 融合切片与网络搜索文档为统一候选列表。",["merge","utility"],"simple"),
('app/rag/query/rerank_service.py','create_question_answer_pair'): ("构造问题-文档对，超出 Reranker token 窗口时截断或压缩文档内容。",["tokenization","truncation","rerank"],"moderate"),
('app/rag/query/rerank_service.py','call_reranker_compute_scores'): ("调用 Reranker 模型计算问答对相关性分数。",["model-inference","rerank"],"simple"),
('app/rag/query/rerank_service.py','set_merged_score_and_sort'): ("将分数写回文档并按分数降序排序。",["sorting","rerank"],"simple"),
('app/rag/query/rerank_service.py','dynamic_top_k'): ("基于分数断崖（相对/绝对差值）在最小与最大 Top-K 之间动态截取结果。",["algorithm","dynamic-top-k"],"moderate"),
('app/rag/query/rerank_service.py','rerank_documents'): ("重排主流程：合并、构造问答对、打分排序、动态截取并写回状态。",["service","rerank","orchestration"],"moderate"),
('app/rag/query/web_search_service.py','get_data_and_validate'): ("提取并校验改写问题。",["validation","state"],"simple"),
('app/rag/query/web_search_service.py','web_search_bailian_mcp'): ("异步连接百炼 MCP 服务并调用联网搜索工具获取原始结果。",["mcp","async","web-search"],"moderate"),
('app/rag/query/web_search_service.py','search_by_web'): ("网络搜索主流程：运行异步 MCP 调用、解析结果为文档列表并写回状态。",["service","web-search","parsing"],"moderate"),
('app/shared/runtime/load_prompt.py','load_prompt'): ("按名称与子目录读取提示词模板文件，并用关键字参数格式化。",["utility","prompt","template"],"simple"),
('app/shared/utils/sse_utils.py','SSEEvent'): ("SSE 事件类型常量集合（ready/progress/delta/final/error/close）。",["constants","sse"],"simple"),
('app/shared/utils/sse_utils.py','create_sse_queue'): ("为会话创建并注册新的 SSE 消息队列。",["sse","queue"],"simple"),
('app/shared/utils/sse_utils.py','push_to_session'): ("向指定会话的 SSE 队列推送事件与数据。",["sse","event-handler"],"simple"),
('app/shared/utils/sse_utils.py','sse_generator'): ("异步生成器，持续从会话队列读取事件并打包为 SSE 格式输出，检测客户端断开与关闭信号。",["sse","async-generator","streaming"],"moderate"),
('app/shared/utils/task_utils.py','add_running_task'): ("记录节点开始运行，并在流式模式下推送进度事件。",["task-tracking","sse"],"simple"),
('app/shared/utils/task_utils.py','add_done_task'): ("将节点从运行中移至已完成，并在流式模式下推送进度事件。",["task-tracking","sse"],"moderate"),
('app/shared/utils/task_utils.py','get_task_status'): ("获取任务的当前状态。",["task-tracking","getter"],"simple"),
('app/shared/utils/task_utils.py','get_done_task_list'): ("获取已完成节点列表（中文名）。",["task-tracking","getter"],"simple"),
('app/shared/utils/task_utils.py','get_running_task_list'): ("获取运行中节点列表（中文名）。",["task-tracking","getter"],"simple"),
('app/shared/utils/task_utils.py','update_task_status'): ("更新任务整体状态并在流式模式下推送状态事件。",["task-tracking","sse"],"simple"),
('app/shared/utils/task_utils.py','task_push_queue'): ("把任务进度信息推送到 SSE 会话队列。",["sse","task-tracking"],"simple"),
('app/shared/utils/task_utils.py','clear_task'): ("清理任务的运行、完成与状态记录。",["task-tracking","cleanup"],"simple"),
}
classes = {k for k in S if k[1][0].isupper()}

nodes=[]; edges=[]
def E(s,t,ty,w): edges.append({"source":s,"target":t,"type":ty,"direction":"forward","weight":w})
for f in inp['batchFiles']:
    p=f['path']; s,t,c=F[p]
    nodes.append({"id":"file:"+p,"type":"file","name":p.split('/')[-1],"filePath":p,"summary":s,"tags":t,"complexity":c})
    for tgt in inp['batchImportData'].get(p,[]): E("file:"+p,"file:"+tgt,"imports",0.7)
def sid(p,n): return ("class" if (p,n) in classes else "function")+":"+p+":"+n
for (p,n),(s,t,c) in S.items():
    assert (p,n) in lr,(p,n)
    i=sid(p,n)
    nodes.append({"id":i,"type":"class" if (p,n) in classes else "function","name":n,"filePath":p,"lineRange":lr[(p,n)],"summary":s,"tags":t,"complexity":c})
    E("file:"+p,i,"contains",1.0); E("file:"+p,i,"exports",0.8)
TU='app/shared/utils/task_utils.py'; SSE='app/shared/utils/sse_utils.py'; LP='app/shared/runtime/load_prompt.py'
ST='app/process/query/agent/state.py'; QS='app/api/http/query_server.py'; MG='app/process/query/agent/main_graph.py'
calls=[]
nodemap={'node_answer_output':('app/rag/query/answer_service.py','generate_answer'),
 'node_item_name_confirm':('app/rag/query/item_name_confirm_service.py','confirm_item_name'),
 'node_rerank':('app/rag/query/rerank_service.py','rerank_documents'),
 'node_search_embedding':('app/rag/query/embedding_search_service.py','search_by_embedding'),
 'node_search_embedding_hyde':('app/rag/query/hyde_search_service.py','search_by_hyde'),
 'node_web_search_mcp':('app/rag/query/web_search_service.py','search_by_web')}
for n,(sp,sn) in nodemap.items():
    p='app/process/query/agent/nodes/'+n+'.py'
    calls += [((p,n),(sp,sn)),((p,n),(TU,'add_running_task')),((p,n),(TU,'add_done_task'))]
calls += [((QS,'stream'),(SSE,'sse_generator')),((QS,'invoke_query_graph'),(TU,'update_task_status')),((QS,'invoke_query_graph'),(SSE,'push_to_session')),
 ((QS,'query_question'),(ST,'create_query_default_state')),((QS,'query_question'),(SSE,'create_sse_queue')),((QS,'query_question'),(QS,'invoke_query_graph')),
 ((TU,'task_push_queue'),(SSE,'push_to_session')),((TU,'add_running_task'),(TU,'task_push_queue')),((TU,'add_done_task'),(TU,'task_push_queue')),
 (('app/rag/query/answer_service.py','create_model_prompt'),(LP,'load_prompt')),(('app/rag/query/answer_service.py','call_model_create_answer'),(SSE,'push_to_session')),
 (('app/rag/query/hyde_search_service.py','call_model_create_answer'),(LP,'load_prompt')),
 (('app/rag/query/item_name_confirm_service.py','call_model_extract_item_names_and_rewritten_query'),(LP,'load_prompt')),
 (('app/rag/query/rerank_service.py','create_question_answer_pair'),(LP,'load_prompt'))]
flows={'app/rag/query/answer_service.py':('generate_answer',['get_data_and_validate','create_model_prompt','call_model_create_answer','extract_image_urls_in_docs']),
 'app/rag/query/embedding_search_service.py':('search_by_embedding',['get_data_and_validate','search_chunks_by_rewritten','normalize_retrieved_chunk']),
 'app/rag/query/hyde_search_service.py':('search_by_hyde',['get_data_and_validate','call_model_create_answer','search_chunks_by_rewritten','normalize_retrieved_chunk']),
 'app/rag/query/item_name_confirm_service.py':('confirm_item_name',['get_data_and_validate','get_valid_history_messages','call_model_extract_item_names_and_rewritten_query','query_milvus_item_names','select_item_names','modify_state_by_dict']),
 'app/rag/query/rerank_service.py':('rerank_documents',['get_data_and_validate','merge_rrf_and_web','create_question_answer_pair','call_reranker_compute_scores','set_merged_score_and_sort','dynamic_top_k']),
 'app/rag/query/web_search_service.py':('search_by_web',['get_data_and_validate','web_search_bailian_mcp'])}
for svc,(m,ss) in flows.items():
    for x in ss: calls.append(((svc,m),(svc,x)))
for a,b in calls:
    assert a in S and b in S,(a,b)
    E(sid(*a),sid(*b),"calls",0.8)
MH='app/shared/clients/mongo_history_utils.py'
E(sid(QS,'clear_history_api'),"function:"+MH+":clear_history","calls",0.8)
E(sid(QS,'search_history_api'),"function:"+MH+":get_recent_messages","calls",0.8)
E(sid('app/rag/query/item_name_confirm_service.py','get_valid_history_messages'),"function:"+MH+":get_recent_messages","calls",0.8)
for p in ['app/rag/query/embedding_search_service.py','app/rag/query/hyde_search_service.py','app/rag/query/item_name_confirm_service.py']:
    E("file:"+p,"class:app/infra/milvus/VectorStore.py:MilvusGateway","depends_on",0.6)
E("file:"+MG,"function:app/process/query/agent/nodes/node_rrf.py:node_rrf","depends_on",0.6)
E("file:"+LP,"file:tests/02_project_load_prompt.py","tested_by",0.5)
E("file:"+MG,"file:tests/11_query_graph_test.py","tested_by",0.5)
E("file:"+ST,"file:tests/11_query_graph_test.py","tested_by",0.5)
E("file:app/rag/query/config.py","file:app/rag/query/rerank_service.py","related",0.5)
ids={n['id'] for n in nodes}; assert len(ids)==len(nodes)
imp=sum(len(v) for v in inp['batchImportData'].values()); assert imp==sum(1 for e in edges if e['type']=='imports')
for e in edges: assert e['source']!=e['target']
print(len(nodes),len(edges),imp)
parts=math.ceil(max(len(nodes)/60,len(edges)/120))
files=sorted(f['path'] for f in inp['batchFiles']); size=math.ceil(len(files)/parts)
for k in range(parts):
    grp=set(files[k*size:(k+1)*size])
    pn=[n for n in nodes if n['filePath'] in grp]; pid={n['id'] for n in pn}
    pe=[e for e in edges if e['source'] in pid]
    name='batch-2.json' if parts==1 else 'batch-2-part-%d.json'%(k+1)
    json.dump({"nodes":pn,"edges":pe},open(R+'/.ua/intermediate/'+name,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print(name,len(pn),len(pe))
