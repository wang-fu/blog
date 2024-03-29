---
title: 当技术遇到承德的文化和法律
date: 2023-09-27 14:52:00
type: post
blog: true
description: 如有一间铁屋子，是绝无窗户而难破毁的，里面有许多熟睡的人们，不久都要闷死了，然而是从昏睡入死灭，并不感就死的悲哀
tags:
    - 承德
    - 法律
    - 非法执法
    - 技术
---


数字化、全球化的时代，我们享受着前所未有的数字化便利。我们可以选择在线上购物、可以线上办公，甚至能远程办公、与哪些人合作，以及如何完成任务，而这样的进步，离不开广大的技术工程师孜孜不倦的努力和贡献。但近日，一个令人震惊的事件打破了这种和谐的氛围。

一位中国技术工程师，因为远程为海外软件公司工作并使用翻墙技术（以下简称fq），其收入被河北承德公安局定性为“非法收入”并被罚没。这位工程师，他的 GitHub上满是绿色的贡献，他为开源社区做出了巨大的贡献，他的努力和汗水被如此定性，令人痛心。

![](../assets/chengdechufashu.jpeg)

### 翻墙与法律

首先，我们必须明确一点：翻墙本身并不违法。《计算机信息网络国际联网管理暂行规定实施办法》（https://www.gd.gov.cn/zwgk/wjk/zcfgk/content/post_2521348.html ）第七条规定，我国境内的计算机信息网络直接进行国际联网，必须使用邮电部国家公用电信网提供的国际出入口信道。这是指物理层面的硬件架设。

其次大部分普通公民上网连接海外，都是通过三大电信运营商的设备和网络，使用的就是“邮电部国家公用电信网提供的国际出入口信道”。而我们大众所说的 fq 是软件层面的行为：在法律规定的物理信道下，用软件实现加密和代理通信的方式，访问目标网站。而这样的软件层实现有成千上万种，从最初的 VPN 、到其他加密更隐蔽的方法。法律并没有定义软件层不允许如何连接。理论上只要你不物理断网，保持和世界连接，软件层面的实现不可能从法律上穷尽和定义，因为加密技术有成千上万且不断更新。当然，他们也可以简单用白名单准入机制：1. 只允许特定人员连接国际网络。2 . 只允许访问法律指定的服务器和 IP。3. 必须明文，不能加密等。用这样的方式，可以“名正言顺”的定义法律。 

然后，这显然不符合他们利益。

几乎所有的科学研究、技术研究、学术研究等都需要fq，因为全世界顶级的科学技术都是用英语文献表达的，包括华为、腾讯、阿里、清华北大等技术人员和研究人员都需要使用类似软件技术，因为直接访问海外平台线路会不稳定，通过优质线路服务器加密代理到海外的科研技术平台，比如 github、arxiv 等技术和科研平台，可以实现更友好交流，也叫“科学上网”。

虽然 fq 是一种在国家规定的物理信道下，用软件实现加密通信的方式，法律并无准确定义禁止，但是它不断被“不成文”的 zz 正确而扩大化执行，通过解释权去非法惩罚那些涉及 zz 言论的人。很多人看到这种处罚，内心默许以为是合法的，事实上，这类处罚，都是“非法处罚”，“扩大化执行”，至少目前法律定义下这样的（不排除他们未来真的施行白名准入单机制）。


### 承德的“罚款文化”

只和他们讲法律是没有意义的，法律是人定的，且靠人解释。我们再看看这次惩罚背后的故事。

这是作者远程支持一万多star的.net JavaSpring 开源 Web 基础框架https://github.com/abpframework/abp，此人贡献值排第二，5年来 github 满绿，纯属辛苦钱。而 github 是目前全球技术影响力最大平台。

![](../assets/chengdegithub.png)

本来就业压力下，远程挣美金，国内消费，妥妥的拉动内需，促进经济，利民利国。根据当事人最后声明，JC 误把他当做推特发表“不当言论”的另一个人，他出具了那个 zz 推特号不是他的证明，而自己号平常只发公司宣传的内容，而承德 JC 又以所谓另一个不成立的法律即“ fq ”非法没收全部收入，且再次行政复议被否决。

2022 年，承德市财政收入123.9亿元。其中，税收66.5亿，同比下降20.7%；非税57.4亿，同比增36.1%。这座城市，非税收入占财政收入46%。

非税收入中，罚没高达9.8亿。按人口七普数据，承德335万人口，平摊到人头，承德人均罚了290多元。打开承德市政府的官网，随便一搜，就是一大摞处罚决定书。（引用来源: https://c.m.163.com/news/a/IA3M1REQ0534B9EY.html?from=wap_redirect&spss=adap_pc&referFrom=&spssid=003985fd2b3f8c431985042cf8a4f18b&spsw=7&isFromH5Share=article）

![](../assets/chengdehistory.jpeg)

2023年上半年，全河北省一共11个市，承德市的GDP总量位列第11名，妥妥的吊车尾。

所以经济下行，才靠罚款创收？所以要刁难找茬去外网打工的程序员，罚没人家的收入来创收？

### 权力和利益

这次事件背后，显露出了一种更深层次的问题。那就是，当权力和利益成为主导，法律和正义往往会被置于次要地位。承德的“罚款文化”就是一个明证。在经济下行的背景下，为了创收，一些地方政府甚至不惜牺牲公民的合法权益。这种做法，不仅损害了公民的权益，也对整个社会的公正和正义造成了严重的伤害。

**很多从事技术的人员经常认为自己和 zz 无关，喜欢闷声搞技术和搞钱**，但是，你不知道人和 zz 的关系是“鱼与水”的关系吗，每个人的冷漠，就是对自身和周边其他人利益的忽视。今天的他，明天可能就是你我。

鲁迅先生曾说：“如有一间铁屋子，是绝无窗户而难破毁的，里面有许多熟睡的人们，不久都要闷死了，然而是从昏睡入死灭，并不感就死的悲哀“，每个时代都有自己的“铁屋子”，我们在忍受这些：“官场人情”、“职场加班、“公权滥用”等行为的时候，不仍然是铁屋子里的人吗？

最后，我想说，这是一个分工的社会，每一个不同的从业者，我们的每一次努力，都是在对行业和社会做贡献，你的学习、工作、衣食住行等都在促进社会的发展。而这个社会的进步与和谐，不仅仅依赖于每个个体的努力，更依赖于我们对社会共同的监督和管理。每一次的妥协和退让，都可能成为下一次不公不义的导火索。众人拾柴火焰高，这个社会的权益，需要每个人来捍卫。




——————

备注： 本文最初发表在国内微信和知乎平台，受制于审核机制，文案措辞反复修改、已经非常柔和了。