import SwiftUI

// MARK: - LiquidGlassCard
/// 兔兔视觉 iOS 26 Liquid Glass 液态玻璃卡统一组件。
///
/// ## 材质栈(从下到上)
/// 1. 主题色派生的 `LinearGradient` / `MeshGradient`(displayP3 色域)
/// 2. `.ultraThinMaterial` — 底层漂浮模糊
/// 3. `.regularMaterial` — 顶层支撑对比
/// 4. 顶部 1/3 白色高光 `LinearGradient`(模拟环境光)
/// 5. 内描边 1pt white.opacity(0.25)
/// 6. 流动光边(2pt `AngularGradient` + rotationEffect)
/// 7. 外阴影 24pt 主题色 25%
///
/// ## API
/// ```swift
/// LiquidGlassCard(style: .hero, themeColors: [.orange, .purple]) {
///     Text("Hero content")
/// }
/// ```
///
/// iOS 26 会自动切换到原生 `.glassEffect()`,iOS 18–25 用手工合成版本。
/// Reduce Motion 开启时光边自动退化为静态渐变。

enum LiquidGlassCardStyle: Equatable {
    case hero
    case stat
    case feature
    case list

    var cornerRadius: CGFloat {
        switch self {
        case .hero:    return LiquidGlassMaterial.Corner.hero
        case .stat:    return LiquidGlassMaterial.Corner.stat
        case .feature: return LiquidGlassMaterial.Corner.feature
        case .list:    return LiquidGlassMaterial.Corner.list
        }
    }

    /// 默认 padding — 卡片内容与边的呼吸感。
    var defaultPadding: EdgeInsets {
        switch self {
        case .hero:    return EdgeInsets(top: 20, leading: 22, bottom: 20, trailing: 22)
        case .stat:    return EdgeInsets(top: 14, leading: 14, bottom: 14, trailing: 14)
        case .feature: return EdgeInsets(top: 18, leading: 18, bottom: 18, trailing: 18)
        case .list:    return EdgeInsets(top: 14, leading: 16, bottom: 14, trailing: 16)
        }
    }
}

// MARK: - LiquidGlassSurface
/// 两种纯净透明玻璃表面 —— 彻底的 Liquid Glass,不画彩色底,不画光弧,不画 noise。
/// 玻璃应该是**透明的**,卡片后面有什么应该能透出来。
///
/// - `.clear`:超透明玻璃 —— 只用 `.ultraThinMaterial`,能看到底层内容淡淡透过。
///   对应真正的 iOS 26 "Liquid Glass clear" 变体。适合放在有彩色/有图案的背景上。
///
/// - `.frosted`:磨砂玻璃 —— 白雾主导,透明度较低,便于文字可读。
///   适合普通浅色背景,类似 iOS 26 "Liquid Glass regular" 变体。
enum LiquidGlassSurface: Equatable {
    case clear
    case frosted
}

// 向后兼容 — 旧代码里的 .vivid 语义迁移到 .clear(真透明玻璃)。
extension LiquidGlassSurface {
    @available(*, deprecated, renamed: "clear", message: "Use .clear for true transparent liquid glass")
    static var vivid: LiquidGlassSurface { .clear }
}

// MARK: - LiquidGlassBlob
/// 卡片内部的"流体光晕"。参考 premium glassmorphism HTML:
/// 卡片背后自带 2~4 个 RadialGradient 圆球,再盖一层 40pt blur 玻璃,
/// 这样玻璃感不依赖页面底色,无论页面是白是灰都成立。
///
/// - `colors`: 径向渐变的 stops(中心 → 外环),通常 3-4 个,最外层透明
/// - `size`:   以点为单位的直径
/// - `offset`: 相对卡片中心的偏移(负值往左/上)
/// - `opacity`: 整体透明度,默认 1
struct LiquidGlassBlob: Equatable {
    let colors: [Color]
    let size: CGFloat
    let offset: CGSize
    let opacity: Double

    init(colors: [Color], size: CGFloat, offset: CGSize, opacity: Double = 1) {
        self.colors = colors
        self.size = size
        self.offset = offset
        self.opacity = opacity
    }
}

extension Array where Element == LiquidGlassBlob {
    // ─────────────────────────────────────────────────────────────────────
    // 色值对应 `/Users/lee/Downloads/UI 测试.html`
    // blob 尺寸放大、颜色更实,blur 18pt 模拟 backdrop-filter
    // ─────────────────────────────────────────────────────────────────────

