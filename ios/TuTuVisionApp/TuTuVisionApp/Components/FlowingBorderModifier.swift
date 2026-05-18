import SwiftUI

// MARK: - Flowing Border
/// 兔兔流动光边动效
/// ------------------------------------------------------------
/// 做法:把 `AngularGradient` 填充到一个 `RoundedRectangle.stroke`(宽度 2pt)里,
/// 再用 `rotationEffect` 做 0→360° 的 linear repeatForever 旋转。
/// 结果:一圈彩色光环沿卡片边缘匀速流动,像 iOS 26 Liquid Glass 的折射环。
///
/// 支持三种模式:
///   • `.flowing` — 默认,角向渐变循环旋转
///   • `.pulse`   — 同一色环,宽度随时间轻微呼吸
///   • `.static`  — 静态描边(Reduce Motion 启用时自动降级到这里)
///
/// Hero 卡可另外叠加 Metal Shader 做液态噪声(见 `LiquidNoiseBorderMetalModifier`)。

enum FlowingBorderStyle: Equatable {
    case flowing
    case pulse
    case `static`
}

struct FlowingBorderModifier: ViewModifier {
    let style: FlowingBorderStyle
    let cornerRadius: CGFloat
    let colors: [Color]
    let width: CGFloat
    let period: Double

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content.overlay(borderOverlay)
    }

    @ViewBuilder
    private var borderOverlay: some View {
        let effective: FlowingBorderStyle = reduceMotion ? .static : style

        switch effective {
        case .flowing:
            FlowingBorderShape(
                cornerRadius: cornerRadius,
                colors: colors,
                width: width,
                period: period
            )

        case .pulse:
            PulsingBorderShape(
                cornerRadius: cornerRadius,
                colors: colors,
                width: width,
                period: period
            )

        case .static:
            StaticBorderShape(
                cornerRadius: cornerRadius,
                colors: colors,
                width: width
            )
        }
    }
}

// MARK: - Flowing (旋转光环)

private struct FlowingBorderShape: View {
    let cornerRadius: CGFloat
    let colors: [Color]
    let width: CGFloat
    let period: Double

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { context in
            let t = context.date.timeIntervalSinceReferenceDate
            // 0 → 2π, 一个 period 转一圈,用取模保持稳定。
            let angle = (t.truncatingRemainder(dividingBy: period)) / period * 360.0

            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                .strokeBorder(
                    AngularGradient(
                        gradient: Gradient(colors: colors),
                        center: .center
                    ),
                    lineWidth: width
                )
                .rotationEffect(.degrees(angle))
                .compositingGroup()
                .blendMode(.plusLighter) // 让光环在深色/浅色卡上都发亮
                .allowsHitTesting(false)
        }
    }
}

// MARK: - Pulse (静止环 + 宽度呼吸)

private struct PulsingBorderShape: View {
    let cornerRadius: CGFloat
    let colors: [Color]
    let width: CGFloat
    let period: Double

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { context in
            let t = context.date.timeIntervalSinceReferenceDate
            let phase = sin(t * 2 * .pi / period) * 0.5 + 0.5 // 0~1
            let lineWidth = width * (0.7 + 0.6 * phase) // 0.7w ~ 1.3w

            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                .strokeBorder(
                    AngularGradient(
                        gradient: Gradient(colors: colors),
                        center: .center
                    ),
                    lineWidth: lineWidth
                )
                .opacity(0.65 + 0.35 * phase)
                .compositingGroup()
                .blendMode(.plusLighter)
                .allowsHitTesting(false)
        }
    }
}

// MARK: - Static (Reduce Motion fallback + 默认推荐玻璃观感)
/// 专业玻璃边 — 顶部强白、侧面主题色、底部柔暗。
/// 参考 Apple 原生 Liquid Glass 的静态描边:像顶光打在玻璃球边上,
/// 反光从 12 点钟最亮、3/9 点钟混彩、6 点钟最暗。
private struct StaticBorderShape: View {
    let cornerRadius: CGFloat
    let colors: [Color]
    let width: CGFloat

