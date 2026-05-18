import SwiftUI

// MARK: - 色板
enum TuTuColor {
    static let orange = DesignTokens.Colors.primary
    static let purple = DesignTokens.Colors.secondary
    static let yellow = DesignTokens.Colors.creativeYellow
    static let dark = DesignTokens.Colors.textPrimary
    static let background = DesignTokens.Colors.surface
    static let groupedBackground = DesignTokens.Colors.background

    // 辅助色 token
    static let mint = Color(red: 0.17, green: 0.61, blue: 0.43)
    static let sky = Color(red: 0.27, green: 0.60, blue: 0.96)
    static let coral = Color(red: 1.0, green: 0.56, blue: 0.39)

    // 细边 / 分割线
    static let hairline = DesignTokens.Colors.hairline
    static let softLine = DesignTokens.Colors.softLine
}

// MARK: - 节奏（间距 / 圆角 / 阴影）
enum TuTuSpacing {
    static let xxs: CGFloat = DesignTokens.Spacing.xxxs
    static let xs: CGFloat = DesignTokens.Spacing.xxs
    static let sm: CGFloat = DesignTokens.Spacing.xs
    static let md: CGFloat = DesignTokens.Spacing.sm
    static let lg: CGFloat = DesignTokens.Spacing.md
    static let xl: CGFloat = DesignTokens.Spacing.lg
    static let xxl: CGFloat = 32
}

enum TuTuRadius {
    static let chip: CGFloat = 12
    static let small: CGFloat = DesignTokens.Corner.button
    static let card: CGFloat = DesignTokens.Corner.card
    static let primary: CGFloat = 24
    static let hero: CGFloat = DesignTokens.Corner.hero
}

struct TuTuShadow {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat

    static let soft = TuTuShadow(color: Color.black.opacity(0.035), radius: 8, x: 0, y: 3)
    static let lifted = TuTuShadow(color: TuTuColor.purple.opacity(0.10), radius: 16, x: 0, y: 8)
}

extension View {
    func tuTuShadow(_ shadow: TuTuShadow) -> some View {
        self.shadow(color: shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
    }
}

// MARK: - 字体层级
enum TuTuTypography {
    /// 大标题（hero 卡里的主标题）
    static let hero = Font.system(size: 28, weight: .bold, design: .rounded)
    /// Section title
    static let sectionTitle = DesignTokens.Typography.sectionTitle
    /// 卡片主标题
    static let cardTitle = DesignTokens.Typography.cardTitle
    /// 正文
    static let body = DesignTokens.Typography.body
    /// 辅助文字
    static let caption = DesignTokens.Typography.helper
}

// MARK: - 品牌渐变
enum TuTuGradient {
    static let brand = LinearGradient(
        colors: [TuTuColor.orange, TuTuColor.coral, TuTuColor.purple],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let brandFlat = DesignTokens.Gradients.brandFlat
    static let surface = DesignTokens.Gradients.surface
}

// MARK: - 兜底兼容（老文件引用 Card）
struct Card<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }

    var body: some View {
        content
            .padding(TuTuSpacing.md)
            .background(.background)
            .clipShape(RoundedRectangle(cornerRadius: TuTuRadius.primary, style: .continuous))
    }
}

// MARK: - 素材定位
enum GeneratedMedia {
    static let rootFolder = "Generated"

    static func url(_ relativePath: String) -> URL? {
        let normalized = relativePath.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let parts = normalized.split(separator: "/")
        guard let fileName = parts.last else { return nil }

        let subdirectory = ([rootFolder] + parts.dropLast().map(String.init)).joined(separator: "/")
        return Bundle.main.url(forResource: String(fileName), withExtension: nil, subdirectory: subdirectory)
    }

    static func urlString(_ relativePath: String, fallback: String = "") -> String {
        url(relativePath)?.absoluteString ?? fallback
    }
}

// MARK: - Aurora 背景（页面级渐变 + 柔焦色晕）
struct AuroraBackground: View {
    var leadingTint: Color = TuTuColor.orange.opacity(0.09)
    var trailingTint: Color = TuTuColor.purple.opacity(0.08)

    var body: some View {
        TuTuGradient.surface
            .overlay(alignment: .topLeading) {
                Circle()
                    .fill(leadingTint)
                    .frame(width: 260, height: 260)
                    .blur(radius: 44)
                    .offset(x: -90, y: -30)
            }
            .overlay(alignment: .topTrailing) {
                Circle()
                    .fill(trailingTint)
                    .frame(width: 280, height: 280)
                    .blur(radius: 48)
                    .offset(x: 100, y: -20)
            }
    }
}

