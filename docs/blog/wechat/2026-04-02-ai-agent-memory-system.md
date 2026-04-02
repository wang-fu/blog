---
date: 2026-04-02 20:29:00
type: post
blog: true
description: 给 7x24 运行的 AI Agent 设计记忆系统
tags:
  - 公众号
  - 混沌随想
---

# 给 7x24 运行的 AI Agent 设计记忆系统

最近两个月，本地 AI Agent 工具突然火了。

很多人第一次体验到：让 AI 在自己电脑上 7x24 小时跑着，盯价格、监控关键词、自主运营等。

这背后有一个绕不开的技术问题：怎么让 Agent 拥有长期记忆？

大语言模型本身没有跨会话的记忆。每次触发都是全新的上下文，要让 Agent 记住"上次发生了什么"、积累经验、避免重复犯错——需要专门设计一套记忆系统。

我们在做 Halo 的过程中深入思考过这个问题。这篇文章讲的是我们的设计思路，以及背后真实的工程决策——不一定是唯一答案，但每个决策背后都有具体的理由。

---

## 从记忆的本质开始想

在动手之前，我们先问了一个更根本的问题：记忆到底是什么？

不是"存了什么"，而是"在什么时刻，以什么形式，提取什么"。

人类记忆给了我们一个很好的参照。你不会以同等密度记住所有事情：

- 昨天发生的事，你记得细节——"下午三点，咖啡店，谈了半小时，对方说了一句具体的话"
- 上个月发生的事，你记得轮廓——"那次谈判最终没成，原因是价格谈不拢"
- 去年发生的事，你记得结论——"那家供应商不靠谱，别再合作了"

越久远的记忆，越抽象，越压缩。但它没有消失——它以更高度概括的形式继续存在，在需要的时候仍然能被调用。

这就是多分辨率的本质：同一段历史，在不同时间距离下，以不同粒度存在。近的清晰，远的模糊，但都在。

还有第二个洞察：记忆里的不同知识，有不同的"新陈代谢速率"。

"当前价格"每次运行都会变——它的生命周期是一次运行。"这家网站的反爬策略"可能几个月才变一次——它是慢变量。"工作日早上价格最低"是一条经验规律——它会随着数据积累越来越可靠，几乎不会失效。

把生命周期不同的知识混在一起管理，也会让记忆系统劣化。

halo 就是从这两个认识，开始设计的。

---

## 从"现在"到"过去"的多层分辨率

推论到 Agent 身上：Agent 的记忆系统，本质上是在管理信息随时间的抽象化过程。不是存多少的问题，而是怎么压缩、压缩成什么形式、在什么时机取用哪一层。

我们设计了四层分辨率梯度：

| 分辨率 | 层级 | 内容特征 | 注入策略 |
|--------|------|----------|----------|
| 最高（清晰） | 工作记忆层（`# now`） | 当前状态、活跃实体、经验规律、错误修复 | 每次执行自动完整注入 |
| 较高（概要） | 时间线记忆层（`# History`） | 每次执行的事件摘要，时间标识+语义概要 | 仅注入标题索引 |
| 较低（快照） | 归档记忆层（`memory/`） | 工作记忆文件的历史版本快照 | 按需读取 |
| 最低（详细） | 执行日志层（`memory/run/`） | 每次执行的完整交互记录 | 按关键字定向检索 |

四层之间通过统一的时间标识（`YYYY-MM-DD-HHmm`）实现跨层关联——Agent 在时间线里看到 `## 2026-01-15-1400 | MacBook涨至¥7999` 这一行摘要后，如果需要那次的完整执行过程，直接用相同时间标识定位到 `memory/run/2026-01-15-1400-run.jsonl`，一路下钻。

这些路径在代码里是结构化隔离的：

