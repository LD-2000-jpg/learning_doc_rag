import json
N=[];E=[]
def fn(p,s,t,c="simple",typ="file",ln=None):
    pre={"file":"file","config":"config"}[typ]
    N.append({"id":f"{pre}:{p}","type":typ,"name":p.split('/')[-1],"filePath":p,"summary":s,"tags":t,"complexity":c})
def fu(p,name,lr,s,t,exp=True,c="simple"):
    i=f"function:{p}:{name}"
    N.append({"id":i,"type":"function","name":name,"filePath":p,"lineRange":lr,"summary":s,"tags":t,"complexity":c})
    E.append({"source":f"file:{p}","target":i,"type":"contains","direction":"forward","weight":1.0})
    if exp: E.append({"source":f"file:{p}","target":i,"type":"exports","direction":"forward","weight":0.8})
def ed(s,t,ty,w): E.append({"source":s,"target":t,"type":ty,"direction":"forward","weight":w})
P="app/resources/prompts/"
fn(P+"image_summary.prompt","图片摘要提示词模板，结合图片所在文件名及上下文文本，让多模态模型生成50字以内的中文 Markdown 图片标题。",["提示词模板","图片摘要","多模态","markdown"])
fn(P+"item_name_recognition.prompt","商品名称识别提示词模板，根据文件标题与正文切片识别带品牌和型号的完整商品名称，无法识别时返回空字符串。",["提示词模板","商品识别","文档导入","llm"])
fn(P+"product_recognition_system.prompt","商品识别系统提示词，将 LLM 设定为商品识别专家并要求只输出识别出的字符串。",["提示词模板","系统提示词","商品识别"])
fn(P+"rerank_text_refine.prompt","文本精炼提示词模板，对问答中的回答文本进行去冗余压缩并限制字数，生成适合向量化嵌入的精简文本。",["提示词模板","文本精炼","重排序","embedding"])
fn(P+"rewritten_query_and_itemnames.prompt","查询改写提示词模板，结合历史会话进行指代消解，提取用户询问的商品名称列表并改写为独立完整问题，以 JSON 格式返回。",["提示词模板","查询改写","指代消解","json-output"])
fn("app/shared/__init__.py","shared 共享包的空初始化文件，仅用于声明 Python 包边界。",["entry-point","包初始化","python"])
fn("app/shared/runtime/__init__.py","runtime 运行时子包的空初始化文件，用于声明日志等运行时组件所在的包边界。",["entry-point","包初始化","runtime"])
fn("app/shared/tool/__init__.py","脚本工具子包的初始化文件，仅包含说明包边界与导出约定的文档字符串。",["entry-point","包初始化","工具脚本"])
fn("app/shared/tool/download_bgem3.py","一次性工具脚本，通过 ModelScope 的 snapshot_download 下载 BAAI/bge-m3 嵌入模型到本地缓存目录。",["工具脚本","模型下载","modelscope","embedding"])
fn("app/shared/tool/download_reranker.py","一次性工具脚本，通过 ModelScope 下载 BAAI/bge-reranker-large 重排序模型到本地指定目录。",["工具脚本","模型下载","modelscope","reranker"])
fn("app/shared/utils/__init__.py","工具函数子包的初始化文件，仅包含声明包边界的文档字符串。",["entry-point","包初始化","utility"])
p="app/shared/utils/escape_milvus_string_utils.py"
fn(p,"提供 Milvus 过滤表达式的字符串安全转义工具，防止商品名称、文件标题等特殊字符导致 filter_expr 解析失败。",["utility","milvus","字符串转义","validation"])
fu(p,"escape_milvus_string",[5,27],"对反斜杠和双引号进行转义，并将换行、回车、制表符替换为空格，返回可直接嵌入 Milvus filter_expr 的安全字符串。",["utility","milvus","字符串转义"])
p="app/shared/utils/format_utils.py"
fn(p,"JSON 格式化工具模块，统一项目中工作流状态和通用数据的 JSON 序列化输出，默认保留中文字符。",["utility","serialization","json","日志输出"])
fu(p,"format_state",[11,31],"将 ImportGraphState 等工作流状态字典格式化为带缩进且保留中文的 JSON 字符串，便于日志打印。",["utility","serialization","langgraph-state"])
fu(p,"format_json",[34,54],"通用 JSON 格式化函数，支持自定义缩进与是否转义非 ASCII 字符。",["utility","serialization","json"])
p="app/shared/utils/normalize_sparse_vector.py"
fn(p,"提供稀疏向量 L2 归一化工具，用于 BGE-M3 稀疏向量写入或检索 Milvus 前的数值标准化。",["utility","向量处理","sparse-vector","numpy"])
fu(p,"normalize_sparse_vector",[5,25],"使用 numpy 计算 dict 形式稀疏向量非零维度的 L2 范数并逐项归一化，空向量或范数接近零时原样返回以避免除零。",["utility","向量处理","归一化"])
p="app/shared/utils/path_util.py"
fn(p,"路径工具模块，提供按层级获取上级目录和定位项目根目录的函数，并在导入时计算全局常量 PROJECT_ROOT 同时加载 .env。",["utility","路径解析","configuration","dotenv"])
fu(p,"get_path_dir",[10,22],"借助 Path.parents 索引快速获取当前文件向上第 N+1 级目录。",["utility","路径解析","pathlib"])
fu(p,"get_project_root",[25,46],"依次通过 PROJECT_ROOT 环境变量、向上查找 .env 并加载、递归查找标识文件来确定项目根目录，均失败时抛出 FileNotFoundError。",["utility","路径解析","dotenv","configuration"],c="moderate")
N.append({"id":"config:pyproject.toml","type":"config","name":"pyproject.toml","filePath":"pyproject.toml","summary":"项目的 Python 包配置（uv 管理），要求 Python 3.11+，声明 FastAPI、LangChain、LangGraph、pymilvus、pymongo、minio、torch、modelscope 等依赖，并将清华镜像设为默认索引。","tags":["configuration","build-system","依赖管理","uv"],"complexity":"simple"})
for t in ["file:app/shared/tool/download_bgem3.py","file:app/shared/tool/download_reranker.py","file:app/shared/utils/normalize_sparse_vector.py","file:app/shared/utils/path_util.py"]:
    ed("config:pyproject.toml",t,"configures",0.6)
