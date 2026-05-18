import SwiftUI

struct CommunityView: View {
    @State private var selectedTab = "推荐"
    @State private var likedCardIDs: Set<UUID> = []
    @State private var bookmarkedCardIDs: Set<UUID> = []

    private let topTabs = ["推荐", "关注", "热门", "Prompt 市场"]
    private let creators = CommunityCreator.sample
    private let cards = CommunityCard.sample

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 20) {
                AppPageHeader(title: "灵感社区")
                topTabsRow
                hotTopicsSection
                weeklyRankingSection
                creatorSection
                feedSection
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, DesignTokens.Spacing.tabBarClearance)
        }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    // MARK: - Top Tabs
    private var topTabsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(topTabs, id: \.self) { tab in
                    Button {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                            selectedTab = tab
                        }
                    } label: {
                        TagChip(
                            text: tab,
                            color: TuTuColor.orange,
                            style: selectedTab == tab ? .filled : .glass
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Hot Topics
    private var hotTopicsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionTitle(title: "热门话题")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(CommunityTopic.sample) { topic in
                        HStack(spacing: 6) {
                            Image(systemName: topic.icon)
                                .font(.caption.weight(.bold))
                                .foregroundStyle(topic.color)
                            Text("# " + topic.name)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(TuTuColor.dark)
                            Text(topic.count)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .background(Capsule().fill(topic.color.opacity(0.10)))
                        .overlay(Capsule().stroke(topic.color.opacity(0.20), lineWidth: 1))
                    }
                }
            }
        }
    }

    // MARK: - Weekly Ranking
    private var weeklyRankingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionTitle(title: "本周爆款排行")

            VStack(spacing: 10) {
                ForEach(Array(cards.enumerated()), id: \.element.id) { idx, card in
                    rankingRow(idx: idx, card: card)
                }
            }
        }
    }

    private func rankingRow(idx: Int, card: CommunityCard) -> some View {
        HStack(spacing: 12) {
            Text("\(idx + 1)")
                .font(.caption.weight(.bold))
                .foregroundStyle(idx < 3 ? .white : TuTuColor.dark)
                .frame(width: 28, height: 28)
                .background(
                    idx < 3
                        ? AnyShapeStyle(TuTuGradient.brandFlat)
                        : AnyShapeStyle(TuTuColor.groupedBackground),
                    in: Circle()
                )

            if let urlStr = card.imageURL, let url = URL(string: urlStr) {
                AsyncImage(url: url) { img in img.resizable().scaledToFill() } placeholder: {
                    RoundedRectangle(cornerRadius: 10).fill(card.background)
                }
                .frame(width: 48, height: 48)
                .clipped()
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            } else {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(card.background)
                    .frame(width: 48, height: 48)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(card.title).font(.subheadline.weight(.bold))
                Text("♥ \(card.likes) · 💬 \(card.comments)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: "flame.fill")
                .font(.caption.weight(.bold))
                .foregroundStyle(TuTuColor.orange)
        }
        .padding(14)
        .background(.background, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .tuTuShadow(.soft)
    }

    // MARK: - Creator Recommendation
    private var creatorSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionTitle(title: "创作者推荐")

            VStack(spacing: 10) {
                ForEach(creators) { creator in
                    creatorRow(creator)
                }
            }
        }
    }

    private func creatorRow(_ creator: CommunityCreator) -> some View {
        HStack(spacing: 12) {
            Circle()
                .fill(LinearGradient(colors: creator.avatarColors, startPoint: .topLeading, endPoint: .bottomTrailing))
                .frame(width: 46, height: 46)
                .overlay {
                    Text(creator.initial)
                        .font(.headline)
                        .foregroundStyle(.white)
                }
                .overlay(Circle().stroke(Color.white.opacity(0.7), lineWidth: 1))

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(creator.name)
                        .font(.headline)
                    if creator.verified {
                        Image(systemName: "checkmark.seal.fill")
                            .foregroundStyle(TuTuColor.orange)
                    }
                }
                Text("精选 Prompt 与场景案例持续更新")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button("关注") { }
                .buttonStyle(.bordered)
                .tint(TuTuColor.orange)
                .controlSize(.small)
        }
        .padding(14)
        .background(.background, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .tuTuShadow(.soft)
    }

    // MARK: - Feed（帖子卡片化）
    private var feedSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionTitle(title: "灵感动态")

            LazyVStack(spacing: 16) {
                ForEach(cards) { card in
                    NavigationLink {
                        CommunityPostDetailView(
                            card: card,
                            isLiked: likedCardIDs.contains(card.id),
                            isBookmarked: bookmarkedCardIDs.contains(card.id),
                            onToggleLike: { toggleLike(card) },
                            onToggleBookmark: { toggleBookmark(card) }
                        )
                    } label: {
                        feedCard(card)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func toggleLike(_ card: CommunityCard) {
        if likedCardIDs.contains(card.id) { likedCardIDs.remove(card.id) }
        else { likedCardIDs.insert(card.id) }
    }

    private func toggleBookmark(_ card: CommunityCard) {
        if bookmarkedCardIDs.contains(card.id) { bookmarkedCardIDs.remove(card.id) }
        else { bookmarkedCardIDs.insert(card.id) }
    }

    // MARK: - Feed Card（独立卡片：大图 + 标题 + 操作栏）
    private func feedCard(_ card: CommunityCard) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .bottomLeading) {
                Group {
                    if let imageURL = card.imageURL, let url = URL(string: imageURL) {
                        AsyncImage(url: url) { image in
                            image.resizable().scaledToFill()
                        } placeholder: {
                            Rectangle().fill(card.background)
                        }
                    } else {
                        Rectangle().fill(card.background)
                    }
                }
                .frame(height: 220)
                .frame(maxWidth: .infinity)
                .clipped()

                LinearGradient(
                    colors: [.clear, Color.black.opacity(0.34)],
                    startPoint: .center,
                    endPoint: .bottom
                )
                .frame(height: 220)
                .allowsHitTesting(false)

                Text(card.title)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
                    .padding(16)
            }

            VStack(alignment: .leading, spacing: 10) {
                Text(card.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)

                HStack(spacing: 8) {
                    Label(card.creator, systemImage: "person.circle")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("点击查看 Prompt")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(TuTuColor.orange)
                }
            }
            .padding(14)

            Divider().opacity(0.35)

            HStack(spacing: 0) {
                feedAction(
                    icon: likedCardIDs.contains(card.id) ? "heart.fill" : "heart",
                    text: card.likes,
                    tint: likedCardIDs.contains(card.id) ? TuTuColor.orange : .secondary
                ) { toggleLike(card) }
                feedAction(
                    icon: "bubble.left",
                    text: card.comments,
                    tint: .secondary
                ) {}
                feedAction(
                    icon: bookmarkedCardIDs.contains(card.id) ? "bookmark.fill" : "bookmark",
                    text: bookmarkedCardIDs.contains(card.id) ? "已收藏" : "收藏",
                    tint: bookmarkedCardIDs.contains(card.id) ? TuTuColor.purple : .secondary
                ) { toggleBookmark(card) }
                feedAction(
                    icon: "square.and.arrow.up",
                    text: "分享",
                    tint: .secondary
                ) {}
            }
            .padding(.vertical, 6)
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.black.opacity(0.04), lineWidth: 1)
        }
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .tuTuShadow(.soft)
    }

    private func feedAction(icon: String, text: String, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 5) {
                Image(systemName: icon)
                    .font(.footnote.weight(.semibold))
                Text(text)
                    .font(.caption.weight(.medium))
            }
            .foregroundStyle(tint)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Models