```typescript
// paths.ts — 记忆路径解析，从 caller + scope 映射到文件系统
export function getMemoryBaseDir(caller: MemoryCallerScope, scope: MemoryScopeType): string {
  switch (scope) {
    case 'user':
      return getHaloDir()                                       // ~/.halo/user-memory.md
    case 'space':
      return join(caller.spacePath, '.halo')                    // {space}/.halo/memory.md
    case 'app':
      return join(caller.spacePath, '.halo', 'apps', caller.appId!) // {space}/.halo/apps/{id}/memory.md
  }
}
```

这就是在模拟人类记忆的分辨率梯度——你不会以同等清晰度记住所有事情，但每一层都有明确的入口，需要时可以回溯到更细的粒度。

---

## 不同知识有不同的新陈代谢速率

四层梯度解决了记忆"纵向"问题。但最核心的工作记忆层（`# now`）内部，还需要"横向"组织。

问题是，工作记忆里的知识不是同质的。把所有"当前状态"堆在一起，Agent 很难判断哪些信息已经过时、哪些需要更新、哪些可以删除。

我们把工作记忆按知识的新陈代谢速率分成四个语义分区：

```markdown
# now

## State | 已完成 84 次，上次检查无变化
- runs_completed: 84
- alerts_sent: 5
- last_result: AirPods ¥1199，无变化

## AirPods Pro（京东）
- current_price: ¥1199
- lowest_seen: ¥1099（2026-01-08）
- last_change: 2026-01-10，¥1299→¥1199
- trend: 稳定（5天）

## Patterns
- 工作日早上价格最低，周末最高
- 降幅超过 10% 通常是限时活动，48小时内回涨
- 用户只在价格低于历史最低时才需要通知

## Errors
- 京东反爬：切换为移动端 User-Agent
- 淘宝页面结构 2026-01-11 变更：使用选择器 .price-current
```

`## State` 每次运行都会改，就地编辑字段值就行。`## [实体名]` 按监控对象组织，有变化改对应的，没变化不动。`## Patterns` 是最慢变的——从大量运行里归纳出来的经验，低频积累，超过 20 行时 Agent 自己合并提炼。`## Errors` 有生命周期——问题解决了就该删掉，不让错误日志无限堆积。

四个区域，各自演化：

| 分区 | 变化频率 | 增长模式 | 维护策略 |
|------|----------|----------|----------|
| `## State` | 每次运行都变 | 值变，结构稳定 | 就地编辑（替换旧值） |
| `## [实体名]` | 按需增删 | 随监控对象增减 | 新增/移除整个实体节 |
| `## Patterns` | 低频积累 | 持续增长 | 超过 20 行时 AI 主动合并归纳 |
| `## Errors` | 事件驱动 | 自修剪 | 问题解决后 AI 主动移除 |

这套结构是通过 system prompt 注入给 Agent 的。不是靠专用 API，而是靠明确的约定——Agent 用原生的 Edit 工具直接操作 `memory.md`：

```typescript
// prompt.ts — 注入给 Agent 的记忆使用指令（节选）
const MEMORY_INSTRUCTIONS = `
## Memory

You have a persistent \`memory.md\` file that carries state across sessions.

### Structure

\`\`\`
# now                          ← working memory (auto-loaded)
## State | one-line summary    ← always first, updated every run
## [Entity Name]               ← per-entity tracking (optional)
## Patterns                    ← learned rules (accumulates)
## Errors                      ← failure lessons (compact)

# History                      ← timeline (newest first)
## YYYY-MM-DD-HHmm | summary  ← one entry per run
\`\`\`

### How to Update

Use **Edit** for all routine updates:
\`\`\`
Edit(memory.md, "- current_price: ¥1199", "- current_price: ¥1099")
\`\`\`
`
```

没有自定义的记忆写入 API。Agent 就是用文本编辑器在写 Markdown。这意味着记忆格式对人类完全透明——你随时可以打开 `memory.md` 看看 Agent 到底记住了什么，甚至手动修改它。

---

## 人类不需要想起全部细节，才能判断一件事值不值得回忆

工作记忆之外还有时间线，每次运行的历史记录。

时间线会一直长。全塞进上下文的话，跑到第 100 次，光历史记录就能占掉上下文窗口大半，token 消耗线性膨胀。但历史又不能不要——Agent 需要知道上次什么情况，需要能回溯上周那次降价。

我们的做法是根据文件大小动态选择：小文件全注入，大文件只注入 `# now` 全文加时间线的标题索引。

