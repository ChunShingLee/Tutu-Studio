import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var session: AppSession
    @State private var isBannerLoading = true
    @State private var quickActionAppeared = false

    private let quickActions = HomeQuickAction.sample
    private let inspirations = HomeInspiration.sample
    private let bannerItems = BannerItem.homeSample

    private var hotTemplates: [CreativeTemplate] {
        Array(session.templates.prefix(10))
    }

    private var remainingQuotaTitle: String {
        session.profile.dailyQuotaRemaining < 0
            ? "今日不限量"
            : "今日剩余 \(session.profile.dailyQuotaRemaining) 次"
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DesignTokens.Spacing.sectionGap) {
                AppPageHeader(title: "Tutu Studio")
                bannerSection
                quickActionSection
                quotaSection
                inspirationSection
                hotTemplatesSection
            }
            .padding(.horizontal, DesignTokens.Spacing.pageHorizontal)
            .padding(.top, 8)
            .padding(.bottom, DesignTokens.Spacing.tabBarClearance)
        }
        .refreshable { await session.refreshAll() }
        .background(AuroraBackground().ignoresSafeArea())
        .navigationBarHidden(true)
        .task {
            guard isBannerLoading else { return }
            try? await Task.sleep(nanoseconds: 420_000_000)
            isBannerLoading = false
        }
        .onAppear {
            guard !quickActionAppeared else { return }
            withAnimation(.spring(response: 0.55, dampingFraction: 0.82).delay(0.05)) {
                quickActionAppeared = true
            }
        }
    }

    // MARK: - Banner

    private var bannerSection: some View {
        BannerCarousel(items: bannerItems, isLoading: isBannerLoading, height: 264) { banner in
            switch banner.action {
            case .activity:
                HomeBannerCampaignView(banner: banner)
            case .create(let prompt, let mode):
                CreateView(initialPrompt: prompt, initialMode: mode)
            case .templates:
                TemplatesView()
            case .community:
                CommunityView()
            }
        }
    }

    // MARK: - Quick Action（4 个正方形方块并排，高度紧凑）

    private var quickActionSection: some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.cardGap) {
            SectionTitle(title: "快速创作", trailing: "\(quickActions.count) 种模式")

            HStack(spacing: 10) {
                ForEach(Array(quickActions.enumerated()), id: \.element.id) { index, action in
                    NavigationLink {
                        CreateView(initialPrompt: action.prompt, initialMode: action.destinationMode)
                    } label: {
                        HomeQuickActionTile(action: action)
                    }
                    .buttonStyle(.plain)
                    .opacity(quickActionAppeared ? 1 : 0)
                    .offset(y: quickActionAppeared ? 0 : 10)
                    .animation(
                        .spring(response: 0.5, dampingFraction: 0.82).delay(Double(index) * 0.05),
                        value: quickActionAppeared
                    )
                }
            }
        }
    }

    // MARK: - Quota（Premium Glass 卡片）

    private var quotaSection: some View {
        NavigationLink {
            MembershipCenterView()
        } label: {
            LiquidGlassCard(
                style: .hero,
                accentBlobs: .brandFluid
            ) {
                HStack(alignment: .center, spacing: 14) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 6) {
                            Image(systemName: "bolt.fill")
                                .font(.caption.weight(.bold))
                            Text("今日额度")
                                .font(.caption.weight(.semibold))
                        }
                        .foregroundStyle(Color.primary)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.white.opacity(0.55), in: Capsule())

                        Text(remainingQuotaTitle)
                            .font(.system(size: 22, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.primary)

                        Text("升级会员可解锁更多次数、高清导出和优先队列。")
                            .font(.caption)
                            .foregroundStyle(Color.secondary)
                            .lineLimit(2)
                    }

                    Spacer(minLength: 10)

                    VStack(alignment: .trailing, spacing: 10) {
                        Text("充值")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(TuTuColor.orange)
                            .padding(.horizontal, 18)
                            .padding(.vertical, 10)
                            .background(Color.white, in: Capsule())
                            .shadow(color: Color.black.opacity(0.08), radius: 6, y: 3)

                        Text(session.profile.plan)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.primary)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.white.opacity(0.55), in: Capsule())
                    }
                }
            }
        }
        .buttonStyle(.plain)
    }

    // MARK: - Inspiration（紧凑横排，不再把图片做成 320pt 高）

    private var inspirationSection: some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.cardGap) {
            HStack {
                SectionTitle(title: "今日灵感")
                NavigationLink {
                    CommunityView()
                } label: {
                    HStack(spacing: 4) {
                        Text("更多")
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.bold))
                    }
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(TuTuColor.orange)
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(inspirations) { item in
                        inspirationCard(item)
                    }
                }
                .padding(.vertical, 2)
            }
        }
    }

    private func inspirationCard(_ item: HomeInspiration) -> some View {
        NavigationLink {
            CommunityPostDetailView(
                card: CommunityCard(
                    creator: item.creator,
                    title: item.title,
                    description: item.prompt,
                    likes: Self.formatLikes(item.likes),
                    comments: "0",
                    background: item.gradient,
                    imageURL: item.imageURL
                ),
                isLiked: false,
                isBookmarked: false,
                onToggleLike: {},
                onToggleBookmark: {}
            )
        } label: {
            VStack(alignment: .leading, spacing: 0) {
                inspirationArtwork(for: item)
                    .frame(width: 200, height: 130)
                    .clipped()

                // 文字区
                VStack(alignment: .leading, spacing: 3) {
                    Text(item.title)
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color.primary)
                        .lineLimit(1)
                    HStack(spacing: 6) {
                        Text(item.creator)
                            .font(.caption2)
                            .foregroundStyle(Color.secondary)
                            .lineLimit(1)
                        Spacer()
                        Label(Self.formatLikes(item.likes), systemImage: "heart.fill")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(TuTuColor.orange)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
            }
            .frame(width: 200)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .shadow(color: Color.black.opacity(0.06), radius: 8, y: 4)
        }
        .buttonStyle(.plain)
    }

    /// 把 1286 → "1,286"；10000+ → "1.0w"，视觉更舒服。
    private static func formatLikes(_ likes: Int) -> String {
        if likes >= 10_000 {
            return String(format: "%.1fw", Double(likes) / 10_000)
        }
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: likes)) ?? "\(likes)"
    }

    @ViewBuilder
    private func inspirationArtwork(for item: HomeInspiration) -> some View {
        if let imageURL = item.imageURL,
           let url = URL(string: imageURL),
           let uiImage = UIImage(contentsOfFile: url.path) {
            Image(uiImage: uiImage)
                .resizable()
                .scaledToFill()
        } else {
            Rectangle()
                .fill(item.gradient)
                .overlay {
                    Image(systemName: item.icon)
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundStyle(.white)
                }
        }
    }

    // MARK: - Hot Templates（空态也有真实推荐入口）

    @ViewBuilder
    private var hotTemplatesSection: some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.cardGap) {
            HStack {
                SectionTitle(title: "热门模板")
                NavigationLink {
                    TemplatesView()
                } label: {
                    HStack(spacing: 4) {
                        Text("全部")
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.bold))
                    }
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(TuTuColor.orange)
                }
            }

            if hotTemplates.isEmpty {
                HomeHotTemplateShortcutsCard()
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 14) {
                        ForEach(hotTemplates) { template in
                            NavigationLink {
                                TemplateDetailView(template: template)
                            } label: {
                                hotTemplateCard(template)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }

    private func hotTemplateCard(_ template: CreativeTemplate) -> some View {
        return VStack(alignment: .leading, spacing: 0) {
            TemplateArtworkView(template: template, height: 150, cornerRadius: 0, compact: true)
                .frame(maxWidth: .infinity)
                .frame(height: 150)
                .clipped()

            // 文字区
            VStack(alignment: .leading, spacing: 3) {
                Text(template.title)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color.primary)
                    .lineLimit(1)
                HStack(spacing: 4) {
                    Text(template.scene)
                        .font(.caption2)
                        .foregroundStyle(Color.secondary)
                        .lineLimit(1)
                    Spacer()
                    if template.isPremium {
                        Image(systemName: "crown.fill")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(TuTuColor.orange)
                    }
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
        }
        .frame(width: 150)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .shadow(color: Color.black.opacity(0.06), radius: 8, y: 4)
    }
}

// MARK: - Compact Quick Action Tile（正方形方块）

private struct HomeQuickActionTile: View {
    let action: HomeQuickAction

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            actionIcon

            VStack(alignment: .leading, spacing: 2) {
                Text(action.title)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(TuTuColor.dark)
                    .lineLimit(1)
                    .minimumScaleFactor(0.9)
                Text(action.subtitle)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.9)
            }

            Spacer(minLength: 0)

            Text(action.highlight)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(action.emphasis)
                .lineLimit(1)
                .minimumScaleFactor(0.85)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .aspectRatio(1, contentMode: .fit)
        .background(.background, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(action.emphasis.opacity(0.10), lineWidth: 1)
        }
        .tuTuShadow(.soft)
    }

    @ViewBuilder
    private var actionIcon: some View {
        if let iconURL = action.iconURL,
           let uiImage = UIImage(contentsOfFile: iconURL.path) {
            Image(uiImage: uiImage)
                .resizable()
                .scaledToFit()
                .frame(width: 40, height: 40)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        } else {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(action.gradient)
                    .frame(width: 40, height: 40)
                Image(systemName: action.icon)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(.white)
            }
        }
    }
}