    /// 粉紫流体
    static var pinkPurpleFluid: [LiquidGlassBlob] {
        [
            LiquidGlassBlob(
                colors: [
                    Color.white,
                    Color(red: 0.973, green: 0.831, blue: 0.902),
                    Color(red: 0.910, green: 0.659, blue: 0.816),
                    Color.clear
                ],
                size: 520, offset: CGSize(width: 100, height: -60)
            ),
            LiquidGlassBlob(
                colors: [
                    Color(red: 0.851, green: 0.722, blue: 0.941),
                    Color(red: 0.784, green: 0.616, blue: 0.941),
                    Color(red: 0.659, green: 0.498, blue: 0.847),
                    Color.clear
                ],
                size: 440, offset: CGSize(width: 120, height: 140)
            ),
            LiquidGlassBlob(
                colors: [
                    Color.white,
                    Color(red: 0.941, green: 0.847, blue: 0.910),
                    Color.clear
                ],
                size: 260, offset: CGSize(width: -100, height: 60), opacity: 0.85
            )
        ]
    }

    /// 蓝调流体
    static var blueFluid: [LiquidGlassBlob] {
        [
            LiquidGlassBlob(
                colors: [
                    Color(red: 0.831, green: 0.925, blue: 0.969),
                    Color(red: 0.722, green: 0.875, blue: 0.941),
                    Color(red: 0.620, green: 0.816, blue: 0.910),
                    Color.clear
                ],
                size: 580, offset: CGSize(width: 100, height: 120)
            ),
            LiquidGlassBlob(
                colors: [
                    Color.white,
                    Color(red: 0.910, green: 0.957, blue: 0.980),
                    Color.clear
                ],
                size: 340, offset: CGSize(width: -80, height: -40)
            )
        ]
    }

    /// 兔兔橙紫 — 品牌色流体
    static var brandFluid: [LiquidGlassBlob] {
        [
            LiquidGlassBlob(
                colors: [
                    Color.white,
                    Color(red: 0.992, green: 0.910, blue: 0.847),
                    Color(red: 0.973, green: 0.816, blue: 0.722),
                    Color.clear
                ],
                size: 560, offset: CGSize(width: 100, height: -60)
            ),
            LiquidGlassBlob(
                colors: [
                    Color(red: 0.910, green: 0.847, blue: 0.957),
                    Color(red: 0.831, green: 0.753, blue: 0.925),
                    Color.clear
                ],
                size: 440, offset: CGSize(width: -80, height: 100)
            )
        ]
    }
}

struct LiquidGlassCard<Content: View>: View {

    // MARK: Input
    private let style: LiquidGlassCardStyle
    private let surface: LiquidGlassSurface
    private let themeColors: [Color]
    private let borderAnimation: FlowingBorderStyle
    private let overrideCornerRadius: CGFloat?
    private let overridePadding: EdgeInsets?
    private let useMetalNoise: Bool
    /// 卡内"流体光晕"。非空 → 启用 premium 玻璃,空 → 纯净玻璃
    private let accentBlobs: [LiquidGlassBlob]
    /// 可选的背景图 — 业务成品图/模板封面,叠在玻璃层之下
    private let backgroundImage: Image?
    /// 背景图之上的暗罩强度(保护白字可读),0 不暗罩
    private let imageOverlay: Double
    private let content: Content

    @Environment(\.colorScheme) private var colorScheme

    // MARK: Init
    init(
        style: LiquidGlassCardStyle,
        surface: LiquidGlassSurface? = nil,
        themeColors: [Color] = LiquidGlassMaterial.brandP3,
        borderAnimation: FlowingBorderStyle = .static,
        cornerRadius: CGFloat? = nil,
        padding: EdgeInsets? = nil,
        useMetalNoise: Bool? = nil,
        accentBlobs: [LiquidGlassBlob] = [],
        backgroundImage: Image? = nil,
        imageOverlay: Double = 0,
        @ViewBuilder content: () -> Content
    ) {
        self.style = style
        self.surface = surface ?? .clear
        self.themeColors = themeColors
        self.borderAnimation = borderAnimation
        self.overrideCornerRadius = cornerRadius
        self.overridePadding = padding
        self.useMetalNoise = useMetalNoise ?? false
        self.accentBlobs = accentBlobs
        self.backgroundImage = backgroundImage
        self.imageOverlay = imageOverlay
        self.content = content()
    }

    // MARK: Derived
    private var corner: CGFloat {
        overrideCornerRadius ?? style.cornerRadius
    }

    private var padding: EdgeInsets {
        overridePadding ?? style.defaultPadding
    }

