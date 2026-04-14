# Female-Life

（仓库名标题保留为 `Female-Life`；下方为项目说明。）

本仓库为 **Female Life OS** 的可运行 Web MVP（按 PRD V1：Cycle + Life Admin + Orchestrator + Today + Mental Load + 简版提醒逻辑）。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 演示路径（建议顺序）

1. `/onboarding`：3 分钟建档（周期 + 常用补货 + 固定缴费）
2. `/today`：快速打点 + 一句话生成 Today 面板（含重点 1–3 / 风险 / 自我照顾 / 卡片）
3. `/chat`：对话入口（Orchestrator 编排输出，可一键“应用到 Today”）
4. `/mental-load`：隐形劳动面板（可委派/可自动化/委派话术模板）

## 数据存储

为便于快速 demo：**全部数据仅保存在浏览器 LocalStorage**（key 前缀：`flo:v1:`）。
