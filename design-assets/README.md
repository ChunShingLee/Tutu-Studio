# Design Assets Guide

这个目录专门放设计源文件和待筛选素材，方便你后续补充更精致的图标、照片和封面图。

建议按下面两层来用：

1. 原始素材放在 `design-assets/`
2. 最终准备接入 App 的导出图放到 `ios/TuTuVisionApp/TuTuVisionApp/Resources/`

## Directory Map

- `icons/app-ui/`
  - 放导航、按钮、空状态、资料卡等通用图标
- `icons/feature-cards/`
  - 放首页“创作入口”、创作页“创作模式”等功能卡片图标
- `icons/community/`
  - 放社区入口、互动角标、小徽章
- `photos/demo-materials/`
  - 放图生图、局部重绘用的真实演示照片
- `photos/community-covers/`
  - 放社区内容卡片封面图
- `photos/template-covers/`
  - 放模板广场、热门模板缩略图

## Naming Suggestions

- 图标：`icon_<scene>_<purpose>.png`
  - 例：`icon_create_text_to_image.png`
- 演示照片：`demo_<subject>_<style>.jpg`
  - 例：`demo_coffee_branding.jpg`
- 社区封面：`community_<topic>_<index>.jpg`
  - 例：`community_castle_01.jpg`
- 模板缩略图：`template_<template-id>_cover.jpg`
  - 例：`template_product-main_cover.jpg`

## Recommended Specs

- 图标：
  - 优先 PNG，透明背景
  - 推荐导出尺寸 `128x128` 或 `256x256`
- 模板/社区封面：
  - 推荐 JPG 或 PNG
  - 长边建议 `1200-1600px`
- 图生图演示素材：
  - 推荐真实拍摄感
  - 长边建议 `1600px` 左右，避免太小

## Where These Will Be Used

- 首页功能入口图标：
  - `ios/TuTuVisionApp/TuTuVisionApp/HomeView.swift`
- 创作页模式图标、演示照片：
  - `ios/TuTuVisionApp/TuTuVisionApp/CreateView.swift`
- 社区卡片封面：
  - `ios/TuTuVisionApp/TuTuVisionApp/CommunityView.swift`
- 模板缩略图：
  - `ios/TuTuVisionApp/TuTuVisionApp/TemplatesView.swift`
