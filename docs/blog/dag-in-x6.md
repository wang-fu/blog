---
title: 基于 x6 自定义DAG 布局实战和坑
date: 2023-07-28 13:22:00
type: post
blog: true
description: 有向无环图DAG 是常见的数据关系可视化方式，DAG 是有方向的关系图一类总称，流程图、树形图等都是属于特别类型的 DAG 布局方式
tags:
    - x6
    - dag
    - antv
---

## 什么是DAG
有向无环图DAG 是常见的数据关系可视化方式，DAG 是有方向的关系图一类总称，流程图、树形图等都是属于特别类型的 DAG 布局方式。

树形图：每个节点有且只有一个父节点，比如部门结构，项目管理结构，脑图等



流程图：流程图不总是DAG 图，只有箭头没有循环的过程，才被视为 DAG。它更是是一种交互很强的关系表示，而非用户数据可视化。

通用的 DAG 父子节点可以是多对多，一个节点既可以有多个字节点，也可以有多个父节点。



## 什么是 X6 
X6 是 AntV 旗下的图编辑引擎，提供了一系列开箱即用的交互组件和简单易用的节点定制能力，方便我们快速搭建 DAG 图、ER 图、流程图等应用。

选型上上注意区别于G6， G6 也是 Antv 团队的一个图可视化引擎，它也可以做同样的事情，但是使用成本更高；好处是基于 canvas 绘制，性能很好。而 X6 是基于 SVG，性能一般，如果是大量数据可视化场景，G6 应该是优先考虑，而 X 6 侧重编排和易用性（支持 vue/react 等组件作为节点渲染）。

## 如何布局
理论上，只要满足数据关系的方向性，可视化图形可以任意随机分布节点的位置，但这样会让界面看起来混乱无序，无法清晰表达出数据的关系。层次化布局，即给每个节点分配一个层次，让底层的节点指向高层的节点，是业界通用的做法。为了实现这种效果，研发人员多年来做了各种研究和改进，x6 中的drage 布局即使采用了业界优秀的层次布局算法。

drage层级布局整个流程其实非常复杂，但核心主要分几个步骤：



### 1去环
循环关系环会导致布局算法陷入死循环，为了保证数据干净，需要先检测闭环的节点，并进行去除（或修改），这一步会影响原始数据，目的是让数据符合 DAG 的关系。



这里有个问题，因为既然存在环，说明不管从哪里节点出发，都会回到原节点，每个边都是成环的重要部分，我们如何确定要移除哪个边呢？这里主要是通过贪婪算法的实现专注于找到（出度-入度）最大的节点并处理这个节点的边。对于一个节点，（出度-入度）的值就是从这个节点出发的边的数量减去指向这个节点的边的数量。

所以最终的步骤就是深度遍历节点，记录节点子节点数量（出度），父节点数量（入度），直到找到环，从行程环的节点中选取出度-入度的节点，并去除形成环的这个边。



### 2确定节点层级

试想下，我们如何分配层级才是合理的？其实并没有最优答案，但是直觉告诉我们，最简单的就是从一个没有父亲节点的开始，遍历它的孙子节点，每向下寻找一次，就增加一层，这样每个节点的层级则自动为遍历的时候确定的层级，层级最大为节点的最深路径。这种方法叫最长路径法，遍历的方式也称拓扑排序，其性能最优。我做过一些随机测试，发现大部分数据，这个算法就能很好的满足布局上的视觉需要，并且和另外两种（一会提到）不会相差很大。

我们能否进一步优化呢），可以的。最长路径最大的问题是，它以来数据的默认顺序，在一些复杂的场景，绘制出来的相邻节点路径会比较长，导致整个视觉效果看起来不平衡。



### 3 优化

● 紧凑树
紧凑树是以最长路径算法为基础，试图找出尽可能让相邻的节点之间更紧凑（更短），代价是更多的计算，用上下的空间，替代了左右的空间。原理就是定义一个最短路径（路径是几何概念，通常就是层级数，比如 1），不断去比较节点是否和它相邻的节点的距离层级，把满足条件的加入到新的紧凑树，如果不能满足，则调整两边层级。