```typescript
// snapshot.ts — 记忆快照构建
const SMALL_MEMORY_LINE_THRESHOLD = 30

export async function buildMemorySnapshot(caller: MemoryCallerScope): Promise<MemorySnapshot> {
  const content = await readMemoryFile(memoryFilePath)

  if (content !== null) {
    snapshot.exists = true
    snapshot.rawContent = content
    const lines = content.split('\n')
    snapshot.totalLines = lines.length
    snapshot.headers = parseHeadings(lines)

    // 提取第一个顶级分节（# now 的全部内容，直到 # History）
    if (snapshot.headers.length > 0) {
      const first = snapshot.headers[0]
      const startIdx = first.line - 1
      snapshot.firstSection = lines.slice(startIdx, startIdx + first.lineCount).join('\n')
    }

    // 小文件：全文注入；大文件：只注入 # now + 标题索引
    if (snapshot.totalLines <= SMALL_MEMORY_LINE_THRESHOLD) {
      snapshot.fullContent = content
    }
  }
  return snapshot
}
```

注入的时候三种情况分开处理：

```typescript
// prompt.ts — 将快照渲染为 Agent 看到的初始消息
function buildMemorySection(snapshot: MemorySnapshot): string {
  if (!snapshot.exists) {
    // 还没有记忆文件——引导 Agent 创建
    lines.push('No memory file exists yet. Create it with Write...')
  } else if (snapshot.fullContent !== null) {
    // 小文件（≤30 行）——全文注入
    lines.push('### Content (full):')
    lines.push(snapshot.fullContent)
  } else {
    // 大文件——# now 全文 + 时间线标题索引
    lines.push('### Working Memory (# now, auto-loaded):')
    lines.push(snapshot.firstSection)
    lines.push('### Structure:')
    for (const h of snapshot.headers) {
      lines.push(`  L${h.line}: ${h.heading} (${h.lineCount} lines)`)
    }
  }
}
```

大文件场景下 Agent 看到的时间线长这样：

```
### Structure:
  L1: # now (28 lines) ← loaded above
  L29: # History (120 lines)
    L30: ## 2026-01-15-1430 | 例行检查,无变化 (1 lines)
    L31: ## 2026-01-15-1400 | MacBook涨至¥7999,已通知 (5 lines)
    L36: ## 2026-01-15-1330 | 例行检查,无变化 (1 lines)
```

扫一眼就知道最近发生了什么。需要某次的详情，用 Read 按行号直接读。

这些标题里的语义摘要怎么来的？这里有个小设计：**系统插时间，AI 填内容**。每次运行前系统先写一个空的时间戳：

```typescript
// execute.ts — 执行前预插时间标识
const runTimestamp = formatRunTimestamp(new Date())    // "2026-01-15-1430"
await preInsertHistoryHeading(memorySnapshot.memoryFilePath, runTimestamp, memorySnapshot.rawContent)

async function preInsertHistoryHeading(memoryFilePath, timestamp, preReadContent) {
  const heading = `## ${timestamp}`

  if (preReadContent === null) {
    // 首次运行——创建骨架
    const skeleton = `# now\n\n## State\n\n# History\n\n${heading}\n`
    await writeFile(memoryFilePath, skeleton, 'utf-8')
    return
  }

  // 找到 # History 行，在其后插入新时间标识
  const historyMatch = content.match(/^# History\s*$/m)
  if (historyMatch && historyMatch.index !== undefined) {
    const insertPos = historyMatch.index + historyMatch[0].length
    const before = content.slice(0, insertPos)
    const after = content.slice(insertPos)
    await writeFile(memoryFilePath, before + `\n\n${heading}` + after, 'utf-8')
  }
}
```

运行结束后，Agent 用 Edit 在这个已有的时间戳行后填上语义概要：`## 2026-01-15-1430` → `## 2026-01-15-1430 | AirPods降至¥1099，创新低`。