fn("tests/06_mimetype_guess.py","学习练习脚本，演示使用 mimetypes.guess_type 根据文件扩展名推断 MIME 类型及编码。",["test","练习示例","mimetype"])
fn("tests/07_reg_use_test.py","正则表达式练习脚本，演示用 re.escape 构造匹配 Markdown 图片引用的模式，并对比 search/match/finditer/findall 及贪婪与非贪婪匹配。",["test","练习示例","正则表达式","markdown"])
fn("tests/08_test_title_deal.py","练习脚本，模拟 Markdown 文档切分时多级标题合并与内容行重组的处理逻辑。",["test","练习示例","文档切分","markdown"])
p="tests/10_fastapi/02_fast_async.py"
fn(p,"FastAPI 异步机制演示脚本，对比 BackgroundTasks 后台任务、同步接口线程池与 async 接口中阻塞调用的线程行为。",["test","练习示例","fastapi","异步","background-tasks"])
fu(p,"product1",[32,43],"同步接口示例，打印线程 ID 并通过 BackgroundTasks 异步提交 invoke 耗时任务后立即返回。",["api-handler","fastapi","background-tasks"],exp=False)
fn("tests/10_fastapi/__init__.py","FastAPI 练习目录的空包初始化文件。",["包初始化","test","fastapi"])
N.append({"id":"file:tests/12_sse/01_sse_data.html","type":"file","name":"01_sse_data.html","filePath":"tests/12_sse/01_sse_data.html","summary":"SSE 前端演示页面，使用 EventSource 连接 7777 端口的 /stream 接口，并通过 onmessage 将收到的数据逐条追加到页面。","tags":["test","sse","前端演示","event-source"],"complexity":"simple"})
N.append({"id":"file:tests/12_sse/02_sse_data.html","type":"file","name":"02_sse_data.html","filePath":"tests/12_sse/02_sse_data.html","summary":"SSE 下载进度演示页面，监听 8888 端口 /stream 的 processing 与 completed 自定义事件，实时更新进度百分比并在完成时关闭连接。","tags":["test","sse","前端演示","进度展示"],"complexity":"simple"})
p="tests/12_sse/01_sse_data.py"
fn(p,"SSE 流式响应基础演示服务，通过 StreamingResponse 和异步生成器每秒推送一条 data 消息，并提供返回配套 HTML 页面的接口。",["test","sse","fastapi","streaming"])
fu(p,"return_stream",[14,26],"/stream 接口，使用内部异步生成器以 text/event-stream 格式每秒推送一条结果，共10条。",["api-handler","sse","streaming"],exp=False)
ed("file:tests/12_sse/01_sse_data.py","file:tests/12_sse/01_sse_data.html","depends_on",0.6)
p="tests/12_sse/02_sse_data.py"
fn(p,"SSE 自定义事件演示服务，通过 event/data 格式推送 processing 进度事件和 completed 完成事件，并提供配套 HTML 页面。",["test","sse","fastapi","自定义事件"])
fu(p,"return_stream",[14,27],"/stream 接口，以 0.1 秒间隔推送 0-100 的 processing 进度事件，最后发送 completed 完成事件。",["api-handler","sse","streaming"],exp=False)
ed("file:tests/12_sse/02_sse_data.py","file:tests/12_sse/02_sse_data.html","depends_on",0.6)
ed("file:tests/12_sse/02_sse_data.py","file:tests/12_sse/01_sse_data.py","related",0.5)
ed("file:app/shared/tool/download_reranker.py","file:app/shared/tool/download_bgem3.py","related",0.5)
ed("file:app/resources/prompts/item_name_recognition.prompt","file:app/resources/prompts/product_recognition_system.prompt","related",0.5)
ids={n["id"] for n in N}; assert len(ids)==len(N)
for e in E: assert e["source"] in ids and e["target"] in ids
json.dump({"nodes":N,"edges":E},open("C:/Users/LD/Desktop/ai_0511_knowledge_base-master/.ua/intermediate/batch-9.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
print(len(N),len(E))
