import SwiftUI

enum BannerAction: Hashable {
    case activity
    case create(prompt: String, mode: CreateMode = .textToImage)
    case templates
    case community
}

struct BannerItem: Identifiable {
    let id: String
    let eyebrow: String
    let title: String
    let subtitle: String
    let highlights: [String]
    let imageURL: URL?
    let gradient: LinearGradient
    let featuredPrompt: String?
    let action: BannerAction

    static let homeSample: [BannerItem] = [
        BannerItem(
            id: "spring-campaign",
            eyebrow: "本周活动",
            title: "春季上新主视觉",
            subtitle: "一句需求就能拉起电商品牌主图、封面和橱窗横幅的统一气质。",
            highlights: ["文生图直达", "16:9 横幅", "品牌感"],
            imageURL: GeneratedMedia.url("Templates/template-product-main-20260508-170123.png"),
            gradient: LinearGradient(
                colors: [DesignTokens.Colors.primary, Color(hex: 0xFF8A5C)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            featuredPrompt: "为春季上新活动生成一张高级电商品牌横幅，暖橙主调，产品主体突出，保留清爽留白区域",
            action: .activity
        ),
        BannerItem(
            id: "living-space",
            eyebrow: "空间灵感",
            title: "法式家居视觉周",
            subtitle: "把室内、家居和陈列氛围做成能持续复用的空间创意底板。",
            highlights: ["空间场景", "图生图延展", "温暖氛围"],
            imageURL: GeneratedMedia.url("Community/community-french-livingroom-20260508-165341.png"),
            gradient: LinearGradient(
                colors: [Color(hex: 0xF4C58B), Color(hex: 0xE7A46D)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            featuredPrompt: "基于法式家居空间灵感，生成一张适合品牌内容专题的室内视觉横幅，阳光通透，层次柔和",
            action: .templates
        ),
        BannerItem(
            id: "community-trend",
            eyebrow: "社区精选",
            title: "高互动案例速览",
            subtitle: "直接进入社区看本周高赞 Prompt 和构图趋势，拿走就能继续创作。",
            highlights: ["高赞 Prompt", "社区趋势", "继续创作"],
            imageURL: GeneratedMedia.url("Community/community-cyber-street-20260508-165602.png"),
            gradient: LinearGradient(
                colors: [DesignTokens.Colors.secondary, Color(hex: 0xA26EFF)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            featuredPrompt: "结合本周高互动案例趋势，生成一张赛博霓虹风的高质感社区封面图，强调空间纵深和氛围灯光",
            action: .community
        )
    ]
}

struct BannerCarousel<Destination: View>: View {
    let items: [BannerItem]
    var isLoading: Bool = false
    var height: CGFloat = 160
    @ViewBuilder var destination: (BannerItem) -> Destination

    @State private var selection = 0

    var body: some View {
        Group {
            if isLoading {
                SkeletonLoader(height: height, cornerRadius: DesignTokens.Corner.card)
            } else if items.isEmpty {
                emptyBanner
            } else {
                TabView(selection: $selection) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                        NavigationLink {
                            destination(item)
                        } label: {
                            bannerCard(item)
                        }
                        .buttonStyle(.plain)
                        .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))
                .frame(height: height)
            }
        }
        .animation(.easeInOut(duration: 0.25), value: isLoading)
    }

    private var emptyBanner: some View {
        ZStack {
            RoundedRectangle(cornerRadius: DesignTokens.Corner.card, style: .continuous)
                .fill(.regularMaterial)

            VStack(spacing: 10) {
                Image(systemName: "megaphone.fill")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(DesignTokens.Colors.primary)
                Text("活动专题稍后更新")
                    .font(DesignTokens.Typography.cardTitle)
                    .foregroundStyle(DesignTokens.Colors.textPrimary)
                Text("先从下面的快速创作入口开始今天的第一张图。")
                    .font(DesignTokens.Typography.helper)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 20)
        }
        .frame(height: height)
    }

    private func bannerCard(_ item: BannerItem) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // 图片区 — scaledToFill 铺满，GeometryReader 精确约束
            backgroundImage(for: item)
                .frame(maxWidth: .infinity)
                .frame(height: height - 48)

            // 文字区 — 固定 48pt，与图片区精确拼合 = height
            HStack(spacing: 8) {
                Text(item.eyebrow)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(TuTuColor.orange)

                Text(item.title)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Color.primary)
                    .lineLimit(1)

                Spacer(minLength: 4)

                Image(systemName: "arrow.up.right")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Color.secondary)
            }
            .padding(.horizontal, 14)
            .frame(height: 48)
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Corner.card, style: .continuous))
        .shadow(color: Color.black.opacity(0.08), radius: 12, y: 6)
        .padding(.horizontal, 4)
    }

    @ViewBuilder
    private func backgroundImage(for item: BannerItem) -> some View {
        GeometryReader { geo in
            Group {
                if let imageURL = item.imageURL,
                   let uiImage = UIImage(contentsOfFile: imageURL.path) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                } else {
                    Rectangle()
                        .fill(item.gradient)
                }
            }
            .frame(width: geo.size.width, height: geo.size.height)
            .clipped()
        }
    }
}

#Preview("Banner Carousel") {
    NavigationStack {
        BannerCarousel(items: BannerItem.homeSample) { item in
            Text(item.title)
        }
        .padding()
        .background(DesignTokens.Gradients.surface.ignoresSafeArea())
    }
}
