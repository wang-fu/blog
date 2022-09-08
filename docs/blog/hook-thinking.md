---
title: 关于前端复用的几点思考和建议——hook 运用
date: 2022-09-04 17:22:00
type: post
blog: true
description: 副作用是面向对象编程当前方法会受到上下状态的影响，这是面向对象一直以来不可避免的的问题。在大量的业务逻辑中，我们不可避免出现依赖状态的场景，函数式编程尝试解决它。
tags:
    - web
    - hook
    - 复用
    - 最佳实践
---
## 复用

复用，在前端 vue 层面有多种形式：指令、filters(vue3 废弃)、minx(vue 3 废弃)、hook，计算属性等。

这些不同的概念，是对不同场景和需求下框架层面的一种抽象，其中对使用者出错的频率 filter < 指令 < 计算属性 < hook < mixin

最前面两种是纯函数，输入输出确定，返回结果就能确定，调试和理解成本都非常低。计算属性是带缓存的函数，后面两种分别是带副作用的函数。

虽然在 vue 中 hook 是 mixin 的一种更优替代，但其危险程度，对于没有熟练运用的人一样非常高。

鉴于官方文档并没有深刻、详细介绍最佳实践，且例子对初学者隐藏了很多设计背后的东西，导致被不少同学奉这种新 api 为圣经且无法正确的运用。在这里深入浅出的剖析达下背后设计理念。以下介绍同样适用于 react，其本质内核不变。

一个 vue 组件本质上其内核是面向对象的，对象对外隐藏了内部实现，且包括自身状态维护。比如组件对象包括的属性有组件名、组件方法、组件 data、组件 render 函数（模板）。

【复用:example-1】

```javascript
class Components {
  data: {
    a:1,
    b:2
  }
  name: 'helloWord',
  methods: {
    say: () => {

    }
  },
  render () {

  }
}

```

如上，是 vue 经典的选项式写法，语法表达的形式和传统面向对象更接近。在选项式写法中，我们如何复用逻辑呢？ 刚刚说前端层面的复用有很多形式，最简单且安全的就是纯函数复用。

【复用:example-2】

```javascript
class Components {
  ...
  methods: {
    say: (id) => {
      const user = getUserInfo(id)
    }
  },

}
class Components {
  ...
  methods: {
    hello: (id) => {
      const user = getUserInfo(id)
    }
  },

}

```

getUserInfo 其内部可能有很多细节，且都是独立无关组件的，我们只需要简单把它封装成函数。这里的 getUserInfo 只要输入 id 不变，返回的结果也必定不变，被影响的因素只有 id 这个参数，任何人调试这段代码心里压力都非常小。

复用既然如此简单，一个函数搞定，为啥还有 mixin? 我们看这个例子：
【复用:example-3】

```javascript
class Components {
  data: {
    id1: 111,
    id2: 333,
    magic: 'hello'
  }
  methods: {
    helloWord: (id) => {
      const someMagic = this.id + this.id2 * id1;
      aler(someMagic + magic);
    }
  },

}
class Components2 {
 // 我该如何复用？
}

```

helloWord 函数内部的逻辑不仅仅依赖一个参数 id，还依赖另外两个当前对象的状态，id1、id2。这个两个数据没法抽象到纯函数之中。

## 什么是副作用？

副作用是面向对象编程当前方法会受到上下状态的影响，这是面向对象一直以来不可避免的的问题。在大量的业务逻辑中，我们不可避免出现依赖状态的场景，函数式编程尝试解决它。

```
function add() {
    id1 = 1;
    id2 = 3
    return function (id) {
        return id1 + id2 * id;
    }
}
add()(1) // 4
add()(2) // 7
```

如上，函数式编程把状态隐藏在函数闭包之中，这样一来，程序不能直接修改 id1 和 id2 的值，每次调用无副作用。 理论上证明了任何带状态的面向对象逻辑，都能转换成函数调用，但计算代价非常昂贵，状态本质上是内存换计算。函数式编程目前只是特定场景结合使用，没有成为主流。

### 解决方案

