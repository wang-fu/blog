(window.webpackJsonp=window.webpackJsonp||[]).push([[81],{531:function(t,i,s){"use strict";s.r(i);var p=s(15),a=Object(p.a)({},(function(){var t=this,i=t._self._c;return i("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[i("p",{staticStyle:{visibility:"visible"}},[t._v("（2024年11月旧文）")]),i("p",{staticStyle:{visibility:"visible"}},[t._v("最近国补，广东地区针对 mac  也在补贴品类系列。 20% 补贴下来 mac mini M4 3000 多，M4 pro 8900，再叠加各种活动，应该是苹果史上最具性价比时刻。")]),i("p",{staticStyle:{visibility:"visible"}},[i("br",{staticStyle:{visibility:"visible"}})]),i("p",{staticStyle:{visibility:"visible"}},[t._v("8 号当天就拿到了 24g 入门版 M4 pro（12+16），体验了很久，并对比公司的 M1（8+8）、对象的M3（8+10），自己17年的intel 古董做了一些测试，有一些个人数据，迟迟没有发出来。这里就给大家看下，主要涉及前端领域以及大模型推理（顺带玩了一把游戏）。")]),i("p",{staticStyle:{visibility:"visible"}},[i("br",{staticStyle:{visibility:"visible"}})]),i("h2",{staticStyle:{visibility:"visible"}},[i("span",{staticStyle:{"font-size":"28px","font-weight":"bold",visibility:"visible"}},[t._v("官方数据")])]),i("p",{staticStyle:{visibility:"visible"}},[i("br",{staticStyle:{visibility:"visible"}})]),i("p",{staticStyle:{visibility:"visible"}},[t._v("在之前，我们先放官方的性能数据")]),i("p",{staticStyle:{visibility:"visible"}},[i("img",{staticStyle:{height:"auto !important",visibility:"visible !important",width:"677px !important"},attrs:{"data-src":"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvOob3JbL4UseMEoRIdDvTyYsj4Gcs78d1b9ehP8AfiaQRBWC93wEkuDQ/640?wx_fmt=png&from=appmsg",src:"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvOob3JbL4UseMEoRIdDvTyYsj4Gcs78d1b9ehP8AfiaQRBWC93wEkuDQ/640?wx_fmt=png&from=appmsg",_width:"677px",crossorigin:"anonymous",alt:"图片"}}),i("img",{staticStyle:{height:"auto !important",visibility:"visible !important",width:"677px !important"},attrs:{"data-src":"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvWQwaWBcBwFzMgcDeQH4nibk0ejLq0XhvqMO1JxPTlHiasgOiawrSiciaiazg/640?wx_fmt=png&from=appmsg",src:"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvWQwaWBcBwFzMgcDeQH4nibk0ejLq0XhvqMO1JxPTlHiasgOiawrSiciaiazg/640?wx_fmt=png&from=appmsg",_width:"677px",crossorigin:"anonymous",alt:"图片"}})]),i("p",[i("br")]),i("p",[t._v("官方的性能对比提高有点惊人，"),i("b",[t._v("但注意“最高”两个字")]),t._v("，很可能是更好利用多核 GPU 比如渲染视频等领域。 然而笔者主要关注占使用频率最高的"),i("b",[t._v("前端开发构建和离线模型推理")]),t._v("。下面主要对比 intel (17) vs M1 vs M3 vs M4 pro ，由于测试是纯手工多次执行并观察，加以实际体验感受为主，仅供参考（可能不少地方有纰漏）。")]),i("p",[i("br")]),i("h2",[i("span",{staticStyle:{"font-size":"28px","font-weight":"bold"}},[t._v("前端项目")])]),i("p",[i("span",{staticStyle:{"font-size":"28px","font-weight":"bold"}},[i("br")])]),i("h3",[i("span",{staticStyle:{"font-weight":"bold","font-size":"20px"}},[t._v("中小型 node 项目构建")])]),i("p",[i("br")]),i("p",[t._v("被测试的第一个项目属于典型的日常项目，基于 nest + node 构建")]),i("p",[i("img",{staticClass:"js_img_placeholder wx_img_placeholder",staticStyle:{width:"677px !important",height:"531.257px !important"},attrs:{"data-src":"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvowyGT9icWwgcaiaqTAuKvza4nbFlianArcRmDotnT4TctSUjTR1g0tOhw/640?wx_fmt=png&from=appmsg",src:"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvowyGT9icWwgcaiaqTAuKvza4nbFlianArcRmDotnT4TctSUjTR1g0tOhw/640?wx_fmt=png&from=appmsg",_width:"677px",crossorigin:"anonymous",alt:"图片"}})]),i("p",[i("br")]),i("table",[i("tbody",[i("tr",[i("th",[t._v("17(Intel) macbook pro 15寸")]),i("th",[t._v("mac mini M1（8+8）")]),i("th",[t._v("macbook air m3 (8 +10)")]),i("th",[t._v("mac mini M4 pro （12 + 16）")])]),i("tr",[i("td",[t._v("17.7s")]),i("td",[t._v("4.0s")]),i("td",[t._v("2.92s")]),i("td",[t._v("2.65")])]),i("tr",[i("td"),i("td"),i("td"),i("td")])])]),i("p",[i("br")]),i("p",[t._v("上面明显看到 M 到 17 年英特尔提升明显，而 M3 到 M1 提升很多，但 M4 pro 相对 M3 提高有限。 ")]),i("p",[i("br")]),i("h3",[i("span",{staticStyle:{"font-size":"20px","font-weight":"bold"}},[t._v("大型项目构建")])]),i("p",[i("br")]),i("p",[t._v("vscode 源码超百万，在前端领域属于不多见的复杂项目了，让我们尝试编辑构建，看实际速度。")]),i("p",[i("br")]),i("p",[i("img",{staticClass:"js_img_placeholder wx_img_placeholder",staticStyle:{width:"677px !important",height:"438.169px !important"},attrs:{"data-src":"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvib5ibJxaia0tIsGxibnq1vWSQ0UVGn0u2xUEPFrwdjmzsr3RBic6VcnS3HQ/640?wx_fmt=png&from=appmsg",src:"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvib5ibJxaia0tIsGxibnq1vWSQ0UVGn0u2xUEPFrwdjmzsr3RBic6VcnS3HQ/640?wx_fmt=png&from=appmsg",_width:"677px",crossorigin:"anonymous",alt:"图片"}})]),i("p",[i("br")]),i("p",[t._v("node 14")]),i("p",[i("br")]),i("table",[i("tbody",[i("tr",[i("th",[t._v("17(Intel) macbook pro 15寸")]),i("th",[t._v("mac mini M1（8+8）")]),i("th",[t._v("macbook air m3 (8 +10)")]),i("th",[t._v("mac mini M4 pro （12 + 16）")])]),i("tr",[i("td",[t._v("126s")]),i("td",[t._v("未测试")]),i("td",[t._v("82s")]),i("td",[t._v("74s")])]),i("tr",[i("td"),i("td"),i("td"),i("td")])])]),i("p",[i("br")]),i("p",[t._v("在 vscode 这种大型项目构建似乎电脑之间没有明显像中小型项目这样有 4 倍的差距，这很有可能是 vscode 构建过程涉及  IO 操作太多（写入大量文件），占据了时间，而这种操作很难拉开距离，M 的速度优势也就不像之前这么大了。")]),i("p",[i("br")]),i("h3",[i("span",{staticStyle:{"font-size":"20px","font-weight":"bold"}},[t._v("模拟打分测评")])]),i("p",[i("br")]),i("p",[t._v("为了更纯粹的测试 CPU 性能，我们让 claude 3.5 sonnet 写了一个前端的 ATS 编译、字符串压缩等常见的测试脚本。这个通过统计每个 cpu 迭代的耗时，采用了几何平均值，"),i("b",[t._v("分数越大越好")]),t._v("。 ")]),i("p",[i("br")]),i("p",[i("br")]),i("p",[t._v("node版本 14")]),i("p",[i("br")]),i("table",[i("tbody",[i("tr",[i("th",[t._v("17(Intel) macbook pro 15寸")]),i("th",[t._v("mac mini M1（8+8）")]),i("th",[t._v("macbook air m3 (8 +10)")]),i("th",[t._v("mac mini M4 pro （12 + 16）")])]),i("tr",[i("td",[t._v("50000")]),i("td",[t._v("91818")]),i("td",[t._v("165390")]),i("td",[t._v("220962")])]),i("tr",[i("td"),i("td"),i("td"),i("td")])])]),i("p",[i("br")]),i("p",[t._v("同一 node 版本 M4 pro 会高很多，这个分数更符合 M 芯片之间的能力差距，但 M1 只比 17 年高一倍，还是很意外（可能和这个算法实现有关）。")]),i("p",[i("br")]),i("p",[t._v("另外测试过程，无意发现一个问题，简单的提高 node 版本，这个分数就会明显提高，比如 node 18 相对 node 14 能提高一个 cpu 版本更新的分数，说明 node 更高版本采用的 js 编译器性能更好。")]),i("p",[i("br")]),i("h2",[i("span",{staticStyle:{"font-size":"28px","font-weight":"bold"}},[t._v("大模型推理")])]),i("p",[i("br")]),i("p",[t._v("推理主要使用 llama.cpp 安装后，启动 llama-server 具备可视化交互， 后天log 会自动统计 token。")]),i("p",[i("br")]),i("pre",{attrs:{lang:"text"}},[t._v("llama-server -m qwen2.5-14b-it-Q4_K_M-LOT.gguf \\"),i("br"),t._v("    -c 4096 \\"),i("br"),t._v("    --host 0.0.0.0 \\"),i("br"),t._v("    --port 8080"),i("br"),i("br"),t._v("# 默认会使用 GPU 加载，也可通过 --n-gpu-layers  指定为 0 使用 CPU"),i("br"),t._v("...."),i("br"),i("br"),t._v("llm_load_tensors: offloading 48 repeating layers to GPU"),i("br"),t._v("llm_load_tensors: offloading output layer to GPU"),i("br"),t._v("llm_load_tensors: offloaded 49/49 layers to GPU"),i("br"),t._v("llm_load_tensors: Metal_Mapped model buffer size =  8148.39 MiB"),i("br"),t._v("llm_load_tensors:   CPU_Mapped model buffer size =   417.66 MiB"),i("br"),t._v("....")]),i("p",[i("img",{staticClass:"js_img_placeholder wx_img_placeholder",staticStyle:{width:"677px !important",height:"350.724px !important"},attrs:{"data-src":"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvibia6ubRcJnyhIuqpOEw7ibicJO9ycbXLPEibibiaxO5n8mjUiaqf7y5yBkVSg/640?wx_fmt=png&from=appmsg",src:"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvibia6ubRcJnyhIuqpOEw7ibicJO9ycbXLPEibibiaxO5n8mjUiaqf7y5yBkVSg/640?wx_fmt=png&from=appmsg",_width:"677px",crossorigin:"anonymous",alt:"图片"}})]),i("h3",[i("br")]),i("h3",[i("span",{staticStyle:{"font-size":"20px","font-weight":"bold"}},[t._v("qwen2.5-14b-int4  ")])]),i("p",[i("br")]),i("pre",{attrs:{lang:"bash"}},[t._v("prompt eval time =     398.68 ms /    20 tokens (   19.93 ms per token,    50.17 tokens per second)"),i("br"),t._v("eval time =     340.81 ms /     8 tokens (   42.60 ms per token,    23.47 tokens per second)")]),i("table",[i("tbody",[i("tr",[i("th",[t._v("17(Intel) macbook pro 15寸")]),i("th",[t._v("mac mini M1（8+8）")]),i("th",[t._v("macbook air m3 (8 +10)")]),i("th",[t._v("mac mini M4 pro （12 + 16）")])]),i("tr",[i("td",[t._v("未测试")]),i("td",[t._v("2-4 /s")]),i("td",[t._v("9.4token /s")]),i("td",[t._v("23 token/s")])]),i("tr",[i("td"),i("td",[t._v("很早之前测过，印象一字一字出来速度，预计这个速度。")]),i("td"),i("td")])])]),i("p",[i("br")]),i("h3",[i("span",{staticStyle:{"font-size":"20px","font-weight":"bold"}},[t._v("qwen2.5-32b-int3")])]),i("p",[i("br")]),i("table",[i("tbody",[i("tr",[i("th",[t._v("17(Intel) macbook pro 15寸")]),i("th",[t._v("mac mini M1（8+8）")]),i("th",[t._v("macbook air m3 (8 +10)")]),i("th",[t._v("mac mini M4 pro （12 + 16）")])]),i("tr",[i("td",[t._v("未测试")]),i("td",[t._v("未测试")]),i("td",[t._v("未测试")]),i("td",[t._v("6-7 token/s")])]),i("tr",[i("td"),i("td"),i("td",[t._v("16g可能会爆内存。")]),i("td")])])]),i("p",[i("br")]),i("p",[i("br")]),i("p",[t._v("使用 M4 pro 测试大模型有一个出乎意料之外的地方，我们采用 CPU 模式和 GPU 模式速度相差不是很大。在 qwen 32g 下 cpu 速度甚至稳定快 1 token 左右，这里怀疑是 GPU 显存分配不够？，未深究。")]),i("p",[i("br")]),i("p",[t._v("上面 qwen 32b-int3 应该是占用 内存 15-16g 。mac gpu 驱动会限制占用总内存的统一内存的部分空间， 第一次启动 mac 24g 内存也会报错。 我们可尝试设置 mac 显存占用突破限制，比如18-19GB")]),i("p",[i("br")]),i("pre",{attrs:{lang:"bash"}},[t._v("sudo sysctl iogpu.wired_limit_mb=19456")]),i("p",[t._v("  但注意，上面这样做有风险，特别是打开了其他占用内存的应用，可能导致内存突然溢出，系统奔溃。")]),i("p",[i("br")]),i("h2",[i("span",{staticStyle:{"font-size":"28px","font-weight":"bold"}},[t._v("游戏")])]),i("p",[i("br")]),i("p",[t._v("简单体验了下之前买的《无人深空》，4K，超高画质下，能稳定在 60 -100 帧之间，这个 mac 原生游戏体验没有任何影响。")]),i("p",[i("img",{staticClass:"js_img_placeholder wx_img_placeholder",staticStyle:{width:"677px !important",height:"380.812px !important"},attrs:{"data-src":"https://mmbiz.qpic.cn/sz_mmbiz_jpg/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvZ7WROSI8qayWmBJOzwjBKeyEZtzQbSTausghp3W9RUKkgsBBWffkicw/640?wx_fmt=jpeg&from=appmsg",src:"https://mmbiz.qpic.cn/sz_mmbiz_jpg/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvZ7WROSI8qayWmBJOzwjBKeyEZtzQbSTausghp3W9RUKkgsBBWffkicw/640?wx_fmt=jpeg&from=appmsg",_width:"677px",crossorigin:"anonymous",alt:"图片"}}),i("img",{staticClass:"js_img_placeholder wx_img_placeholder",staticStyle:{width:"677px !important",height:"380.812px !important"},attrs:{"data-src":"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvR5rIo4jmoSXc0ToOiaYk6hHVVLGU4TpXOicdrcMEGPOr88sCq1lFsoAw/640?wx_fmt=png&from=appmsg",src:"https://mmbiz.qpic.cn/sz_mmbiz_png/UtlXZ9UDt5icVIt9My52zkbibZ3Tf9uBCvR5rIo4jmoSXc0ToOiaYk6hHVVLGU4TpXOicdrcMEGPOr88sCq1lFsoAw/640?wx_fmt=png&from=appmsg",_width:"677px",crossorigin:"anonymous",alt:"图片"}})]),i("h2",[i("br")]),i("h2",[i("span",{staticStyle:{"font-size":"28px","font-weight":"bold"}},[t._v("结论")])]),i("p",[i("br")]),i("p",[t._v("如果专注前端开发的体验，单核能力 "),i("b",[t._v("M1 系列比 intel mac 提高是飞跃的")]),t._v("，而在  M4 pro 对比 M1 和 M3则是在预期之中的提升，工作不会明显的感受到。（笔者平常工作是使用公司配置的 M1 ，进行中大型前端开发体验都是良好的） 。这是因为"),i("b",[t._v("前端领域的构建编译基本上主要利用单核能力，无法充分发挥多核优势")]),t._v("。如果你工作中打开大量浏览器网页和应用，M4 pro的多核可能会很明显帮助。")]),i("p",[i("br")]),i("p",[t._v("对于大模型推理，M1 仅仅能跑起来，无法达到可用阶段。 而 "),i("b",[t._v("M3 能够达到能用阶")]),t._v("段，而 "),i("b",[t._v("M4 pro 则是体验良好的感受")]),t._v("。实际 qwen14b-int4 在 M4 pro 返回的感受和当初的 chatgpt 3.5 很像了，但M4 pro （12+16）明显不适应跑更大的模型（比如32g ），即使显存够了，速度还是跟不上（至少10 token/s 才能正常用吧？）。可以预测，在不久的将来，离线模型会非常成熟，且能能力越来越强。")]),i("p",{staticStyle:{display:"none"}},[i("mp-style-type")],1),t._v(" "),i("hr"),t._v(" "),i("div",{staticClass:"original-link",staticStyle:{"margin-top":"20px",padding:"10px","background-color":"#f8f8f8","border-radius":"6px"}},[i("p",{staticStyle:{margin:"0","font-size":"14px"}},[t._v("⚠️ 本文包含视频内容可能无法正常播放。")]),t._v(" "),i("p",{staticStyle:{margin:"5px 0 0","font-size":"14px"}},[t._v("原文链接："),i("a",{attrs:{href:"https://mp.weixin.qq.com/s/Y_bdR2H4lBl1hPwxRaruGQ",target:"_blank",rel:"noopener noreferrer"}},[t._v("点击查看微信公众号原文")])])])])}),[],!1,null,null,null);i.default=a.exports}}]);