● 单纯形算法（Simplex Algorithm）
Simplex其实我也没有太完全理解（还在研究中），这个是运筹学和优化理论中，一种用于求解线性规划问题的常见方法。但是DAG布局问题是图形理论中的一个问题，可以被转化为线性规划问题。

Simplex ，需要在紧凑树的基础上进一步继续，它视图最小化整体路径的长度。

上面3 种算法可以在 x6 的drage 布局中进行选择（默认是复杂度最高的Simplex）。



这两个算法感兴趣的可以参考antv 团队的wiki  深入解读Dagre布局算法 



### 4确定同层级的位置
这步主要是确定相同层级中，哪个节点排前面，哪个节点排后面，目的是让线条交叉最少，这里也很复杂，是一个NP 完全问题。

最简单的做法就是两两节点位置互换，然后比较线条交叉数是否减少，是则换位置，否则保持，然后不断遍历下一个节点，但是这种计算量非常大，层级和节点数的指数增长。所以只能采用贪心策略，找到布局最优，drage  算法会给它设置一个最大的遍历次数，如果超过了则不会再进行。

### 5 计算宽高、间距等进行绘制
这步主要是基于上面的确定的层级和节点位置，控制间距、大小、换行等调用图形 api 遍历节点进行绘制。 


## 自定义X6 布局
图形库虽然提供了大量常见的算法支持，但是业务总是有超出框架覆盖的需求，比如一个特殊的 DAG 图，已经根据业务需要分配了固定的层级，每个层级有默认的顺序，每个层级有特定的个性化样式和UI，这个时候 darge 不能满足定制化排版，需要运用 X6 的节点，进行自定义绘制。这种情况没有办法复用 drage 的自动布局能力，因为它是为通用的 DAG 而实现的。



### 绘制步骤
自定义 dag 布局相对于普通的 html + css工作量更大，需要处理全部的细节。其过程主要有一下步骤：



1.确定层级，这里由后台根据业务，从数据库直接确定，而不是基于纯 UI 算法布局

2.基于给定层数，从左到右自动排列节点

3.节点 x （距离画布最左）位置以层最大宽度为基准，自动居中

4.根据预设间距进行排列，超过最大宽度，自动换行

5.线条可跨层直线连接

6.自动渲染虚线矩形围绕层数，并且每个矩形x 对齐最宽的层数的外围矩形，宽高一致

7.绘制每层区块标题，对齐最上左

8.绘制 toolips



上面的过程无法使用 CSS，需要用 JS 手动控制 x6 节点节点大小、x、y间距、行间距、每行放多少个、居中偏移量、标题占据空间。这边列举几个重点和调试工作量大的地方：



### 居中和换行
居中 = 节点内容总宽（每个节点的宽度 + 边距 ）向右相对画布偏移 50%，在相对自身左偏移50%。这是常见的居中算法。

行 = 当前第几个层 * （每行高度 + 间距） + 区块内第几行 *  节点大小和间距 + 标题占据的高度

