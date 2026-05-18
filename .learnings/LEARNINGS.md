# LEARNINGS

## [LRN-20260508-001] correction

**Priority**: high
**Status**: resolved
**Area**: tools

### 内容
用户明确要求：涉及 `gpt-image-2` 的生图或改图时，必须直接复用 `~/.hermes/skills/openclaw-imports/figure-gpt-image-2/scripts/generate.py`，并且始终通过 `zsh -lc 'source ~/.zshrc >/dev/null 2>&1; ...'` 执行。只允许走 Images API，不要走 `/v1/chat/completions`。

### 建议修复
后续所有文生图走：
`python3 ~/.hermes/skills/openclaw-imports/figure-gpt-image-2/scripts/generate.py "PROMPT" --print-json`

后续所有改图走：
`python3 ~/.hermes/skills/openclaw-imports/figure-gpt-image-2/scripts/generate.py --edit --image /path/to/input.png "PROMPT" --print-json`

### 元数据
- Source: correction

---

## [LRN-20260508-002] best_practice

**Priority**: medium
**Status**: resolved
**Area**: tools

### 内容
调用 `~/.hermes/skills/openclaw-imports/figure-gpt-image-2/scripts/generate.py` 时，不能完全依赖环境里的默认模型值。当前环境曾把默认模型解析到不可用的 `gpt-image-2-4k`，导致 Figure 返回 `model_not_found`。显式传 `--model gpt-image-2` 更稳。

### 建议修复
后续所有 Figure 图片生成命令都直接带上：
`--model gpt-image-2`

### 元数据
- Source: best_practice
- See Also: LRN-20260508-001

---

## [LRN-20260509-001] correction

**Priority**: high
**Status**: resolved
**Area**: tools

### 内容
当用户明确指出某个 iOS 26 底部栏样式是系统原生组件时，不应先把它当成“重复渲染”或“多余背景”去削掉。对于 Liquid Glass、tab bar、toolbar 这类系统件，应该优先回到 Apple 官方 HIG 和系统标准组件，避免继续手绘一个近似品。

### 建议修复
遇到 iOS 26 原生导航/标签栏风格诉求时：
优先查阅 Apple 官方 `Tab Bars`、`Materials`、`Liquid Glass` 文档；
优先采用标准 `TabView` / `tabItem` 等系统组件，而不是用 `overlay` 自绘自定义浮层底栏。

### 元数据
- Source: correction

---