// MARK: - Empty-state Shortcuts for Hot Templates

private struct HomeHotTemplateShortcutsCard: View {
    private let shortcuts: [(id: String, title: String, systemImage: String, palette: AnimatedMeshBackground.Palette)] = [
        ("ecommerce-shortcut", "电商转化", "bag.fill", .sunrise),
        ("social-shortcut", "社媒种草", "megaphone.fill", .dawn),
        ("brand-shortcut", "品牌提案", "seal.fill", .verdant),
        ("portrait-shortcut", "人像海报", "person.crop.square.fill", .aurora)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center, spacing: 10) {
                Image(systemName: "square.grid.2x2.fill")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(TuTuColor.purple)
                    .frame(width: 32, height: 32)
                    .background(TuTuColor.purple.opacity(0.12), in: RoundedRectangle(cornerRadius: 10, style: .continuous))

                VStack(alignment: .leading, spacing: 2) {
                    Text("热门模板正在整理中")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(TuTuColor.dark)
                    Text("先从下面的场景快速进入模板广场")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                NavigationLink {
                    TemplatesView()
                } label: {
                    HStack(spacing: 4) {
                        Text("去广场")
                        Image(systemName: "arrow.up.right")
                            .font(.caption2.weight(.bold))
                    }
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(TuTuGradient.brandFlat, in: Capsule())
                }
                .buttonStyle(.plain)
            }

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                ForEach(shortcuts, id: \.id) { shortcut in
                    NavigationLink {
                        TemplatesView()
                    } label: {
                        GlowingMeshTile(palette: shortcut.palette, cornerRadius: 18, padding: 10) {
                            VStack(alignment: .leading, spacing: 6) {
                                Image(systemName: shortcut.systemImage)
                                    .font(.footnote.weight(.bold))
                                    .foregroundStyle(.white)
                                    .shadow(color: .black.opacity(0.2), radius: 2, y: 1)

                                Spacer(minLength: 6)

                                Text(shortcut.title)
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(.white)
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.85)
                                    .shadow(color: .black.opacity(0.2), radius: 2, y: 1)
                            }
                            .frame(maxWidth: .infinity, minHeight: 68, alignment: .topLeading)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(16)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.black.opacity(0.04), lineWidth: 1)
        }
        .tuTuShadow(.soft)
    }
}

