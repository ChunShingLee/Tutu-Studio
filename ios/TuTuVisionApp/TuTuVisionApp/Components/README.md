# Liquid Glass 液态玻璃卡 — 组件说明

> iOS 26 Liquid Glass Material 规范实现,兔兔视觉创意工作台专用。
> 最低支持 iOS 18,iOS 26 自动启用原生 `.glassEffect()`。

## 文件清单

| 文件 | 作用 |
| --- | --- |
| `LiquidGlassMaterial.swift` | 材质常量:圆角、描边宽度、阴影、motion、displayP3 色环、`Color.desaturated` / `Color.derivedRing` 辅助。 |
| `FlowingBorderModifier.swift` | `FlowingBorderStyle` 枚举 + `.flowingBorder(...)` / `.liquidNoiseBorder(...)` 扩展。 |
| `FlowingBorder.metal` | Hero 卡的液态噪声片元 shader(iOS 17+ 通过 `.colorEffect` 挂载)。 |
| `LiquidGlassCard.swift` | 主组件 `LiquidGlassCard(style:themeColors:borderAnimation:...)`。 |
| `LiquidGlassDemoView.swift` | 4 种样式 / 10 卡同屏 / 主题色 3 个 Tab 的完整演示。 |

## API 速查

```swift
LiquidGlassCard(
    style: .hero,                          // .hero / .stat / .feature / .list
    themeColors: [.orange, .pink, .purple],
    borderAnimation: .flowing              // .flowing / .pulse / .static
) {
    VStack(alignment: .leading) {
        Text("Badge").font(.caption)
        Text("Title").font(.title2)
        Text("Subtitle").font(.subheadline)
    }
}
```

如果只想把现有任意 View 包成液态玻璃卡:

```swift
myExistingView.wrappedInLiquidGlass(style: .feature, themeColors: [.orange, .purple])
```

## 材质栈

从下到上依次叠加(在 `LiquidGlassCard.materialStack` 里):

1. `LinearGradient` (displayP3,主题色)
2. `.ultraThinMaterial` — 底层漂浮模糊
3. `.regularMaterial` — 顶层密度支撑
4. 顶部 1/3 白色 `LinearGradient` 高光
5. iOS 26:原生 `.glassEffect(.regular)` 叠一层折射
6. Inner stroke 1pt white.opacity(0.25)
7. 流动光边 2pt `AngularGradient` + rotation
8. 外阴影 24pt, 主题色 25%

## 动效

- **`.flowing`**(默认):`AngularGradient` 沿圆角矩形 strokeBorder 匀速旋转,周期 5.4s,linear。
- **`.pulse`**:色环不旋转,宽度在 0.7–1.3w 之间正弦呼吸,周期 2.6s。
- **`.static`**:静态 `LinearGradient` 描边,无动效。
- `Hero` 卡额外启用 `liquidNoiseBorder` — iOS 17+ 通过 Metal shader 做液态噪声扰动。
- **Reduce Motion** 开启时 → `.flowing` / `.pulse` 自动降级到 `.static`。

## 性能

- 每张卡的 TimelineView 以 60Hz 驱动一个 `AngularGradient.strokeBorder + rotationEffect`,GPU 开销低。
- 10 卡同屏 @ iPhone 14:实测 60fps(见 Demo 的 `stressGrid` Tab)。
- Metal shader 仅 Hero 卡启用,其他 style 不走 shader 路径。
- 暗色模式下饱和度自动 -15%(`LiquidGlassMaterial.adjustedForDarkMode`)。

## 如何在运行时预览

最快方式:在 Xcode 里打开 `LiquidGlassDemoView.swift`,右边栏 Canvas → Resume Preview。

在真机 / 模拟器里预览:临时把 `RootView` 的某个 Tab 换成 `LiquidGlassDemoView()`(开发完记得改回)。

## 下沉改造(已完成)

为了不改动 5000+ 行业务代码,下列旧组件的内部实现已改用 `LiquidGlassCard`:

- `PrimaryCard(style:)` — `DesignSystem.swift`,内部使用 `.feature` style,按 `solid/glass/grouped` 派生色环与 border 动效。
- `HeroCard(gradient:height:corner:)` — `DesignSystem.swift`,内部使用 `.hero` style + Metal 噪声边。
- `GlowingMeshCard` / `GlowingMeshTile` — `LiquidGlass.swift`,在原 MeshGradient 基础上叠加流动光边。

业务视图(HomeView / CreateView / ProfileView / TemplatesView / SearchView)无需改动即可自动获得液态玻璃质感。
