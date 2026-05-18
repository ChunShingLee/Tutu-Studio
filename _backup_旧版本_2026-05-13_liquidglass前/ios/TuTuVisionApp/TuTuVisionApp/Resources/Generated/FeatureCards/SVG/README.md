# Feature Card SVG Masters

这套 SVG 是按当前 UI 规范手工补的功能图标母版，用来兜底 Figure 图标批次被额度卡住的情况。

## Files

- SVG 母版路径：
  - `design-assets/icons/feature-cards/generated-svg/icon_feature_text_to_image.svg`
  - `design-assets/icons/feature-cards/generated-svg/icon_feature_image_to_image.svg`
  - `design-assets/icons/feature-cards/generated-svg/icon_feature_outpaint.svg`
  - `design-assets/icons/feature-cards/generated-svg/icon_feature_local_edit.svg`
- PNG 预览路径：
  - `Resources/Generated/FeatureCards/PNG/icon_feature_text_to_image.svg.png`
  - `Resources/Generated/FeatureCards/PNG/icon_feature_image_to_image.svg.png`
  - `Resources/Generated/FeatureCards/PNG/icon_feature_outpaint.svg.png`
  - `Resources/Generated/FeatureCards/PNG/icon_feature_local_edit.svg.png`

## Style Rules

- 圆角方块底板
- 橙 / 紫 / 黄 / 绿四组高饱和渐变
- 白色极简线性 glyph
- 不带文字
- 适合直接继续导入 Figma 微调

## Recommended Use

1. 先把这些 SVG 导入 Figma
2. 在 Figma 里按实际卡片尺寸微调留白和线宽
3. 导出 `128x128` 或 `256x256` PNG
4. 再放回 `Resources/Icons/` 或加入 Xcode target