    var body: some View {
        // 取 ring 中段两色做彩边,不用全彩虹,避免过花
        let midA = colors.count >= 2 ? colors[1] : (colors.first ?? .white)
        let midB = colors.count >= 3 ? colors[2] : midA

        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            .strokeBorder(
                LinearGradient(
                    stops: [
                        // 12 点钟附近:强白高光(顶面反光)
                        .init(color: Color.white.opacity(0.85), location: 0.0),
                        .init(color: Color.white.opacity(0.55), location: 0.15),
                        // 3~9 点钟:融入主题色
                        .init(color: midA.opacity(0.55),       location: 0.45),
                        .init(color: midB.opacity(0.50),       location: 0.70),
                        // 6 点钟:柔暗,模拟阴影
                        .init(color: Color.black.opacity(0.15), location: 1.0)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                ),
                lineWidth: width
            )
            .allowsHitTesting(false)
    }
}

// MARK: - Metal Liquid Noise Border (Hero 卡可选)
/// iOS 17+ 的 `.colorEffect(ShaderLibrary.xxx(...))` 可以直接挂一个片元 shader。
/// 这里我们用自带的 `FlowingBorder.metal` 在角向渐变上再叠一层液态噪声扰动,
/// 让 Hero 卡的光边看起来像在"呼吸"而不是机械旋转。
///
/// 低于 iOS 17 时,fallback 回 `.flowing`。
@available(iOS 17.0, *)
struct LiquidNoiseBorderModifier: ViewModifier {
    let cornerRadius: CGFloat
    let colors: [Color]
    let width: CGFloat
    let period: Double

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        guard !reduceMotion else {
            return AnyView(
                content.overlay(
                    StaticBorderShape(
                        cornerRadius: cornerRadius,
                        colors: colors,
                        width: width
                    )
                )
            )
        }

        return AnyView(
            content.overlay(
                TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { context in
                    let t = context.date.timeIntervalSinceReferenceDate
                    let angle = (t.truncatingRemainder(dividingBy: period)) / period * 360.0

                    // 角向渐变作为底
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .strokeBorder(
                            AngularGradient(
                                gradient: Gradient(colors: colors),
                                center: .center
                            ),
                            lineWidth: width * 1.5
                        )
                        .rotationEffect(.degrees(angle))
                        // colorEffect Shader — 在 RGBA 层上做液态噪声扰动。
                        // Shader 位于 FlowingBorder.metal; 若工程未链接 Metal file,
                        // colorEffect 会静默失败,效果退化为纯 AngularGradient 流动。
                        .colorEffect(
                            ShaderLibrary.default.liquidNoiseBorder(
                                .float(Float(t)),
                                .float(Float(period))
                            )
                        )
                        .blendMode(.plusLighter)
                        .allowsHitTesting(false)
                }
            )
        )
    }
}

// MARK: - View extension

extension View {
    /// 流动光边。默认使用 `.flowing` 角向渐变旋转。
    /// - Parameters:
    ///   - style: 流动 / 呼吸 / 静态。Reduce Motion 开启时自动降级为 `.static`。
    ///   - cornerRadius: 与卡片圆角保持一致。
    ///   - colors: 环形色带,首尾同色可获得无缝闭环。若少于 2 个色,会自动用默认彩虹环。
    ///   - width: 描边宽度,默认 2pt,限制在 stroke mask 内。
    ///   - period: 循环周期(秒),默认 5.4s。
    func flowingBorder(
        style: FlowingBorderStyle = .flowing,
        cornerRadius: CGFloat,
        colors: [Color] = LiquidGlassMaterial.rainbowP3,
        width: CGFloat = LiquidGlassMaterial.Border.flowingWidth,
        period: Double = LiquidGlassMaterial.Motion.flowingPeriod
    ) -> some View {
        let palette: [Color] = colors.count >= 2 ? colors : LiquidGlassMaterial.rainbowP3
        return modifier(
            FlowingBorderModifier(
                style: style,
                cornerRadius: cornerRadius,
                colors: palette,
                width: width,
                period: period
            )
        )
    }

    /// Hero 卡专用:带 Metal 液态噪声的流动边(iOS 17+)。
    /// iOS 16 或 Reduce Motion 启用时会自动退化为 `.flowing` / `.static`。
    @ViewBuilder
    func liquidNoiseBorder(
        cornerRadius: CGFloat,
        colors: [Color] = LiquidGlassMaterial.rainbowP3,
        width: CGFloat = LiquidGlassMaterial.Border.flowingWidth,
        period: Double = LiquidGlassMaterial.Motion.flowingPeriod
    ) -> some View {
        if #available(iOS 17.0, *) {
            self.modifier(
                LiquidNoiseBorderModifier(
                    cornerRadius: cornerRadius,
                    colors: colors.count >= 2 ? colors : LiquidGlassMaterial.rainbowP3,
                    width: width,
                    period: period
                )
            )
        } else {
            self.flowingBorder(style: .flowing, cornerRadius: cornerRadius, colors: colors, width: width, period: period)
        }
    }
}
