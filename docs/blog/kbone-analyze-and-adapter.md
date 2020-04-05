---
title: 小程序同构方案kbone分析与适配
date: 2019/12/13 17:22:00
type: post
blog: true
excerpt: 在微信小程序的开发的过程中，我们会存在小程序和 H5页面共存的场景，而让小程序原生和web h5独立开发，往往会遇到需要两套人力去维护。对开发者而言，加大了工作量成本，对于产品而言，容易出现展示形态同步不及时问题。在这种情况下，我们急需要找到一个既能平衡性能，也能满足快速迭代的方案。
tags:
    - 小程序
    - 同构
    - 适配
---

在微信小程序的开发的过程中，我们会存在小程序和 H5页面共存的场景，而让小程序原生和web h5独立开发，往往会遇到需要两套人力去维护。对开发者而言，加大了工作量成本，对于产品而言，容易出现展示形态同步不及时问题。在这种情况下，我们急需要找到一个既能平衡性能，也能满足快速迭代的方案。
<!--more-->


## 主流的小程序同构方案
### web-view 组件
web-view组件是一个承载网页的容器，最简单的方案就是使用原h5的代码，通过 web-view组件进行展示。其优点是业务逻辑无需额外开发与适配，只需要处理小程序特有的逻辑，然后通过jssdk 与原生小程序通信。

使用 webview 加载 h5的问题也非常明显，首先是体验问题，用户见到页面会经过以下环节：加载小程序包，初始化小程序，再加载 webview中的 html页面，然后加载相关资源，渲染h5页面，最后进行展示。最终导致的结果是打开体验非常差。另外其他缺点是小程序对web-view部分特性有限制，比如组件会自动铺满整个小程序页面，不支持自定义导航效果等。

![](http://www.alloyteam.com/wp-content/uploads/2019/12/屏幕快照-2019-12-03-下午7.45.42.png)

### 静态编译兼容

静态编译是最为主流的小程序同构方案，类似的有 taro, mpvue等。其思路是在构建打包过程，把一种结构化语言，转换成另一种结构化语言。比如，taro 把jsx在构建时进行词法分析，解析代码获取AST，然后将 AST递归遍历生成wxml目标代码。

![](http://www.alloyteam.com/wp-content/uploads/2019/12/bianyi.png)

静态编译的好处是非常明显，一套代码，通过编译分别转h5和小程序，兼具性能与跨平台。另一方面，随着这种方案的流行，大家也感受到了其明显的问题，首先，由于小程序本身的限制，比如无法dom操作，js 与 webview 双线程通信等，导致静态编译语法转换，不能做到彻底的兼容，开发体验受制于框架本身的支持程度，相信踩过坑的同学应该非常有痛的感悟。其次，静态编译转换逻辑需要与小程序最新的特性保持同步，不断升级。

## 小程序运行时兼容方案

静态编译的方案实现了同构，但它只是以一种中间态的结构化语法去编码，非真正的web，牺牲了大量的灵活性。我们来看下另外一种更灵活的方案———运行时兼容。

我们回到小程序本身的限制上来。由于小程序采用双线程机制，内部通过一个 webview 用于承载页面渲染，但小程序屏蔽了它原本的 DOM/BOM接口，自己定义了一套组件规范；另一方面，使用独立的js-core 负责对 javascript 代码进行解析，让页面和js-core之间进行相互通信（setData），从而达到执行与渲染的分离。而浏览器的 DOM接口是大量web得以显示的底层依赖，这也是h5代码无法直接在小程序中运行的主要原因。

那么如何突破小程序对DOM接口的屏蔽呢？ 最直接的思路就是用JS实现和仿造一层浏览器环境DOM相关的标准接口，让用户的JS代码可以无感知的自由操作DOM。通过仿造的底层DOM接口，web 代码执行完后，最终生成一层仿造的 DOM树，然后将这棵 DOM 树转换成小程序的wxml构成的DOM树，最后由小程序原生去负责正确的渲染出来。


![](http://www.alloyteam.com/wp-content/uploads/2019/12/0.png)


### kbone

kbone 是微信官方出一套小程序运行时兼容方案，目前已经接入的小程序有小程序官方社区，及腾讯课堂新人礼包等。并且有专人维护，反馈及时~~。

kbone方案核心主要有两大模块，第一是miniprogram-render实现了对浏览器环境下dom/bom的仿造，构建dom树，及模拟 web 事件机制。第二个模块是miniprogram-element是原生小程序渲染入口，主要监听仿造dom树的变化，生成对应的小程序的dom 树，另外一个功能是监听原生小程序事件，派发到仿造的事件中心处理。

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-1.png)


### DOM/BOM仿造层

DOM、BOM相关的接口模拟，主要是按照web标准构建 widow、document、node节点等相关 api，思路比较清晰，我们简单看下其流程。

首先在用户层有一个配置文件miniprogram.config，里面有必要信息origin、entry等需要配置。在 miniprogram-render 的入口文件createPage方法中，配置会初始化到一个全局cache对象中，然后根据配置初始化 Window 和 Document 这两个重要的对象。Location、Navigator、Screen、History等 BOM 实例都是在 window初始化过程中完成。DOM 节点相关 api 都是在Document 类中初始化。所有生成的节点和对象都会通过全局的pageMap管理，在各个流程中都能获取到。

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-2.png)

### 小程序渲染层
miniprogram-element 负责监听仿造DOM仿造的变化，然后生成对应小程序组件。由于小程序中提供的组件和 web 标准并不完全一样，而我们通过 html 生成的 dom 树结构千差万别，如和保证任意的html dom树可以映射到小程序渲染的dom树上呢？kbone 通过小程序自定义组件去做了这件事情。

简单说下什么是自定义组件，既将特定的代码抽象成一个模块，可以组装和复用。以 react 为例，div、span 等标签是原生组件，通过react.Component将div 和 span 组合成一个特定的 react 组件，在小程序中用自带的 view、image 等标签通过Component写法就能组合成小程序自定义组件。

和大部分 web 框架的自定义组件类似，小程序自定义组件也能够自己递归地调用自己，通过将伪造的dom结构数据传给自定义组件作为子组件，然后再递归的调用，直到没有子节点为止，这样就完成了一个小程序 dom 树的生成。

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-3.png)

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-4.png)

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-5.png)



