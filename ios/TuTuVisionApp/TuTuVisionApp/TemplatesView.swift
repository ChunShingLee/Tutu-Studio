import SwiftUI

struct TemplatesView: View {
    @EnvironmentObject private var session: AppSession
    @State private var query = ""
    @State private var selectedCategoryId = "all"
    @Namespace private var categoryChipNamespace

    private var categoryOptions: [TemplateCategory] {
        [TemplateCategory(id: "all", name: "全部")] + session.categories
    }

    private var filtered: [CreativeTemplate] {
        session.templates.filter { template in
            let matchesQuery = query.isEmpty || template.title.localizedCaseInsensitiveContains(query) || template.scene.localizedCaseInsensitiveContains(query)
            let matchesCategory = selectedCategoryId == "all" || template.categoryId == selectedCategoryId
            return matchesQuery && matchesCategory
        }
    }

    private var premiumCount: Int {
        session.templates.filter(\.isPremium).count
    }

    private var curatedCollections: [TemplateCollection] {
        [
            .init(id: "ecommerce-pack", title: "电商转化包", subtitle: "主图、详情、单品和餐饮上新都收进来", categoryId: "ecommerce", systemImage: "bag.fill", tint: TuTuColor.orange, palette: .sunrise),
            .init(id: "social-pack", title: "社媒种草包", subtitle: "封面、九宫格、直播预告集中管理", categoryId: "social", systemImage: "megaphone.fill", tint: TuTuColor.purple, palette: .dawn),
            .init(id: "branding-pack", title: "品牌提案包", subtitle: "Logo、KV 与包装提案更适合品牌项目", categoryId: "branding", systemImage: "seal.fill", tint: Color(red: 0.72, green: 0.48, blue: 0.22), palette: .verdant),
            .init(id: "portrait-pack", title: "人像海报包", subtitle: "AI 写真和招生海报更适合人物表达", categoryId: "portrait", systemImage: "person.crop.square.fill", tint: Color(red: 0.31, green: 0.60, blue: 0.94), palette: .aurora)
        ]
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                AppPageHeader(title: "模板广场")
                heroCard
                quickStatsSection
                curatedCollectionsSection
                categorySection
                templateListSection
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 96)
        }
        .refreshable { await session.loadTemplates() }
        .searchable(text: $query, prompt: "搜索模板 / 场景")
        .background(AuroraBackground(leadingTint: TuTuColor.orange.opacity(0.10)).ignoresSafeArea())
        .navigationBarHidden(true)
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            // 图片区
            plazaFullImage(id: "plaza-hero", fallbackId: "product-main")
                .frame(maxWidth: .infinity)
                .frame(height: 140)
                .clipped()

            // 文字区
            HStack(spacing: 8) {
                HStack(spacing: 5) {
                    Image(systemName: "sparkles.rectangle.stack.fill")
                        .font(.caption2.weight(.bold))
                    Text("完整模板库")
                        .font(.caption2.weight(.semibold))
                }
                .foregroundStyle(TuTuColor.orange)

                Spacer()

                Text("固定模板 \(session.templates.count)")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Color.secondary)

                premiumMetric(count: premiumCount)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
        .shadow(color: Color.black.opacity(0.08), radius: 12, y: 6)
    }

    // MARK: - Plaza Full Image Helper

    /// 图片铺满整个卡片作为背景，scaledToFill + clipped
    private func plazaFullImage(id: String, fallbackId: String) -> some View {
        GeometryReader { geo in
            Group {
                if let path = TemplateVisualBook.assetPath(for: id),
                   let url = GeneratedMedia.url(path),
                   let uiImage = UIImage(contentsOfFile: url.path) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                } else if let path = TemplateVisualBook.assetPath(for: fallbackId),
                          let url = GeneratedMedia.url(path),
                          let uiImage = UIImage(contentsOfFile: url.path) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                } else {
                    LinearGradient(
                        colors: [TuTuColor.orange.opacity(0.4), TuTuColor.purple.opacity(0.4)],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                }
            }
            .frame(width: geo.size.width, height: geo.size.height)
            .clipped()
        }
    }

    private func premiumMetric(count: Int) -> some View {
        HStack(spacing: 6) {
            Image(systemName: "crown.fill")
                .font(.caption.weight(.bold))
            Text("会员 \(count)")
                .font(.caption.weight(.semibold))
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(
            LinearGradient(
                colors: [Color(red: 0.95, green: 0.75, blue: 0.20), TuTuColor.orange],
                startPoint: .leading,
                endPoint: .trailing
            ),
            in: Capsule()
        )
    }

    private var quickStatsSection: some View {
        HStack(spacing: 8) {
            statBlock(value: "\(session.templates.count)", label: "全部模板", icon: "square.grid.2x2.fill", thumbId: "plaza-stat-all", fallbackId: "product-main")
            statBlock(value: "\(premiumCount)", label: "会员专属", icon: "crown.fill", thumbId: "plaza-stat-premium", fallbackId: "beauty-single")
            statBlock(value: "\(session.categories.count)", label: "行业分类", icon: "tag.fill", thumbId: "plaza-stat-categories", fallbackId: "food-menu")
            statBlock(value: "4 组", label: "推荐专题", icon: "square.stack.3d.up.fill", thumbId: "plaza-stat-collections", fallbackId: "storybook-scene")
        }
    }

    private func statBlock(value: String, label: String, icon: String, thumbId: String, fallbackId: String) -> some View {
        ZStack(alignment: .bottom) {
            // 图片铺满整个卡片
            plazaFullImage(id: thumbId, fallbackId: fallbackId)

            // 底部：半透明标签条
            HStack(spacing: 3) {
                Image(systemName: icon)
                    .font(.system(size: 9, weight: .bold))
                Text(label)
                    .font(.system(size: 10, weight: .semibold))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 6)
            .padding(.vertical, 4)
            .frame(maxWidth: .infinity)
            .background(Color.black.opacity(0.45))
        }
        .frame(maxWidth: .infinity, minHeight: 80)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .shadow(color: Color.black.opacity(0.06), radius: 6, y: 3)
    }

    private var categorySection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                SectionTitle(title: "场景筛选", trailing: "按分类浏览")
                Spacer()
                if selectedCategoryId != "all" {
                    Button("清除") {
                        withAnimation(.spring(response: 0.45, dampingFraction: 0.82)) {
                            selectedCategoryId = "all"
                        }
                    }
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(TuTuColor.orange)
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(categoryOptions) { category in
                        categoryChip(category)
                    }
                }
                .padding(.vertical, 2)
            }
        }
        .padding(18)
        .liquidGlassCard(cornerRadius: TuTuRadius.primary)
        .tuTuShadow(.soft)
    }

    private func categoryChip(_ category: TemplateCategory) -> some View {
        let isSelected = selectedCategoryId == category.id

        return Button {
            withAnimation(.spring(response: 0.45, dampingFraction: 0.82)) {
                selectedCategoryId = category.id
            }
        } label: {
            Text(category.name)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(isSelected ? .white : TuTuColor.dark)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background {
                    if isSelected {
                        Capsule()
                            .fill(TuTuGradient.brandFlat)
                            .shadow(color: TuTuColor.orange.opacity(0.25), radius: 8, y: 3)
                            .matchedGeometryEffect(id: "template-category-chip", in: categoryChipNamespace)
                    } else {
                        Capsule()
                            .fill(TuTuColor.groupedBackground)
                    }
                }
        }
        .buttonStyle(.plain)
    }

    private var curatedCollectionsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionTitle(title: "推荐专题", trailing: "一键切到对应模板")

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(curatedCollections) { collection in
                    Button {
                        selectedCategoryId = collection.categoryId
                    } label: {
                        collectionCard(collection)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func collectionCard(_ collection: TemplateCollection) -> some View {
        let count = session.templates.filter { $0.categoryId == collection.categoryId }.count
        let plazaId = "plaza-collection-\(collection.categoryId)"
        let fallback = session.templates.first(where: { $0.categoryId == collection.categoryId })?.id ?? "product-main"

        return ZStack(alignment: .bottom) {
            // 图片铺满
            plazaFullImage(id: plazaId, fallbackId: fallback)

            // 底部标签条
            HStack(spacing: 4) {
                Image(systemName: collection.systemImage)
                    .font(.system(size: 9, weight: .bold))
                Text(collection.title)
                    .font(.system(size: 11, weight: .semibold))
                Spacer()
                Text("\(count)")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.white.opacity(0.7))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .frame(maxWidth: .infinity)
            .background(Color.black.opacity(0.45))
        }
        .frame(maxWidth: .infinity, minHeight: 110)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .shadow(color: Color.black.opacity(0.06), radius: 8, y: 4)
    }


    private var templateListSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionTitle(title: "模板库", trailing: "共 \(filtered.count) 个")

            if filtered.isEmpty {
                emptyTemplateCard
            } else {
                LazyVStack(spacing: 14) {
                    ForEach(filtered) { template in
                        NavigationLink {
                            TemplateDetailView(template: template)
                        } label: {
                            templateCard(template)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    /// 空状态：除了提示，还暴露"一键切分类"的 Chips 和"清除筛选"的快捷按钮。
    private var emptyTemplateCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(TuTuColor.purple.opacity(0.14))
                        .frame(width: 42, height: 42)
                    Image(systemName: "square.grid.2x2")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(TuTuColor.purple)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text("没有匹配模板")
                        .font(.headline)
                        .foregroundStyle(TuTuColor.dark)
                    Text(query.isEmpty ? "换一个行业分类看看" : "可以清空搜索词，或者切换到其他分类")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                if !query.isEmpty || selectedCategoryId != "all" {
                    Button {
                        withAnimation(.spring(response: 0.45, dampingFraction: 0.82)) {
                            query = ""
                            selectedCategoryId = "all"
                        }
                    } label: {
                        Label("清除筛选", systemImage: "xmark.circle.fill")
                            .labelStyle(.titleAndIcon)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 7)
                            .background(TuTuGradient.brandFlat, in: Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }

            Divider().opacity(0.35)

            Text("一键切到热门场景")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                ForEach(curatedCollections) { collection in
                    Button {
                        withAnimation(.spring(response: 0.45, dampingFraction: 0.82)) {
                            selectedCategoryId = collection.categoryId
                        }
                    } label: {
                        emptyShortcutRow(collection)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.black.opacity(0.04), lineWidth: 1)
        }
        .tuTuShadow(.soft)
    }

    private func emptyShortcutRow(_ collection: TemplateCollection) -> some View {
        HStack(spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(collection.tint.opacity(0.16))
                    .frame(width: 34, height: 34)
                Image(systemName: collection.systemImage)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(collection.tint)
            }

            VStack(alignment: .leading, spacing: 0) {
                Text(collection.title)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(TuTuColor.dark)
                    .lineLimit(1)
                Text("切换该分类")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 4)

            Image(systemName: "arrow.up.right")
                .font(.caption2.weight(.bold))
                .foregroundStyle(collection.tint)
        }
        .padding(10)
        .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func templateCard(_ template: CreativeTemplate) -> some View {
        let palette = TemplateVisualBook.palette(for: template)

        return VStack(alignment: .leading, spacing: 0) {
            TemplateArtworkView(template: template, height: 180, cornerRadius: 0)
                .frame(maxWidth: .infinity)
                .frame(height: 180)
                .clipped()

            // 文字区
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(template.title)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Color.primary)
                        .lineLimit(1)
                    Text(template.scene)
                        .font(.caption2)
                        .foregroundStyle(Color.secondary)
                        .lineLimit(1)
                }

                Spacer()

                if template.isPremium {
                    Image(systemName: "crown.fill")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(TuTuColor.orange)
                }

                Text("使用")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(palette.accent, in: Capsule())
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .shadow(color: Color.black.opacity(0.06), radius: 10, y: 5)
    }

}

struct TemplateDetailView: View {
    @EnvironmentObject private var session: AppSession
    let template: CreativeTemplate

    private var palette: TemplatePalette {
        TemplateVisualBook.palette(for: template)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                heroCard
                infoCard
                promptCard
                relatedCard
                actionCard
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 28)
        }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("模板详情")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            TemplateArtworkView(template: template, height: 240, cornerRadius: 0)
                .frame(maxWidth: .infinity)
                .frame(height: 240)
                .clipped()

            // 文字区
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(session.categories.first(where: { $0.id == template.categoryId })?.name ?? "未分类")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(TuTuColor.orange)
                    if template.isPremium {
                        Label("会员", systemImage: "crown.fill")
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(TuTuColor.orange)
                    }
                    Spacer()
                }
                Text(template.title)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color.primary)
                Text(template.scene)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
                    .lineLimit(2)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .shadow(color: palette.accent.opacity(0.14), radius: 20, y: 12)
    }

    private var infoCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            cardTitle("模板信息")

            VStack(spacing: 12) {
                detailRow(title: "分类", value: session.categories.first(where: { $0.id == template.categoryId })?.name ?? "未分类")
                detailRow(title: "场景", value: template.scene)
                detailRow(title: "热度", value: TemplateVisualBook.usageSummary(for: template.id))
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var promptCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            cardTitle("推荐提示词")

            Text(template.promptHint)
                .font(.body)
                .foregroundStyle(TuTuColor.dark)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(16)
                .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    @ViewBuilder
    private var relatedCard: some View {
        let related = session.relatedTemplates(for: template)

        if !related.isEmpty {
            VStack(alignment: .leading, spacing: 14) {
                cardTitle("同类模板")

                VStack(spacing: 10) {
                    ForEach(related) { item in
                        NavigationLink {
                            TemplateDetailView(template: item)
                        } label: {
                            HStack(spacing: 12) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                                        .fill(TemplateVisualBook.palette(for: item).gradient)
                                        .frame(width: 54, height: 54)

                                    Image(systemName: TemplateVisualBook.palette(for: item).symbol)
                                        .foregroundStyle(.white)
                                }

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(item.title)
                                        .font(.headline)
                                        .foregroundStyle(TuTuColor.dark)
                                    Text(item.scene)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .lineLimit(2)
                                }

                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundStyle(.tertiary)
                            }
                            .padding(14)
                            .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(18)
            .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        }
    }

    private var actionCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            NavigationLink {
                CreateView(selectedTemplate: template, initialPrompt: template.promptHint)
            } label: {
                BrandButtonLabel(title: "使用这个模板开始创作", systemImage: "wand.and.stars")
            }
            .buttonStyle(.plain)

            Text("将推荐提示词直接带入创作页，再继续微调风格、比例与品牌细节。")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func cardTitle(_ title: String) -> some View {
        Text(title)
            .font(.title3.weight(.bold))
            .foregroundStyle(TuTuColor.dark)
    }

    private func detailRow(title: String, value: String) -> some View {
        HStack(alignment: .top) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(TuTuColor.dark)
            Spacer()
            Text(value)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.trailing)
        }
        .padding(14)
        .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

private struct TemplateCollection: Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let categoryId: String
    let systemImage: String
    let tint: Color
    let palette: AnimatedMeshBackground.Palette
}