下面代码不到 50 行主要是给节点进行居中和换行，通过遍历节点得到它们的  x、y 位置。除此以外还要考虑绘制其他区域，逻辑类似。
``` javascript
// 每层最大宽度
  const maxBlockWidth = containerRef.value.offsetWidth - 50
  // 计算每个节点的大小
  const nodeSize = 24
  // 节点 y 纵向的间距
  const nodeGap = 20
  // 节点 x 横向的间距
  const blockGap = 20

  // 每行能容纳的最大节点数
  const maxNodeCountPerLine = Math.floor(maxBlockWidth / (nodeSize + blockGap))

  const maxRowHeight = nodeSize + nodeGap
  // 偏移量，用于将节点相对区块居中的偏移量
  let xOffset = 0
  // 计算出区块相对画布居中需要的偏移量
  const containerCenterX = containerRef.value.offsetWidth / 2
  const maxBlockCenterX = maxBlockWidth / 2
  const canvasOffsetX = containerCenterX - maxBlockCenterX
  // 设置区块标题
  const titleHeight = 30 // 设置标题的高度
  const titleGap = 10 // 设置标题和节点的行间距
  // 全局行索引
  let globalRowIndex = 0

  Object.values(blocks).forEach((block: any, blockIndex: number) => {
    block.forEach((node: any, nodeIndex: number) => {
      // 计算节点在当前行的位置
      const xInLine = nodeIndex % maxNodeCountPerLine
      if (xInLine === 0 && nodeIndex !== 0) {
        globalRowIndex++
      }
      // 当我们开始处理新的一行时，计算新的偏移量，用于居中
      if (xInLine === 0) {
        const nodesInCurrentRow = nodeIndex + maxNodeCountPerLine < block.length ? maxNodeCountPerLine : block.length - nodeIndex
        const totalWidthInCurrentRow = nodesInCurrentRow * nodeSize + (nodesInCurrentRow - 1) * blockGap
        xOffset = (maxBlockWidth - totalWidthInCurrentRow) / 2
      }
      // 每个节点 y 的位置 = 当前第几个区块 * （每行高度 + 间距） + 区块内第几行 *  节点大小和间距 + 标题占据的高度
      const y = blockIndex * (maxRowHeight + blockGap) + globalRowIndex * (nodeSize + nodeGap) + titleHeight + 2 * titleGap
      const x = xOffset + xInLine * (nodeSize + blockGap) + canvasOffsetX
      node.x = x
      node.y = y
      // console.log('node.y:', y)
      // 使用 x6，你可以这样来创建节点：
      //... 略
    // 如果最后一行的节点数超过了 maxNodeCountPerLine，增加 globalRowIndex
    if (block.length % maxNodeCountPerLine !== 0) {
      globalRowIndex++
    }
  })

```
### 深度优先搜索关系链
DAG 最场景的使用场景是根据一个节点，我们需要找出其全部的祖先节点。比如如图所示，点击其中的一个分析结果，寻找其全部的祖先节点，并进行高亮和显示关系。



我们可以通过深度遍历 nodes 、edges，取出全部的祖先节点和边，因为我们使用的是 x6 graph图形化2布局的，最简单的做法是用 x6 的图形api 

``` javascript
 const ancestors = graph.getPredecessors(node)
```
反之，全部孙子节点关系网也可以通过如下方式
``` javascript
 const descendants = graph.getSuccessors(node)
```
通过遍历节点找边

// 遍历上面的节点再取对应的边
const edges = graph?.getConnectedEdges(descendant)
在处理交互的时候，通常需要高亮显示和隐藏，为了隐藏的时候全量遍历，我们可以在显示的时候，把节点和边添加到缓存数组中，隐藏的时候直接遍历缓存中的节点，可以提高性能。

## 基于 vue 绘制节点
x6默认情况下是通过 svg 添加的节点的，下图shape 默认为 rect 矩形框。

``` javascript
    graph?.addNode({       
       id: node.id,
       // shape: 默认是 svg的 rect 
        x: node.x,
        y: node.y,
        width: nodeSize,
        height: nodeSize,
        zIndex: 99,
        className: 'node-cell-box',
      })
    })

```
svg 节点的样式操控能力比基于 canvas （浏览器图形 api）绘制要高很多了。但是效率仍然比现代化的 MVVM 框架组件低很多，除了无法方便的数据驱动UI 外，svg 样式编写和 html + css 不太一样，一般前端开发不会很熟悉，需要现查API 。x6 提供了一种机制让你使用 vue 组件渲染节点的方式。

### 自定义 vue 组件的 shape
先引入  @antv/x6-vue-shape' 依赖