## 性能问题

### 多层dom组合
大量小程序自定义组件会有额外的性能损耗，kbone 在实现时提供了一些优化。其中最基本的一个优化是将多层小程序原生标签作为一个自定义组件。dom 子树作为自定义组件渲染的层级数是可以通过配置传入，理论上层级越多，使用自定义组件数量越少，性能也就越好。

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-6.png)
![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-7.png)
![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-8.png)




以上逻辑就是通过DOM_SUB_TREE_LEVEL 层级数对节点过滤，更新后，检测是否还有节点，再触发更新。

### 节点缓存
在页面onUnload卸载的过程中，kbone会将当前节点放入缓存池中，方便下次初始化的时候优先从缓存中读取。

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-9.png)
![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-8.png)



## kbone 接入与适配
kbone 作为一种运行时兼容方案，适配成本相对于静态编译方案而言会低很多，总体来说对原代码侵入性非常少，目前接入过程比较顺利（期间遇到的坑，感谢 作者june 第一时间帮忙更新发布[玫瑰]）
### svg资源适配
小程序不支持 svg，对于使用 svg 标签作为图片资源的应用而言，需要从底层适配。在一开始我们想到的方案有通过 肝王的cax进行兼容，但评估后不太靠谱，cax 通过 解析svg 绘制成 canvas，大量 icon会面临比较严重的性能问题。那么最直接暴力的办法就是使用 webpack 构建过程直接把 svg 转 png？后面一位给力的小伙伴想到通过把 svg 标签转成Data URI作为背景图显示，最终实践验证非常可靠，具体可以参考[kbone svg 适配](http://www.alloyteam.com/2019/11/14073/ "kbone svg 适配")。
### 网络层适配/cookie
微信小程序环境拥有自己定义的一套 wx.request API， web 中的XMLHttpRequest对象是无法直接使用。由于我们代码中使用了 axios，所以在预言阶段直接简单通过axios-miniprogram-adapter进行适配器，后面发现部分业务没有使用 axios，兼容并不够彻底。于是直接从底层构建了一个XMLHttpRequest模块，将web网络请求适配到 wx.request。同时做了 cookie 的自动存取逻辑适配（小程序网络请求默认不带 cookie）。这一层等完善好了看是否能 pull request到 kbone代码仓库中。

### 差异性 DOM/BOM API 适配
部分web 中的接口在小程序无法完全获得模拟，比如getBoundingClientRect在小程序中只能通过异步的方式实现。类似的有removeProperty、stopImmediatePropagation

等接口在 kbone 中没有实现，performance等web特有的全局变量的需要兼容。这些扩展API可以通过kbone对外暴露的dom/bom 扩展 API进行适配。

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-11.png)


### getBoundingClientRect
对于元素的的高度height \offsetHeight获取，我们只能通过$getBoundingClientRect异步接口，如果是body scroll-view 实现的，getBoundingClientRect 返回的是scrollHeight。

### 滚动
web的全局滚动事件默认是无法触发，需要通过配置windowScroll来监听，启用这个特性会影响性能。
```
global: {
    windowScroll: true
},
```



### 样式适配
#### 标签选择器
kbone 样式有一个坑，就是它会将标签选择器转换成类选择器去适配小程序环境，比如
```
span { } =>  .h5-span{  }
```

这样带来的副作用就是选择器的权重会被自动提升，对选择器权重依赖的标签样式需要去手动调整兼容。

#### 其他适配点