private struct CommunityTopic: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let color: Color
    let count: String

    static let sample: [CommunityTopic] = [
        .init(name: "节日海报", icon: "gift.fill", color: TuTuColor.orange, count: "× 1.2k"),
        .init(name: "电商主图", icon: "cart.fill", color: TuTuColor.purple, count: "× 942"),
        .init(name: "小红书风", icon: "book.fill", color: TuTuColor.coral, count: "× 786"),
        .init(name: "品牌 VI", icon: "sparkle", color: TuTuColor.mint, count: "× 512"),
        .init(name: "国风插画", icon: "leaf.fill", color: TuTuColor.sky, count: "× 384"),
        .init(name: "品志感摄影", icon: "camera.fill", color: TuTuColor.yellow, count: "× 271")
    ]
}

struct CommunityCreator: Identifiable {
    let id = UUID()
    let name: String
    let initial: String
    let avatarColors: [Color]
    let verified: Bool

    static let sample: [CommunityCreator] = [
        CommunityCreator(name: "AI 艺术家阿杰", initial: "杰", avatarColors: [Color(red: 0.52, green: 0.73, blue: 0.98), Color(red: 0.23, green: 0.46, blue: 0.95)], verified: true),
        CommunityCreator(name: "鹿小葵", initial: "鹿", avatarColors: [Color(red: 1.0, green: 0.82, blue: 0.28), Color(red: 0.98, green: 0.53, blue: 0.24)], verified: true),
        CommunityCreator(name: "墨染江南", initial: "墨", avatarColors: [Color(red: 0.90, green: 0.83, blue: 0.74), Color(red: 0.66, green: 0.49, blue: 0.36)], verified: true),
        CommunityCreator(name: "幻梦设计师", initial: "幻", avatarColors: [Color(red: 0.38, green: 0.47, blue: 0.97), Color(red: 0.20, green: 0.22, blue: 0.58)], verified: true)
    ]
}

