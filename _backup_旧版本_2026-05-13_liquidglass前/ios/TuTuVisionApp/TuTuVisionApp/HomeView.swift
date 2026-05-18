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
                AppPageHeader(title: "兔兔创意设计")
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
        BannerCarousel(items: bannerItems, isLoading: isBannerLoading, height: 232) { banner in
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

    // MARK: - Quota（Mesh 彩色玻璃卡）

    private var quotaSection: some View {
        NavigationLink {
            MembershipCenterView()
        } label: {
            GlowingMeshCard(palette: .brand, cornerRadius: 28, padding: 20, height: 152) {
                HStack(alignment: .center, spacing: 14) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 6) {
                            Image(systemName: "bolt.fill")
                                .font(.caption.weight(.bold))
                            Text("今日额度")
                                .font(.caption.weight(.semibold))
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .liquidGlassCapsule(tint: .white)

                        Text(remainingQuotaTitle)
                            .font(.system(size: 22, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                            .shadow(color: Color.black.opacity(0.12), radius: 4, y: 2)

                        Text("升级会员可解锁更多次数、高清导出和优先队列。")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.92))
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
                            .shadow(color: Color.black.opacity(0.14), radius: 6, y: 3)

                        Text(session.profile.plan)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .liquidGlassCapsule(tint: .white)
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
            HomeInspirationDetailView(item: item)
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                ZStack(alignment: .bottomLeading) {
                    inspirationArtwork(for: item)
                        .frame(width: 236, height: 160)
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

                    LinearGradient(
                        colors: [Color.clear, Color.black.opacity(0.54)],
                        startPoint: .center,
                        endPoint: .bottom
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

                    Text(item.topic)
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .liquidGlassCapsule(tint: .white)
                        .padding(10)

                    NavigationLink {
                        CreateView(
                            initialPrompt: item.prompt,
                            initialMode: item.imageURL == nil ? .textToImage : .imageToImage,
                            initialReferenceImageUrl: item.imageURL
                        )
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "wand.and.stars")
                                .font(.caption2.weight(.bold))
                            Text("套用")
                                .font(.caption2.weight(.semibold))
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(TuTuGradient.brandFlat, in: Capsule())
                        .shadow(color: TuTuColor.orange.opacity(0.28), radius: 6, y: 2)
                    }
                    .buttonStyle(.plain)
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(item.title)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(TuTuColor.dark)
                        .lineLimit(1)
                        .minimumScaleFactor(0.9)

                    HStack(spacing: 8) {
                        Label(item.creator, systemImage: "person.crop.circle.fill")
                            .labelStyle(.titleAndIcon)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                        Label(Self.formatLikes(item.likes), systemImage: "heart.fill")
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(TuTuColor.orange)
                            .lineLimit(1)
                    }
                }
                .padding(.horizontal, 2)
            }
            .frame(width: 236, alignment: .leading)
            .padding(8)
            .background(.background, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .stroke(Color.black.opacity(0.04), lineWidth: 1)
            }
            .tuTuShadow(.soft)
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
        let palette = TemplateVisualBook.palette(for: template)

        return VStack(alignment: .leading, spacing: 10) {
            TemplateArtworkView(template: template, height: 148, cornerRadius: 20, compact: true)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                .contentShape(RoundedRectangle(cornerRadius: 20, style: .continuous))

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    TagChip(
                        text: template.isPremium ? "会员" : "热门",
                        systemImage: template.isPremium ? "crown.fill" : "flame.fill",
                        color: template.isPremium ? TuTuColor.orange : palette.accent,
                        style: .tinted
                    )
                    Spacer()
                    Text(TemplateVisualBook.usageSummary(for: template.id))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                Text(template.title)
                    .font(.headline)
                    .foregroundStyle(TuTuColor.dark)
                    .lineLimit(1)
                    .minimumScaleFactor(0.9)

                Text(template.scene)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            .padding(.horizontal, 2)
        }
        .frame(width: 168, alignment: .leading)
        .padding(10)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.black.opacity(0.04), lineWidth: 1)
        }
        .tuTuShadow(.soft)
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
        ZStack(alignment: .bottomLeading) {
            if let imageURL = banner.imageURL,
               let image = UIImage(contentsOfFile: imageURL.path) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Rectangle()
                    .fill(banner.gradient)
            }

            LinearGradient(colors: [Color.clear, Color.black.opacity(0.56)], startPoint: .center, endPoint: .bottom)

            VStack(alignment: .leading, spacing: 10) {
                Text(banner.eyebrow)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.94))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(.white.opacity(0.14), in: Capsule())

                Text(banner.title)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text(banner.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.92))
                    .lineLimit(3)
            }
            .padding(20)
        }
        .frame(height: 260)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
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