// MARK: - Section 标题
struct SectionTitle: View {
    let title: String
    var trailing: String? = nil

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .font(TuTuTypography.sectionTitle)
                .foregroundStyle(TuTuColor.dark)
            Spacer()
            if let trailing {
                Text(trailing)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

// MARK: - HeroCard（首页 / 模板 / 创作 / 个人中心通用英雄卡）
struct HeroCard<Decoration: View, Content: View>: View {
    var gradient: LinearGradient = TuTuGradient.brand
    var height: CGFloat = 248
    var corner: CGFloat = TuTuRadius.hero
    @ViewBuilder var decoration: () -> Decoration
    @ViewBuilder var content: () -> Content

    init(
        gradient: LinearGradient = TuTuGradient.brand,
        height: CGFloat = 248,
        corner: CGFloat = TuTuRadius.hero,
        @ViewBuilder decoration: @escaping () -> Decoration = { EmptyView() },
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.gradient = gradient
        self.height = height
        self.corner = corner
        self.decoration = decoration
        self.content = content
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: corner, style: .continuous)
                .fill(gradient)

            RoundedRectangle(cornerRadius: corner, style: .continuous)
                .fill(.ultraThinMaterial.opacity(0.18))
                .overlay {
                    RoundedRectangle(cornerRadius: corner, style: .continuous)
                        .stroke(Color.white.opacity(0.28), lineWidth: 1)
                }

            // 默认装饰：柔光圆 + 旋转小卡，子视图可叠加
            Circle()
                .fill(.white.opacity(0.14))
                .frame(width: 180, height: 180)
                .offset(x: 180, y: -40)

            Circle()
                .fill(.white.opacity(0.10))
                .frame(width: 112, height: 112)
                .offset(x: 220, y: 92)

            decoration()

            content()
                .foregroundStyle(.white)
                .padding(TuTuSpacing.xl)
        }
        .frame(height: height)
        .tuTuShadow(.lifted)
    }
}

/// 英雄卡的白色胶囊 metric，橙紫通用
struct HeroMetric: View {
    let title: String
    var systemImage: String? = nil

    var body: some View {
        Group {
            if let systemImage {
                Label(title, systemImage: systemImage)
            } else {
                Text(title)
            }
        }
        .font(.caption.weight(.semibold))
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(.white.opacity(0.18), in: Capsule())
    }
}

// MARK: - PrimaryCard：常规白底 / 半透明玻璃卡
struct PrimaryCard<Content: View>: View {
    enum Style { case solid, glass, grouped }

    var style: Style = .solid
    var padding: CGFloat = TuTuSpacing.md + 2
    var corner: CGFloat = TuTuRadius.primary
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(padding)
            .background(backgroundView)
            .overlay {
                if style == .glass {
                    RoundedRectangle(cornerRadius: corner, style: .continuous)
                        .stroke(TuTuColor.softLine, lineWidth: 1)
                }
            }
    }

    @ViewBuilder
    private var backgroundView: some View {
        switch style {
        case .solid:
            RoundedRectangle(cornerRadius: corner, style: .continuous)
                .fill(.background)
        case .glass:
            RoundedRectangle(cornerRadius: corner, style: .continuous)
                .fill(.ultraThinMaterial)
        case .grouped:
            RoundedRectangle(cornerRadius: corner, style: .continuous)
                .fill(TuTuColor.groupedBackground)
        }
    }
}

// MARK: - TagChip：统一标签 / 状态 capsule
struct TagChip: View {
    enum Style { case filled, tinted, glass, outline }

    let text: String
    var systemImage: String? = nil
    var color: Color = TuTuColor.orange
    var style: Style = .tinted

    var body: some View {
        HStack(spacing: 6) {
            if let systemImage {
                Image(systemName: systemImage)
                    .font(.caption.weight(.bold))
            }
            Text(text)
                .font(.caption.weight(.semibold))
        }
        .foregroundStyle(foreground)
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(backgroundView)
    }

    private var foreground: Color {
        switch style {
        case .filled: return .white
        case .tinted: return color
        case .glass: return TuTuColor.dark
        case .outline: return color
        }
    }

    @ViewBuilder
    private var backgroundView: some View {
        switch style {
        case .filled:
            Capsule().fill(color)
        case .tinted:
            Capsule().fill(color.opacity(0.10))
        case .glass:
            Capsule().fill(.ultraThinMaterial)
        case .outline:
            Capsule()
                .fill(Color.clear)
                .overlay(Capsule().stroke(color.opacity(0.35), lineWidth: 1))
        }
    }
}

// MARK: - Brand Button（橙紫渐变主按钮）
struct BrandButtonLabel: View {
    let title: String
    var systemImage: String? = nil
    var isLoading: Bool = false
    var enabled: Bool = true

