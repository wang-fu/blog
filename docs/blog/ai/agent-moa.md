---
title: MOA架构，多个开源 LLM 协作可超过GPT-4o
date: 2024-07-10 08:22:00
type: post
blog: true
description: MOA架构，多个开源 LLM 协作可超过GPT-4o
tags:
    - LLM
    - MOA
    - Agent
---

看到一个基于纯 Agent 的 MOA 架构，感觉挺有意思，通俗解释就是: [三个臭皮匠](https://zhida.zhihu.com/search?q=%E4%B8%89%E4%B8%AA%E8%87%AD%E7%9A%AE%E5%8C%A0&zhida_source=entity&is_preview=1)顶一个诸葛亮。

论文在这:[https://arxiv.org/abs/2406.04692](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2406.04692)

代码如下:[https://github.com/togethercomputer/MoA](https://link.zhihu.com/?target=https%3A//github.com/togethercomputer/MoA)

有点像 MoE 的思想，但 MoE 是模型内部，分为多个子网络专家，训练的时候调整门控网络参数，这些协作是训练到参数中，最终对外部是一个模型整体，后续是不能随着修改和拔插的。而混合智能体（MoA），它能利用多个已经训练好的 LLM 作为 独立的Agent，让多个这种 Agent相互协作，相互参考答案和建议，得到最终答案，并且可以随时组合和拔插不同的模型 。本质上是用[提示工程](https://zhida.zhihu.com/search?q=%E6%8F%90%E7%A4%BA%E5%B7%A5%E7%A8%8B&zhida_source=entity&is_preview=1)调度发挥 Agent的集体优势。

MoA 采用[分层架构](https://zhida.zhihu.com/search?q=%E5%88%86%E5%B1%82%E6%9E%B6%E6%9E%84&zhida_source=entity&is_preview=1)，每一层包含若干个 LLM Agent 智能体。这些 Agent 智能体将前一层的输出作为[辅助信息](https://zhida.zhihu.com/search?q=%E8%BE%85%E5%8A%A9%E4%BF%A1%E6%81%AF&zhida_source=entity&is_preview=1)来生成更精细的响应。这种方法使 MoA 能够有效地整合各种模型的不同能力和见解，从而形成一个更强大、更灵活的综合模型。

他们构建了一个由 qwen1.5-110b、llama70b 等组合起来的一个整体，在 AlpacaEval 2.0 上取得了 65.1%的分数，超过了先前的领先者 [GPT-4o](https://zhida.zhihu.com/search?q=GPT-4o&zhida_source=entity&is_preview=1)（57.5%）。

  

![](https://picx.zhimg.com/80/v2-34eccd4c16e38f40dce574a805fb08e5_720w.webp)

此示例展示了具有 4 层 MoA 结构，每层有 3 个智能体。这里的智能体可以共享同一模型。

  

  

这里有有一个关键发现: 即当一个LLM被展示其他模型的输出时，它往往能产生更好的响应，即使这些其他模型自身的能力较弱。

  
大概的组成如下，为有效利用多个LLMs的合作，根据它们在合作不同方面的优势对它们的角色进行分类：

Proposers 提义者：这些模型生成初步的参考响应。虽然一个提案者可能独自就能产生高质量的响应，但其主要价值在于提供细微且多样的视角，作为[聚合器](https://zhida.zhihu.com/search?q=%E8%81%9A%E5%90%88%E5%99%A8&zhida_source=entity&is_preview=1)有价值的参考。

Aggregators 聚合器：这些模型将提案者的不同响应综合成单一的、高质量的响应。

首先，多个提议者对给定的提示独立生成回复。然后，这些回复会被传递给下一层的聚合器，它们将这些回复合成更高质量的回复。这一迭代过程通过多层进行，直到得到更稳健且全面的回复为止。

下面是他们其中的一种模型配置: 采用六种开源模型作为提案者，Qwen1.5-110B-Chat 作为最终聚合器。测试的六种开源模型包括：WizardLM-2-8x22b、Qwen1.5-110B-Chat、Qwen1.5-72B-Chat、Llama-3-70B-Chat、Mixtral-8x22B-Instruct-v0.1 和 dbrx-instruct。

  

![](https://pic2.zhimg.com/80/v2-e8ba7d9ee64da432369ca3076dde7541_720w.webp)

在更精细化的评估纬度上，比如 MoA 方法在无害性、健壮性、正确性、效率、事实性、常识、洞察力和完整性方面显著优于原始的 Qwen1.5-110B-Chat。此外，MoA 在正确性、事实性、洞察力、完整性和[元认知](https://zhida.zhihu.com/search?q=%E5%85%83%E8%AE%A4%E7%9F%A5&zhida_source=entity&is_preview=1)方面也超过了 GPT-4o。

关于成本，组合的 MoA 采用开源模型，即使是有多层和多个Agent协作，最终一次调用成本还是低于 gpt4o的接口价格，但代价是整体推理时间更久。

最后， Agent 集群优势，是不是很像人类相互讨论给出答案？ 而结合多个不同的开源 LLMs ，竟然实现了优于强大闭源模型的性能，看来又有了新的打榜姿势。但实用性如何，还待验证，也许可以考虑用在一些对速度要求不高质量要求高，且因合规而无法用闭源模型的场景上？