struct CommunityCard: Identifiable {
    let id = UUID()
    let creator: String
    let title: String
    let description: String
    let likes: String
    let comments: String
    let background: LinearGradient
    let imageURL: String?

    static let sample: [CommunityCard] = [
        CommunityCard(
            creator: "鹿小葵",
            title: "梦幻城堡",
            description: "生成一个漂浮在云端之上的梦幻城堡场景，金色日落，轻盈云海，童话感强。",
            likes: "1.2w",
            comments: "342",
            background: LinearGradient(colors: [Color(red: 0.69, green: 0.80, blue: 0.98), Color(red: 0.94, green: 0.92, blue: 1.0)], startPoint: .topLeading, endPoint: .bottomTrailing),
            imageURL: GeneratedMedia.url("Community/community-castle-20260508-165127.png")?.absoluteString
        ),
        CommunityCard(
            creator: "小宇宙",
            title: "法式客厅",
            description: "生成一个被阳光照亮的法式客厅，植物茂密，窗景通透，家居杂志质感。",
            likes: "8623",
            comments: "198",
            background: LinearGradient(colors: [Color(red: 0.74, green: 0.86, blue: 0.62), Color(red: 0.97, green: 0.90, blue: 0.72)], startPoint: .topLeading, endPoint: .bottomTrailing),
            imageURL: GeneratedMedia.url("Community/community-french-livingroom-20260508-165341.png")?.absoluteString
        ),
        CommunityCard(
            creator: "AI 艺术家",
            title: "赛博街头",
            description: "生成一张赛博朋克雨夜街头场景，霓虹反射在湿润路面，跑车穿行，电影感强。",
            likes: "1.8w",
            comments: "564",
            background: LinearGradient(colors: [Color(red: 0.12, green: 0.17, blue: 0.34), Color(red: 0.07, green: 0.28, blue: 0.38)], startPoint: .topLeading, endPoint: .bottomTrailing),
            imageURL: GeneratedMedia.url("Community/community-cyber-street-20260508-165602.png")?.absoluteString
        )
    ]
}

// MARK: - Post Detail（大图 + 操作栏 + 评论）

struct CommunityPostDetailView: View {
    let card: CommunityCard
    let isLiked: Bool
    let isBookmarked: Bool
    let onToggleLike: () -> Void
    let onToggleBookmark: () -> Void

