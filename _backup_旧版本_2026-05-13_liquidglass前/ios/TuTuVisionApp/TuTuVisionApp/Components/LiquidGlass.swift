import SwiftUI

// MARK: - Animated Mesh Background
/// iOS 26 风格流动渐变背景。底层基于 `MeshGradient`（iOS 18+），
/// 低版本自动降级为三角径向渐变叠加，依然保留慢循环呼吸感。
struct AnimatedMeshBackground: View {
    enum Palette {
        case brand          // 兔兔主橙紫
        case sunrise        // 暖橙 + 金黄 + 珊瑚
        case dawn           // 橙 + 紫
        case aurora         // 紫 + 蓝 + 青
        case verdant        // 青 + 黄
        case neutral        // 浅色渐变（白底偏好）
        case custom([Color])

        var colors: [Color] {
            switch self {
            case .brand:
                return [
                    Color(hex: 0xFF9F6E), Color(hex: 0xFF6B35), Color(hex: 0xFF5A9E),
                    Color(hex: 0xFFB28E), Color(hex: 0xF58BCF), Color(hex: 0x9F7BFF),
                    Color(hex: 0xFFD9B8), Color(hex: 0xC9A7FF), Color(hex: 0x7B61FF)
                ]
            case .sunrise:
                return [
                    Color(hex: 0xFFB88A), Color(hex: 0xFF8560), Color(hex: 0xE75939),
                    Color(hex: 0xFFA671), Color(hex: 0xFF7547), Color(hex: 0xD14A6D),
                    Color(hex: 0xFF9258), Color(hex: 0xF26B4B), Color(hex: 0xAF348C)
                ]
            case .dawn:
                return [
                    Color(hex: 0xFFD1B5), Color(hex: 0xFF9C6D), Color(hex: 0xFF6B7A),
                    Color(hex: 0xFFB08A), Color(hex: 0xE37BAA), Color(hex: 0xA171FF),
                    Color(hex: 0xFFE0C4), Color(hex: 0xC295FF), Color(hex: 0x7B61FF)
                ]
            case .aurora:
                return [
                    Color(hex: 0x8DA2FF), Color(hex: 0x7B61FF), Color(hex: 0x54C4FF),
                    Color(hex: 0xB1A5FF), Color(hex: 0x9F7BFF), Color(hex: 0x5DE5D0),
                    Color(hex: 0xD7E1FF), Color(hex: 0x7EADFF), Color(hex: 0x4FC0A8)
                ]
            case .verdant:
                return [
                    Color(hex: 0x8FE3B8), Color(hex: 0x3BB790), Color(hex: 0x22876B),
                    Color(hex: 0xCFE99A), Color(hex: 0x5EC9A6), Color(hex: 0x1E8C7A),
                    Color(hex: 0xB9E28A), Color(hex: 0x3FA88E), Color(hex: 0x146F5B)
                ]
            case .neutral:
                return [
                    Color.white, Color(hex: 0xFFF3EB), Color(hex: 0xF4E8FF),
                    Color(hex: 0xFFF9F3), Color(hex: 0xFFE7D3), Color(hex: 0xE8DCFF),
                    Color.white, Color(hex: 0xFFF4E4), Color(hex: 0xE3D7FF)
                ]
            case .custom(let colors):
                return colors.count >= 9 ? Array(colors.prefix(9)) : (colors + Array(repeating: colors.last ?? .white, count: max(0, 9 - colors.count)))
            }
        }
    }

    var palette: Palette = .brand
    var animated: Bool = true
    /// 动画周期；越大越柔和，越不刺眼。
    var duration: Double = 9
    /// 颜色整体亮度缩放（0~1.2），用于在浅色底上做柔和 wash。
    var intensity: Double = 1.0

