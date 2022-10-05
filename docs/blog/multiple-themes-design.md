

# 前言
前端经常不可避免的出现，页面风格改版造成额外的工作量，特别是在项目中期，风格的调整不仅耗时，且让代码可读性更低，这是由于在项目之初缺乏对主题、布局等灵活扩展的设计。


我们之前一篇[文章](http://km.weoa.com/group/codeshow/article/23386 "文章")里面就讲到过： 迭代的过程，默认的组件风格完全被全局自定义风格覆盖了， 最后整站样式风格改版，因为“样式耦合”，不得不评估超过一周的工作量。虽然用了一些“技巧”规避了超预期工作量，但是问题的更本并没有解决，即如何构建灵活、可扩展的多主题方案？






# 多主题设计

多主题设计，已经是非常成熟的方案了，在本篇文章不会过于细节展示，仅仅抛砖引玉，大家再根据关键字去检索，再思考和实践即可。


##  css 覆盖的问题

未采取多主题设计的编码方案，界面的样式通常是硬编码，也就是写死的。我们看一个简单例子：

``` css
body .d-ui.button {
   background: blue;
   color: #ccc;
   font-size: 16px;
}
```

如上按钮，背景色、字体颜色、字体大小分别硬编码在 css 样式中。如果想要对 button 的颜色进行替换有两种方案，第一是直接修改源码，但大部分中后台业务会运用第三方、或者组件库，按钮颜色是被第三方 lib 影响，源码并不能直接被改动。

利用 css 样式作用权重优先级，我们可以给一个元素附加多个 css 属性，把组件库中的原代码效果覆盖掉。

``` css
// 原样式-不动
body .d-ui.button {
   background: blue;
   color: #ccc;
   font-size: 16px;
}
// 新样式覆盖
body .d-ui.button {
   background: red;!important
   color: #ccc;
   font-size: 16px;
}
```
样式覆盖的方式很有效，除了` !important ` 关键字外，更多的是利用 CSS 级联[属性优先级](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity)，比如行内样式优先级高于 >  id 选择器> 高于 class 选择器等。

这是前期成本最低的做法。随着迭代可能会导致一些问题，1. 样式硬编码具体属性和元素耦合，导致样式风格修改工作量大，参考[之前痛点](http://km.weoa.com/group/codeshow/article/23386 "文章") 。2. 无法适应多种风格的样式快速变化。

所以，通常成熟的组件库会应该会有更通用的主题自定义方案。

##  css 属性如何变成动态的

想要让具体的样式值和元素解耦，必须有能力让 css 样式可以被动态编写。

``` css
body .d-ui.button {
   background: ？;
   color: ？;
   font-size: ？;
}
```

在早期，浏览器层面的动态 css 属性并没有被浏览器层面支持，通常借助 javascript 脚本进行处理。有两种方式，一种是浏览器运行时动态切换、另一种是提前预编译。

- 运行时动态切换

运行时切换，直接借助 js  调用 css 样式切换接口[CSS Model](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model)，达动态改变样式的目的。

``` javascript
// js 文件和 js 语法
let basecolor = '#ccc'

buttonCss({
   color: basecolor
})

listCss({
   color: basecolor
})

```
 css in js 方案中可以非常方便的实现各种动态 css  。

- 提前预编译

把 css 写到 js 代码，这种编码风格并未成为主流。另一种更常见的方式是，对 css 语法表达能力“增强”，用 javascrpt 对这种“增强”版 css 语法做编译，编译成浏览器能识别的正常 css，最后再部署到浏览器环境 。


``` less
// css 增强语法
baseColor: #ccc

.button {
   color: baseColor
}

.ul {
  color: baseColor;
}

```

``` css
//  编译后的 css

.button {
   color: #ccc
}

.ul {
  color: #ccc;
}

```

如上，编码过程中，我们的 color 依赖于 baseColor ，而不依赖具体的颜色值。而最终浏览器运行时的颜色由编译决定。

采用预编译 css 的技术代表有 less、scss 等。


- 自定义 css 变量

好在  [自定义 css 变量 ](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)  已经被广泛的支持，这是一种符合 w3c 标准浏览器层面的增强版 css 。

``` css
// 原生 css
body {
  --basecolor: #ccc;
}

button {
  color: var(--basecolor)
}
ul {
  color: var(--basecolor)
}

```

## 如何切换风格/主题

`有了 css 动态属性能力，我们的元素和样式值的直接依赖，变成了元素和动态变量的依赖`。直接预定义多种风格的变量、配合 js  可满足风格快速切换。


``` css
body[theme='dark-default']  {
    --primary-1: red;
}
body[theme='light-default']  {
     --primary-1: blue;
}

button {
   color: var(--primary-1);
}

```

``` javascript

   document.body.setAttribute('theme', 'dark-default')

```

如上，button 依赖 -primary-1 变量，而 -primary-1 变量的作用范围取决于当前作用域，上面示例是通过 body 元素赋予了 `dark-default` 和 `light-default` 两种不同的风格。风格作用域范围还能精确到页面中更局部的元素，某个 table ，甚至某个 div 等。



## 主题动态加载

如果一个页面包含多种复杂风格，一次新打包到样式文件中，包可能会比较大，想要更极致按需加载，把主题变量拆分到不同的 css 文件，动态 import 即可

```
import('@/assets/theme/dark-pruple.css')
```


# 理想的方案

界面主题并不是由一两个元素和属性组成，而是需要一个配套的色彩系统，元素系统，基于这些基础颜色和元素再组合成更复杂的元素。

在主流的组件库中，并没有达到真正好用的阶段，这里有两个原因，第一是开发主题系统的人大部分是开发组成，而颜色配置的人是设计师组成，从开发的角度预设的色彩模型，比如：颜色如何分类、基础元素如何划分等可能满足编码高拓展性，但不一定满足设计配色的自由度。


理想的模型如下图所示：



![/storage/img/60f13675fc11436bacfa9ca0fca4d281XXX315E1](/storage/img/60f13675fc11436bacfa9ca0fca4d281XXX315E1)


我们可以看到可视化的配色平台，是非常关键，它的用户应该是设计师，开发则只需要关心主题包，一键引入即可。


`目前在社区能看到的已有主题系统，对非技术的设计群体关注还不够`，比如易用度较低。我们能否把 figma、sketch 等一些设计平台和配色系统打通？让前端开发的风格、主题工作和设计师之间更多的“DevOps”。

未来需要更多的一起探索，一起协同。
