为什么要这样分工？LLM 对精确时间的感知很差——更弱的模型写错会导致严重的时间线错乱，确定的事情由系统负责自动精确插入，AI 负责理解，各做擅长的事，这是提示工程的一部分。

---

## 没有任何一个 Agent 有权覆盖集体记忆

单个 Agent 的记忆好管理。复杂的是多个 Agent 共存的场景。

Halo 里一个工作空间可以同时跑好几个 Agent——一个盯价格，一个监控竞品，一个定时发报告。它们之间有些知识是共享的：用户偏好、项目背景、工作空间级的上下文。

如果每个 Agent 都能随意读写共享记忆，早晚出事：Agent A 把共享记忆整体替换了一遍，Agent B 之前追加的内容全没了。不是谁犯了错，就是没有边界。

我们做了三级隔离。权限矩阵硬编码在代码里：

```typescript
// permissions.ts — 记忆权限矩阵

export function assertWritePermission(
  caller: MemoryCallerScope,
  scope: MemoryScopeType,
  mode: 'append' | 'replace'
): void {
  if (caller.type === 'user') {
    if (scope === 'app') {
      throw new MemoryPermissionError(
        'User sessions cannot write to app memory.'
      )
    }
    return // 用户可以读写 user 和 space 记忆
  }

  // App 调用者
  if (scope === 'user') {
    throw new MemoryPermissionError(
      'Apps cannot write to user memory. User memory is read-only for apps.'
    )
  }

  if (scope === 'space') {
    if (mode === 'replace') {
      throw new MemoryPermissionError(
        'Apps can only append to space memory, not replace it.'
      )
    }
    return // 共享记忆：只能追加，不能替换
  }

  // app scope: 自己的记忆，完全控制
}
```

最关键的约束在中间那一层——共享记忆对 Agent 是 **append-only**（只能追加，不能替换）。

完整的权限矩阵：

| | 全局用户记忆 | 工作空间共享记忆 | 自己的私有记忆 | 其他Agent的记忆 |
|---|---|---|---|---|
| **用户** | 可读可写 | 可读可写 | 不可访问 | 不可访问 |
| **Agent A** | 只读 | 可读可追加 | 完全控制 | 不可访问 |
| **Agent B** | 只读 | 可读可追加 | 不可访问 | 完全控制 |

隔离不是为了限制，是为了让每个 Agent 的行为可预期——它能改什么、不能改什么，在系统层面就定死了。跨 Agent 的读取隔离甚至是在路径层面结构性保证的——`caller.appId` 决定了路径，Agent A 从代码上就不可能拼出 Agent B 的记忆文件路径。

---

## 在上下文压缩前保存记忆

这是最容易被忽略的。

Agent 长时间运行，对话越来越长。快到上下文窗口上限时，SDK 会自动把前面的对话压缩成一段摘要——腾出空间让对话继续。

问题是这个摘要是 SDK 自己用 LLM 生成的，它不知道你的 Agent 在做什么、哪些中间结论特别重要。如果 Agent 刚在上下文里归纳出"京东 AirPods 周三下午常降价"，还没写到 `memory.md`，压缩后这条发现可能变成一句模糊的概括，甚至直接消失。

SDK 提供了 PreCompact hook——压缩前的最后窗口。我们在这个窗口里给 Agent 塞一条指令："把还没保存的重要信息立刻写到记忆文件。"

解法是在运行时引擎执行压缩之前，设置一个记忆刷盘的生命周期钩子：