    // MARK: Body
    var body: some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(materialStack)
            .clipShape(RoundedRectangle(cornerRadius: corner, style: .continuous))
            // 两层阴影叠加 — HTML box-shadow: 0 30px 80px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)
            .shadow(
                color: shadowColorNear,
                radius: shadowRadiusNear,
                x: 0, y: shadowYNear
            )
            .shadow(
                color: shadowColorFar,
                radius: shadowRadiusFar,
                x: 0, y: shadowYFar
            )
    }

    // MARK: Shadow
    // HTML: box-shadow: 0 30px 80px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)
    private var shadowColorNear: Color {
        Color.black.opacity(colorScheme == .dark ? 0.20 : 0.04)
    }
    private var shadowRadiusNear: CGFloat { 3 }
    private var shadowYNear: CGFloat      { 2 }

    private var shadowColorFar: Color {
        Color.black.opacity(colorScheme == .dark ? 0.35 : 0.10)
    }
    private var shadowRadiusFar: CGFloat { 40 }
    private var shadowYFar: CGFloat      { 30 }

    // MARK: Material stack
    /// 四条路径(优先级从高到低):
    /// - `backgroundImage` + `accentBlobs` → **image + premium**(模板封面 + 彩色玻璃)
    /// - `backgroundImage` → 图片封面(图 + 极淡玻璃高光)
    /// - `accentBlobs 非空` → **Premium 玻璃**(卡内彩色流体 + 40pt blur + 饱和度增强)
    /// - `.clear` / `.frosted` → 纯净玻璃
    @ViewBuilder
    private var materialStack: some View {
        if let image = backgroundImage {
            imageStack(image, withBlobs: !accentBlobs.isEmpty)
        } else if !accentBlobs.isEmpty {
            premiumStack
        } else {
            switch surface {
            case .clear:   clearStack
            case .frosted: frostedStack
            }
        }
    }

    // MARK: Image stack (成品图封面卡)
    @ViewBuilder
    private func imageStack(_ image: Image, withBlobs: Bool) -> some View {
        ZStack {
            image
                .resizable()
                .scaledToFill()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .clipped()

            // 可选暗罩
            if imageOverlay > 0 {
                LinearGradient(
                    colors: [
                        Color.black.opacity(imageOverlay * 0.3),
                        Color.black.opacity(imageOverlay)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .allowsHitTesting(false)
            }

            // 如果也传了 blobs,在图上叠 premium 玻璃层(冬瓜变胡萝卜的那种高级玻璃)
            if withBlobs {
                blobLayer.opacity(0.7)
                glassOverlay.opacity(0.5)
            } else {
                // 极淡顶反光 — 玻璃厚度感
                GeometryReader { proxy in
                    LinearGradient(
                        colors: [Color.white.opacity(0.14), Color.white.opacity(0)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: proxy.size.height * 0.22)
                    .allowsHitTesting(false)
                }
            }
        }
    }

    // MARK: Premium (HTML glassmorphism 移植)
    /// 对应 HTML 里的玻璃结构:
    /// ```
    /// ZStack {
    ///   blobs:  多个 RadialGradient 圆球,blur 2px,卡内溢出
    ///   glass:  135° 白色对角渐变 (45%-25%-55%),叠 40pt blur + saturate 180%
    ///   inner stroke: 1pt rgba(255,255,255,0.7)
    /// }
    /// ```
    @ViewBuilder
    private var premiumStack: some View {
        ZStack {
            // 0) 奶白底色 — HTML `background: #F2F2F2`,深模式用 #1C1C1E
            (colorScheme == .dark
                ? Color(red: 0.110, green: 0.110, blue: 0.118)
                : Color(red: 0.949, green: 0.949, blue: 0.949))

            // 1) 卡内流体光晕层 — 超出卡片的部分被 clipShape 裁掉
            blobLayer

            // 2) 真正的玻璃层 — 白色 135° 渐变 + 背景模糊 + 饱和增强
            glassOverlay
        }
    }

    @ViewBuilder
    private var blobLayer: some View {
        ZStack {
            ForEach(0..<accentBlobs.count, id: \.self) { i in
                let blob = accentBlobs[i]
                Circle()
                    .fill(
                        RadialGradient(
                            colors: blob.colors,
                            center: .center,
                            startRadius: 0,
                            endRadius: blob.size / 2
                        )
                    )
                    .frame(width: blob.size, height: blob.size)
                    .opacity(blob.opacity)
                    .blur(radius: 18)
                    .offset(blob.offset)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    @ViewBuilder
    private var glassOverlay: some View {
        // HTML: linear-gradient(135deg, rgba(255,255,255, 0.45/0.25/0.55))
        //       + backdrop-filter: blur(40px) saturate(180%)
        // 不用 .ultraThinMaterial(它会额外加白),blob 自身 blur 25pt 已模拟 backdrop blur,
        // 这里只叠白色渐变 + saturation 增强色彩。
        let stops: [Gradient.Stop] = colorScheme == .dark
            ? [
                .init(color: Color.white.opacity(0.18), location: 0.0),
                .init(color: Color.white.opacity(0.08), location: 0.5),
                .init(color: Color.white.opacity(0.22), location: 1.0)
            ]
            : [
                .init(color: Color.white.opacity(0.45), location: 0.0),
                .init(color: Color.white.opacity(0.25), location: 0.5),
                .init(color: Color.white.opacity(0.55), location: 1.0)
            ]

        LinearGradient(
            stops: stops,
            startPoint: UnitPoint(x: 0, y: 0),
            endPoint:   UnitPoint(x: 1, y: 1)
        )
        .saturation(1.8)
    }

    // MARK: Clear (超透明玻璃)
    /// 核心:`.ultraThinMaterial` 主导,什么彩色都不加。
    /// 卡后面是什么(壁纸、mesh 背景、内容)就透过来什么。
    /// 唯一的"玻璃感"来源:材质折射 + 顶部极淡白光反射 + iOS 26 原生 glassEffect。
    @ViewBuilder
    private var clearStack: some View {
        ZStack {
            // 唯一的底:iOS 26 原生 glassEffect(真·Liquid Glass)
            // 或降级到 ultraThinMaterial(iOS 18~25)
            glassBase

            // 顶部一条极淡反光(不超过 12% 白),模拟玻璃厚度
            GeometryReader { proxy in
                LinearGradient(
                    colors: [Color.white.opacity(0.12), Color.white.opacity(0)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: proxy.size.height * 0.25)
                .allowsHitTesting(false)
            }
        }
    }

    // MARK: Frosted (磨砂白玻璃)
    /// 比 clear 更"实" —— 白雾较重,便于文字可读。
    /// 仍然不加彩色底 / 光弧 / 渗光。
    @ViewBuilder
    private var frostedStack: some View {
        ZStack {
            // 白色 systemBackground 做基底(暗模式自动切灰黑)
            RoundedRectangle(cornerRadius: corner, style: .continuous)
                .fill(Color(.systemBackground))
                .opacity(colorScheme == .dark ? 0.55 : 0.70)

            // ultraThin 叠加 — 给磨砂呼吸感
            glassBase
                .opacity(colorScheme == .dark ? 0.7 : 0.55)

            // 顶部极淡反光
            GeometryReader { proxy in
                LinearGradient(
                    colors: [Color.white.opacity(0.10), Color.white.opacity(0)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: proxy.size.height * 0.2)
                .allowsHitTesting(false)
            }
        }
    }

    /// 玻璃基底:iOS 26 用原生 `.glassEffect()`,iOS 18~25 fallback 到 `.ultraThinMaterial`。
    @ViewBuilder
    private var glassBase: some View {
        if #available(iOS 26.0, *) {
            RoundedRectangle(cornerRadius: corner, style: .continuous)
                .fill(Color.white.opacity(0.001))
                .glassEffect(.regular, in: .rect(cornerRadius: corner))
        } else {
            RoundedRectangle(cornerRadius: corner, style: .continuous)
                .fill(LiquidGlassMaterial.baseMaterial)
        }
    }
}

// MARK: - Convenience modifier
/// 把现有任意 View 快速包裹成 Liquid Glass 卡。
/// (方法名 `wrappedInLiquidGlass` 刻意避开 LiquidGlass.swift 里 `liquidGlassCard(cornerRadius:tint:)` 的旧 API,
/// 避免重载解析歧义。)
extension View {
    func wrappedInLiquidGlass(
        style: LiquidGlassCardStyle,
        themeColors: [Color] = LiquidGlassMaterial.brandP3,
        cornerRadius: CGFloat? = nil,
        padding: EdgeInsets? = nil
    ) -> some View {
        LiquidGlassCard(
            style: style,
            themeColors: themeColors,
            cornerRadius: cornerRadius,
            padding: padding
        ) { self }
    }
}

// MARK: - Bundle image helper
/// 从 Resources/Generated/<subfolder> 加载模板图,封装成 SwiftUI.Image。
/// 返回 nil 意味着文件找不到 —— 调用方可传 backgroundImage: .some(nil) 自动走无图回路
enum LiquidGlassImage {
    /// - Parameter path: 相对 `Resources/Generated/` 的路径
    static func load(_ path: String) -> Image? {
        guard let url = GeneratedMedia.url(path),
              let ui = UIImage(contentsOfFile: url.path) else { return nil }
        return Image(uiImage: ui)
    }

    /// 根据 template.id 查 Resources/Generated/Templates/ 里的图
    static func template(_ id: String) -> Image? {
        guard let path = TemplateVisualBook.assetPath(for: id) else { return nil }
        return load(path)
    }
}