import '@antv/x6-vue-shape'
shape 是一个用于定义 x6 如何渲染节点的参数，我们可以自定义一个 vue组件的 shape 名为node-title-box（唯一的） 的渲染方式。它的原理是利用 svg 的foreignObject 对象，将 html 挂载到其内部。
``` javascript
 // 注册
   Graph.registerNode('node-title-box', {
    inherit: 'vue-shape',
    component: {
      render: () => {
        return createVNode(title, {
          graph
        })
      }
    }
  })
  // 使用
    graph?.addNode({
      shape: 'node-title-box',
      x: canvasOffsetX,
      y: minY - padding - titleHeight,
      width: maxBlockWidth,
      height: titleHeight,
    })
```

通过 inherit: 'vue-shape',  然后component 参数返回一个组件 createVNode 的节点即可。

要注意，这里的 createVNode 就是 vue 原生的API，所以我们可以把 组件的外部依赖通过 props 传递到组件内部，从而利用响应式达到通信（这个很重要，在发现这个问题之前，我是用侵入性更强的全局事件机制）。

最后，在graph?.addNode 过程中把 shape 指定为上面的node-title-box 就会在渲染过程中把组件挂载进去。



### vue 节点性能
vue 组件是基于原生 html  + js 的再次抽象，其性能成本会更大，额外的响应式跟踪、虚拟 dom 计算等，在很图形简单、量级巨大的节点绘制是不适合的。

下面是一个在 100 节点 600 多边绘制的性能对比，原生 svg 和 vue 组件渲染的差别会很大。





由此可见，效率和性能并不可兼得。在这次场景我只是用 vue节点创建标题和 tooltips ，更多节点的关系链则是有原生 svg 绘制的。

在前端图形绘制中，性能关系一般如下 webgl > canvas > html + js > MVVM 组件。

而开发效率则反之 MVVM 组件 > html + js > canvas2d > webgl

canvas 和 webgl 开发也有很多框架和库，但在开发效率上和响应式驱动的 MVVM 组件还是差别很大。这里我们不展开。



## 坑
使用外部库，最大的问题就是它不是浏览器的标准实现，质量和api 往往是隐晦的，这里记录了一些在 x6 目前版本（1.34.5）遇到的问题和心得。



●  getDescendants 无效？

这个文档的api 没有效果（也可能是我的使用方式不对）。但用上面案例的 getPredecessors 写法替换即可。



●  import '@antv/x6-vue-shape' 

这个是必要的，要单独引用，不在x6 核心库 ，否则挂载 vue 组件不会初始化成功



● item 节点错误

在生产构建 构建下 x6 会有一个报错（具体忘记了）， 和 dev 开发模式构建不会。

解决方案是直接通过 webpack 把别名统一指向相同的文件库。
``` javascript
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@antv/x6': '@antv/x6/dist/x6.js',
      '@antv/x6-vue-shape': '@antv/x6-vue-shape/lib'
    }
  }
```
● 设置的节点层级 z-index 失效

需要 sorting 属性设置  approx 。

浏览器原生并没有提供像 html 一样的z-index 属性，来定义哪些元素在上层，哪些在下层，而是需要开发自己实现，先绘制的在下层，后绘制的在上面，所以 下x6 提供了几种绘制方式的选择。（不详细搜文档和调试很难发现这个坑。）



● 线条路由模式有好多种，会影响路径效果


通过 router 属性进行控制

https://antv-x6.gitee.io/zh/docs/api/registry/router/#gatsby-focus-wrapper



● 组件销毁需要手动解除引用



销毁 vue 组件的时候，最好主动释放 x6 的引用，因为它是全局的，一直在内存中（如果不是因为事件系统异常排错，这个问题肯本发现不了）。
``` javascript
  // 组件销毁、手动解除引用
  Node.registry.unregister('tree-node')
  Edge.registry.unregister('tree-edge')
  Graph.unregisterNode(currentNodeId)
  Graph.registerNode
```
这个是因为 x6 node 节点注册时一种全局标识。我们既要销毁 Graph 对象本身，也要效注册的自定义节点（记住 id 唯一）。这两个销毁方式直接用 x6 提供的 api 就行（理论上设置 null 也行，没有试过）。

## 结