    var body: some View {
        HStack(spacing: 8) {
            Spacer()
            if isLoading {
                ProgressView().tint(.white)
            }
            if let systemImage {
                Image(systemName: systemImage)
                    .font(.headline)
            }
            Text(title).font(.headline)
            Spacer()
        }
        .padding(.vertical, 16)
        .foregroundStyle(.white)
        .background(
            enabled
                ? AnyShapeStyle(TuTuGradient.brandFlat)
                : AnyShapeStyle(Color(.systemGray3)),
            in: RoundedRectangle(cornerRadius: TuTuRadius.card, style: .continuous)
        )
    }
}

// MARK: - 空态视图（统一提示，比原生 alert 更柔和）
struct EmptyStateView: View {
    let title: String
    var subtitle: String? = nil
    var systemImage: String = "sparkles"
    var accent: Color = TuTuColor.purple

    var body: some View {
        VStack(spacing: TuTuSpacing.sm) {
            ZStack {
                Circle()
                    .fill(accent.opacity(0.10))
                    .frame(width: 72, height: 72)
                Image(systemName: systemImage)
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundStyle(accent)
            }

            Text(title)
                .font(.headline)
                .foregroundStyle(TuTuColor.dark)

            if let subtitle {
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .background(.background, in: RoundedRectangle(cornerRadius: TuTuRadius.primary, style: .continuous))
    }
}

// MARK: - 模板视觉映射
struct TemplatePalette {
    let accent: Color
    let gradient: LinearGradient
    let symbol: String
    let eyebrow: String
}

enum TemplateVisualBook {
    static func assetPath(for id: String) -> String? {
        switch id {
        case "product-main":
            return "Templates/template-product-main-20260508-170123.png"
        case "detail-poster":
            return "Templates/template-detail-poster-20260508-170308.png"
        case "beauty-single":
            return "Templates/template-beauty-single-20260511-012641.png"
        case "food-menu":
            return "Templates/template-food-menu-20260511-012648.png"
        case "redbook-cover":
            return "Templates/template-redbook-cover-20260508-170443.png"
        case "festival":
            return "Templates/template-festival-promo-20260508-170623.png"
        case "brand-poster":
            return "Templates/template-brand-poster-20260511-012654.png"
        case "portrait-photo":
            return "Templates/template-portrait-photo-20260511-012904.png"
        case "report-cover":
            return "Templates/template-report-cover-20260511-012919.png"
        case "storybook-scene":
            return "Templates/template-storybook-scene-20260511-012855.png"
        default:
            return nil
        }
    }

    static func imageURL(for template: CreativeTemplate) -> URL? {
        guard let path = assetPath(for: template.id) else { return nil }
        return GeneratedMedia.url(path)
    }

    static func usageSummary(for id: String) -> String {
        switch id {
        case "product-main": return "12.3w 人在用"
        case "detail-poster": return "8.7w 人在用"
        case "beauty-single": return "7.9w 人在用"
        case "food-menu": return "6.8w 人在用"
        case "redbook-cover": return "8.6w 人在用"
        case "festival": return "7.8w 人在用"
        case "social-nine-grid": return "6.1w 人在用"
        case "live-cover": return "5.2w 人在用"
        case "logo": return "6.2w 人在用"
        case "brand-poster": return "4.9w 人在用"
        case "packaging-proposal": return "3.8w 人在用"
        case "portrait-photo": return "9.1w 人在用"
        case "kids-poster": return "5.4w 人在用"
        case "ppt-illustration": return "4.2w 人在用"
        case "report-cover": return "3.6w 人在用"
        case "storybook-scene": return "4.4w 人在用"
        case "ip-character": return "5.7w 人在用"
        default: return "2.8w 人在用"
        }
    }

    static func palette(for template: CreativeTemplate) -> TemplatePalette {
        switch template.id {
        case "product-main", "detail-poster", "beauty-single", "food-menu":
            return TemplatePalette(
                accent: TuTuColor.orange,
                gradient: LinearGradient(colors: [Color(red: 1.0, green: 0.49, blue: 0.26), Color(red: 0.95, green: 0.29, blue: 0.42)], startPoint: .topLeading, endPoint: .bottomTrailing),
                symbol: "bag.fill",
                eyebrow: "电商转化"
            )
        case "redbook-cover", "festival", "social-nine-grid", "live-cover":
            return TemplatePalette(
                accent: TuTuColor.purple,
                gradient: LinearGradient(colors: [Color(red: 0.57, green: 0.46, blue: 0.98), Color(red: 0.97, green: 0.48, blue: 0.56)], startPoint: .topLeading, endPoint: .bottomTrailing),
                symbol: "megaphone.fill",
                eyebrow: "社媒传播"
            )
        case "logo", "brand-poster", "packaging-proposal":
            return TemplatePalette(
                accent: Color(red: 0.67, green: 0.42, blue: 0.19),
                gradient: LinearGradient(colors: [Color(red: 0.99, green: 0.86, blue: 0.68), Color(red: 0.87, green: 0.67, blue: 0.42)], startPoint: .topLeading, endPoint: .bottomTrailing),
                symbol: "seal.fill",
                eyebrow: "品牌表达"
            )
        case "portrait-photo", "kids-poster":
            return TemplatePalette(
                accent: Color(red: 0.31, green: 0.60, blue: 0.94),
                gradient: LinearGradient(colors: [Color(red: 0.82, green: 0.90, blue: 0.99), Color(red: 0.45, green: 0.66, blue: 0.98)], startPoint: .topLeading, endPoint: .bottomTrailing),
                symbol: "person.crop.square.fill",
                eyebrow: "人物表达"
            )
        case "ppt-illustration", "report-cover":
            return TemplatePalette(
                accent: TuTuColor.mint,
                gradient: LinearGradient(colors: [Color(red: 0.73, green: 0.92, blue: 0.88), Color(red: 0.31, green: 0.73, blue: 0.64)], startPoint: .topLeading, endPoint: .bottomTrailing),
                symbol: "doc.richtext.fill",
                eyebrow: "提案汇报"
            )
        default:
            return TemplatePalette(
                accent: TuTuColor.yellow,
                gradient: LinearGradient(colors: [Color(red: 0.99, green: 0.88, blue: 0.63), Color(red: 0.98, green: 0.64, blue: 0.37)], startPoint: .topLeading, endPoint: .bottomTrailing),
                symbol: "sparkles",
                eyebrow: "插画内容"
            )
        }
    }
}

struct TemplateArtworkView: View {
    let template: CreativeTemplate
    var height: CGFloat
    var cornerRadius: CGFloat = 24
    var compact: Bool = false

    private var palette: TemplatePalette {
        TemplateVisualBook.palette(for: template)
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            if let url = TemplateVisualBook.imageURL(for: template),
               let uiImage = UIImage(contentsOfFile: url.path) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .clipped()
            } else {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(palette.gradient)

                Circle()
                    .fill(.white.opacity(0.18))
                    .frame(width: compact ? 92 : 128, height: compact ? 92 : 128)
                    .offset(x: compact ? 110 : 150, y: -16)

                RoundedRectangle(cornerRadius: compact ? 18 : 22, style: .continuous)
                    .fill(.white.opacity(0.14))
                    .frame(width: compact ? 96 : 112, height: compact ? 112 : 132)
                    .rotationEffect(.degrees(-9))
                    .offset(x: compact ? 118 : 164, y: compact ? 24 : 28)
                    .overlay(alignment: .topLeading) {
                        Image(systemName: palette.symbol)
                            .font(.system(size: compact ? 18 : 22, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(compact ? 14 : 16)
                    }

                VStack(alignment: .leading, spacing: compact ? 8 : 10) {
                    TagChip(text: palette.eyebrow, systemImage: "sparkles", color: .white, style: .glass)

                    Spacer(minLength: 0)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(template.title)
                            .font(compact ? .headline : .title3.weight(.bold))
                            .foregroundStyle(.white)
                            .lineLimit(compact ? 1 : 2)
                        Text(template.scene)
                            .font(compact ? .caption : .subheadline)
                            .foregroundStyle(.white.opacity(0.92))
                            .lineLimit(compact ? 1 : 2)
                    }
                }
                .padding(compact ? 14 : 18)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
    }
}

// MARK: - Skeleton 占位块
struct SkeletonBlock: View {
    var height: CGFloat = 120
    var corner: CGFloat = TuTuRadius.card

    @State private var phase: CGFloat = -0.6

    var body: some View {
        RoundedRectangle(cornerRadius: corner, style: .continuous)
            .fill(Color.secondary.opacity(0.08))
            .overlay(
                LinearGradient(
                    colors: [Color.clear, Color.white.opacity(0.35), Color.clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .mask(RoundedRectangle(cornerRadius: corner, style: .continuous))
                .offset(x: phase * 240)
            )
            .frame(height: height)
            .clipped()
            .onAppear {
                withAnimation(.linear(duration: 1.4).repeatForever(autoreverses: false)) {
                    phase = 1.2
                }
            }
    }
}

// MARK: - 旧封面组件（保留兼容）
struct GradientCover: View {
    let title: String

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            TuTuGradient.brandFlat
            Text(title)
                .font(.headline)
                .foregroundStyle(.white)
                .padding(TuTuSpacing.md)
        }
        .frame(height: 128)
        .clipShape(RoundedRectangle(cornerRadius: TuTuRadius.primary - 2, style: .continuous))
    }
}
