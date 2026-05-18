import SwiftUI

// MARK: - LiquidGlass Demo View
/// 展示 `LiquidGlassCard` 四种 style 的完整演示页。
///
/// 在 Xcode 里可用以下方式查看:
/// 1. 右键文件 → Show Preview
/// 2. 或在 `RootView.swift` 里把 TabView 的某一项临时换成 `LiquidGlassDemoView()`
///
/// 也提供 Tab 页直接切换单卡/多卡/深浅色场景。

struct LiquidGlassDemoView: View {

    enum Scene: String, CaseIterable, Identifiable {
        case gallery   = "四种样式"
        case premium   = "Premium"
        case stress    = "10 卡同屏"
        case palettes  = "主题色"
        var id: String { rawValue }
    }

    @State private var scene: Scene = .gallery
    @State private var forceDark = false
    @State private var surface: LiquidGlassSurface = .clear

    var body: some View {
        NavigationStack {
            ZStack {
                backgroundLayer
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        controls
                        Group {
                            switch scene {
                            case .gallery:  gallery
                            case .premium:  premiumShowcase
                            case .stress:   stressGrid
                            case .palettes: paletteGrid
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("Liquid Glass")
            .navigationBarTitleDisplayMode(.inline)
        }
        .preferredColorScheme(forceDark ? .dark : nil)
    }

    // MARK: Background
    // 对标 HTML 的 premium glassmorphism 场景:浅模式是 #EAEAEA 浅灰,
    // 深模式自动切到近黑。卡片内部自带流体色晕,玻璃质感不依赖页面背景。
    private var backgroundLayer: some View {
        DesignTokens.Colors.background
    }

    // MARK: Controls
    private var controls: some View {
        VStack(spacing: 12) {
            Picker("", selection: $scene) {
                ForEach(Scene.allCases) { s in Text(s.rawValue).tag(s) }
            }
            .pickerStyle(.segmented)

            HStack(spacing: 12) {
                // 表面切换
                Picker("表面", selection: $surface) {
                    Text("Clear 透明玻璃").tag(LiquidGlassSurface.clear)
                    Text("Frosted 磨砂白").tag(LiquidGlassSurface.frosted)
                }
                .pickerStyle(.segmented)

                Toggle(isOn: $forceDark) {
                    Image(systemName: forceDark ? "moon.fill" : "sun.max.fill")
                }
                .toggleStyle(.button)
                .tint(.purple)
            }
        }
    }

    // MARK: Gallery
    private var gallery: some View {
        VStack(spacing: 20) {
            heroCard

            HStack(spacing: 12) {
                statCard(icon: "sparkles",    number: "128",  label: "今日生成", colors: [.orange, .pink])
                statCard(icon: "heart.fill",  number: "36",   label: "收藏",    colors: [.pink, .purple])
                statCard(icon: "clock.fill",  number: "4.2",  label: "均耗时",  colors: [.blue, .cyan])
                statCard(icon: "star.fill",   number: "98",   label: "积分",    colors: [.yellow, .orange])
            }
            .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 12) {
                featureCard(icon: "paintbrush.fill",
                            title: "主图生成",
                            description: "上传样品图,一键替换背景、光源与文案。",
                            tag: "电商转化",
                            colors: [.orange, .coral])
                featureCard(icon: "sparkle",
                            title: "灵感广场",
                            description: "2.8w 位设计师的流行模板,一键继续创作。",
                            tag: "社区",
                            colors: [.purple, .cyan])
            }
            .fixedSize(horizontal: false, vertical: true)

            VStack(spacing: 10) {
                listRow(icon: "photo.stack.fill",     title: "我的素材库",        subtitle: "84 张 · 2.3GB")
                listRow(icon: "rectangle.stack.fill", title: "项目 / 历史记录",     subtitle: "9 个进行中")
                listRow(icon: "crown.fill",           title: "Premium 订阅",      subtitle: "剩余 12 天",     colors: [.yellow, .orange])
            }
        }
    }

    // MARK: Premium (Glassmorphism HTML 对标)
    /// 完整复刻 Chloe Harrison 设计师名片的两张版本:
    /// - 蓝调流体玻璃(HTML 里的 .profile-card.blue)
    /// - 粉紫流体玻璃(HTML 里的 .profile-card 默认版)
    private var premiumShowcase: some View {
        VStack(spacing: 28) {
            profileCard(blobs: .blueFluid,      subtitle: "Blue Fluid · 蓝调流体")
            profileCard(blobs: .pinkPurpleFluid, subtitle: "Pink Purple Fluid · 粉紫流体")
            profileCard(blobs: .brandFluid,     subtitle: "Brand Fluid · 兔兔橙紫")
        }
    }

    @ViewBuilder
    private func profileCard(blobs: [LiquidGlassBlob], subtitle: String) -> some View {
        LiquidGlassCard(
            style: .feature,
            themeColors: [],
            borderAnimation: .static,
            cornerRadius: 32,                                 // HTML border-radius: 32px
            padding: EdgeInsets(top: 28, leading: 28, bottom: 28, trailing: 28),
            accentBlobs: blobs
        ) {
            VStack(alignment: .leading, spacing: 18) {
                // Avatar + share
                HStack(alignment: .top) {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(.displayP3, red: 0.78, green: 0.89, blue: 0.96, opacity: 1),
                                    Color(.displayP3, red: 0.66, green: 0.82, blue: 0.91, opacity: 1)
                                ],
                                startPoint: .topLeading, endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 76, height: 76)
                        .overlay(
                            Image(systemName: "person.fill")
                                .font(.system(size: 32))
                                .foregroundStyle(Color.white.opacity(0.6))
                        )
                        .overlay(
                            Circle().stroke(Color.white.opacity(0.8), lineWidth: 2)
                        )
                        .shadow(color: Color.black.opacity(0.06), radius: 12, y: 4)

                    Spacer()
                    Image(systemName: "square.and.arrow.up")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Color.primary.opacity(0.85))
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Chloe Harrison")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundStyle(Color.primary)
                    Text("Product designer")
                        .font(.system(size: 17, weight: .medium))
                        .foregroundStyle(Color.secondary)
                }

                // Tags
                HStack(spacing: 10) {
                    frostedTag("Figma")
                    frostedTag("UX Design")
                }

                // Stats
                HStack {
                    VStack(spacing: 4) {
                        HStack(spacing: 4) {
                            Image(systemName: "star.fill")
                                .font(.system(size: 16))
                                .foregroundStyle(Color.primary)
                            Text("4.5")
                                .font(.system(size: 20, weight: .bold))
                        }
                        Text("Rating")
                            .font(.system(size: 14))
                            .foregroundStyle(Color.secondary)
                    }
                    Spacer()
                    VStack(spacing: 4) {
                        Text("$15K+")
                            .font(.system(size: 20, weight: .bold))
                        Text("Earned")
                            .font(.system(size: 14))
                            .foregroundStyle(Color.secondary)
                    }
                    Spacer()
                    VStack(spacing: 4) {
                        Text("$80/hr")
                            .font(.system(size: 20, weight: .bold))
                        Text("Rate")
                            .font(.system(size: 14))
                            .foregroundStyle(Color.secondary)
                    }
                }
                .foregroundStyle(Color.primary)
                .padding(.vertical, 6)

                // Actions
                HStack(spacing: 12) {
                    Text("Get in touch")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Color.primary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                        .background(
                            Capsule()
                                .fill(Color.white.opacity(0.55))
                        )
                        .overlay(
                            Capsule().stroke(Color.white.opacity(0.7), lineWidth: 1)
                        )
                        .shadow(color: Color.black.opacity(0.04), radius: 4, y: 4)

                    Circle()
                        .fill(Color.white)
                        .frame(width: 62, height: 62)
                        .overlay(
                            Image(systemName: "bookmark")
                                .font(.system(size: 22))
                                .foregroundStyle(Color.primary)
                        )
                        .shadow(color: Color.black.opacity(0.08), radius: 16, y: 6)
                }

                Text(subtitle)
                    .font(.caption2)
                    .foregroundStyle(Color.secondary)
                    .padding(.top, 4)
            }
        }
    }

    @ViewBuilder
    private func frostedTag(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 14, weight: .medium))
            .foregroundStyle(Color.primary.opacity(0.9))
            .padding(.horizontal, 18)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(Color.white.opacity(0.55))
            )
            .overlay(
                Capsule().stroke(Color.white.opacity(0.6), lineWidth: 1)
            )
    }

    // MARK: Stress (10 cards on screen)
    private var stressGrid: some View {
        let palettes: [[Color]] = [
            [.orange, .pink],
            [.pink, .purple],
            [.purple, .blue],
            [.blue, .cyan],
            [.cyan, .mint],
            [.mint, .yellow],
            [.yellow, .orange],
            [.red, .pink],
            [.indigo, .purple],
            [.teal, .blue]
        ]
        return LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
            ForEach(0..<10, id: \.self) { i in
                LiquidGlassCard(
                    style: .stat,
                    surface: surface,
                    themeColors: palettes[i],
                    borderAnimation: .static
                ) {
                    VStack(alignment: .leading, spacing: 8) {
                        Image(systemName: "sparkles")
                            .foregroundStyle(palettes[i].first ?? .orange)
                            .font(.title3)
                        Text("Card #\(i + 1)")
                            .font(.system(size: 22, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.primary)
                        Text("60fps target")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .frame(height: 108)
            }
        }
    }

    // MARK: Palettes
    private var paletteGrid: some View {
        VStack(spacing: 12) {
            paletteRow("兔兔品牌",     LiquidGlassMaterial.brandP3)
            paletteRow("默认彩虹",     LiquidGlassMaterial.rainbowP3)
            paletteRow("日出",         [.orange, .pink, .purple])
            paletteRow("极光",         [.cyan, .blue, .purple])
            paletteRow("薄荷",         [.mint, .teal, .blue])
            paletteRow("单色派生",     [.orange])
        }
    }

    @ViewBuilder
    private func paletteRow(_ title: String, _ colors: [Color]) -> some View {
        LiquidGlassCard(style: .list, surface: surface, themeColors: colors, borderAnimation: .static) {
            HStack {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(Color.primary)
                Spacer()
                HStack(spacing: -4) {
                    ForEach(Array(colors.prefix(5).enumerated()), id: \.offset) { _, c in
                        Circle()
                            .fill(c)
                            .frame(width: 20, height: 20)
                            .overlay(Circle().stroke(Color.white.opacity(0.6), lineWidth: 1))
                    }
                }
            }
        }
    }

    // MARK: Card builders
    /// Hero 卡 — 200pt 高, full width, Badge + Title + Subtitle + Chips
    private var heroCard: some View {
        LiquidGlassCard(
            style: .hero,
            surface: surface,
            themeColors: [.orange, .pink, .purple],
            borderAnimation: .static
        ) {
            VStack(alignment: .leading, spacing: 12) {
                // Badge
                HStack(spacing: 6) {
                    Image(systemName: "sparkles")
                    Text("今日灵感 · Hero")
                }
                .font(.caption.weight(.bold))
                .foregroundStyle(Color.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.white.opacity(0.25), in: Capsule())

                // Title + Subtitle
                VStack(alignment: .leading, spacing: 6) {
                    Text("一只橙色小兔,正在为你挑选今日的创意")
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.primary)
                        .lineLimit(2)
                    Text("Liquid Glass Material · 流动光边 5.4s")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                // Chips
                HStack(spacing: 8) {
                    chip("ultraThin", .white)
                    chip("regular",   .white)
                    chip("P3 Color",  .white)
                }

                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(height: 200)
    }

    /// Stat 卡 — 正方形 1/4 宽,Icon + Number + Label
    private func statCard(icon: String, number: String, label: String, colors: [Color]) -> some View {
        LiquidGlassCard(
            style: .stat,
            surface: surface,
            themeColors: colors,
            borderAnimation: .static
        ) {
            VStack(alignment: .leading, spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(colors.first ?? .orange)
                Text(number)
                    .font(.system(size: 22, weight: .heavy, design: .rounded))
                    .foregroundStyle(Color.primary)
                Text(label)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .aspectRatio(1, contentMode: .fit)
    }

    /// Feature 卡 — 1/2 宽,240pt 高, Icon + Title + Description + Tag + Arrow
    private func featureCard(icon: String, title: String, description: String, tag: String, colors: [Color]) -> some View {
        LiquidGlassCard(
            style: .feature,
            surface: surface,
            themeColors: colors,
            borderAnimation: .static
        ) {
            VStack(alignment: .leading, spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill((colors.first ?? .orange).opacity(0.18))
                        .frame(width: 40, height: 40)
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(colors.first ?? .orange)
                }

                Text(title)
                    .font(.headline)
                    .foregroundStyle(Color.primary)

                Text(description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)

                Spacer(minLength: 0)

                HStack {
                    Text(tag)
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(colors.first ?? .orange)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background((colors.first ?? .orange).opacity(0.12), in: Capsule())
                    Spacer()
                    Image(systemName: "arrow.up.right")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(height: 240)
    }

    /// List 卡 — 72pt 高, full width, Icon + Title/Subtitle + Chevron
    private func listRow(icon: String, title: String, subtitle: String, colors: [Color] = [.purple, .blue]) -> some View {
        LiquidGlassCard(
            style: .list,
            surface: surface,
            themeColors: colors,
            borderAnimation: .static
        ) {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill((colors.first ?? .purple).opacity(0.18))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(colors.first ?? .purple)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color.secondary)
            }
        }
        .frame(height: 72)
    }

    private func chip(_ text: String, _ tint: Color) -> some View {
        Text(text)
            .font(.caption2.weight(.semibold))
            .foregroundStyle(Color.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(tint.opacity(0.22), in: Capsule())
            .overlay(Capsule().stroke(Color.white.opacity(0.35), lineWidth: 0.5))
    }
}

// MARK: - Preview helpers (Color sugar so the demo reads nicely)
private extension Color {
    static let coral = Color(.displayP3, red: 1.00, green: 0.56, blue: 0.39, opacity: 1)
}

#Preview("Gallery Light") {
    LiquidGlassDemoView()
}

#Preview("Gallery Dark") {
    LiquidGlassDemoView()
        .preferredColorScheme(.dark)
}