#Preview("Home Light") {
    NavigationStack {
        HomeView()
            .environmentObject(AppSession.previewLoaded())
            .environment(homePreviewStore())
    }
}

#Preview("Home Dark") {
    NavigationStack {
        HomeView()
            .environmentObject(AppSession.previewLoaded())
            .environment(homePreviewStore())
            .preferredColorScheme(.dark)
    }
}

@MainActor
private func homePreviewStore() -> GenerationTaskStore {
    let store = GenerationTaskStore()
    store.tasks = [
        GenerationTask(
            id: UUID(),
            remoteJobID: "preview-home-completed",
            prompt: "生成一张品牌主视觉",
            params: CreationParams(),
            status: .completed,
            results: [],
            viewed: false,
            createdAt: .now
        )
    ]
    return store
}

// MARK: - Quick Action Model

private struct HomeQuickAction: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let icon: String
    let iconURL: URL?
    let gradient: LinearGradient
    let emphasis: Color
    let highlight: String
    let prompt: String
    let destinationMode: CreateMode

    static let sample: [HomeQuickAction] = [
        .init(title: "文生图", subtitle: "一句中文直接出图", icon: "character.textbox", iconURL: GeneratedMedia.url("FeatureCards/PNG/icon_feature_text_to_image.svg.png"), gradient: LinearGradient(colors: [TuTuColor.orange, Color(red: 0.98, green: 0.56, blue: 0.36)], startPoint: .topLeading, endPoint: .bottomTrailing), emphasis: TuTuColor.orange, highlight: "主打快速表达", prompt: "生成一张适合商业传播的高质感海报，从一句中文需求开始", destinationMode: .textToImage),
        .init(title: "图生图", subtitle: "延展现有视觉风格", icon: "photo.on.rectangle.angled", iconURL: GeneratedMedia.url("FeatureCards/PNG/icon_feature_image_to_image.svg.png"), gradient: LinearGradient(colors: [TuTuColor.purple, Color(red: 0.56, green: 0.48, blue: 0.98)], startPoint: .topLeading, endPoint: .bottomTrailing), emphasis: TuTuColor.purple, highlight: "适合风格延展", prompt: "基于现有图片做风格延展，保持主体特征清晰", destinationMode: .imageToImage),
        .init(title: "智能扩图", subtitle: "补全画面边界", icon: "rectangle.expand.vertical", iconURL: GeneratedMedia.url("FeatureCards/PNG/icon_feature_outpaint.svg.png"), gradient: LinearGradient(colors: [TuTuColor.yellow, Color(red: 1.0, green: 0.72, blue: 0.32)], startPoint: .topLeading, endPoint: .bottomTrailing), emphasis: Color(red: 0.89, green: 0.59, blue: 0.16), highlight: "适配多端尺寸", prompt: "将当前画面向四周智能扩展，保留构图逻辑并补足完整场景", destinationMode: .imageToImage),
        .init(title: "局部重绘", subtitle: "优化局部细节", icon: "paintbrush.pointed", iconURL: GeneratedMedia.url("FeatureCards/PNG/icon_feature_local_edit.svg.png"), gradient: LinearGradient(colors: [Color(red: 0.41, green: 0.79, blue: 0.56), Color(red: 0.23, green: 0.64, blue: 0.62)], startPoint: .topLeading, endPoint: .bottomTrailing), emphasis: Color(red: 0.17, green: 0.61, blue: 0.43), highlight: "细节精修入口", prompt: "对画面局部区域进行重绘优化，保持整体风格统一", destinationMode: .localEdit)
    ]
}