    var body: some View {
        if #available(iOS 18.0, *) {
            MeshBody(colors: palette.colors, animated: animated, duration: duration, intensity: intensity)
        } else {
            LegacyBody(colors: palette.colors, animated: animated, duration: duration, intensity: intensity)
        }
    }

    @available(iOS 18.0, *)
    private struct MeshBody: View {
        let colors: [Color]
        let animated: Bool
        let duration: Double
        let intensity: Double

        var body: some View {
            // 关键：边缘 8 个点固定在 0 / 0.5 / 1，保证 mesh 在 clip 里不会凸凹变形；
            // 只让中心 1 个点小范围漂移，再让颜色随时间循环，就能做出流动感。
            TimelineView(.animation(minimumInterval: animated ? 1.0 / 20.0 : nil, paused: !animated)) { context in
                let t: Float = animated ? Float(context.date.timeIntervalSinceReferenceDate) : 0
                let durationF = Float(duration)
                let phase = sin(t * 2 * .pi / durationF)
                let phase2 = cos(t * 2 * .pi / (durationF * 1.4))

                MeshGradient(
                    width: 3,
                    height: 3,
                    points: [
                        SIMD2<Float>(0.0, 0.0),
                        SIMD2<Float>(0.5, 0.0),
                        SIMD2<Float>(1.0, 0.0),
                        SIMD2<Float>(0.0, 0.5),
                        // 只动中心点，且幅度严格 < 0.12，保证不会压到角
                        SIMD2<Float>(0.5 + 0.12 * phase, 0.5 + 0.1 * phase2),
                        SIMD2<Float>(1.0, 0.5),
                        SIMD2<Float>(0.0, 1.0),
                        SIMD2<Float>(0.5, 1.0),
                        SIMD2<Float>(1.0, 1.0)
                    ],
                    colors: rotatedColors(base: colors, phase: t, duration: durationF)
                )
            }
        }

        /// 把颜色数组随时间做环形"旋转"，在不动点的情况下也能感觉到颜色在流动。
        /// 用连续混合（不是离散换色）避免闪烁。
        private func rotatedColors(base: [Color], phase: Float, duration: Float) -> [Color] {
            let normalized = intensity == 1.0 ? base : base.map { $0.opacity(min(1, max(0.3, intensity))) }
            guard normalized.count == 9, animated else { return normalized }

            // 让中心点颜色在相邻三色之间平滑过渡，其它格保持原色；
            // 中心点是感知最强的一格，动它最经济。
            let cycle = sin(phase * 2 * .pi / (duration * 1.6)) * 0.5 + 0.5  // 0~1
            let a = normalized[0]
            let b = normalized[4]
            let c = normalized[8]
            let centerColor = cycle < 0.5
                ? mix(a, b, t: Double(cycle * 2))
                : mix(b, c, t: Double((cycle - 0.5) * 2))

            var result = normalized
            result[4] = centerColor
            return result
        }

        private func mix(_ lhs: Color, _ rhs: Color, t: Double) -> Color {
            let t = max(0, min(1, t))
            #if canImport(UIKit)
            let l = UIColor(lhs)
            let r = UIColor(rhs)
            var lr: CGFloat = 0, lg: CGFloat = 0, lb: CGFloat = 0, la: CGFloat = 0
            var rr: CGFloat = 0, rg: CGFloat = 0, rb: CGFloat = 0, ra: CGFloat = 0
            l.getRed(&lr, green: &lg, blue: &lb, alpha: &la)
            r.getRed(&rr, green: &rg, blue: &rb, alpha: &ra)
            return Color(
                red: Double(lr) * (1 - t) + Double(rr) * t,
                green: Double(lg) * (1 - t) + Double(rg) * t,
                blue: Double(lb) * (1 - t) + Double(rb) * t,
                opacity: Double(la) * (1 - t) + Double(ra) * t
            )
            #else
            return t < 0.5 ? lhs : rhs
            #endif
        }
    }

    private struct LegacyBody: View {
        let colors: [Color]
        let animated: Bool
        let duration: Double
        let intensity: Double

        @State private var pulse = false

        var body: some View {
            let primary = colors.first ?? .orange
            let accent = colors.count > 4 ? colors[4] : .purple
            let closing = colors.last ?? .white

            LinearGradient(colors: [primary, closing], startPoint: .topLeading, endPoint: .bottomTrailing)
                .overlay(alignment: .topLeading) {
                    Circle()
                        .fill(primary.opacity(0.42 * intensity))
                        .frame(width: 260, height: 260)
                        .blur(radius: 60)
                        .offset(x: pulse ? -60 : -120, y: -40)
                }
                .overlay(alignment: .bottomTrailing) {
                    Circle()
                        .fill(accent.opacity(0.38 * intensity))
                        .frame(width: 260, height: 260)
                        .blur(radius: 64)
                        .offset(x: pulse ? 60 : 120, y: 40)
                }
                .onAppear {
                    guard animated else { return }
                    withAnimation(.easeInOut(duration: duration).repeatForever(autoreverses: true)) {
                        pulse.toggle()
                    }
                }
        }
    }
}

