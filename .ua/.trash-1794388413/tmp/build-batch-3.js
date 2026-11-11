const fs=require('fs');
const inp=require('C:/Users/LD/Desktop/ai_0511_knowledge_base-master/.ua/tmp/ua-file-analyzer-input-3.json');
const nodes=[],edges=[];
const E=(s,t,type,w)=>edges.push({source:s,target:t,type,direction:'forward',weight:w});
const F=(p,summary,tags,cx,ln)=>{const n={id:'file:'+p,type:'file',name:p.split('/').pop(),filePath:p,summary,tags,complexity:cx};if(ln)n.languageNotes=ln;nodes.push(n);};
const S=(kind,p,name,lr,summary,tags,cx='simple',exp=true)=>{const id=kind+':'+p+':'+name;nodes.push({id,type:kind,name,filePath:p,lineRange:lr,summary,tags,complexity:cx});E('file:'+p,id,'contains',1.0);if(exp)E('file:'+p,id,'exports',0.8);return id;};
const P='app/infra/config/providers.py',O='app/infra/minio/ObjectStore.py',M='app/shared/clients/minio_utils.py',C='app/shared/config/';
F(P,'基础设施层配置汇总入口，将 shared/config 下各子配置（Embedding、LLM、MCP、Milvus、MinerU、MinIO、Reranker、应用设置）聚合为单例 infra_config，供 infra 层统一取用。',['config','聚合','singleton','dataclass'],'moderate','使用 @dataclass 的 field(default_factory=lambda: obj) 规避可变默认值检查；文件内含大量关于 TypedDict、BaseModel 与 dataclass 区别的教学注释。');
S('class',P,'InfraConfig',[36,44],'聚合所有共享配置对象的 dataclass，每个字段通过 default_factory 引用已实例化的配置单例。',['config','dataclass','聚合']);
F(O,'MinIO 对象存储网关封装，提供桶名、图片前缀、客户端实例以及图片公网访问 URL 拼接能力，导出单例 minio_gateway。',['service','gateway','对象存储','singleton'],'simple');
const mg=S('class',O,'MinioGateway',[6,31],'MinIO 网关类，以属性方式暴露 bucket_name、images_prefix、minio 客户端，并通过 build_image_url 按协议+端点+桶名+对象名拼接图片访问地址。',['gateway','对象存储','url-builder']);
E(mg,'function:'+M+':get_minio_client','calls',0.8);
E(mg,'class:'+P+':InfraConfig','depends_on',0.6);
F(M,'MinIO 客户端工具模块，以懒加载单例方式创建 MinIO 客户端，首次初始化时检查/创建存储桶并设置公开只读访问策略。',['utility','client','对象存储','lazy-loading','singleton'],'moderate','通过模块级全局变量 + global 声明实现无锁懒加载单例，仅适合单线程场景。');
S('function',M,'_create_minio_client',[18,29],'读取 minio_config 中的端点、密钥与 HTTPS 开关，创建 Minio 客户端实例。',['factory','client','对象存储'],'simple',false);
S('function',M,'_set_bucket_policy',[33,54],'生成兼容 AWS S3 规范的桶策略 JSON，允许所有用户对桶内对象执行 s3:GetObject 读取。',['security','policy','serialization'],'simple',false);
S('function',M,'_create_bucket_ready',[58,73],'检查目标桶是否存在，不存在则创建并设置公开读取策略，确保图片上传前桶已就绪。',['initialization','对象存储','bucket'],'simple',false);
S('function',M,'get_minio_client',[76,97],'获取全局 MinIO 客户端：首次调用时创建客户端并初始化桶，后续直接复用全局实例。',['singleton','lazy-loading','client'],'simple');
E('function:'+M+':_create_bucket_ready','function:'+M+':_set_bucket_policy','calls',0.8);
E('function:'+M+':get_minio_client','function:'+M+':_create_minio_client','calls',0.8);
E('function:'+M+':get_minio_client','function:'+M+':_create_bucket_ready','calls',0.8);
F(C+'__init__.py','共享配置包的统一出口，集中 re-export 各配置类及其单例实例并声明 __all__。',['entry-point','barrel','config'],'simple');
F(C+'bailian_mcp_config.py','百炼 MCP 联网检索配置模块，从环境变量读取 MCP 服务地址与 API Key 并实例化 mcp_config。',['config','mcp','联网检索','环境变量'],'simple','同名类 McpConfig 先以 @dataclass 定义，又以普通类重新定义覆盖，用于演示二者等价写法；实际生效的是后者。');
S('class',C+'bailian_mcp_config.py','McpConfig',[15,19],'MCP 配置类，保存 mcp_base_url 与 api_key（普通类写法，覆盖前面的 dataclass 定义）。',['config','mcp','data-model']);
F(C+'common.py','配置读取公共工具，加载 .env 并提供字符串、布尔、浮点类型的环境变量读取与容错转换函数。',['utility','config','环境变量','dotenv'],'moderate');
S('function',C+'common.py','env_str',[16,28],'读取字符串环境变量，不存在时返回默认值。',['utility','环境变量']);
S('function',C+'common.py','env_bool',[31,51],'读取布尔环境变量，兼容 1/true/yes/on 等常见真假写法，无法识别时回退默认值。',['utility','环境变量','validation']);
S('function',C+'common.py','env_float',[54,72],'读取浮点数环境变量，为空或格式非法时返回默认值。',['utility','环境变量','validation']);
const sub=[
['embedding_config.py','EmbeddingConfig',[10,14],'Embedding 向量模型配置模块，从环境变量读取 BGE-M3 模型路径、设备与 FP16 设置并实例化 embedding_config。','BGE-M3 向量模型配置数据类，包含模型路径、名称、运行设备与是否启用 FP16。',['env_str','env_bool'],'embedding'],
['lm_config.py','LLMConfig',[11,16],'LLM 配置模块，从环境变量读取 OpenAI 兼容接口地址、API Key、视觉模型、默认对话模型及温度并实例化 lm_config。','大语言模型配置数据类，包含 base_url、api_key、视觉模型、对话模型与温度。',['env_str','env_float'],'llm'],
['milvus_config.py','MilvusConfig',[10,14],'Milvus 向量库配置模块，从环境变量读取连接地址与 chunks、实体名、商品名等集合名称并实例化 milvus_config。','Milvus 配置数据类，包含连接 URL 与三个集合名称。',['env_str'],'milvus'],
['mineru_config.py','MinerUConfig',[10,12],'MinerU 文档解析服务配置模块，从环境变量读取服务地址与 API Token 并实例化 mineru_config。','MinerU 配置数据类，包含 base_url 与 api_key。',['env_str'],'mineru'],
['minio_config.py','MinIOConfig',[10,16],'MinIO 对象存储配置模块，从环境变量读取端点、访问密钥、桶名、图片目录与 HTTPS 开关并实例化 minio_config。','MinIO 配置数据类，包含端点、密钥、桶名、图片目录与是否启用 HTTPS。',['env_str','env_bool'],'对象存储'],
['reranker_config.py','RerankerConfig',[9,12],'Reranker 重排模型配置模块，从环境变量读取 BGE Reranker 模型路径、设备与 FP16 设置并实例化 reranker_config。','BGE Reranker 重排模型配置数据类，包含模型路径、运行设备与是否启用 FP16。',['env_str','env_bool'],'reranker'],
];
for(const [f,cls,lr,fs_,cs,fns,tag] of sub){const p=C+f;F(p,fs_,['config',tag,'环境变量','dataclass'],'simple');S('class',p,cls,lr,cs,['config','dataclass','data-model']);
 for(const fn of fns)E('file:'+p,'function:'+C+'common.py:'+fn,'calls',0.8);}
F(C+'settings_config.py','应用基础配置模块，从环境变量读取导入/查询服务名称、运行环境、监听地址、端口与 CORS 白名单并实例化 settings。',['config','settings','环境变量','dataclass'],'simple');
S('class',C+'settings_config.py','AppSettings',[14,23],'应用启动设置数据类，字段默认值在类定义时从环境变量读取，CORS 源按逗号拆分为元组。',['config','dataclass','cors']);
E('file:'+C+'bailian_mcp_config.py','function:'+C+'common.py:env_str','calls',0.8);
let n=0;for(const [k,v] of Object.entries(inp.batchImportData))for(const t of v){E('file:'+k,'file:'+t,'imports',0.7);n++;}
console.log('imports',n);
const ids=new Set(nodes.map(x=>x.id));if(ids.size!==nodes.length)throw 'dup';
for(const e of edges){if(e.source===e.target)throw 'self';}
fs.writeFileSync('C:/Users/LD/Desktop/ai_0511_knowledge_base-master/.ua/intermediate/batch-3.json',JSON.stringify({nodes,edges},null,1));
console.log(nodes.length,edges.length);
