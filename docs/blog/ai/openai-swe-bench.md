---
title: 重大更新，openai 开始打榜 swe-bench
date: 2024-08-15 08:22:00
type: post
blog: true
description: openai 开始关注 swe-bench ，并尝试打榜。
tags:
    - LLM
    - swe-bench 
    - Agent
---

这就有些意思了，openai 最新的一篇博客，公布了一些他们和 swe-bench 相关的一些东西。最新的 gpt4o（不确定是否发布），直接 Agentless （无工具调用）就超过了社区各种复杂的 Agent 方案。

  

swe-bench 是一个由社区驱动的，以评估 [LLM](https://zhida.zhihu.com/search?q=LLM&zhida_source=entity&is_preview=1) Agent 系统解决真实世界问题能力的[测试集](https://zhida.zhihu.com/search?q=%E6%B5%8B%E8%AF%95%E9%9B%86&zhida_source=entity&is_preview=1)。

  

这些测试集中的每个示例都是根据 [GitHub](https://zhida.zhihu.com/search?q=GitHub&zhida_source=entity&is_preview=1) 上 12 个开源 Python 存储库之一中已解决的 GitHub 问题创建的。每个示例都有一个关联的拉取请求 (PR)，其中包括解决方案代码和用于验证代码正确性的[单元测试](https://zhida.zhihu.com/search?q=%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95&zhida_source=entity&is_preview=1)。简单而言，就是用 Agent 模拟人类程序员，自动分析issue、找到代码，修复 bug，提交 [diff](https://zhida.zhihu.com/search?q=diff&zhida_source=entity&is_preview=1)。

  

由于笔者最近大部分时间在关注基于 LLM 解决真实世界的问题，一直在尝试各种各样的 Agent 策略，以提高性能。这个领域一直是被社区驱动，截止 openai 博客提到的8月5日的前，在 SWE-bench 上得分最高为 20%，在 SWE-bench Lite 上得分为 43% 。

大部分 Agent 策略都是使让模型调用各种工具，并思考做规划和行动等，构建这类[智能体](https://zhida.zhihu.com/search?q=%E6%99%BA%E8%83%BD%E4%BD%93&zhida_source=entity&is_preview=1)通常工程工作非常繁琐。

  

openai 博客本次更新主要信息有两个:

1.  原始的swe-bench 测试集有一些数据质量不高，会导致模型给出正确的方案，也会导致测试不通过。于是基于 swe-bench和大量 python 开发合作构建了更高质量的 swe-bench-verified，这些测试集均人工验证。
    

2\. 新的 gpt4o 在 Agentless 达到33%。超过社区构建的各种复杂 Agent 方案。

  

当 openai 开始关注 更上层的 Agent 应用，并从纯 Agentless（不依赖复杂的 Agent，纯LLM） 上做到了 top。这是不是意味着，底层模型一更新，基于模型的 Agent 方案就失效了，广大工程师和研究者所设计的各种策略就没有价值了呢？

  

首先，从实际结果上看，模型底层能做到这样的结果非常惊艳。但底座的能力提升和基于底层的 Agent 策略缺不冲突。使用[逻辑推理](https://zhida.zhihu.com/search?q=%E9%80%BB%E8%BE%91%E6%8E%A8%E7%90%86&zhida_source=entity&is_preview=1)性能更的底座，构建到 Agent 会让系统整体更强。我们可以持续关注 swe-bench 来验证这一点（事实上，昨天最新的一个Agent genie，已经把榜单做到 50%，超过了openai 今天这篇[博客](https://zhida.zhihu.com/search?q=%E5%8D%9A%E5%AE%A2&zhida_source=entity&is_preview=1)的数据）。

  

openai的博客也没有提到最新的 gpt4o 是否更新了到 api 接口中，如果一旦更新，社区将会继续用更强的接口，构建更复杂的 Agent。

  

这次更新，可能不会引起公众的关注，但对于在尝试构建 Agent 系统的人而言，是非常重要的信号。在用大模型解决现实世界真实问题的的过程中，基座能力和[工程应用](https://zhida.zhihu.com/search?q=%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8&zhida_source=entity&is_preview=1)是协同并进的。期待更强推理能力的模型出现！也支持投入大量精力去研究构建更复杂 Agent 方案。

  

openai 的博客: [https://openai.com/index/introd](https://link.zhihu.com/?target=https%3A//openai.com/index/introducing-swe-bench-verified/)