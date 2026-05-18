# ERRORS

## [ERR-20260508-001] Figure image generation usage limit

**Priority**: high
**Status**: pending
**Area**: tools

### 摘要
在继续生成功能图标时，Figure Images API 返回 `usage_limit_reached`，导致图标批次无法继续。

### 错误信息
```text
HTTP 429 from https://figure.jiangsuocean.cn: {"error":{"message":"The usage limit has been reached","type":"usage_limit_reached","param":"","code":null}}
```

### 上下文
- 执行命令：
  - `zsh -lc 'source ~/.zshrc >/dev/null 2>&1; python3 ~/.hermes/skills/openclaw-imports/figure-gpt-image-2/scripts/generate.py --model gpt-image-2 --size 1024x1024 --background transparent --quality high --output-dir ".../Resources/Generated/FeatureCards" --prefix icon-text-to-image "..." --print-json'`
- 前序已成功生成 10 张素材：
  - 3 张演示照片
  - 3 张社区封面
  - 4 张模板缩略图

### 建议修复
- 检查 Figure 账号额度或渠道配额
- 配额恢复后从 `FeatureCards/` 图标批次继续

### 元数据
- Reproducible: yes
- See Also: LRN-20260508-001, LRN-20260508-002

---
