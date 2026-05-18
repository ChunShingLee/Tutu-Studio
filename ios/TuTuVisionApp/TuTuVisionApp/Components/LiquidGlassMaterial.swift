import SwiftUI

// MARK: - Liquid Glass Material Tokens
/// 兔兔 iOS 26 Liquid Glass 材质规范常量。
///
/// 设计目标:
/// - 双层 Material 叠加:`.ultraThinMaterial` + `.regularMaterial`。
/// - 渐变从主题色派生,启用 displayP3 色域以获得更饱和的彩色玻璃。
/// - 顶部 1/3 白色高光渐变,模拟环境光折射。
/// - 圆角 28pt continuous corner,外阴影 24pt,25% 主题色透明度。
/// - 暗黑模式下整体饱和度降低 15%。
enum LiquidGlassMaterial {

    // MARK: Geometry
    enum Corner {
        static let hero: CGFloat       = 28
        static let feature: CGFloat    = 24
        static let stat: CGFloat       = 22
        static let list: CGFloat       = 20
    }

    enum Border {
        /// inner stroke 宽度。
        static let innerStrokeWidth: CGFloat = 1
        /// 流动光边占用的宽度(stroke mask 限制在此宽度内)。
        static let flowingWidth: CGFloat = 2
        static let innerStrokeOpacity: Double = 0.25
    }

    enum Shadow {
        static let radius: CGFloat  = 24
        static let yOffset: CGFloat = 10
        static let opacity: Double  = 0.25
    }

    enum Specular {
        /// 顶部高光的相对高度(整张卡 1/3)。
        static let topHighlightRatio: CGFloat = 1.0 / 3.0
        static let highlightOpacity: Double   = 0.28
    }

    // MARK: Materials
    /// 底层 base — 柔和半透明漂浮感。
    static let baseMaterial: Material    = .ultraThinMaterial
    /// 顶层 overlay — 增加密度 / 支撑文字对比。
    static let overlayMaterial: Material = .regularMaterial

    // MARK: Animation
    enum Motion {
        /// 流动光边的循环周期(秒)。
        static let flowingPeriod: Double = 5.4
        /// Pulse 模式的呼吸周期。
        static let pulsePeriod:   Double = 2.6
    }

    // MARK: Theme Colors (displayP3)
    /// 默认彩虹光环 — 使用 displayP3 获得 Apple 原生液态玻璃那种饱和度。
    static let rainbowP3: [Color] = [
        Color(.displayP3, red: 1.00, green: 0.42, blue: 0.72, opacity: 1.0), // pink
        Color(.displayP3, red: 0.56, green: 0.38, blue: 1.00, opacity: 1.0), // purple
        Color(.displayP3, red: 0.30, green: 0.58, blue: 1.00, opacity: 1.0), // blue
        Color(.displayP3, red: 0.28, green: 0.92, blue: 0.94, opacity: 1.0), // cyan
        Color(.displayP3, red: 1.00, green: 0.42, blue: 0.72, opacity: 1.0)  // pink(闭合)
    ]

    /// 兔兔品牌色环 — 默认 hero 用。
    static let brandP3: [Color] = [
        Color(.displayP3, red: 1.00, green: 0.42, blue: 0.21, opacity: 1.0), // orange
        Color(.displayP3, red: 1.00, green: 0.55, blue: 0.36, opacity: 1.0), // coral
        Color(.displayP3, red: 0.48, green: 0.38, blue: 1.00, opacity: 1.0), // violet
        Color(.displayP3, red: 0.56, green: 0.46, blue: 1.00, opacity: 1.0), // soft purple
        Color(.displayP3, red: 1.00, green: 0.42, blue: 0.21, opacity: 1.0)
    ]

    /// 给定主题色,生成一个闭合(首尾相同)的 5 色环,适合 AngularGradient。
    static func closedRing(from base: [Color]) -> [Color] {
        guard let first = base.first, base.count >= 2 else {
            return rainbowP3
        }
        return base + [first]
    }

    /// 暗黑模式下把颜色饱和度降低 15%。
    static func adjustedForDarkMode(_ colors: [Color], isDark: Bool) -> [Color] {
        guard isDark else { return colors }
        return colors.map { $0.desaturated(by: 0.15) }
    }
}

// MARK: - Color helpers
extension Color {
    /// HSB 饱和度下调。iOS 14+ 用 UIColor 通路。
    func desaturated(by amount: Double) -> Color {
        #if canImport(UIKit)
        let ui = UIColor(self)
        var h: CGFloat = 0, s: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        if ui.getHue(&h, saturation: &s, brightness: &b, alpha: &a) {
            let newS = max(0, s - CGFloat(amount))
            return Color(hue: Double(h), saturation: Double(newS), brightness: Double(b), opacity: Double(a))
        }
        return self
        #else
        return self
        #endif
    }

    /// HSB 亮度上调(有上限 1.0)。用于从主题色派生顶部高光色。
    func lightened(by amount: Double) -> Color {
        #if canImport(UIKit)
        let ui = UIColor(self)
        var h: CGFloat = 0, s: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        if ui.getHue(&h, saturation: &s, brightness: &b, alpha: &a) {
            let newB = min(1.0, b + CGFloat(amount))
            return Color(hue: Double(h), saturation: Double(s), brightness: Double(newB), opacity: Double(a))
        }
        return self
        #else
        return self
        #endif
    }

    /// 从主题色派生一个 5 色闭合环(主题色 → 亮化 → 冷调 → 暗化 → 主题色)。
    /// 用于在 themeColors 只给一个颜色时,自动产生有层次的流动光环。
    static func derivedRing(from color: Color) -> [Color] {
        #if canImport(UIKit)
        let ui = UIColor(color)
        var h: CGFloat = 0, s: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        ui.getHue(&h, saturation: &s, brightness: &b, alpha: &a)

        func rotate(_ hue: CGFloat, by degrees: Double) -> CGFloat {
            var result = hue + CGFloat(degrees / 360.0)
            while result > 1 { result -= 1 }
            while result < 0 { result += 1 }
            return result
        }

        let warm  = Color(hue: Double(h),              saturation: Double(s),               brightness: Double(min(1, b + 0.08)), opacity: Double(a))
        let shift = Color(hue: Double(rotate(h, by: 30)),  saturation: Double(min(1, s + 0.08)), brightness: Double(b),          opacity: Double(a))
        let cool  = Color(hue: Double(rotate(h, by: -45)), saturation: Double(s),               brightness: Double(min(1, b + 0.05)), opacity: Double(a))
        let deep  = Color(hue: Double(rotate(h, by: 20)),  saturation: Double(min(1, s + 0.1)),  brightness: Double(max(0.2, b - 0.08)), opacity: Double(a))

        return [warm, shift, cool, deep, warm]
        #else
        return [color, color, color, color, color]
        #endif
    }
}