```typescript
// types.ts — MemoryService 接口
interface MemoryService {
  /**
   * Flush in-progress memory before context compaction.
   *
   * Called by apps/runtime just before the Agent SDK performs context compaction.
   * The implementation appends any pending notes from the current session.
   */
  flushBeforeCompaction(caller: MemoryCallerScope): Promise<void>
}
```

当上下文使用率超过阈值时，系统向 Agent 注入一条刷盘指令：

> "上下文即将压缩。立即将当前上下文中的关键状态信息保存到记忆文件。包括：执行结果、新发现的规律、待跟踪条件、错误修复方案。"

Agent 收到这条指令后，把上下文中尚未持久化的重要信息写到 `memory.md` 的对应分区。然后运行时引擎再执行上下文压缩。

这是在一个窄窗口里做的协调——"抢在压缩之前保存"。有了这一步，即使后续的上下文压缩丢弃了早期对话内容，关键状态信息已经安全落盘。

---

## 记忆不是堆积，是持续的整理

记忆文件会持续增长。`# History` 里的条目一天天累积，文件越来越大。这是任何长期运行的记忆系统都必须面对的问题。

直觉上的解法是按时间截断——保留最近 N 条，删掉更早的。简单，但代价很高：你永远不知道第 N+1 条里有没有一条关键的经验规律，一刀切下去可能把最有价值的内容删掉了。

我们的解法是：**让 LLM 来做压缩，而不是用规则截断**。

当 `memory.md` 超过 100KB 时触发：

```typescript
// execute.ts — 记忆压缩
const COMPACTION_THRESHOLD_BYTES = 100 * 1024   // 100KB

async function checkAndCompactMemory(memory, scope, app, runTag) {
  const needsCompaction = await memory.needsCompaction(scope, 'app')
  if (!needsCompaction) return

  // 压缩前先读取全文（归档后就读不到了）
  const currentContent = await memory.read(scope, { scope: 'app', mode: 'full' })

  // 归档旧文件——不删除，永久保留
  const { archived } = await memory.compact(scope, 'app')

  // 调用 LLM 生成压缩版本（带验证 + 重试）
  const summary = await generateCompactionSummary(currentContent, app.spec.name, app, runTag)

  // 写入新的 memory.md
  await memory.write(scope, { scope: 'app', content: summary, mode: 'replace' })
}
```

LLM 压缩的核心是这段 prompt——告诉它保留什么、丢弃什么：

```typescript
// execute.ts — 压缩指令
function buildCompactionPrompt(content: string, appName: string): string {
  return (
    `You are compacting the memory file for "${appName}".\n\n` +
    `## Current Memory Content\n\n${content}\n\n` +
    `## Rules\n\n` +
    `- Every entry in \`# now\` must be current and actionable\n` +
    `- Keep only the most recent ~10 History entries\n` +
    `- Both \`# now\` and \`# History\` H1 headings are MANDATORY\n` +
    `- Aim for roughly 60–120 lines total\n` +
    `- Older History entries are already archived in memory/run/ files, safe to drop`
  )
}
```

生成结果要通过结构验证——必须保留完整的两层结构：

```typescript
function isValidCompaction(content: string): boolean {
  return /^# now\s*$/m.test(content) && /^# History\s*$/m.test(content)
}
```

验证失败则重试，最多两次。LLM 的上一次输出和修正指令一起发回去，构成多轮对话：

```typescript
async function generateCompactionSummary(content, appName, app, runTag) {
  const messages = [{ role: 'user', content: buildCompactionPrompt(truncatedContent, appName) }]

  for (let attempt = 0; attempt <= COMPACTION_MAX_RETRIES; attempt++) {
    const response = await client.messages.create({ model, max_tokens: 16384, messages })
    // ...提取文本...
    if (isValidCompaction(output)) return output

    // 验证失败——把失败的输出和修正指令追加到对话
    messages.push({ role: 'assistant', content: output })
    messages.push({
      role: 'user',
      content: 'Your output is missing required H1 headings. ' +
               'Must contain both `# now` and `# History`...'
    })
  }
  // LLM 全部失败——降级为规则提取
  return buildFallbackCompactionSummary(content)
}
```

降级方案是纯代码的确定性提取——取 `# now` 的前 50 行 + `# History` 的最近 10 条，拼成一个合法的两层结构：