    @State private var comment: String = ""
    @State private var localComments: [PostComment] = PostComment.sample
    @FocusState private var commentFocused: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                heroSection
                actionBar
                promptSection
                commentSection
                applyCTA
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 40)
        }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("灵感详情")
        .navigationBarTitleDisplayMode(.inline)
    }

    /// 原图尺寸不缩放（保留比例，宽度跟屏幕对齐）
    private var heroSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            ZStack(alignment: .bottomLeading) {
                Group {
                    if let imageURL = card.imageURL, let url = URL(string: imageURL) {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    // 不裁切，保留原始比例
                                    .aspectRatio(contentMode: .fit)
                            default:
                                Rectangle().fill(card.background)
                                    .aspectRatio(4.0 / 5.0, contentMode: .fit)
                            }
                        }
                    } else {
                        Rectangle().fill(card.background)
                            .aspectRatio(4.0 / 5.0, contentMode: .fit)
                    }
                }
                .frame(maxWidth: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))

                LinearGradient(colors: [.clear, .clear, .black.opacity(0.38)], startPoint: .top, endPoint: .bottom)
                    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))

                VStack(alignment: .leading, spacing: 6) {
                    Text(card.title)
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    Text(card.creator)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.88))
                }
                .padding(24)
            }
        }
    }

    private var actionBar: some View {
        HStack(spacing: 10) {
            actionPill(
                icon: isLiked ? "heart.fill" : "heart",
                label: "\(card.likes) 赞",
                tint: isLiked ? TuTuColor.orange : TuTuColor.dark,
                background: isLiked ? TuTuColor.orange.opacity(0.12) : Color(.secondarySystemBackground)
            ) { onToggleLike() }

            actionPill(
                icon: "bubble.left.fill",
                label: "\(card.comments) 评论",
                tint: TuTuColor.dark,
                background: Color(.secondarySystemBackground)
            ) {
                commentFocused = true
            }

            actionPill(
                icon: isBookmarked ? "bookmark.fill" : "bookmark",
                label: isBookmarked ? "已收藏" : "收藏",
                tint: isBookmarked ? TuTuColor.purple : TuTuColor.dark,
                background: isBookmarked ? TuTuColor.purple.opacity(0.12) : Color(.secondarySystemBackground)
            ) { onToggleBookmark() }

            actionPill(
                icon: "square.and.arrow.up",
                label: "分享",
                tint: TuTuColor.dark,
                background: Color(.secondarySystemBackground)
            ) {}
        }
    }

    private func actionPill(icon: String, label: String, tint: Color, background: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.caption.weight(.bold))
                Text(label)
                    .font(.caption.weight(.semibold))
                    .lineLimit(1)
            }
            .foregroundStyle(tint)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(background, in: Capsule())
        }
        .buttonStyle(.plain)
    }

    private var promptSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("提示词描述")
                .font(.title3.weight(.bold))
            Text(card.description)
                .font(.body)
                .foregroundStyle(TuTuColor.dark)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(20)
        .background(.background, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
    }

    private var commentSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("评论")
                    .font(.title3.weight(.bold))
                Spacer()
                Text("\(localComments.count) 条")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // 输入框
            HStack(spacing: 10) {
                Image(systemName: "bubble.left.fill")
                    .foregroundStyle(TuTuColor.orange)
                TextField("写下你的想法…", text: $comment, axis: .vertical)
                    .focused($commentFocused)
                    .font(.subheadline)
                    .lineLimit(1...3)
                Button {
                    guard !comment.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                    let new = PostComment(author: "我", body: comment, likes: 0)
                    withAnimation {
                        localComments.insert(new, at: 0)
                        comment = ""
                        commentFocused = false
                    }
                } label: {
                    Text("发送")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(TuTuGradient.brandFlat, in: Capsule())
                }
                .buttonStyle(.plain)
                .opacity(comment.trimmingCharacters(in: .whitespaces).isEmpty ? 0.4 : 1)
            }
            .padding(12)
            .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 18, style: .continuous))

            // 评论列表
            VStack(spacing: 12) {
                ForEach(localComments) { c in
                    commentRow(c)
                }
            }
        }
        .padding(20)
        .background(.background, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
    }

    private func commentRow(_ c: PostComment) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Circle()
                .fill(TuTuGradient.brandFlat)
                .frame(width: 34, height: 34)
                .overlay {
                    Text(String(c.author.prefix(1)))
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.white)
                }
            VStack(alignment: .leading, spacing: 4) {
                Text(c.author)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(TuTuColor.dark)
                Text(c.body)
                    .font(.subheadline)
                    .foregroundStyle(TuTuColor.dark)
                HStack(spacing: 12) {
                    Label("\(c.likes)", systemImage: "heart")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text("回复")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer(minLength: 0)
        }
    }

    private var applyCTA: some View {
        NavigationLink {
            CreateView(initialPrompt: card.description)
        } label: {
            BrandButtonLabel(title: "用这个灵感继续创作", systemImage: "wand.and.stars")
        }
        .buttonStyle(.plain)
    }
}

struct PostComment: Identifiable {
    let id = UUID()
    let author: String
    let body: String
    let likes: Int

    static let sample: [PostComment] = [
        .init(author: "葡萄 UI", body: "这张城堡的光影好顶，Prompt 拿走啦", likes: 12),
        .init(author: "设计师阿鱼", body: "很适合套到品牌年度 KV 里", likes: 6),
        .init(author: "林间小径", body: "想复刻一张傍晚光的版本", likes: 3)
    ]
}
