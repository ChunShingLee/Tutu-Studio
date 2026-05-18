import SwiftUI

struct SearchView: View {
    @EnvironmentObject private var session: AppSession
    @State private var query = ""

    private let communityCards = CommunityCard.sample
    private let suggestedQueries = ["电商主图", "法式客厅", "赛博街头", "节日海报", "小红书封面", "宠物品牌"]

    private var trimmedQuery: String {
        query.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var matchingTemplates: [CreativeTemplate] {
        guard !trimmedQuery.isEmpty else { return [] }
        return session.templates.filter { template in
            matches(trimmedQuery, in: [template.title, template.scene, template.promptHint])
        }
    }

    private var matchingCommunityCards: [CommunityCard] {
        guard !trimmedQuery.isEmpty else { return [] }
        return communityCards.filter { card in
            matches(trimmedQuery, in: [card.title, card.creator, card.description])
        }
    }

    private var matchingAssets: [Asset] {
        guard !trimmedQuery.isEmpty else { return [] }
        return session.recentAssets.filter { asset in
            matches(trimmedQuery, in: [asset.title, asset.prompt])
        }
    }

    private var totalMatches: Int {
        matchingTemplates.count + matchingCommunityCards.count + matchingAssets.count
    }

    var body: some View {
        configuredSearchContent
            .background(backgroundLayer.ignoresSafeArea())
            .navigationTitle(trimmedQuery.isEmpty ? "搜全站灵感" : "搜索结果")
            .navigationBarTitleDisplayMode(.large)
            .appProfileToolbar()
    }

    @ViewBuilder
    private var configuredSearchContent: some View {
        if #available(iOS 26.0, *) {
            content
                .searchable(
                    text: $query,
                    placement: .toolbar,
                    prompt: "模板、帖子、素材和资产"
                )
                .searchToolbarBehavior(.minimize)
        } else {
            content
                .searchable(
                    text: $query,
                    placement: .toolbar,
                    prompt: "模板、帖子、素材和资产"
                )
        }
    }

