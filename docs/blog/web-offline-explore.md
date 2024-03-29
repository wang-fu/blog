---
title: 前端离线化索
date: 2019-08-13 17:22:00
type: post
blog: true
description: 某天，小明同学突然反馈 ：“昨晚发现根本无法使用你们的应用... ....怎么回事呢”。我和我的小伙伴们立马惊呆了，心想：“老司机多年的经验有一种预感，那就是同学你使用姿势不正确...（此处省略300字）”。 然后默默排查了许久，答案竟然是：
tags:
    - web
    - 离线
    - indexdb
---

## 飞机上的梗

某天，小明同学突然反馈 ：“昨晚发现根本无法使用你们的应用... ....怎么回事呢”。我和我的小伙伴们立马惊呆了，心想：“老司机多年的经验有一种预感，那就是同学你使用姿势不正确...（此处省略300字）”。 然后默默排查了许久，答案竟然是：
![](http://www.alloyteam.com/wp-content/uploads/2019/07/0719bc0b310878e11751b7010fa67ec2.gif)
<!--more-->
“小明昨晚在飞机上”。

为了以后能够在飞机上愉快的玩耍，这里的离线体验我们有必要再着重优化下。自此，一个不分昼夜的需求快马飞鞭地提上了日程。

## 离线化带来的价值
在这个流量日益白菜价，不断提及云端计算、5g网络的时代，有人觉得，离线已经完全没有必要。谈及离线，仿佛想到的是深海老林，荒无人烟之处。事实上，离线离我们的生活很近，也非常频繁。高速公路、地铁隧道、楼道角落，以及诸多日常信号不稳定区域，这些场景每天都有大量用户经过，每天有成千万用户频繁因为网络问题，心底里吐槽抱怨过我们的应用，断网离线并非我们的错，但我们是否能够从用户体验的角度，尝试改善他们在进入弱网或无网络状态时的焦虑情绪呢，从而给产品带来更正向的体验收益，提升用户留存与口碑。

## 乐观UI

谈及改善用户焦虑情绪，很有必要介绍下乐观 UI[[Optimistic User Interfaces](https://guide.meteor.com/ui-ux.html#optimistic-ui "Optimistic User Interfaces")]。乐观 UI 是一种界面的响应模式，它推荐前端在服务端接收响应之前，先更新 UI，一旦服务器返回，再变更为实际结果。

![](http://www.alloyteam.com/wp-content/uploads/2019/07/9-1.png)


比如，用户点击按钮，前端更新数据状态为成功，请求到达后台，服务器响应，更新前端数据。因为99%的响应都是成功的，所以只有少部分用户需要退回到失败状态。

乐观 UI 不是一种先进的技术和新东西，而是一种“离线优先”思维模式下，改善用户体验情绪的设计。

## 前端离线化几种常用的方案

###  Application Cache

HTML5 最早提供一种了一种缓存机制，可以使 web 的应用程序离线运行。我们使用 Application Cache  接口设置浏览器应该缓存的资源，即配置manifest文件， 在用户处于离线状态时，点击刷新按钮，应用也能正常加载与工作。

不过该接口很快被标准废弃了，原因之一是这是个设计很不合理的接口，比如更新不及时，无法做到用 javascript 精细化控制，可用性很差，如果你不严格的遵循其规则，会遇到很多坑。取而代之的是更强大的service-worker。


### service-worker
正因为Application Cache一直无法有效的解决离线资源精细化控制，services-worker （以下简称sw）接口被设计出来了，比起Application Cache，它提供独立的后台JS线程，是一种特殊的worker上下文访问环境。在渐进式web应用[pwa](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps/Introduction "pwa")中，sw为[Network independent](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Advantages#Network_independent "Network independent")特性提供了最核心的支持。

借助CacheStorage，我们可以在 sw 安装激活的生命周期中，按需填充缓存资源，然后在fetch 事件中，拦截 http 请求，将缓存资源或者自定义消息返回给页面。

services-worker 实现了真正的可用性及安全性。首先，相对于原有web 应用逻辑是不可见，它类似于一个中间拦截服务，中间发生任何错误，都会退回到请求线上逻辑。其次，它只能在 https 下运行保证了安全性。

 sw 对于我们的离线化方案而言，有一个致命的问题，就是ios webview 兼容性问题。ios 11.3以上自带的 Safari 是支持 ws，然而， 苹果一贯的特性， 默认 UIWebView  不支持 services-worker。



## 离线数据
事实上，我们的大部分离线场景将是会在本地独立 app 之中，借助客户端能力，我们可以把 web 代码包提前内置到客户端之中，然后使用一套代码更新机制，前端代码缓存问题可以得到解决。离线代码加载和更新逻辑本身不复杂，下面是一个简化图，具体特定业务场景下还需要考虑比如是否灰度用户，代码版本和数据是否同步等问题。

![](http://www.alloyteam.com/wp-content/uploads/2019/07/1-1-e1563807031838.png)

离线化方案的复杂度之一在于离线数据的处理，及如何对设计之初就没有考虑过“Offline First” 的旧代码进行最小改造处理，既优先考虑在离线状态的基本功能，在线时再进一步增强。基于离线和在线逻辑解耦的考虑，我们应该本着最大限度减少对原有在线逻辑侵入的原则去思考离线化方案。我们看下常见的离线数据前端方案。

###  PouchDB
PouchDB 是一个跨平台javascript 数据库，内部封装了IndexDB、WebSql兼容前端处理.

一般而言前端pouchDB进行离线处理，搭配后台CouchDB，可以更方便双向数据同步。

Sync 接口专门用于同步前后的数据：


![](http://www.alloyteam.com/wp-content/uploads/2019/07/2-1.png)


在中小型项目，特别是那种后台可以由前端接手的全栈式开发，pouchDB是一种不错的离线数据处理方案。此方案问题是压缩后任然有130多kb，并且依赖于特定后台方案，不够通用。

### Redux-Offline

对于项目使用了 redux 数据管理的项目而言，最快捷的办法，就是使用 redux-offline，其基本思路是通过redux middleware 监听每次 acton  数据变化，然后将需要离线的数据序列化到本地（对于 web 浏览而言存储兼容顺序是indexdb—websql—localstorage），等下一次刷新页面时，优先从本地还原数据还原到 store 中。这种方案的好处是快速配置需要缓存的API接口到中间件即可，充分结合了 redux 特性，对于想要达到简单优先展示离线数据的应用而言，是非常不错的。
![](http://www.alloyteam.com/wp-content/uploads/2019/07/4-1-e1563807797814.png)

但这种思路带来的问题是操作数据不够灵活，本地储存数据无法方便的和其他非 redux逻辑共享。在离线数据量较大的情况，一次性读写，并同时序列化大量本地数据也会带来性能问题，对于频繁有数据变更的场景也不合适。


### Redux 与 IndexDB 结合
如果想要达到对数据精细化控制，并且同时不对原有在线逻辑有过多的侵入，我们可以在数据储存上用 IndexDB 替换后台返回数据，前端数据处理仍然复用原有redux。

业务数据的本地储存需要注意的就是合理抽象业务使用的数据，然后按照数据库设计的基本原则本地建表，这里也可以和后台同学聊聊，避免有遗漏的设计问题。

由于 IndexDB 原生操作 api 比较粗糙，我们分装了一套通用 DB 底层操作库，同时将api接口抽象出来，以 git 子仓库的形式在各业务放公用。这里首先简化了前端业务层DB本地读写、排序等逻辑， 便于相互关联项目的共用，其次将 DB 抽象出来也是为了更好的方便业务本身可以不依赖 IndexDB 本身，可以结合客户端特性，给底层数据库替换及进行优化提供了便捷，或者对于纯 web 端，为向下兼容可以使用 WebSql、LocalStorage 等兼容提供了拓展。

![](http://www.alloyteam.com/wp-content/uploads/2019/07/5-1-1024x593.png)

对于前端代码架构上，如何借助 redux 将原有的在线请求后台接口，快速优雅的转换到对本地的读写呢？


![](http://www.alloyteam.com/wp-content/uploads/2019/07/6-1.png)


比较合适的做法是，单独抽出一层 redux  中间件，通过配置文件的形式，将需要离线的 API初始化时传进去，然后在 middleware 中，完成对 DB 的读写操作，将数据组装好给下一个 reducer，我们可以叫offline中间件。为了更进一步合理的对 api 参数分解出来，我们也需要在offline 中间件前将接口请求层再抽象一个中间件，我们叫 API middleware ，这样经过离线中间件的 api 参数已经被分解，可以直接作为查询 db 使用，同时也能服务于后台请求。
![](http://www.alloyteam.com/wp-content/uploads/2019/07/7-1-e1563806790758.png)

### 离线优先与数据同步

我们已经可以通过配置将需要离线的接口通过 offline 中间件进行离线化，那么这里面临着两种数据更新方式，第一种是在线时走正常逻辑等待后台数据返回，异步同步到本地数据库，再进行渲染；当判断离线时，从本地读取。还有一种是具备乐观UI的思维，配置了离线的接口，优先从本地进行数据操作，渲染UI，然后再将服务端数据与本地数据进行同步。显然，后者离线优先的方案显得更为明智。

数据同步分为本地向后台同步，和后台向本地同步。后者需要增加增量变更的逻辑，用于解决离线下用户数据由于其他原因发生的变更，比如当用户登录多台设备数据移动、删除等场景（前端离线增量变更涉及很多细节及业务相关考虑点，这里暂不细述）。

如何记录本地的数据变更然后同步到后台呢？这里我们需要定义一个数据变更的抽象，比如Change
![](http://www.alloyteam.com/wp-content/uploads/2019/07/8-1.png)

里面功能主要是定义变更类型，字段等。每次抵达offline中间件的数据通过一个数据同步管理器对变更进行注册，待合适的时机再去同步。数据同步管理器主要接受change，进行diff管理，判断数据是否有变化，及去重管理，最后再触发异步同步任务。同步可能会失败，这里的超时，重试，失败退回处理都需要加以注意，保证同步的事务性。

## 储存安全

储存安全包括数据加密安全和储存大小问题。对于对称加密，前端查看，客户端必须要知道密匙，密匙本身绕不开加密的问题，理论上，不和服务端通信的离线状态，任何能够在前端能够离线下查看的数据，不管采用什么加密手段，数据都能被还原。纯前端数据加密并无可靠性， 但是访问权限可以依赖于IndexDB浏览器同源策略进行数据安全隔离。避免明文储存和加大数据直接还原的难度才是思考的方向。

有一个容易忽视的安全问题是 iframe,  它可以访问它所嵌入的源的 IndexedDB 库，所以我们需要采取安全措施比如CSP等策略保证页面资源可信任。

采用IndexDB 的储存方案涉及到一个储存大小问题，浏览器的最大存储空间是动态的，总共为可用磁盘空间的50％，每个站点为所用空间的20%，超出限制的写入将导致数据被删除，并且导致严重的数据丢失。因为从浏览器本身无法直接获取到 IndexDB 储存空间（以字符串方式计算性能不可靠，也极不准确），从产品统计角度，限制储存条数是一直思路之一，当然更好的方案是采用端上储存比如larveldb，杜绝此类数据丢失现象。对于纯 web 端，采用浏览器插件拓展的形式也值得尝试（比如 Google doc），更合理的保证数据安全。

## 结

离线化是很多前端项目不会设计进去的特性，因为对于大部分纯展示型 web 项目而言，它的收益性价比低。但作为工具型，创造型应用而言，离线会是一个具有长期受益的特性，