// MARK: - Liquid Glass Modifier
/// iOS 26 Liquid Glass 容器：在支持平台上使用原生 `.glassEffect`；
/// 低版本自动降级为 `.ultraThinMaterial + 柔边`，保持一致视觉。
extension View {
    /// 常规玻璃容器（内容卡、模块背景）。
    @ViewBuilder
    func liquidGlassCard(cornerRadius: CGFloat = TuTuRadius.primary, tint: Color? = nil) -> some View {
        if #available(iOS 26.0, *) {
            self
                .glassEffect(
                    tint.map { .regular.tint($0.opacity(0.28)) } ?? .regular,
                    in: .rect(cornerRadius: cornerRadius)
                )
        } else {
            self
                .background(alignment: .center) {
                    ZStack {
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .fill(.ultraThinMaterial)

                        if let tint {
                            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                                .fill(tint.opacity(0.14))
                        }
                    }
                }
                .overlay {
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .stroke(Color.white.opacity(0.55), lineWidth: 0.5)
                }
        }
    }

    /// 突出的互动玻璃容器（CTA、Hero 元素），带描边。
    @ViewBuilder
    func liquidGlassProminent(cornerRadius: CGFloat = TuTuRadius.card, tint: Color = TuTuColor.orange) -> some View {
        if #available(iOS 26.0, *) {
            self
                .glassEffect(
                    .regular.tint(tint.opacity(0.42)).interactive(),
                    in: .rect(cornerRadius: cornerRadius)
                )
        } else {
            self
                .background(tint.opacity(0.18), in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .stroke(tint.opacity(0.32), lineWidth: 1)
                }
        }
    }

    /// Capsule 形状的玻璃按钮/Chip。
    @ViewBuilder
    func liquidGlassCapsule(tint: Color? = nil, interactive: Bool = false) -> some View {
        if #available(iOS 26.0, *) {
            if interactive {
                self.glassEffect(
                    tint.map { .regular.tint($0.opacity(0.36)).interactive() } ?? .regular.interactive(),
                    in: .capsule
                )
            } else {
                self.glassEffect(
                    tint.map { .regular.tint($0.opacity(0.28)) } ?? .regular,
                    in: .capsule
                )
            }
        } else {
            self
                .background((tint ?? .white).opacity(0.18), in: Capsule())
                .overlay { Capsule().stroke((tint ?? .white).opacity(0.28), lineWidth: 0.5) }
        }
    }
}

// MARK: - Glowing Mesh Card
/// 带流动渐变背景 + Liquid Glass 前景的高亮卡。
/// 用于今日额度、今日灵感、创作 Hero、订阅 CTA 等"需要被注意到"的模块。
struct GlowingMeshCard<Content: View>: View {
    var palette: AnimatedMeshBackground.Palette = .brand
    var cornerRadius: CGFloat = TuTuRadius.hero
    var padding: CGFloat = 18
    var height: CGFloat? = nil
    var animated: Bool = true
    @ViewBuilder var content: () -> Content

    var body: some View {
        ZStack {
            AnimatedMeshBackground(palette: palette, animated: animated, duration: 11)
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))

            // 柔光高光（白色在左上角、深色在右下角），增加 3D 质感
            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.16), Color.white.opacity(0), Color.black.opacity(0.06)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            content()
                .padding(padding)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
        .shadow(color: Color.black.opacity(0.08), radius: 14, y: 8)
    }
}

// MARK: - Glowing Mesh Tile
/// 用于首页「今日额度」等四宫格色彩化 tile；更紧凑的 mesh 方块。
struct GlowingMeshTile<Content: View>: View {
    var palette: AnimatedMeshBackground.Palette
    var cornerRadius: CGFloat = TuTuRadius.card
    var padding: CGFloat = 14
    var animated: Bool = true
    @ViewBuilder var content: () -> Content

    var body: some View {
        ZStack(alignment: .topLeading) {
            AnimatedMeshBackground(palette: palette, animated: animated, duration: 12, intensity: 0.96)
            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.18), Color.white.opacity(0)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            content()
                .padding(padding)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
        .shadow(color: Color.black.opacity(0.06), radius: 8, y: 3)
    }
}

// MARK: - Liquid Glass Metric Chip
/// Hero 卡片里放在顶部的小彩色 capsule，替代原来的 HeroMetric。
struct LiquidGlassMetric: View {
    let title: String
    var systemImage: String? = nil
    var tint: Color = .white

    var body: some View {
        HStack(spacing: 6) {
            if let systemImage {
                Image(systemName: systemImage)
                    .font(.caption.weight(.bold))
            }
            Text(title)
                .font(.caption.weight(.semibold))
                .lineLimit(1)
        }
        .foregroundStyle(tint)
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .liquidGlassCapsule(tint: tint)
    }
}

// MARK: - PhaseAnimator Helper (iOS 17+)
/// 卡片入场/轻微呼吸动画。
extension View {
    @ViewBuilder
    func softBreathing(active: Bool = true, minScale: CGFloat = 0.995, maxScale: CGFloat = 1.005) -> some View {
        if active, #available(iOS 17.0, *) {
            self.phaseAnimator([false, true]) { view, active in
                view.scaleEffect(active ? maxScale : minScale)
            } animation: { _ in
                .easeInOut(duration: 4.2)
            }
        } else {
            self
        }
    }
}