    private var content: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                if trimmedQuery.isEmpty {
                    searchHeroCard
                    sourceOverviewSection
                    trendingSection
                    suggestionSection
                    recentAssetsSection
                    searchTipsSection
                } else {
                    resultsSummaryCard
                    resultsSection
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 130)
        }
    }

    private var backgroundLayer: some View {
        AuroraBackground()
    }

    private var searchHeroCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center, spacing: 12) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color.white.opacity(0.94), Color.white.opacity(0.68)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 50, height: 50)

                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(TuTuColor.dark)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("搜全站灵感")
                        .font(.title3.weight(.bold))
                    Text("模板、社区帖子、生成素材和你的个人资产，都可以直接搜。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            HStack(spacing: 10) {
                overviewMetric(title: "模板 \(session.templates.count)", systemImage: "square.grid.2x2")
                overviewMetric(title: "帖子 \(communityCards.count)", systemImage: "text.bubble")
                overviewMetric(title: "资产 \(session.assets.count)", systemImage: "photo.on.rectangle")
            }
        }
        .padding(22)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Color.white.opacity(0.72), lineWidth: 1)
        }
        .shadow(color: .black.opacity(0.06), radius: 18, y: 10)
    }

    private func overviewMetric(title: String, systemImage: String) -> some View {
        Label(title, systemImage: systemImage)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color.white.opacity(0.82), in: Capsule())
    }

    private var sourceOverviewSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionHeader("可搜索内容")

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                sourceCard(
                    title: "模板",
                    subtitle: "按场景、行业和提示词搜创意方向",
                    stat: "\(session.templates.count) 个",
                    icon: "square.grid.2x2.fill",
                    colors: [Color(red: 1.0, green: 0.55, blue: 0.40), Color(red: 1.0, green: 0.74, blue: 0.46)]
                )
                sourceCard(
                    title: "社区帖子",
                    subtitle: "搜灵感案例、创作者和爆款 Prompt",
                    stat: "\(communityCards.count) 条",
                    icon: "bubble.left.and.bubble.right.fill",
                    colors: [Color(red: 0.49, green: 0.53, blue: 0.98), Color(red: 0.73, green: 0.63, blue: 1.0)]
                )
                sourceCard(
                    title: "我的资产",
                    subtitle: "搜已经生成过的图片、提示词和时间",
                    stat: "\(session.assets.count) 张",
                    icon: "photo.stack.fill",
                    colors: [Color(red: 0.33, green: 0.78, blue: 0.64), Color(red: 0.34, green: 0.63, blue: 0.90)]
                )
                sourceCard(
                    title: "最近成果",
                    subtitle: "沿着最近的创作记录继续修改和复用",
                    stat: "\(session.recentJobs.count) 条",
                    icon: "sparkles.rectangle.stack.fill",
                    colors: [Color(red: 0.96, green: 0.52, blue: 0.63), Color(red: 0.79, green: 0.65, blue: 0.98)]
                )
            }
        }
    }

    private func sourceCard(title: String, subtitle: String, stat: String, icon: String, colors: [Color]) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 52, height: 52)

                Image(systemName: icon)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(TuTuColor.dark)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            Text(stat)
                .font(.caption.weight(.semibold))
                .foregroundStyle(TuTuColor.orange)
        }
        .padding(18)
        .frame(maxWidth: .infinity, minHeight: 168, alignment: .topLeading)
        .background(Color.white.opacity(0.84), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.white.opacity(0.78), lineWidth: 1)
        }
    }

    private var suggestionSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionHeader("试试这些关键词")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(suggestedQueries, id: \.self) { item in
                        Button {
                            query = item
                        } label: {
                            TagChip(text: item, color: TuTuColor.orange, style: .glass)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var recentAssetsSection: some View {
        if !session.recentAssets.isEmpty {
            VStack(alignment: .leading, spacing: 14) {
                sectionHeader("最近生成")

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 14) {
                        ForEach(Array(session.recentAssets.prefix(6))) { asset in
                            NavigationLink {
                                AssetDetailView(asset: asset)
                            } label: {
                                VStack(alignment: .leading, spacing: 10) {
                                    AsyncImage(url: URL(string: asset.imageUrl)) { image in
                                        image
                                            .resizable()
                                            .scaledToFill()
                                    } placeholder: {
                                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                                            .fill(Color(.systemGray5))
                                    }
                                    .frame(width: 184, height: 124)
                                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))

                                    Text(asset.title)
                                        .font(.headline)
                                        .foregroundStyle(TuTuColor.dark)
                                        .lineLimit(1)

                                    Text(asset.prompt)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .lineLimit(2)
                                }
                                .frame(width: 184, alignment: .leading)
                                .padding(14)
                                .background(Color.white.opacity(0.84), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                                .overlay {
                                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                                        .stroke(Color.white.opacity(0.78), lineWidth: 1)
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 1)
                }
            }
        }
    }

    private var resultsSummaryCard: some View {
        HStack(alignment: .center, spacing: 12) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color(red: 1.0, green: 0.55, blue: 0.40), Color(red: 0.46, green: 0.50, blue: 0.98)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 44, height: 44)

                Image(systemName: "text.magnifyingglass")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("“\(trimmedQuery)”")
                    .font(.headline)
                Text("共找到 \(totalMatches) 条相关内容")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if !trimmedQuery.isEmpty {
                Button("清除") {
                    query = ""
                }
                .font(.subheadline.weight(.medium))
            }
        }
        .padding(18)
        .background(Color.white.opacity(0.84), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.white.opacity(0.78), lineWidth: 1)
        }
    }

    @ViewBuilder
    private var resultsSection: some View {
        if totalMatches == 0 {
            EmptyStateView(
                title: "没有找到结果",
                subtitle: "试试更通用的词，比如“海报”“客厅”“电商主图”或“赛博”。",
                systemImage: "magnifyingglass",
                accent: TuTuColor.orange
            )
        } else {
            VStack(alignment: .leading, spacing: 18) {
                if !matchingTemplates.isEmpty {
                    resultsGroup(title: "模板", count: matchingTemplates.count) {
                        ForEach(matchingTemplates) { template in
                            NavigationLink {
                                TemplateDetailView(template: template)
                            } label: {
                                resultRow(
                                    title: template.title,
                                    subtitle: template.scene,
                                    detail: template.promptHint,
                                    icon: "square.grid.2x2.fill",
                                    tint: TuTuColor.purple
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                if !matchingCommunityCards.isEmpty {
                    resultsGroup(title: "社区帖子", count: matchingCommunityCards.count) {
                        ForEach(matchingCommunityCards) { card in
                            NavigationLink {
                                CommunityPostDetailView(
                                    card: card,
                                    isLiked: false,
                                    isBookmarked: false,
                                    onToggleLike: {},
                                    onToggleBookmark: {}
                                )
                            } label: {
                                resultRow(
                                    title: card.title,
                                    subtitle: card.creator,
                                    detail: card.description,
                                    icon: "bubble.left.and.bubble.right.fill",
                                    tint: TuTuColor.orange
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                if !matchingAssets.isEmpty {
                    resultsGroup(title: "我的资产", count: matchingAssets.count) {
                        ForEach(matchingAssets) { asset in
                            NavigationLink {
                                AssetDetailView(asset: asset)
                            } label: {
                                resultRow(
                                    title: asset.title,
                                    subtitle: asset.createdAt.formatted(date: .abbreviated, time: .shortened),
                                    detail: asset.prompt,
                                    icon: "photo.stack.fill",
                                    tint: Color(red: 0.30, green: 0.72, blue: 0.60)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }

    private func resultsGroup<Content: View>(title: String, count: Int, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(TuTuColor.dark)
                Spacer()
                Text("\(count) 条")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 12) {
                content()
            }
        }
    }

    private func resultRow(title: String, subtitle: String, detail: String, icon: String, tint: Color) -> some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(tint.opacity(0.14))
                    .frame(width: 48, height: 48)

                Image(systemName: icon)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(tint)
            }

            VStack(alignment: .leading, spacing: 5) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(TuTuColor.dark)

                Text(subtitle)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(tint)

                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            Spacer(minLength: 10)

            Image(systemName: "arrow.up.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
                .padding(.top, 6)
        }
        .padding(16)
        .background(Color.white.opacity(0.84), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(Color.white.opacity(0.78), lineWidth: 1)
        }
    }

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(TuTuTypography.sectionTitle)
            .foregroundStyle(TuTuColor.dark)
    }

    private func matches(_ needle: String, in fields: [String]) -> Bool {
        fields.contains { $0.localizedCaseInsensitiveContains(needle) }
    }

    // MARK: - 新增密度 section

    private var trendingSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionTitle(title: "本周搜索榜", trailing: "每 30 分钟更新")

            VStack(spacing: 10) {
                ForEach(Array(SearchTrending.sample.enumerated()), id: \.element.id) { idx, item in
                    Button {
                        query = item.keyword
                    } label: {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .fill(idx < 3 ? AnyShapeStyle(TuTuGradient.brandFlat) : AnyShapeStyle(TuTuColor.groupedBackground))
                                    .frame(width: 30, height: 42)
                                Text("\(idx + 1)")
                                    .font(.subheadline.weight(.bold))
                                    .foregroundStyle(idx < 3 ? .white : TuTuColor.dark)
                            }
                            VStack(alignment: .leading, spacing: 4) {
                                HStack(spacing: 6) {
                                    Text(item.keyword)
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(TuTuColor.dark)
                                    if item.isHot {
                                        Label("HOT", systemImage: "flame.fill")
                                            .labelStyle(.iconOnly)
                                            .font(.caption2.weight(.bold))
                                            .foregroundStyle(.white)
                                            .padding(.horizontal, 6).padding(.vertical, 2)
                                            .background(Capsule().fill(Color.red))
                                    }
                                }
                                Text(item.context)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(1)
                            }
                            Spacer()
                            HStack(spacing: 4) {
                                Image(systemName: item.isUp ? "arrow.up.right" : "minus")
                                    .font(.caption2.weight(.bold))
                                Text(item.delta)
                                    .font(.caption2.weight(.semibold))
                            }
                            .foregroundStyle(item.isUp ? TuTuColor.mint : .secondary)
                        }
                        .padding(12)
                        .background(.background, in: RoundedRectangle(cornerRadius: TuTuRadius.card, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var searchTipsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionTitle(title: "搜索技巧")

            VStack(alignment: .leading, spacing: 10) {
                tipRow(icon: "text.magnifyingglass", tint: TuTuColor.orange, title: "用“场景 + 行业”组合", detail: "例如“电商 主图”、“小红书 封面”")
                tipRow(icon: "sparkle.magnifyingglass", tint: TuTuColor.purple, title: "贴图索图", detail: "在创作页粘贴参考图，可以反向匹配模板")
                tipRow(icon: "person.2.fill", tint: TuTuColor.mint, title: "跟创作者热搜", detail: "输入创作者名字，能看到 ta 的全部 Prompt和作品")
            }
        }
    }

    private func tipRow(icon: String, tint: Color, title: String, detail: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(tint)
                .frame(width: 40, height: 40)
                .background(tint.opacity(0.14), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(TuTuColor.dark)
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.background, in: RoundedRectangle(cornerRadius: TuTuRadius.card, style: .continuous))
        .tuTuShadow(.soft)
    }
}

private struct SearchTrending: Identifiable {
    let id = UUID()
    let keyword: String
    let context: String
    let delta: String
    let isUp: Bool
    let isHot: Bool

    static let sample: [SearchTrending] = [
        .init(keyword: "节日促销主图", context: "电商 / 1.2k 人在搜", delta: "+48%", isUp: true, isHot: true),
        .init(keyword: "护肤品平铺", context: "美妆 / 820 人在搜", delta: "+21%", isUp: true, isHot: true),
        .init(keyword: "宠物赴约海报", context: "宠物 / 612 人在搜", delta: "+17%", isUp: true, isHot: false),
        .init(keyword: "品牌日常摄影", context: "品牌 / 438 人在搜", delta: "+6%", isUp: true, isHot: false),
        .init(keyword: "赛博零售樱窗", context: "零售 / 326 人在搜", delta: "±0%", isUp: false, isHot: false)
    ]
}