```typescript
function buildFallbackCompactionSummary(content: string): string {
  // 提取 # now 区（上限 50 行）
  const nowLines = sectionLines.slice(0, 51)

  // 提取 # History 最近 10 条时间标识记录
  const recentEntries = historyEntries.slice(0, 10)

  return ['<!-- Compacted by system (LLM unavailable) -->', '', ...nowLines, '', '# History', '',
    ...recentEntries.flatMap(entry => [...entry, ''])
  ].join('\n')
}
```

为什么规则做不到 LLM 做的事？因为规则不理解语义。它不知道"京东反爬：切换移动端 User-Agent"这条 Errors 记录，在问题已经解决三个月后还有没有必要保留。LLM 可以做这个判断——它能识别哪些字段已经过时、哪些规律已被证伪、哪些实体已经不再被追踪。

在我们的商品比价 Agent 测试中，105KB 的记忆文件压缩后约 8KB，`# now` 的所有当前状态字段完整保留，结构和可读性没有损失。

这其实是在模拟人类记忆的睡眠阶段——大脑在你休息的时候，把白天的经历整理、压缩、归档，保留值得保留的，抛弃已经没用的。

---

## 跑了 84 次之后

用一个商品比价 Agent 来说明这套系统的实际效果：

**第 1 次运行**时，它什么历史都没有。系统为它创建骨架文件，它机械地执行任务，把结果写入 `## State`。

**第 10 次运行**时，`## Errors` 里开始出现经验——"京东反爬需要切换 User-Agent"——它不会再在同一个地方跌倒两次。

**第 30 次运行**时，`## Patterns` 里出现了第一条归纳："降幅超过 10% 通常是限时活动，48 小时内回涨"。这条规律改变了它的通知策略——它开始区分"真实降价"和"虚假促销"。

**第 84 次运行**时，`## Patterns` 里有 6 条经过验证的经验规律，`## State` 里有完整的当前状态，`## Errors` 里只剩 2 条仍然有效的注意事项。它知道这个任务的全部背景，知道用户的真实偏好，知道哪些情况值得通知、哪些不值得。

这不是靠更大的模型实现的，也不是靠更长的上下文——是靠记忆结构让知识得以跨次运行积累和演化。

**第 1 次是无状态的脚本，第 84 次是有经验的员工。差的不是智能，是记忆。**

---

## 最后

设计这套系统的过程里，我们反复回到同一个问题：记忆的目的是什么？

不是存档，不是备份，不是日志。记忆的目的是**让下一次行动比上一次更好**。

从这个目的出发，记忆系统的设计标准就很清楚了：每次运行注入的信息，要足够让 Agent 做出比上次更好的判断。多了是浪费，少了是遗忘，关键是恰好够用——以最低的信息密度承载最有价值的上下文。

多分辨率分层、语义分区、自适应注入、权限隔离、刷盘保护、LLM 压缩等这些机制，都是在回答同一个问题：怎么让"恰好够用"在系统层面自动发生。

7x24 运行的 Agent，值得一个同样持续演化的记忆系统。

---

> 文中所述记忆系统已在 Halo 中实现并投入生产使用。代码片段来自实际代码库，为可读性做了适当精简。
>
> halo 是开源的，您可以随时查看代码：[https://github.com/openkursar/hello-halo](https://github.com/openkursar/hello-halo)

原文链接：[https://mp.weixin.qq.com/s/qdSmWiaxCI_pSH0iBJm0ZA](https://mp.weixin.qq.com/s/qdSmWiaxCI_pSH0iBJm0ZA)

> 由 Halo 数字人自动同步