// MARK: - Inspiration Model

private struct HomeInspiration: Identifiable {
    let id = UUID()
    let title: String
    let topic: String
    let creator: String
    let prompt: String
    let icon: String
    let gradient: LinearGradient
    let imageURL: String?
    let likes: Int

    static let sample: [HomeInspiration] = [
        .init(title: "梦幻城堡海报", topic: "童话场景", creator: "鹿小葵", prompt: "生成一个漂浮在云端之上的梦幻城堡场景，金色日落，轻盈云海，童话感强", icon: "sparkles", gradient: LinearGradient(colors: [Color(red: 0.99, green: 0.75, blue: 0.45), Color(red: 0.48, green: 0.59, blue: 0.99)], startPoint: .topLeading, endPoint: .bottomTrailing), imageURL: GeneratedMedia.url("Community/community-castle-20260508-165127.png")?.absoluteString, likes: 1286),
        .init(title: "法式客厅专题图", topic: "空间提案", creator: "小宇宙", prompt: "生成一个被阳光照亮的法式客厅，植物茂密，窗景通透，家居杂志质感", icon: "sofa.fill", gradient: LinearGradient(colors: [Color(red: 0.85, green: 0.91, blue: 0.80), Color(red: 0.96, green: 0.92, blue: 0.84)], startPoint: .topLeading, endPoint: .bottomTrailing), imageURL: GeneratedMedia.url("Community/community-french-livingroom-20260508-165341.png")?.absoluteString, likes: 964),
        .init(title: "赛博街头视觉稿", topic: "潮流氛围", creator: "AI 艺术家", prompt: "生成一张赛博朋克雨夜街头场景，霓虹反射在湿润路面，跑车穿行，电影感强", icon: "car.rear.waves.up.fill", gradient: LinearGradient(colors: [Color(red: 0.08, green: 0.11, blue: 0.22), Color(red: 0.16, green: 0.12, blue: 0.30)], startPoint: .topLeading, endPoint: .bottomTrailing), imageURL: GeneratedMedia.url("Community/community-cyber-street-20260508-165602.png")?.absoluteString, likes: 753)
    ]
}

// MARK: - Campaign Detail