// MARK: - Inspiration Detail

private struct HomeInspirationDetailView: View {
    let item: HomeInspiration

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                heroCard
                promptCard
                actionCard
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, DesignTokens.Spacing.tabBarClearance)
        }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("灵感详情")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var heroCard: some View {
        ZStack(alignment: .bottomLeading) {
            if let imageURL = item.imageURL,
               let url = URL(string: imageURL),
               let image = UIImage(contentsOfFile: url.path) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Rectangle()
                    .fill(item.gradient)
            }

            LinearGradient(colors: [Color.clear, Color.black.opacity(0.58)], startPoint: .center, endPoint: .bottom)

            VStack(alignment: .leading, spacing: 8) {
                Text(item.topic)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.94))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(.white.opacity(0.14), in: Capsule())

                Text(item.title)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                HStack(spacing: 12) {
                    Label(item.creator, systemImage: "person.crop.circle.fill")
                    Label("\(item.likes)", systemImage: "heart.fill")
                }
                .font(.caption.weight(.semibold))
                .foregroundStyle(.white.opacity(0.92))
            }
            .padding(20)
        }
        .frame(height: 320)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    private var promptCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("灵感 Prompt")
                .font(.title3.weight(.bold))
                .foregroundStyle(TuTuColor.dark)

            Text(item.prompt)
                .font(.body)
                .foregroundStyle(TuTuColor.dark)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(16)
                .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var actionCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            NavigationLink {
                CreateView(
                    initialPrompt: item.prompt,
                    initialMode: item.imageURL == nil ? .textToImage : .imageToImage,
                    initialReferenceImageUrl: item.imageURL
                )
            } label: {
                BrandButtonLabel(title: "套用此 Prompt", systemImage: "wand.and.stars")
            }
            .buttonStyle(.plain)

            Text("如果这张灵感图已经很接近你的目标成片，可以直接带上参考图继续延展。")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

// MARK: - Membership Center

private struct MembershipCenterView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                GlowingMeshCard(palette: .brand, cornerRadius: 30, padding: 22, height: 220) {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                            Text("会员中心")
                        }
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .liquidGlassCapsule(tint: .white)

                        Text("把额度、高清导出和优先队列一起升级")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                            .shadow(color: Color.black.opacity(0.14), radius: 6, y: 3)

                        Text("第二步先把充值入口落在首页，完整订阅体系和订单流在后续页面继续展开。")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.94))
                    }
                }

                VStack(alignment: .leading, spacing: 14) {
                    Text("当前可见权益")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(TuTuColor.dark)

                    benefitRow(title: "更多创作次数", subtitle: "适合电商上新和高频内容投放")
                    benefitRow(title: "高清导出", subtitle: "海报、主图和封面成片更适合直接交付")
                    benefitRow(title: "优先队列", subtitle: "高峰期也能更快拿到结果")
                }
                .padding(18)
                .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, DesignTokens.Spacing.tabBarClearance)
        }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("会员中心")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func benefitRow(title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.headline)
                .foregroundStyle(TuTuColor.dark)
            Text(subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}
