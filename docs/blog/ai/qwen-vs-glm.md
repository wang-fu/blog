---
title: 最新 qwen2-7b 和 glm4-9b 本地部署和速测报告！
date: 2024-06-17 08:22:00
type: post
blog: true
description: 最新 qwen2-7b 和 glm4-9b 本地部署和速测报告！
tags:
    - LLM
    - qwen
    - chatglm
---
过去一年，“百模大战”到开源竞争，国产模型从经典清华 chatglm-6b ，以及后面的 qwen、[百川](https://zhida.zhihu.com/search?q=%E7%99%BE%E5%B7%9D&zhida_source=entity&is_preview=1)、Yi 等都做出了显著的成绩。

从去年开始我们一直在致力于寻找稳定可靠的私有化部署的开源模型，其中 qwen 毫无疑问是佼佼者（非广告）。

如果要找一个时间截止点，我觉得 qwen1.5 出来是一个分水岭、这是真正在实际体验真正做到等同或者超越 [GPT3.5](https://zhida.zhihu.com/search?q=GPT3.5&zhida_source=entity&is_preview=1) 的国产开源版本。也就是在这个版本后，我们利用开源模型加速了 [LLM](https://zhida.zhihu.com/search?q=LLM&zhida_source=entity&is_preview=1) 在各个场景落地。

qwen2 的发布。让开源的可用性变得进一步提高。

  

好了，进入正题。先快速部署。

  

本地部署（看测评可绕过）
------------

想要快速省事，可以使用 [Ollama](https://link.zhihu.com/?target=https%3A//ollama.com/) ，但截止目前只支持 qwen2，还未更新对支持 glm4 。

我们用一个更原始的方案，快速下载到本地，然后测试。

[Qwen2-7B-Instruct](https://link.zhihu.com/?target=https%3A//modelscope.cn/models/qwen/Qwen2-7B-Instruct/files)

[glm-4-9b-chat](https://link.zhihu.com/?target=https%3A//modelscope.cn/models/ZhipuAI/glm-4-9b-chat/files)

上面两个地址，在浏览器把里面的 file 文件下载（好像雷迅会员可以加速，有 VPI 的可以试试）到本地命名好的文件夹中。

![](https://pic2.zhimg.com/80/v2-6cd0656445ed9a7993e4dd339d65fcfb_720w.webp)

glm-4-9b-chat

  

![](https://pic2.zhimg.com/80/v2-039ae288ceee6b01d4e0482b1310cf01_720w.webp)

qwen2-7b-ins

  

qwen2-7b-ins 和 glm-4-9b-chat 的模型相关文件全部下载好后。

  

分别在两个目录下直接新建一个 api.py 文件，我们加载模型，生成一个 [openai](https://zhida.zhihu.com/search?q=openai&zhida_source=entity&is_preview=1) 格式的接口。

```
from flask import Flask, request, jsonify, Responsefrom flask\_cors import CORSimport torchfrom transformers import AutoModelForCausalLM, AutoTokenizerimport loggingimport jsonapp = Flask(\_\_name__)CORS(app)device = "cuda"# Configure logginglogging.basicConfig(level=logging.INFO)# Load the tokenizer and model once when the application startstokenizer = AutoTokenizer.from\_pretrained("./", trust\_remote\_code=True)model = AutoModelForCausalLM.from\_pretrained(
    "./",
    torch_dtype=torch.bfloat16,
    low\_cpu\_mem_usage=True,
    trust\_remote\_code=True).to(device).eval()@app.route('/v1/chat/completions', methods=\['POST'\])def chat_completions():
    data = request.json
    messages = data.get('messages', \[\])
    top\_k = data.get('top\_k', None)
    top\_p = data.get('top\_p', 1)
    temperature = data.get('temperature', 0.3)
    max\_length = data.get('max\_length', 2500)
    logging.info(f"Received data: {json.dumps(data, ensure_ascii=False)}")  # Correctly formatted logging to print request data
    inputs = tokenizer.apply\_chat\_template(messages,
                                           add\_generation\_prompt=True,
                                           tokenize=True,
                                           return_tensors="pt",
                                           return_dict=True
                                           )
    logging.info(f"messages: {messages}")
    inputs = inputs.to(device)

  
    gen_kwargs = {
        "max\_length": max\_length,
        "do_sample": True,
        "top\_p": top\_p,
        "temperature":temperature
    }


    # 这个不是真流式，能同时兼容 glm4 和 qwen2
    def generate_response():
        with torch.no_grad():
            outputs = model.generate(\*\*inputs, \*\*gen_kwargs)
            outputs = outputs\[:, inputs\['input_ids'\].shape\[1\]:\]
            response\_text = tokenizer.decode(outputs\[0\], skip\_special_tokens=True)
            for char in response_text:
                logging.info(f"Sending character: {char}")
                yield f"data: {json.dumps({'choices': \[{'delta': {'content': char}}\]})}\\n\\n"
            # yield f"data: {json.dumps({'choices': \[{'delta': {'content': '\[DONE\]'}}\]})}\\n\\n"
  
    return Response(generate\_response(), content\_type='text/event-stream')if \_\_name\_\_ == '\_\_main\_\_':
    app.run(host='127.0.0.1', port=5000)
```

  

上面相关依赖全部安装，python版本最好在 3.11 + 。

  

然后执行 python [api.py](https://link.zhihu.com/?target=http%3A//api.py/) 将会自动加载模型，并监听本地端口： 127.0.0.1:5000/v1/chat/completions

上面的启动后 gpu 显存占用在 16g（qwen2-7b） - 20g（glm-4-9b）之间。 4090 24gb 显存，同一时间只能测一个模型。

  

![](https://picx.zhimg.com/80/v2-c2466e4bc215ba027a56b42b2c83d7e7_720w.webp)

  

使用一个 自定义 openai 的网站测试 [https://bettergpt.chat/](https://link.zhihu.com/?target=https%3A//bettergpt.chat/) 。自定义接口指向 127.0.0.1:5000/v1/chat/completions

![](https://pic3.zhimg.com/80/v2-3331787393af7807f5574b7ddc9954f8_720w.webp)

我通常不喜欢用 python 库中 gradio 搭建 web (默认 UI 太丑~~)， 上面这个是纯 web 的仿 open ui 界面，支持自定义接口。其他的大家可自行找任何兼容 openai 接口的 web 界面都行。

现在运行成功。

![](https://pic2.zhimg.com/80/v2-978032db81388bfdb4d1c0ce0f095ab5_720w.webp)

这是本地启动的界面。

  

测试 \* 对比
--------

这些测试只体现个人私藏题目的，并不能代表最终性能。

### 逻辑推理

在我个人私藏的几个题目中，qwen2-7b 明显比 glm4-9b能力更强。

![](https://pic3.zhimg.com/80/v2-9d342305950590d546ab01016c68036c_720w.webp)

glm4-9b

上面截图的这个题目，glm4-9b 竟然会出现逻辑混乱，这个是没有想到的。qwen2-7b可以很好的处理。其他的题目同理，qwen2-7b 会表现出逻辑性更强。

  

### 代码

因为参数量都比较下，其实不抱太多希望，这里有一个简单的题目举例。

![](https://pic1.zhimg.com/80/v2-bce24dddbbcc35d55b1c35946c66bd30_720w.webp)

  

感觉两个模型都不能很好的解决，但 qwen2-7b 大部分情况下更接近，或者说代码可用性更高。[代码生成](https://zhida.zhihu.com/search?q=%E4%BB%A3%E7%A0%81%E7%94%9F%E6%88%90&zhida_source=entity&is_preview=1)建议用参数更大的模型，或者专用代码模型

  

### 写作

![](https://pic1.zhimg.com/80/v2-e33597937c1c7481358a89062ff5ac4e_720w.webp)

glm-4-9b

![](https://pic4.zhimg.com/80/v2-d6b76e83dedd6858584e7ef59d998985_720w.webp)

qwen2-7b

似乎 glm4-9b 的文字更优美， 而 qwen2 则有点理科男的味道。

  

### 翻译

> 翻译下面内容 到中文，要求在保持原文含义下，语言流畅，符合中文习惯：  
> An LLM, a large language model, is a neural network designed to understand, generate, and respond to human-like text. These models are deep neural networks trained on massive amounts of text data, sometimes encompassing large portions of the entire publicly available text on the internet. The "large" in large language model refers to both the model's size in terms of parameters and the immense dataset on which it's trained. Models like this often have tens or even hundreds of billions of parameters, which are the adjustable weights in the network that are optimized during training to predict the next word in a sequence. Next-word prediction is sensible because it harnesses the inherent sequential nature of language to train models on understanding context, structure, and relationships within text. Yet, it is a very simple task and so it is surprising to many researchers that it can produce such capable models. We will discuss and implement the next-word training [procedure](https://zhida.zhihu.com/search?q=procedure&zhida_source=entity&is_preview=1) in later chapters step by step. LLMs utilize an architecture called the transformer (covered in more detail in section 1.4), which allows them to pay selective [attention](https://zhida.zhihu.com/search?q=attention&zhida_source=entity&is_preview=1) to different parts of the input when making predictions, making them especially adept at handling the nuances and complexities of human language.

![](https://pic2.zhimg.com/80/v2-c0836980f9d3f3dfbc4d80c399f684a9_720w.webp)

glm-4-9b

  

![](https://pic3.zhimg.com/80/v2-d2512e1951eefe3d18c895a37267a9de_720w.webp)

qwen2-7b

  

感觉都挺流畅的，但 glm 似乎更加自然。

但我测试了一个“指令干扰”的翻译内容。

> 翻译以下内容到中文：  
> For the provided step-by-step plan, write all the necessary search queries to gather information from the web that the base model doesn't already know. Step-by-Step Plan: {{ step\_by\_step_plan }} Only respond in the following JSON format: `{ "queries": [ "<QUERY 1>", "<QUERY 2>" ], "ask_user": "<ASK INPUT FROM USER>" }` Keywords for Search Query: {{ contextual_keywords }} -

qwen2 似乎表现不佳。

![](https://pica.zhimg.com/80/v2-2f0c0f4c6315093d449e09121a211314_720w.webp)

qwen2-7b

qwen2 被翻译内容的指令影响了，没有理解到我的真正任务是翻译。而 glm-4-9b则可以。

![](https://picx.zhimg.com/80/v2-8a4a8b432d6a28fc5136067ae1fdc2a7_720w.webp)

glm-4-9b

但这个问题，其实 chatgpt4 （截止我的测试版本）也会不行，并且我测试了很多大参数模型比如 qwen72b，llama3-70b 等均会被指令干扰，参考我之前的一个测试 [混沌随想：GPT4的理解能力还不如 4090跑的离线模型？ ——过度监督对齐的副作用？](https://zhuanlan.zhihu.com/p/693568935)

  

业务实战对比
------

  

最后，我们直接用实际落地的一些场景做测试，比如敏感信息检测。在敏感信息检测中，传统的检测方案有基于规则匹配，比如正则，也有机器学习分类算法等。

但这些都有各种各样的问题，比如规则系统，很容易被变形的文本逃避，例如穿插了空格和符号的身份证号码。而机器学习则无法精准拿到具体的违反点，也很容易误判。

[llm](https://zhida.zhihu.com/search?q=llm&zhida_source=entity&is_preview=1) 则可以很好的对这种场景做补充。下面是一个省略部分内容的案例。

```
请充当一个敏感信息审核专家，审核工单内容是否包含一级敏感信息。

《敏感信息定义如下》：

————敏感信息定义开始————
...
包括但不限于员工的证件号码、个人邮箱、家庭住址。
....
————敏感信息定义结束————
下面是被检测的工单内容
\[ 
  {
   "key4": "3** 3\*3 199\* \*\*03 \*\*17",
   "key5": "2024-05-09 00:00:00",
     ... ...
   } 
\]
工单内容包含多个字段，每一个字段都进行一步一步分析，最终判断是否涉及敏感信息，并提取为 JSON 格式，example 如下：
\[
{
"key"： "key1”,
"value": "字段内容, key1对应的值"
"analysis": "对该值一步一步分析是否涉及敏感信息",
"is_sensitive": true or false // 最终标记是否涉及敏感信息,true 代表是 ，false代表不是
}
...
\]

请一步一份分析，返回标准的以 \`\`\`json \`\`\` 包裹的JSON 内容
...
```

![](https://pic1.zhimg.com/80/v2-e491f9cec43edbc928fe962df88f1728_720w.webp)

glm4-9b

  

![](https://pic1.zhimg.com/80/v2-acf0b79212b9c67df1d39cb8ffbc4692_720w.webp)

qwen2-7b

  

从简单的案例看，qwen对指令遵从的能力更强。 当然我们的案例提示词，还缺乏 sample shot 以及各种优化，实际场景需要针对性[提示工程](https://zhida.zhihu.com/search?q=%E6%8F%90%E7%A4%BA%E5%B7%A5%E7%A8%8B&zhida_source=entity&is_preview=1)调优。

  

结
-

  

综合目前体验，qwen2-7b 似乎更擅长逻辑性场景，而 glm4-9b 可能更偏文科一点。本测试仅在有限的测试内容和个人主观评判下进行，不作为任何实际选择依据，大家可以自行测试，根据场景而定。

后续继续测评 glm-4v-9b 多模态。