注意使用标准的style属性，比如有webkit-transform会不支持，及小程序样式和web差异性兼容等。

```
  style: {
      'WebkitTransform': 'translate(' + x + 'px, 0)' // 正确
     // '-webkit-transform': 'translate(' + x + 'px, 0)' 报错
  }
```



### 路由适配
在初始化路由阶段，曾经遇到过Redux 更新dom后偶现节点销毁，最终定位到是kbone对Location等BOM实例化过晚，最终在june帮忙及时调整了顺序，更新了一个版本，现最新本所有BOM对象会在业务执行前准备好。

```
//初始化dom
this.window.$$miniprogram.init()
...
//初始化业务
init(this.window, this.document)
```



### 隐式全局变量兼容
在模拟XMLHttpRequest模块的过程中遇到一个问题，什么时候初始化这个对象，我们可以选择在网络请求库初始化前引入它，挂载在仿造的 window 对象下。但仍然会出现一个问题，第三放库直接使用的是XMLHttpRequest 对象，而非通过 window 访问。
```
var request = new XMLHttpRequest() // 报错

var request = new window.XMLHttpRequest() // 正确
```


在正常的 web 环境，window 是默认的顶层作用域，而小程序中隐式的使用window 对象则会报错。

为了解决这一问题，可以通过配置文件的globalVars字段，将 XMLHttpRequest 直接进行定义。

```
 globalVars: [
    ['XMLHttpRequest', 'require("libs/xmlhttprequest.js")']
]
```

构建的过程中会在所有依赖前转成如下代码 ：

```
 var XMLHttpRequest = require("libs/xmlhttprequest.js")
```


这样做解决了隐式访问 window 作用域问题。但又面临另一个问题，那就是xmlhttprequest模块本身内部由依赖仿造window对象，比如 cookie 访问，而此时因为require的模块独立的作用域无法访问到其他模块的仿造window 对象。于是最终通过导入一个 function 传入 window 作用域，然后初始化xmlhttprequest。


```
  globalVars: [
      ['XMLHttpRequest', 'require("libs/xmlhttprequest.js").init(window, document)']
]
```
### 多端构建

小程序和web端需要的资源及部分逻辑是有差异，通过webpck配置进行差异化处理，具体可以参考文档编写kbone webpack 配置。

大概是这样的区分跨端配置：

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-12.png)


分离打包入口文件:

![](http://www.alloyteam.com/wp-content/uploads/2019/12/0-13.png)


小程序打包入口依赖的 dom 节点，需要主动创建。详细示例参照官方demo.
```
export default function createApp() {
    initialize(function() {
        let Root = require('./root/index').default;
     
        const container = document.createElement('div')
        container.id = 'pages';
        document.body.appendChild(container);
        render(<Root />, container)
    })
}
```


由于小程序本身是没有真正userAgent，kbone内部是是根据当前环境进行仿造。
```
//miniprogram-render/src/bom/navigator#45
this.$_userAgent = `${this.appCodeName}/${appVersion} (${platformContext}) AppleWebKit/${appleWebKitVersion} (KHTML, like Gecko) Mobile MicroMessenger/${this.$_wxVersion} Language/${this.language}`
```

在业务中有需要区分小程序平台的场景，我们可以通过webpack DefinePlugin插件进行注入，然后通过定义变量进行判断。
```
if (!process.env.isWxMiniProgram) {
    render(
        <Root />,
        document.getElementById('pages')
    );
}
```

### 小程序分包
在腾讯文档的小程序中，有一个独立的小程序仓库。 而文档管理列表是另外一个独立的H5项目，嵌入到小程序webview动态加载。通过kbone转原生打包后，这部分代码需要继承到小程序仓库中。

首先我们可以通过脚本，在webpack构建过程，将kbone 编译后的包copy到独立小程序仓库的目录下，合并小程序相关配置，从而实现功能合并。同时通过FileWebpackPlugin过滤掉无用的web平台资源。


这样遇到一个问题是主包大小仍然超过限制，最后通过小程序分包可以解决这个问题，将原小程序非首屏页面全部放分包之中，配置preloadRule 字段再预加载分包。

```
"subpackages": [
    {
      "root": "packageA",
      "pages": [
        "pages/cat"      ]
    }
  ]
  "preloadRule": {
    "pages/index": {
      "network": "all",
      "packages": ["important"]
    }  
}
```




## 结
通过对目前各种小程序同构方案的对比与实践，kbone是一种非常值得推荐的新思路，新方法，兼具性能与灵活。唯一不足的地方就是目前仍有不少底层工作需要适配，更多的问题在继续探索中，相信随着不断迭代及采坑后的反馈，kbone会变得越来稳定和成熟。

（最后感谢作者junexie及dntzhang大神的鼎力支持~~也欢迎大家一起参与共建[kbone](https://github.com/wechat-miniprogram/kbone "kbone")）








