(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{409:function(t,s,a){t.exports=a.p+"assets/img/fc.ed7b7f5a.png"},410:function(t,s,a){t.exports=a.p+"assets/img/high-cpu.ccfbb113.png"},411:function(t,s,a){t.exports=a.p+"assets/img/assets1111.b7901a02.png"},412:function(t,s,a){t.exports=a.p+"assets/img/share-b3ccea.0aa8f0cc.png"},413:function(t,s,a){t.exports=a.p+"assets/img/user_recent.022eef09.png"},414:function(t,s,a){t.exports=a.p+"assets/img/problem-develop.fe091471.png"},415:function(t,s,a){t.exports=a.p+"assets/img/iframe-irpc.d4c0abcd.png"},416:function(t,s,a){t.exports=a.p+"assets/img/host-plugin.814c3a60.png"},417:function(t,s,a){t.exports=a.p+"assets/img/inject-require.150494c9.png"},418:function(t,s,a){t.exports=a.p+"assets/img/rpc-proxy.645efda9.png"},419:function(t,s,a){t.exports=a.p+"assets/img/plugin-type.d395ee3f.png"},420:function(t,s,a){t.exports=a.p+"assets/img/plugin-publish.e7170759.png"},421:function(t,s,a){t.exports=a.p+"assets/img/plugin-install.b103ad79.png"},422:function(t,s,a){t.exports=a.p+"assets/img/plugin-debug.064a4766.png"},423:function(t,s,a){t.exports=a.p+"assets/img/plugin-upload.62e3de21.png"},424:function(t,s,a){t.exports=a.p+"assets/img/plugin-global-var.1f5166d7.png"},425:function(t,s,a){t.exports=a.p+"assets/img/plugin-sdk.a536a169.png"},526:function(t,s,a){"use strict";a.r(s);var n=a(15),r=Object(n.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h2",{attrs:{id:"腾讯文档公共组件历史包袱"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#腾讯文档公共组件历史包袱"}},[t._v("#")]),t._v(" 腾讯文档公共组件历史包袱")]),t._v(" "),s("h3",{attrs:{id:"_1-架构问题-开发层面"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-架构问题-开发层面"}},[t._v("#")]),t._v(" 1. 架构问题——开发层面")]),t._v(" "),s("p",[t._v("腾讯文档管理的公共组件， 设计之初，采用了各种便于快速迭代的设计方式，组件代码结构和规范也缺乏统一，在长期的开发过程中质量没有得到保障。随着需求不断累积，目前存在比较大的历史包袱。大量组件错综复杂，相互辑合紧密，而导致不管多么小的改动都需要数天的恶战才能完，对于开发新功能和修复缺陷的同时时，都异常痛苦。主要存在的问题是以下几点。")]),t._v(" "),s("h3",{attrs:{id:"_1-1-难以预料第三方公共组件导致的卡顿"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-难以预料第三方公共组件导致的卡顿"}},[t._v("#")]),t._v(" 1.1 难以预料第三方公共组件导致的卡顿")]),t._v(" "),s("p",[t._v("腾讯文档管理的公共组件(以下称FC)主要通过 script-loader 动态加载承载了各个页面的公共业务逻辑，然后将脚本注入到品类的 HTML 中，比如登陆、分享，权限等。这些逻辑都是同一个线程中执行的。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(409),alt:""}})]),t._v(" "),s("p",[t._v("第三方组件是由不同团队和开发人员在维护着，往往有着不可控制的预期，品类方难以保证引入某一个组件的性能是否合理，从而容易导致品类编辑发生卡顿，及性能数据下降。")]),t._v(" "),s("p",[t._v("目前在 excel 中是在调用公共组件的时间会停止卡顿监控，从而让通过组件不影响详情页的卡顿数据。然而，这无法从根本上改变用户主进程卡顿的体验问题。")]),t._v(" "),s("div",{staticClass:"language-typescript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 以下伪代码")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("async")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("loadModule")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("name"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 卡顿监控停止")]),t._v("\n    jank"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("stopReport")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("await")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("dosomeThingToLoadModule")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("name"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    jank"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("restartReport")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("p",[t._v("【案例】\n打开权限组件 cpu 暴涨，表格卡顿。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(410),alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_1-2-script-loader-加载形式链路非常长-公共组价加载异常延迟。"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-script-loader-加载形式链路非常长-公共组价加载异常延迟。"}},[t._v("#")]),t._v(" 1.2 script-loader 加载形式链路非常长，公共组价加载异常延迟。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(411),alt:""}})]),t._v(" "),s("p",[s("img",{attrs:{src:a(412),alt:""}})]),t._v(" "),s("p",[s("img",{attrs:{src:a(413),alt:""}})]),t._v(" "),s("p",[t._v("首先需要加载 assets.json 依赖映射文件，然后再异步加载需要功能的 js 代码，最后再初始化组件，向后台请求组件所需数据，进行渲染，最终才能完整展示。这是一个非常长的链路，导致用户使用体验相关功能非常耗时。")]),t._v(" "),s("h3",{attrs:{id:"_1-3-发布没有版本控制。"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-发布没有版本控制。"}},[t._v("#")]),t._v(" 1.3 发布没有版本控制。")]),t._v(" "),s("p",[t._v("“一次更新，多端升级” 本来是 FC 设计之初的一种考虑，但在日积月累的迭代中，我们积累了无数 bug，每一次常规发布之夜都伴随着惊恐与噩梦。由于模块A 发布修复了某个 ppt 的 bug，带了某个 word 的新 bug; 由于某一个版本的升级，带来全品类功能的崩溃。缺乏版本控制的后果就是，为了节省半个小时的包升级时间，带来了大量调用品类方之间的缺陷连锁反应。我们的设计目标除了尽可能保证发布效率，发布的质量和稳定性也是非常重要的。")]),t._v(" "),s("h3",{attrs:{id:"_1-4-组件调用形式不规范和统一"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-组件调用形式不规范和统一"}},[t._v("#")]),t._v(" 1.4 组件调用形式不规范和统一")]),t._v(" "),s("div",{staticClass:"language-typescript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 以下伪代码")]),t._v("\n "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 业务A")]),t._v("\n "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" someModule "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("await")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("loadModule")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'someModule'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n someModule"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("init")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    xxx"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'yyyy'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    zzz"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'hello'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    from"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'xxx'")]),t._v("\n "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n")])])]),s("div",{staticClass:"language-typescript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[t._v("\n "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 以下伪代码")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 业务B")]),t._v("\n\n "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" someModule "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("await")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("loadModule")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'someModule'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n someModule"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("init")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    bbb"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'yyyy'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    ccc"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'hello'")]),t._v("\n "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n")])])]),s("p",[t._v("公共组件没有统一的入参规范。每次开发的步骤是，在品类 A 已经提前接入前提某组件下，品类 B、C直接复制黏贴过去，然后完事。由此带来的问题是：我们发现大量由于品类直接差异性导致的公共组件 bug 。")]),t._v(" "),s("h3",{attrs:{id:"_1-5-通信机制混乱"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-5-通信机制混乱"}},[t._v("#")]),t._v(" 1.5 通信机制混乱")]),t._v(" "),s("p",[t._v("script-loader 即承担了模块加载的职责，内部有又事件通信的逻辑。而公共组件和各个品类的通信除了使用SLR.listen 外，同时又掺杂 window.addEventListener，导致很多地方重复监听，同时在定位问题时带来了困扰。\n示例：excel 和 word  对应的通信不一样。")]),t._v(" "),s("div",{staticClass:"language-typescript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 伪代码")]),t._v("\nwindow"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("something"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("listen")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'someEvent'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),s("div",{staticClass:"language-typescript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 伪代码")]),t._v("\ndocument"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("addEventlistener"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("listen")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'someEvent'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),s("h3",{attrs:{id:"_1-6-内部大量使用全局变量"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-6-内部大量使用全局变量"}},[t._v("#")]),t._v(" 1.6  内部大量使用全局变量")]),t._v(" "),s("p",[t._v("FC 仓库仅 xxx 这个变量就有500 多处调用方。公共组件使用全局变量容易会造成对详情页的污染，同时让组件逻辑与品类的特定变量耦合，一旦某一个品类对应的字段在迭代中发生变化，就会造成意外 bug 。")]),t._v(" "),s("h3",{attrs:{id:"_2-架构问题-产品层面"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-架构问题-产品层面"}},[t._v("#")]),t._v(" 2. 架构问题——产品层面")]),t._v(" "),s("p",[t._v("架构的不合理设计，会带来一些很大的负面影响，尤其是在需求的开发周期上。这本身是一个恶性循环：")]),t._v(" "),s("p",[s("img",{attrs:{src:a(414),alt:""}})]),t._v(" "),s("h2",{attrs:{id:"解决方案"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#解决方案"}},[t._v("#")]),t._v(" 解决方案")]),t._v(" "),s("p",[t._v("综上所述，我们可以发现，目前我们原来对第三方公用组件的设计思路是——把公用组件当作编辑页不可或缺的耦合部分。实际上，公共组件，例如，权限，分享，通知等功能，具备独立应用的功能，它们应该更像是一个可拔插的插件，品类不应该关心插件的内部细节，插件也不应该有权限影响和破坏外部主进程。让每次变更都变得可控，并且避免缺陷，同时最大程度地满足功能性和灵活性的要求是这次架构设计的目标。")]),t._v(" "),s("p",[t._v("解决方案是建设可拔插式插件化公共组件体系。定制标准的插件化规范，可便于拓展成对第三方开发者开发插件的体系。而  FC 公共组件是作为官方内置插件的形式存在。\n插件体系有几个比较关键的点：第一是，第三方插件质量会参差不齐，如何约束插件的运行不会导致页面的卡顿。第二点是，插件如何调用文档SDK，也即使如何规范插件和主线程的通信问题。第三点是，插件安装，卸载等后台管理服务。")]),t._v(" "),s("h3",{attrs:{id:"_2-1-如何安全的运行插件"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-如何安全的运行插件"}},[t._v("#")]),t._v(" 2.1 如何安全的运行插件？")]),t._v(" "),s("h4",{attrs:{id:"_2-1-1-插件类型"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-1-插件类型"}},[t._v("#")]),t._v(" 2.1.1 插件类型")]),t._v(" "),s("p",[t._v("首先我们的插件体系分为两类：纯计算逻辑型插件 和 UI 交互式插件。\n纯计算逻辑插件，比如一个自定义函数，一个自定义任务等。这种插件可以通过使用 web worker 进行多线程计算进行隔离。\nUI 交互式插件，比如分享弹窗，权限侧边栏等，目前 FC 公共组件全部是这种类型。这种插件需要复杂的 UI 交互，我们可以通过 chrome 的 site-isolation 特性(参考"),s("a",{attrs:{href:"https://imwangfu.com/blog/iframe-site-isolation.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("第三方 web 应用进程隔离"),s("OutboundLink")],1),t._v(")，用不同域的域名动态创建 iframe，对应的 iframe 内容区域会和主进程进行隔离，从而保证品类的性能和安全性。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(415),alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_2-2-插件如何与主进程通信"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-插件如何与主进程通信"}},[t._v("#")]),t._v(" 2.2 插件如何与主进程通信")]),t._v(" "),s("p",[t._v("出于安全限制，插件不应该直接访问和写入主进程任何数据。需要建立一套 rpc 通信协议打通插件和主进程的调用。")]),t._v(" "),s("h4",{attrs:{id:"_2-2-1主进程接口安全暴露"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-1主进程接口安全暴露"}},[t._v("#")]),t._v(" 2.2.1主进程接口安全暴露")]),t._v(" "),s("p",[t._v("excel  通过 di 依赖服务化后，各种依赖将会以服务化的形式对外提供。对外暴露 api 接口，提供给内部和外部调用。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(416),alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_2-2-2插件接口安全暴露"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-2插件接口安全暴露"}},[t._v("#")]),t._v(" 2.2.2插件接口安全暴露")]),t._v(" "),s("p",[t._v("基于安全性考虑，插件只能调用平台方提供的安全接口，这些接口可以 api 服务化的形式对外暴露。在初始化的过程注入到一个 API 服务工厂中返回给一个缓存对象，提供给插件使用。\n这些对象如何暴露给插件？这里我们参考 vscode 机制，可以拦截 require 接口，将缓存的插件api 注入到插件上下文。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(417),alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_2-2-3-插件进程-api-和-主进程-api-通信"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-3-插件进程-api-和-主进程-api-通信"}},[t._v("#")]),t._v(" 2.2.3 插件进程 api 和 主进程 api 通信")]),t._v(" "),s("p",[t._v("定义标准的 worker/iframe 进程与主进程通信机制。参照 vscode 我们可以巧用 proxy 代理（IE 11 不兼容），在插件调用 api 时进行拦截，统一转换成 message send 调用，可以避免每次api 调用手动触发 message 通信，简化调用流程。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(418),alt:""}})]),t._v(" "),s("h2",{attrs:{id:"_2-3-插件-ui-扩展点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-3-插件-ui-扩展点"}},[t._v("#")]),t._v(" 2.3 插件 UI 扩展点")]),t._v(" "),s("p",[t._v("腾讯文档公共组件交互上只有两种组成，分别是 dialog 弹窗和 slidebar 侧边栏，dialog 弹窗代表是添加文件夹面包、分享面板、vip 支付面板等。侧边栏有权限、通知列表等。这两种类型组件，我们分别为插件 UI 展示提供统一的面板。插件编写时需要配置指定类型，调用时在特定区域承载视图。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(419),alt:""}})]),t._v(" "),s("h2",{attrs:{id:"_2-4-插件管理体系"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-4-插件管理体系"}},[t._v("#")]),t._v(" 2.4 插件管理体系")]),t._v(" "),s("h3",{attrs:{id:"_2-4-1-部署"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-4-1-部署"}},[t._v("#")]),t._v(" 2.4.1 部署")]),t._v(" "),s("p",[t._v("用户开发的插件需要有管理平台，按照规范开发完后，发布到插件管理服务。管理服务具备生成插件描述信息，部署到静态资源，为 UI 组件形态的插件动态生成插件三级域名。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(420),alt:""}})]),t._v(" "),s("h2",{attrs:{id:"_2-4-鉴权、安装"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-4-鉴权、安装"}},[t._v("#")]),t._v(" 2.4.鉴权、安装")]),t._v(" "),s("p",[t._v("用户授权给插件，然后才能完成安装。可访问权限比如用户基本信息，表格信息，确认许可后，用户信息下绑定应对插件。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(421),alt:""}})]),t._v(" "),s("h2",{attrs:{id:"_2-5-调试"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-5-调试"}},[t._v("#")]),t._v(" 2.5 调试")]),t._v(" "),s("p",[t._v("内部插件暂时可以直接代理 sheet 本地进行开发。对外部插件需要提供一种标准便捷的调试方式。可选方案有两种，第一种是通过腾讯文档调试工具 Chrome 插件，支持用户安装临时的本地插件，进行开发。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(422),alt:""}})]),t._v(" "),s("p",[t._v("另外一种是用户申请调试开发权限，文档菜单选项内增加插件导入，然后上传到一个临时的调试服务服务 ，调试好后，再进行发布。\n"),s("img",{attrs:{src:a(423),alt:""}})]),t._v(" "),s("h2",{attrs:{id:"_2-5-如何兼容多品类"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-5-如何兼容多品类"}},[t._v("#")]),t._v(" 2.5 如何兼容多品类")]),t._v(" "),s("p",[t._v("公用组件插件化依赖品类有相同的服务化机制。但各个品类因为代码并不统一，插件化如何兼容各个品类呢？")]),t._v(" "),s("p",[t._v("有两种主要方法，第一种是公共组件按照 Excel 服务化进行插件化先行改造，内部再暴露全局变量给其他未改造的品类按照原 FC 调用。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(424),alt:""}})]),t._v(" "),s("p",[t._v("另外一种是将插件化体系进行单独的 SDK 化，SDK 内部做统一的插件化环境及初始化流程，在各个品类再进行引入。")]),t._v(" "),s("p",[s("img",{attrs:{src:a(425),alt:""}})]),t._v(" "),s("h2",{attrs:{id:"结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#结"}},[t._v("#")]),t._v(" 结")]),t._v(" "),s("p",[t._v("任何架构设计都是历史下的产物，脱离实际情况谈最优解都是不切实际的想法，如何在有限的人力资源和更优的方案中取得平衡是一门学问。一个模式的提出必定面对解决一个问题，随着时间的推移，需求不断调整和迭代之下，原先的软件设计必定会变得越来越脆弱，最终面临自然崩塌，需要重构。但就像一栋房子，工程师设计出结构稳定和考虑长远的方案（架构和可扩展性），施工队不偷工减料（代码质量），那么房子也会保值更久，也能更好的面对新工程的不断改造。")])])}),[],!1,null,null,null);s.default=r.exports}}]);