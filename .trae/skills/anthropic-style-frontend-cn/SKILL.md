---
name: anthropic-style-frontend-cn
description: |
  生成 Anthropic 风格的高质量前端界面——有温度、有个性、绝不「AI 通用」。
  包含官方品牌字体（Poppins + Lora）、43 个完整组件、4 种场景模式。

  每当用户要构建任何前端界面，无论是 landing page、SaaS 产品、AI 工具、
  Chat UI、Dashboard、后台管理，都应使用本 skill——尤其是当他们说「做个界面」
  「设计一个页面」「帮我写 UI」「Anthropic 风格」「Claude 风格」「好看一点」
  「避免 AI 通用感」「有温度感」时，立即触发本 skill，不要自行发挥。

  本 skill 强制要求：动手前先确定大胆的美学方向；每次输出必须有差异化，
  不得收敛到同一套模板；实现复杂度必须匹配美学强度。
---

# Anthropic 风格前端设计规范

*基于官方 brand-guidelines + frontend-design skill*

---

## 文件索引（先看这里）

| 文件 | 内容 | 何时读取 |
|------|------|---------|
| `assets/base.css` | 完整 CSS Token（颜色/字体/间距/动效/Z-index）| 每次都要引入 |
| `assets/fonts/fonts.css` | 离线字体声明（Poppins + Lora + DM 系列）| 每次都要引入 |
| `references/components/index.md` | 43 个组件索引，含快速查找表 | 需要具体组件时 |
| `references/systems.md` | 11 条系统规范（响应式/暗色模式/焦点陷阱等）| 构建完整项目时 |
| `references/dashboard.md` | Dashboard 专项规范（KPI/图表/实时数据）| 数据密集场景 |
| `references/logo.md` | Logo 绘制 + Favicon 规范 | 需要图标/Logo 时 |
| `references/typography-cn.md` | 中文排版（霞鹜文楷/混排/子集化）| 中文界面 |
| `references/design-rules.md` | 操作规则详细版（自检/模式隔离/修复规则）| 需要完整规则时 |
| `references/design-patterns.md` | 背景纹理 CSS、动效规范、微交互、可访问性、反模式 | 需要具体视觉实现参考时 |
| `SKILL-lite.md` | 精简版（~700 token）| 简单组件/单页面/快速原型，先读此文件 |

---

## 开始前：选择模式

收到任务后，先按以下关键词判断模式，这决定了后续所有决策：

| 任务包含这些词 | 模式 | 核心调整 |
|-------------|------|---------|
| dashboard / 监控 / 数据看板 / metrics / 图表 / 运维 / 报表 | **数据密集** | 压缩留白、提高对比度、参考 dashboard.md |
| admin / 后台 / 管理系统 / 配置 / 权限 / CRM / ERP / OA | **工具优先** | 密度优先、功能完整、可突破留白底线 |
| landing page / 落地页 / marketing / 品牌 / 官网首页 / 游戏 | **品牌增强** | 允许受控渐变、更强视觉张力 |
| 其他 | **默认** | 完整执行本 skill，留白克制 |

模式判断优先于「觉得这应该属于哪种」——关键词匹配是机械判断，不是语义猜测。非默认模式仍使用同一套 Token，只在密度、对比度、克制程度上做有限调整。模式隔离细则见 `design-rules.md`。

---

## 设计哲学

Anthropic 的视觉语言建立在一个核心矛盾上：**技术性 + 人文温度**。它刻意与冷蓝色调的「AI 科技风」划清界限：

- 暖米色大地调（`#ECE9E0`）而非冰冷白底
- 衬线体（Lora）+ 无衬线体（Poppins）混排，而非全无衬线
- 克制的橙色（`#D97757`）作为唯一强调色
- 叙事感排版，而非功能性列举
- 大留白，或极致密度——拒绝中间状态

> 做完设计后问自己：**「把 Logo 遮住，还能看出这是一家专注人类价值观的 AI 公司吗？」**

### 开始前的四个问题（前置思考框架）

来自官方 frontend-design skill：

1. **Purpose（目的）**：这个界面解决什么问题？谁在用它？
2. **Tone（调性）**：选一个明确方向并坚定执行——Anthropic 风格是「有机自然 × 精致克制 × 编辑叙事」的交叉点。可选方向：极简克制 / 有机自然 / 精致奢华 / 编辑叙事 / 几何硬朗 / 温暖柔和 / 工业实用
3. **Constraints（约束）**：框架要求？多语言？可访问性？
4. **Differentiation（差异化）**：这个设计里有什么让人过目不忘的元素？

### 实现复杂度必须匹配美学强度

来自官方 frontend-design skill——这是最容易被忽略的原则：

- **极简设计**需要精准的间距、克制的排版、每个细节都经过深思；不能用「代码少」来合理化「设计随意」
- **极繁设计**需要大量动效、复杂背景处理、精心编排的视觉层次；代码量和视觉丰富度必须匹配
- **不可接受**：介于两者之间的「普通」——既不够克制，又不够大胆

### 强制差异化（防止模式坍缩）

来自官方 frontend-design skill：**不同任务的输出必须有视觉差异，绝不收敛到同一套模板。**

每次生成时主动改变其中一项：字体配对 / 配色权重 / 布局结构 / 背景处理 / 动效风格。

在默认模式下，每次还需要加入一个「非标准元素」：

- 非对称分栏（而非全部居中）
- 突破容器边界的装饰图形
- 极大标题 + 极小说明的字号对比
- 不寻常的负空间分配

### 信息密度规则（具体数字）

```
单屏视觉层级：最多 3 个（主标题 / 内容 / 辅助信息）
单区块信息块：最多 2 个，超出拆分成新区块
行宽控制：正文最大 65ch，标题最大 28ch
留白底线（默认模式）：区块间距最小 64px，卡片内距最小 24px
导航项数：顶部导航最多 6 个
```

### 决策优先级（规则冲突时）

信息清晰 > 交互可用 > 视觉一致 > 极简美学。

美感是最低优先级——如果为了「好看」牺牲了信息或可用性，那就是设计失败。

### 必须放弃极简的场景

危险操作（删除/不可逆操作）、紧急报警、系统崩溃、不可回退节点——这些场景必须用强烈视觉强调，不能克制。详细实现见 `systems.md` 第 11.4 节和 `design-rules.md`。

---

## Token 系统

**颜色**

```css
--color-bg-base: #ECE9E0
--color-bg-raised: #F5F3EC
--color-bg-inverted: #141413
--color-accent-orange: #D97757
--color-text-primary: #141413
--color-text-secondary: #6B6860
--color-error: #C0453A
```

**字体**

```css
--font-display: 'Lora', serif
--font-heading: 'Poppins', sans-serif
--font-body:    'Lora', serif
--font-mono:    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
```

**间距**

```css
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-16: 64px
--space-32: 128px
```