private struct HomeBannerCampaignView: View {
    let banner: BannerItem

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                heroCard
                summaryCard
                actionCard
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, DesignTokens.Spacing.tabBarClearance)
        }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("活动专题")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            Group {
                if let imageURL = banner.imageURL,
                   let image = UIImage(contentsOfFile: imageURL.path) {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                } else {
                    Rectangle()
                        .fill(banner.gradient)
                }
            }
            .frame(height: 220)
            .frame(maxWidth: .infinity)
            .clipped()

            // 文字区
            VStack(alignment: .leading, spacing: 4) {
                Text(banner.eyebrow)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(TuTuColor.orange)
                Text(banner.title)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color.primary)
                Text(banner.subtitle)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
                    .lineLimit(2)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .shadow(color: Color.black.opacity(0.08), radius: 12, y: 6)
    }

    private var summaryCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("本期亮点")
                .font(.title3.weight(.bold))
                .foregroundStyle(TuTuColor.dark)

            ForEach(banner.highlights, id: \.self) { highlight in
                HStack(spacing: 10) {
                    Image(systemName: "sparkles")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(TuTuColor.orange)
                    Text(highlight)
                        .font(.body)
                        .foregroundStyle(TuTuColor.dark)
                }
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var actionCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            NavigationLink {
                CreateView(initialPrompt: banner.featuredPrompt ?? banner.subtitle, initialMode: .textToImage)
            } label: {
                BrandButtonLabel(title: "用本期活动主题开始创作", systemImage: "wand.and.stars")
            }
            .buttonStyle(.plain)

            Text("会把活动主题文案直接带入创作页，你可以继续细化品牌调性、比例和画面结构。")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

// MARK: - Membership Center

struct MembershipCenterView: View {
    @EnvironmentObject private var session: AppSession

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                heroCard
                benefitsCard
                plansCard
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, DesignTokens.Spacing.tabBarClearance)
        }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("会员中心")
        .navigationBarTitleDisplayMode(.inline)
    }

    // Hero: 品牌渐变 + 文字区（统一 VStack 卡片风格）
    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack {
                LinearGradient(
                    colors: [TuTuColor.orange, TuTuColor.purple.opacity(0.85)],
                    startPoint: .topLeading, endPoint: .bottomTrailing
                )
                VStack(spacing: 10) {
                    Image(systemName: "crown.fill")
                        .font(.system(size: 34, weight: .medium))
                        .foregroundStyle(.white)
                    Text("Tutu Studio 会员")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(.white)
                    Text("创作无上限，品质再升级")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.88))
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 180)

            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("当前：\(session.profile.plan)")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Color.primary)
                    Text("升级后可解锁更多次数、高清导出和优先队列")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                }
                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
        .shadow(color: Color.black.opacity(0.06), radius: 10, y: 5)
    }

    // 权益列表
    private var benefitsCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("会员权益")
                .font(.headline.weight(.bold))
                .foregroundStyle(Color.primary)

            memberBenefitRow(icon: "flame.fill", title: "更多创作次数", subtitle: "适合电商上新和高频内容投放", tint: TuTuColor.orange)
            memberBenefitRow(icon: "arrow.down.circle.fill", title: "高清导出", subtitle: "海报、主图和封面成片更适合直接交付", tint: TuTuColor.purple)
            memberBenefitRow(icon: "bolt.badge.clock.fill", title: "优先队列", subtitle: "高峰期也能更快拿到结果", tint: TuTuColor.mint)
            memberBenefitRow(icon: "crown.fill", title: "会员模板", subtitle: "解锁全部高级模板和专属风格", tint: TuTuColor.orange)
        }
        .padding(18)
        .background(Color(.systemBackground), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .shadow(color: Color.black.opacity(0.04), radius: 8, y: 4)
    }

    private func memberBenefitRow(icon: String, title: String, subtitle: String, tint: Color) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.body.weight(.bold))
                .foregroundStyle(tint)
                .frame(width: 36, height: 36)
                .background(tint.opacity(0.12), in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Color.primary)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
            }
            Spacer(minLength: 0)
        }
    }

    // 套餐选择
    private var plansCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("选择套餐")
                .font(.headline.weight(.bold))
                .foregroundStyle(Color.primary)

            planOption(name: "月卡", price: "¥29", unit: "/月", recommended: false)
            planOption(name: "季卡", price: "¥69", unit: "/季", recommended: true)
            planOption(name: "年卡", price: "¥199", unit: "/年", recommended: false)

            // CTA
            Button {} label: {
                BrandButtonLabel(title: "立即开通", systemImage: "sparkles")
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
        }
        .padding(18)
        .background(Color(.systemBackground), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .shadow(color: Color.black.opacity(0.04), radius: 8, y: 4)
    }

    private func planOption(name: String, price: String, unit: String, recommended: Bool) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(name)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Color.primary)
                    if recommended {
                        Text("推荐")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(TuTuColor.orange, in: Capsule())
                    }
                }
                Text("适合持续创作的用户")
                    .font(.caption2)
                    .foregroundStyle(Color.secondary)
            }
            Spacer()
            HStack(alignment: .firstTextBaseline, spacing: 1) {
                Text(price)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(recommended ? TuTuColor.orange : Color.primary)
                Text(unit)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(recommended ? TuTuColor.orange.opacity(0.06) : TuTuColor.groupedBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(recommended ? TuTuColor.orange.opacity(0.4) : Color.clear, lineWidth: 1.5)
        )
    }
}
