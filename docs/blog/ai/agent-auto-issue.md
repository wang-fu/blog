---
title: 基于开源大模型的 Agent 如何自主完成需求—回顾
date: 2024-08-02 22:22:00
type: post
blog: true
description: 近期大量时间都在聚焦基于 Agent 解决现实世界问题。这个想法最初来自 Devin 的出现，随后由普林斯顿大学大学发起的 swe-bench Can Language Models Resolve Real-World GitHub Issues? 引发了社区踊跃参与建设——用 Agent 方案以解决真实时间的软件 issue 问题。
tags:
    - LLM
    - Agent
    - swe-bench
---
源起
--

近期大量时间都在聚焦基于 Agent 解决现实世界问题。这个想法最初来自 Devin 的出现，随后由[普林斯顿大学](https://zhida.zhihu.com/search?q=%E6%99%AE%E6%9E%97%E6%96%AF%E9%A1%BF%E5%A4%A7%E5%AD%A6&zhida_source=entity&is_preview=1)大学发起的 [swe-bench Can Language Models Resolve Real-World GitHub Issues?](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2310.06770) 引发了社区踊跃参与建设——用 Agent 方案以解决真实时间的软件 issue 问题。 这些 issue 可以是需求、或者是 bug， Agent 看到这些 issue 后，会自动做需求分析、打开 git 仓库，并找到项目中与之相关的文件，并进行编码，测试验证，随后自动提交，完整任务。由于整个过程无人干预，Agent 就像人类程序员一样工作和解决问题。我们需要对 Agent 的性能进行评估和反馈，这就是 swe-bench [测试集](https://zhida.zhihu.com/search?q=%E6%B5%8B%E8%AF%95%E9%9B%86&zhida_source=entity&is_preview=1)的来源。这些测试集中的每个示例都是根据 GitHub 上 12 个开源 Python 存储库之一中已解决的 GitHub 问题创建的。每个示例都有一个关联的拉取请求 (PR)，其中包括解决方案代码和用于验证代码正确性的[单元测试](https://zhida.zhihu.com/search?q=%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95&zhida_source=entity&is_preview=1)。简单而言，就是用 Agent 模拟人类程序员，自动分析issue、找到代码，修复 bug，提交 [diff](https://zhida.zhihu.com/search?q=diff&zhida_source=entity&is_preview=1)。

  

随后，普林斯顿很快也发布了 [swe-Agent](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2405.15793)，即它们解决这个问题的一种方案： 定制的Agent-计算机接口（ACI）显著增强了代理创建和编辑代码文件、浏览整个代码库以及执行测试和其他程序的能力。在 SWE-bench 和 HumanEvalFix 上评估了 SWE-agent，在这两者上都达到了最先进的性能，[通过率](https://zhida.zhihu.com/search?q=%E9%80%9A%E8%BF%87%E7%8E%87&zhida_source=entity&is_preview=1)分别为 12.5%和 87.7%。 这两篇论文可以说是 Agent 解决现实软件问题的最重要的起点。今年上半年大量各种类型的 Agent 策略犹如[雨后春笋](https://zhida.zhihu.com/search?q=%E9%9B%A8%E5%90%8E%E6%98%A5%E7%AC%8B&zhida_source=entity&is_preview=1)般被发布，其性能也超普林斯顿最初的方案，但基本都将 [swe-bench](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2310.06770) 和 [swe-Agent](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2405.15793) 作为论文引用。

  

![](https://pic3.zhimg.com/80/v2-786dfbfe802d7b78a0971d2edd0ea26c_720w.webp)

  

针对大量的相关论文，以及参考方案，笔者都进行了一些实验(由于并不能使用外部诸如 gpt4 的模型，我们的实验均在内部部署的基[开源模型](https://zhida.zhihu.com/search?q=%E5%BC%80%E6%BA%90%E6%A8%A1%E5%9E%8B&zhida_source=entity&is_preview=1)进行)，项目到一定进展，文本做一个简单的回顾。

  

方案汇总
----

虽然有大量相关论文以及[开源项目](https://zhida.zhihu.com/search?q=%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE&zhida_source=entity&is_preview=1)，但整体思路的方向还是一致的，就是将单一 LLM + RAG 工具调用拆成 多 Agent 协同。 比如，传统的 LLM + RAG 仅仅是一个模型上下文解决整个任务，而 Agent 方案基本都是：把整个问题的解决拆分成多个任务分配给不同的 Agent 去解决。 比如任务分析 Agent、代码定位 Agent、任务规划 Agent、[代码生成](https://zhida.zhihu.com/search?q=%E4%BB%A3%E7%A0%81%E7%94%9F%E6%88%90&zhida_source=entity&is_preview=1) Agent、测试验证 Agent等，这里的原因也很简单，每个 Agent 聚焦更简短的任务，每个系统提示词都能针对性优化，从而整体加强了 系统的性能。

话虽如此，但其中工程细节却会导致显著性能差异，本文不会做每个方案详细的论述，主要阐述整体思想，但文章结束后会贴出能想起来的论文链接。 不管哪种 Agent 策略，最核心的两个： 1. 基于 issue 找到相关修改的代码。 2. 对代码进行准确修改 。

### 如何定位到文件

我们首先看第一个问题： 如何根据一个 [issue](https://zhida.zhihu.com/search?q=issue&zhida_source=entity&is_preview=1) 在一个几百上千文件的项目中找到相关文件呢？ 模型的上下以及能力限制，这个其实是难点。

解决这个问题社区又分三大类方向： 1 . 仿人类思维直觉的逐步操作。2. 挂载程序[语法分析](https://zhida.zhihu.com/search?q=%E8%AF%AD%E6%B3%95%E5%88%86%E6%9E%90&zhida_source=entity&is_preview=1)、向量/知识库等能力。3\. AgentLess 无工具调用。

这几类方向并不冲突，而是可以相互利用，但仍有信仰之争。就有点像汽车自动驾驶中，到底该不该用雷达去探测路障，坚持纯视觉方案的人会认为，人类并没有额外的雷达能力，仅仅依靠视觉就能完整熟练的驾驶操作，那自动驾驶应该如此。 而增加雷达方案的人会认为，我们可以用雷达让智能驾驶看到超越人类的更多的信息。

在解决[软件自动化](https://zhida.zhihu.com/search?q=%E8%BD%AF%E4%BB%B6%E8%87%AA%E5%8A%A8%E5%8C%96&zhida_source=entity&is_preview=1)方案过程一样，仿人类思维直觉的操作：让 Agent 观察当前 issue ，然后给定项目的目录，让其模拟人类决策当前应该做什么操作，人类可选的操作一般是：打开文件夹，打开文件，鼠上滚动，定位到某行，定位到某个类等。Agent 每进行一步操作，系统将会把操作的结果返回的 LLM ，让其再次决策接下来的行动，这和人类程序员利用编辑器看代码是一样的。 因为[通用模型](https://zhida.zhihu.com/search?q=%E9%80%9A%E7%94%A8%E6%A8%A1%E5%9E%8B&zhida_source=entity&is_preview=1)拥有大量人类真实世界项目的知识，可以根据这些信息去决定接下来做什么。 为什么这里称“仿人类思维直觉”，因为这类操作和人类相似，没有用视觉以外的外挂。比如人类在写代码过程并没有使用AST，向量这种外挂工具，社区中偏执这种思维的方案和自动驾驶偏置于纯视觉类似（比如特斯拉）。

  

那第二种方案，比如开源的 [Auto Code](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2404.05427) 直接将项目的本地代码库解析为[抽象语法树](https://zhida.zhihu.com/search?q=%E6%8A%BD%E8%B1%A1%E8%AF%AD%E6%B3%95%E6%A0%91&zhida_source=entity&is_preview=1)（AST）并在其上进行搜索来进行本地处理，局部执行这些 API 的结果返回给代理，形成代码上下文。 还有阿里的 [Lingma](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2406.01422) 类似的把代码库的关键信息以自上而下的方式浓缩为代码库知识图，再基于[蒙特卡洛树搜索](https://zhida.zhihu.com/search?q=%E8%92%99%E7%89%B9%E5%8D%A1%E6%B4%9B%E6%A0%91%E6%90%9C%E7%B4%A2&zhida_source=entity&is_preview=1)的代码库探索策略等。华为的 [CodeR](https://link.zhihu.com/?target=https%3A//arxiv.org/pdf/2406.01304) 也用到了 AutoCodeRover 搜索等。这些方案都验证了利用人类视觉以外的能力能显著的提高定位到相关代码的效率。

  

第三种方案：其实是我们最初尝试的策略。直接用传统程序生成特定的代码结构抽象，模型逐一分析，定位最相关文件，再查看，最后去修改。但那个时候并没有 [AgentLess](https://link.zhihu.com/?target=https%3A//arxiv.org/html/2407.01489v1) 这个名词。直到 7 月份伊利诺伊大学发了一个 [paper](https://link.zhihu.com/?target=https%3A//arxiv.org/html/2407.01489v1)，被网传起来了，我一看，哦，原来这就是 AgentLess。 什么意思呢？就是借助传统程序回归简单，不要用各种复杂的工具调用，论文指出：当前的 Agent 修复软件的方案，过于复杂（确实工程上有点繁琐），成本高。Agent 之间相互调用表现出明显的脆弱性，当前模型的在进行反思、规划方面存在困难。伊利诺伊大学针对 swe-bench 做了大量定制化优化，比如它们选定的是 python 的语法，先定位文件、类、函数、变量抽象做一个精简版本，然后 LLM 定位（localize）可能需要修改的文件和内容，确定圈定具体文件修改的范围，直接在这个范围内字符串替换。 其实本质上就是利用程序把整个项目上下文范围的从大到小不断收缩的过程。 但这种方案缺点是不够通用。（[openai](https://zhida.zhihu.com/search?q=openai&zhida_source=entity&is_preview=1) 曾经基于这个方案推出过一篇博客，参考我[之前的介绍](https://zhuanlan.zhihu.com/p/714411345)）

  

  

在上面的几大类方案中，目前 70b大小的开源模型似乎处理太复杂的工具调用有一定难度，比如测试普林斯顿的这种复杂工具调用，会让整体反而更弱，在其基础上做一些工具精简反而更好。当前的通用模型确实对在规划和反思上存在不足，利用更多传统程序能力来加强是不可避免。

  

### 如何准确修改

第二个问题：如何对代码进行准确修改。

理论上， Agent 系统已经定位到具体的修改点后，修改局部代码应该是模型强项，不应该成为阻塞点。实际并没有想象中简单（特别是当前开源模型）。由于修改文件内容长度问题，我们不可能让模型返回全部的完整文件代码。

最直接的方案就是基于给定原代码，让模型生成标准的 diff ，这样直接把 diff 合并到原始代码中即可，这个是很多基于 gpt4 的做法。经过我个人的测试这某开源模型似乎有挑战， diff 的应用是相当敏感，空白、回撤、tab、加减号等任意的字符差异都会导致失败。另外一种是在给模型原代码的过程，每一行标注对应的行号，提示模型返回生成代码需要携带行，比如 [AbanteAI](https://link.zhihu.com/?target=https%3A//mentat.ai/blog/mentatbot-sota-coding-agent) 就是让模型返回修改的行区块起始结束行号， 我们测试这种策略模型也很难遵守行号指令，容易出现幻觉，给出错误的行。最后一种就是更直接的方案比如 swe-agent 中给定 replace 工具方法，让模型返回被替换的原内容和生产的新内容，直接字符串替换，这种对开源模型失败率更高。

所以，最终尝试必须要构造一种适合这款开源模型本身的新旧代码替换方案，期间尝试了从代码占位符替换、到更简单的伪 git diff 格式，手动解析，并替换，以及其他大量提示词生成方案，最终暂定一种简单的、不带行号的自定义代码格式，然后程序解析这个格式，生成新旧代码，并利用 diff 算法给定一个相似度阈值，去源码中检索匹配源码，进行替换。本质上，这些工程都是因为模型能力不够强。

  

社区其他强化方案
--------

### 微调

上面的大量已经社区方案都是在非微调的通用模型下进行，最新的 [Genie](https://link.zhihu.com/?target=https%3A//cosine.sh/blog/genie-technical-report) 在技术报告中提到，使用大量基于 openai 长上下文模型微调的方案，构建了 swe-bench 大性能最高的 50%。 但也[有人指出](https://link.zhihu.com/?target=https%3A//news.ycombinator.com/item%3Fid%3D41224905)，他们可能在微调过程，把 swe-bench 测试集的数据搞进去了。 如今的通用模型，在预训练阶段，代码比例已经相当之高了，对这种继续再微调方案的通用性个人持谨慎态度。

  

### Agent 集群

这个是 [CodeStory Aide](https://link.zhihu.com/?target=https%3A//aide.dev/) 提出的一种策略，本质上还是更倾向使用仿人类思维直觉，他们抽离了一层轻量的 vscode LSP (语言服务协议)，组合大量的 Agent 集群，模仿人类的点击跳转获取更多代码上下文，并获得 了 swe-bench-lite 集的最高性能，当然代价是更多的 LLM 调用。这是随着模型性能提高、算力进步追究的一个方向，这一点 Aide 的做法很让人鼓舞。

  

### 摘要和代码知识

人类程序员在解决一个软件问题的时候，通常是拥有对整个项目的经验知识。比如某个文件夹是做什么的，某个文件什么功能，这些都是在项目迭代中不断积累的，假定一个新人入职，处理他从未遇到的项目，通常也需要很长时间才能上手（特别是维护性不加和没有文档的情况）。 提前把这些的信息组织起来，注入到模型上下文是一种非常符合直觉的方案。我们可以提前让 LLM 阅读代码，对代码进行抽象总结，缓存，并在代码更新的过程再次总结。 在后续 Agent 系统打开各种文件的过程，加以利用，从而降低 LLM 的调用次数。

  

结
-

最后，谈下个人的观点，从去年中旬以来，Agent 方案论文数量已经超过了底层 LLM 调用，某种程度，Agent 工程已经和底层 LLM 并驾齐驱的重要技术。然而这些工程优化可能会因为通用模型性能的提高而变得过时，在 Agent 商业化应用过程，不可避免会在短期和长期方向之间摇摆。 如果我们提前假定模型能力会不断增加，算力会不断更便宜。那至少在结构上，那些临时的方案只是外围扩展而已，这样模型能力即使不断变化，我们的 Agent 系统也能不断被强化和适应。

  

相关论文
----

*   swe-bench: [https://arxiv.org/abs/2310.06770](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2310.06770)  
    Can Language Models Resolve Real-World GitHub Issues? 提出解决现实 GitHub 的问题
    
*   swe-Agent [https://arxiv.org/abs/2405.15793](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2405.15793)  
    普林斯顿的工程优化方案，有各种打开文件、滚动代码等标准工程方案。
    
*   AutoCodeRover [https://arxiv.org/abs/2404.05427](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2404.05427)  
    [开源社区](https://zhida.zhihu.com/search?q=%E5%BC%80%E6%BA%90%E7%A4%BE%E5%8C%BA&zhida_source=entity&is_preview=1)基于 ATS 搜索上下文的 Agent 方案。
    
*   Lingma [https://arxiv.org/abs/2406.01422](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2406.01422)  
    阿里 Lingma 提到了[知识图谱](https://zhida.zhihu.com/search?q=%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1&zhida_source=entity&is_preview=1)，蒙特卡洛探索策略，摘要等
    
*   CodeR [https://arxiv.org/pdf/2406.01304](https://link.zhihu.com/?target=https%3A//arxiv.org/pdf/2406.01304)  
    华为的一个工程方案，提到了测试、复现、验证来提高解决率。
    
*   AgentLess [https://arxiv.org/html/2407.01489v1](https://link.zhihu.com/?target=https%3A//arxiv.org/html/2407.01489v1)  
    提出非 Agent 方案，openai 最新模型使用 AgentLess 达到了更高水准。
    
*   mentat[https://mentat.ai/blog/mentatbot-sota-coding-agent](https://link.zhihu.com/?target=https%3A//mentat.ai/blog/mentatbot-sota-coding-agent)  
    开源项目，使用了向量库收集上下文，并提供了多种不同策略的代码生成方案。
    
*   Genie [Technical Report: Building Genie](https://link.zhihu.com/?target=https%3A//cosine.sh/blog/genie-technical-report)  
    基于 openai 模型微调
    
*   json 策略的效果 [https://arxiv.org/abs/2408.02442](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2408.02442)  
    这篇论文提供了很好的数据证据，强制模型返回特定 JSON 格式会降低性能。
    
*   Aide[Our SOTA multi-agent coding framework](https://link.zhihu.com/?target=https%3A//aide.dev/blog/sota-on-swe-bench-lite)  
    抽离 vscode LSP模拟代码跳转，并结合 Agent 集群。