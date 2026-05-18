# iOS Resource Drop Zone

这个目录是给 iOS App 准备用的“最终导出图”。

你可以把已经选好的 PNG / JPG 放到这里，再按下面方式接入到 Xcode 和代码里。

## Subfolders

- `Icons/`
  - 放最终要在 App 里使用的本地图标
- `Photos/DemoMaterials/`
  - 放图生图、局部重绘的演示照片
- `Photos/Community/`
  - 放社区列表封面
- `Photos/Templates/`
  - 放模板广场缩略图
- `Photos/EditMasks/`
  - 放局部重绘示意图、遮罩参考图

## How To Use

1. 先把图导出到这个目录
2. 在 Xcode 中右键 `TuTuVisionApp` 分组
3. 选择 `Add Files to "TuTuVisionApp"...`
4. 选中你需要的图片文件
5. 勾选 `Copy items if needed`
6. 勾选 `Add to targets: TuTuVisionApp`

## Recommended Access Pattern

如果是图标或固定封面，后续优先改成资源名方式使用：

```swift
Image("icon_create_text_to_image")
Image("template_product_main_cover")
```

如果是需要继续保留 URL / 动态来源的图片，可以先继续沿用当前结构，再逐步把远程图替换成本地资源。

## Current Code Hotspots

- 图生图演示照片来源：
  - `CreateView.swift` 里的 `DemoPhoto.sample`
- 首页入口图标：
  - `HomeView.swift` 里的 `HomeQuickAction.sample`
- 社区卡片内容：
  - `CommunityView.swift` 里的 `CommunityCard.sample`

注意：这个 `Resources/` 目录现在只是文件夹本身，新增图片后还需要通过 Xcode 加入 target，才会真正打进 App 包里。