面向对象的副作用，导致我们无法用纯函数解决对象之间带状态逻辑的复用——横切关注点。在传统编程语言中，比如、C++ 、java 等，我们使用继承的方案，解决这种对象复用问题。前端内一个组件可能需要从多个不同的组件公用方法这很常见，这不可避免要多继承，而传统多继承有的，菱形继承问题等不可避免。

前端灵活的特性，主流生态圈一直是排斥传统编程，除了前端大型软件，完全传统的纯面向对象编程方案非常少被运用。

hook 出来之前，react 使用了 HOC、mixin 等方案。高阶组件本质上是利用的父子组件可嵌套的特性，把带状态的复用逻辑提升到父组件中，通过组件进行传递，在 vue 中一样能做到，但 jsx 在 vue 中使用不频繁，HOC 也没有这么方便， 于是 mixin 是作为组件状态逻辑复用的最早方案（因为状态逻辑复用是危险，大部分前端场景可以通过设计规避掉，我们会简单介绍）。

mixin 的问题非常多，这些命名冲突和多继承一样，参考另外一篇详细分析 [mixin](<(http://km.weoa.com/group/NGI/article/17254)>)。

### hook

react 团队难以忍受高阶组件带来的深层嵌套，创造了一种新概念，叫 hook，发布在 react 16 版本中，随后很快流行起来。vue 3 以组合式 api 的形式提供了类似的思想，以下我们统称 hook。

hook 函数不是“真”函数。了解编程基础的人都知道，函数就是子程序，可以实现固定运算功能的同时，还带有一个入口和一个出口，函数定义在任何编程语言中都是相通的。hook 则是前端专有，其内核就是把多继承包装成函数的写法，解决了传统多继承的一些问题。

【复用:example-4】

```javascript
function hello() {
  const state = reactive({
    loading: true,
  });

  loadData = () => {
    setTimeout(() => {
      state.loading = fasle;
    }, 1000);
  };

  loadData();

  return state.loading;
}
```

不清楚 hook 背景的开发同学看这个函数，会有一个疑惑，这个方法只要调用就会返回一个布尔值，中间的 loadData 过 1 秒中改变了值的状态，函数都已经调用结束了，写在这里有什么意义呢？

这正是突破传统语言的一种方案，正常函数只能被程序主动调用，而前端 hook 函数则尝试监听（reactive）函数中的某些数据，观测到数据变化，则重新把值返回回去。使用任意传统语言也能实现这样的监听、派发新值。前端的优势是借助灵活特点，包装到函数中去了，看起来几乎和普通函数一模一样。

<!-- 为啥要设计这样一种奇怪的东西？为解决传统对象中带状态函数复用的困难的场景，前端既不想通过继承、也不想要 minx，也没办法完全函数式编程。 -->

这个函数内部同时带有状态和行为，行为等同于对象中的方法，状态则是对象中上下数据。函数内部数据被修改后，最后函数的值会重新自动计算并返回给调用方。

```javascript

app () {
  let loading = hello() // 这个 hello 不是普通函数，会自动返回最新的值，而这个值正式当前上下文依赖的状态。
  render () {
    // 借助框架机制， 会检测到 loading 变化，自动更新
    {{ loading }}
  }
}


```

这确实是一个精妙的设计，最早想到这个 idea 的人是个鬼才，软化行业没有什么问题不能够多加一层解决，把面向对象的横切面复用问题，通过 DSL 包装到普通函数中去，让复用模块能像函数一样方便的调用。

### hook 和[反应式编程（RX）](https://cn.rx.js.org/)的区别

反应式编程仍然是属于函数式，即每一个函数和操作都是无副作用的纯函数，通过显示的事件订阅对消息进行传递。

而 hook，我们从上面的例子看到，是带副作用的“伪”函数，它对外暴露了特定语法，数据被函数外部的外观察者监听到，再重新传递给调用方。

![](../assets/![](imgs/2022-08-25-10-58-53.png).png)

综上，我们看到了 hook 的本质是带副作用的反应式函数，而这个副作用就是面向对象的状态。

### 方案对比

上面例子我们 example-3 中有个问题没有解决，如何编写代码，让带状态的数据和方法逻辑被复用。我们稍微改造成更复杂，但很常见的案例：即组件需要共用多个不同对象的数据和行为，先用 hook 以外的几种方案。

#### 继承：

```javascript
class common1 {
  data: {
    id1: 111,
    id2: 333
  }
  helloWord: (id) => {
    const someMagic = this.id + this.id2 * id1;
    aler(someMagic + magic);
  }

}
class common2{
  data: {
    magic: 'hello'
  }
  magic: (id) => {
     this.data.someMagic = id + 'magic'
  }

}
class Components2 extend common1, common2 {
  render () {
     this.helloWord();
     this.magic();
  }
   ...
}

```

多继承是传统编程中常用的方法，优点很明显，结构清晰，但很前端不管是 es6、还是 typescript 原生均不支持。

#### mixin

```javascript
let common1Mixin = {
  data: {
    id1: 111,
    id2: 333,
  }
  helloWord: (id) => {
    const someMagic = this.id + this.id2 * id1;
    aler(someMagic + magic);
  }

}
let common2Mixin = {
 data: {
    magic: 'hello'
  }
  magic: (id) => {
    this.data.someMagic = id + 'magic'
  }

}

class Components2  {
  mixin: [ common1Mixin,  common2Mixin]
  render () {
    this.helloWord();
    this.magic();
  }
   ...
}

```

因为前端只能严格单继承，mixin 混合其实是一种用函数模拟多继承的方法，把其他对象的数据和方法动态合并到当前对象，非常灵活和轻量。

混合的缺点我们之前分析过，这里再讲下对比真正多继承的另一个重要缺点，混合是一种动态函数，没法享受类型自动导入，编辑器跳转等传统多继承的优点，混合的对象非常之多的时候，基本靠全局搜索，可维护性简直噩梦。

#### hooks

轮到我们 hooks 上场了。

```javascript

let hook1 = () => {
  let data = {
    id1: 111,
    id2: 333,
  }
  let helloWord = (id) => {
    const someMagic = this.id + this.id2 * id1;
    aler(someMagic + magic);
  }
  return { data, helloWord }
}

let hook2 = () => {
  let data = {
    magic: 'hello'
  }
  let magic =  (id) => {
    this.data.someMagic = id + 'magic'
  }
  return { data, magic }
}


class Components2  {
  setup  () {
    const { helloWord, data } = hook1();
    const { magic, data: data2 } = hook2();
    render () => {
      helloWord();
      magic();
      console.log(data2.magic);
    }
  }
}

```

我们看下，hook 如何解决传统多继承，及混合的问题。

- 隐式定义

如上，helloWord、magic 这几个变量如果采用 mixin 的方式会无法直接推断来自哪个对象，而 hook 通过函数返回值显示的进行定义。编辑器也能根据函数定义，自动推导类型。

- 命名冲突

传统多继承的形式无法避免这个问题，有些编程语言静态检测到冲突后编译抛错(c ++)，有些采用设定优先级方案(python)。而 hook 中两个相同函数和变量可以被 es6 结构赋值重写，上面的 data 变量在 hook1 和 hook2 中同时存在。正常导出编辑器会提示错误，我们能重新解构赋值给一个变量别名，无需改变原函数。

## hook 的问题及最佳实践

<!-- 带副作用的反应式函数在 vue (组合式编程)及 react（hook） 中具体的表达形式[有所差别](https://cn.vuejs.org/guide/extras/composition-api-faq.html#comparison-with-react-hooks)，这些差异和框架双方设计理念有关。但不影响我们对 hook 最佳实践的一些共同做法。 -->

### 最佳实践

以函数的形式表达状态及行为，可以享受函数调用的便捷，但也会受制于函数的使用场景。

- 要符合函数的最佳实践

hook 被错误使用最多的地方在状态和行为过多，理论上面向对象中一个几百上千行的父类，都能通过 hook 表达出来，但最终效果是这样的：

```javascript
let hook1 = () => {
  let data1 = "xxx";
  let data2 = "xxx2";
  // ...此处几十个状态
  let helloWord = (id) => {
    // someMagic
  };
  let helloWord2 = (id) => {
    // someMagic
  };
  // ...此处几十个方法
  return {
    data1,
    data1,
    ... // 此处几十上百的变量
  };
};

class Components2  {
  setup  () {
    // 这里导出几十上百的变量
    const { data, ... } = hook1();
    render () => {
      helloWord();
      magic();
      console.log(data.magic);
    }
  }
}

```

很明显，这样一个函数在阅读性和可理解性上非常差。函数的只专注于一件精简的事情，其参数也不宜过长，这是函数可读的基本要求。

hook 的运用也要符合函数整洁之道，保持共享状态的精简、小巧，最理想的是一个 hook 只处理一个状态, 参考上面 example-4。关于函数的其他最佳实践有哪些，大家参考 【Robert C.Martin】的《代码整洁之道》。关键字：'短小'、'只做一件事'。

- 集中管理副作用

hook 和纯函数的区别在副作用上，我们不可避免会去修改内部状态，这些行为都会导致 bug 的地方。编写 vue 的自定义组合式 api 把修改数据的方法集合到一个代码块，可读性会高更多(react 同理)。

```javascript
// bad code
function hello() {
  const state = reactive({
    loading: true,
  });
  // ... 更多东西
  const loadData1 = () => {
    setTimeout(() => {
      state.loading = fasle;
    }, 1000);
  };
  // ... 更多东西
  const state3 = reactive({
    loading2: true,
  });
  // ... 更多东西

  const loadData2 = () => {
    setTimeout(() => {
      state3.loading = fasle;
    }, 1000);
  };
  mounted(() => {
    loadData1();
    loadData2();
  });
  // ... 更多东西
  loadData();

  return state;
}
```

```javascript
// good code
function hello() {
  const state = reactive({
    loading: true,
    loading2: true,
  });

  //!!!下面的代码会有副作用，易引发 bug !!!
  loadData1 = () => {
    setTimeout(() => {
      state.loading = fasle;
    }, 1000);
  };
  loadData2 = () => {
    setTimeout(() => {
      state.loading2 = fasle;
    }, 1000);
  };
  //!!!上面的代码会有副作用，易引发 bug !!!

  mounted(() => {
    loadData1();
    loadData2();
  });

  return state;
}
```

- 小心 hook 嵌套调用

我们已经知道了，hook 非纯函数，每一个 hook 内部的状态都会增加一层复杂度，hook 内部如何再次引用其他 hook，相当于一个组件向上继承了多个状态。

![](../assets/![](imgs/2022-08-25-16-19-02.png).png)

一个组件，如果向上复用了更多的状态，只要中间任意一个状态被意外修改，组件产生的疑难杂症非常难定为，这和多继承的隐患相似。我们应该尽量在架构设计层面规避这种场景发生，同时小巧的 hook 又会降低这种风险。 

- 关注分离结合点

hook 设计原则应该和传统 class 类相似，高度内聚。组件中哪些行为和状态是需要分离出去成为独立的模块，有一个比较基本的判断标准，分离出去的模块对原组件零依赖，和组件交互通过纯粹的函数接口进行通信即可。

前端灵活的特性，很多低可维护性的 hook 内部和原组件之间有大量回调，原组件的一些方法用参数传到 hook，hook 的方法又在组件中，出现太多这种双向调用，说明 hook 设计上没有明显和原组件分离，或者压根不需要分离。

### 问题

类，经过这么多年的潜移默化的影响，大部分开发熟知各种教条式的规则，传统的编程语言在语法上比较限严格，创建一个类，书写其业务代码通常问题下限比较高。

函数，任何编程语言都有的概念，调用非常灵活。而函数式编程语言，又允许把函数本身当成参数赋值，灵活性更高。但好在通常的纯函数是无状态、没有副作用的，再怎么写，纯函数还是能追随 bug 源头，问题下限偏中吧。

hook 是函数和类的结合体，在设计上要同时符合两者的思维，我们要用函数解决小规模类的缺点，但函数非常灵活，传统类 “死板” 的各种限制被消失了，稍微不小心副作用被函数调用带到漫天飞舞。所以 hook，下限低，上限高。

#### 使用场景

现在社区有种把一切项目都用 hook 去完成的冲动和勇气，甚至要完全替代传统 class （包括选项式）的表达方式。这种想法和当年要用函数式编程替代传统的类一样，非常危险。从语法完备上，它们都能做相同的事情，纯函数式杜绝状态，要通过叠加计算来模拟状态的效果。而 hook 则做出妥协，在函数中包装状态，达到和类同等的效果。

状态——始终是 hook 可维护性的源头，函数内篡改引用数值、函数赋值、回调等灵活特性难以被收敛。通常，熟练的开发者，可以避开这些坑，并且减少心智负担，达到比传统类更灵活、强大的武器。对于团队，函数式的 hook 失去了传统类的基本约束，每个人拥有任意修改状态的至高的权限，hook 的使用要评估团队成员的能力，放任低水平的 hook 代价是极大拉高代码维护成本。

- 不是必要条件，而是可选

我们从本篇知道了，hook 的设计初衷，对比传统类的创新思维，但不管是 react、还是 vue 都是把它作为可选的尝试。而更偏向大型应用开发的 angular 更不会往这种灵活的方向发展。

- 解决状态逻辑问题

我们从设计 hook 的背景，已经知道带状态逻辑复用确实是前端（仅 vue/react）通点，hook 非常适合小规模状态提取出来取代传统小类。
除此以外，hook 天生适合和与 redux/vuex 中小函数相互结合，Pinia 正是是这样一种改进。

- 大规模状态和行为是噩梦

封装大规模状态和行为首先不符合我们函数的最佳实践。其次，前端组件设计层面，我们从来不推荐有大组件、更不会有大的被复用模块，在 react、vue 均提倡拆分，组合的思想，遇到这种场景，只能说你拆分设计不够细。相反，如果你的应用规模对象足够多且复杂，使用类似 angular 用完全的面向对象思维和语法去构建业务更合适。常见的前端页面，特别是中后台等侧重 B-S 业务交互的场景并不具备这种大规模面相对象的特点。

- 状态复用应该优先在设计上避免

在 hook 出来之前，我使用 vue 和 react 这么多年，无论构建规模多大的业务，涉及到状态模块复用的场景（其实就是多继承）都能被合理的组件拆分及其他方案规避掉。不少同学，把简单的纯函数调用，换成 hook，简直是引入额外副作用来增加风险。

```javascript
// 下面伪代码
class Components2  {
  setup  () {
    // hook someData 自动更新，这只是一个简单场景，实际会有更对类似需要追踪的调用。
    const { someData, getData } = getDataHook(render);

    getData();
    // 模拟框架的自动 render
    const = render () => {
      console.log(someData);
    }
  }
}

class Components2  {
  setup  () {
    someData = ref([])；
    // 主动赋值
    const getData async () {
      someData = await getDataPrue();
    }

    getData();

    // 模拟框架的自动 render
    const = render () => {
      console.log(someData);
    }
  }
}

```

我们看上面第一个，getData 只是一个获取数据的异步方法而已，hook 会响应式自动更新 someData 数据。而人的思维天生对同步编程方式理解成本更低。响应式只应该出现在人不该关心的地方，人关心的地方，应该是让开发者手动去调用，优先使用同步的思维，否则，在大量响应式表达下，变量来源难以追踪。
这种只是小例子，大部分情况下不要为了少写一行代码，而增加理解成本，复用的目的从来不是少码字，而是为了提高可读、易拓展，看未来的自己，让其他同事看起来容易理解。


## 结
只要是状态，不管通过类，还是 hook 等方式表达，都比纯函数危险都更高，异步比同步危险。而 99% 的场景可以设计成不需要状态共用，让横切关注点降低。而跨组件共享的状态，大部分又能通过专门的状态管理解，但正如 redux 状态管理的作者也说过“ 99% 的前端场景不需要使用状态管理”。

所以，请不要滥用 hook 及其他复用模式。


