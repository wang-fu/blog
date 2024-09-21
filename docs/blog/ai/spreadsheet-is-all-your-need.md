---
title: 把大模型装进 Excel表，Spreadsheet is all your need
date: 2024-06-11 13:22:00
type: post
blog: true
description: Spreadsheet is all your need
tags:
    - LLM
    - AI 生成
---

最近发现了一个超有意思的项目，叫 Spreadsheet Is All You Need。简单来说，这个项目把 nanoGPT 的全部推理过程塞进了一张电子表格里。没错，就是我们平时用来记账的电子表格，这简直太疯狂了！

什么概念
----

  

[你有没有想过](https://zhida.zhihu.com/search?q=%E4%BD%A0%E6%9C%89%E6%B2%A1%E6%9C%89%E6%83%B3%E8%BF%87&zhida_source=entity&is_preview=1)，用 Excel 来理解 GPT 模型？作者就是这么干的。他发现变换器（transformer）的内部机制其实就是一系列[矩阵计算](https://zhida.zhihu.com/search?q=%E7%9F%A9%E9%98%B5%E8%AE%A1%E7%AE%97&zhida_source=entity&is_preview=1)的巧妙排列。于是，他突发奇想：既然这些计算不复杂，为什么不试试用电子表格来实现整个过程呢？结果真是[大开眼界](https://zhida.zhihu.com/search?q=%E5%A4%A7%E5%BC%80%E7%9C%BC%E7%95%8C&zhida_source=entity&is_preview=1)——他真的成功了！

  

忘掉 Python，电子表格才是你需要的全部工具。

  

电子表格的魔法
-------

  

这个表格包含了 GPT 模型的所有关键组件，包括嵌入（embedding）、[层归一化](https://zhida.zhihu.com/search?q=%E5%B1%82%E5%BD%92%E4%B8%80%E5%8C%96&zhida_source=entity&is_preview=1)（layer norm）、自注意力（[self attention](https://zhida.zhihu.com/search?q=self+attention&zhida_source=entity&is_preview=1)）、投影（projection）、[多层感知机](https://zhida.zhihu.com/search?q=%E5%A4%9A%E5%B1%82%E6%84%9F%E7%9F%A5%E6%9C%BA&zhida_source=entity&is_preview=1)（MLP）、Softmax 和 Logits。整个结构基于 Andrej Karpathy 的 NanoGPT，虽然只有大约 85000 个参数，但足够复杂，同时不会让你的电脑崩溃。

  

而且，这个项目是字符级的[预测系统](https://zhida.zhihu.com/search?q=%E9%A2%84%E6%B5%8B%E7%B3%BB%E7%BB%9F&zhida_source=entity&is_preview=1)，每个 token 是一个字符，只对字母 A/B/C 进行标记化。这样设计既能帮助理解模型，又不会过于复杂。

  

怎么用？
----

  

这张电子表格有两个标签页："no weights" 和 "random weights"。前者的参数整齐排列，便于阅读；后者的参数是随机生成的，每次更新时都会重新生成（虽然会让电脑卡顿几秒）。如果你有 NanoGPT 的权重，可以替换这些参数，让表格真正“活起来”。

  

颜色说明
----

  

\- **紫色**：需要训练模型的参数。

\- **绿色**：从输入开始，经过转换得到的结果。

\- **橙色**：计算中使用的中间值。

  

为什么你会喜欢
-------

  

这个项目不仅帮你形成对变换器的直观理解，还能通过双击[单元格](https://zhida.zhihu.com/search?q=%E5%8D%95%E5%85%83%E6%A0%BC&zhida_source=entity&is_preview=1)查看具体计算。你甚至可以修改参数，看看会发生什么。想象一下，通过电子表格理解 GPT 模型的每一个细节，真是一种全新的体验。

  

锐评一波
----

  

最酷的地方在于，这个项目完全颠覆了我们对电子表格的传统认知。谁能想到，平时用来做财务报表的工具，居然还能用来解析前沿的 AI 技术？这不仅是一种创新，更是一种思维方式的转变。它让我们看到，科技的界限比我们想象的要宽广得多。

  

总之，如果你对 AI 和 LLM 有兴趣，并且喜欢动手实践，这个项目绝对值得一试。拿起你的电子表格，开始探索 GPT 的奥秘吧！

项目地址如下

[https://github.com/dabochen/spreadsheet-is-all-you-need/github.com/dabochen/spreadsheet-is-all-you-need/](https://link.zhihu.com/?target=https%3A//github.com/dabochen/spreadsheet-is-all-you-need/)

excel 内容示意

![](https://pic3.zhimg.com/80/v2-e142cc720ff9384b2181bc93f2a4d94e_720w.webp)

  

申明: 文本由 gpt4o 根据项目内容生成。