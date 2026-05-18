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
        GlowingMeshCard(palette: .brand, cornerRadius: 28, padding: 20, height: 180) {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 6) {
                    Image(systemName: "sparkles.rectangle.stack.fill")
                        .font(.caption.weight(.bold))
                    Text("完整模板库")
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .liquidGlassCapsule(tint: .white)

                Spacer(minLength: 0)

                Text("固定模板库")
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                    .foregroundStyle(.white)

                Text("筛选、专题包和完整模板列表都收在这里")
                    .font(.footnote)
                    .foregroundStyle(.white.opacity(0.92))
                    .lineLimit(2)

                HStack(spacing: 8) {
                    LiquidGlassMetric(title: "固定模板 \(session.templates.count)", systemImage: "square.grid.2x2")
                    LiquidGlassMetric(title: "会员 \(premiumCount)", systemImage: "crown.fill")
                }
            }
        }
    }

    private var quickStatsSection: some View {
        HStack(spacing: 10) {
            statBlock(value: "\(session.templates.count)", label: "全部模板", palette: .sunrise, icon: "square.grid.2x2.fill")
            statBlock(value: "\(premiumCount)", label: "会员专属", palette: .dawn, icon: "crown.fill")
            statBlock(value: "\(session.categories.count)", label: "行业分类", palette: .verdant, icon: "tag.fill")
            statBlock(value: "4 组", label: "推荐专题", palette: .aurora, icon: "square.stack.3d.up.fill")
        }
    }

    private func statBlock(value: String, label: String, palette: AnimatedMeshBackground.Palette, icon: String) -> some View {
        GlowingMeshTile(palette: palette, cornerRadius: 18, padding: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Image(systemName: icon)
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 22, height: 22)
                    .background(.white.opacity(0.22), in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                Spacer(minLength: 2)

                Text(value)
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .shadow(color: .black.opacity(0.18), radius: 2, y: 1)
                    .contentTransition(.numericText())
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Text(label)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.94))
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, minHeight: 78, alignment: .topLeading)
        }
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

        return GlowingMeshTile(palette: collection.palette, cornerRadius: 22, padding: 16) {
            VStack(alignment: .leading, spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(.white.opacity(0.22))
                        .frame(width: 42, height: 42)
                    Image(systemName: collection.systemImage)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(.white)
                        .shadow(color: .black.opacity(0.18), radius: 2, y: 1)
                }

                VStack(alignment: .leading, spacing: 5) {
                    Text(collection.title)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .shadow(color: .black.opacity(0.18), radius: 2, y: 1)
                    Text(collection.subtitle)
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.92))
                        .lineLimit(3)
                }

                Spacer(minLength: 4)

                HStack {
                    Text("\(count) 个模板")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .liquidGlassCapsule(tint: .white)
                    Spacer()
                    Image(systemName: "arrow.up.right")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.white.opacity(0.9))
                }
            }
            .frame(maxWidth: .infinity, minHeight: 152, alignment: .topLeading)
        }
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

        return VStack(alignment: .leading, spacing: 14) {
            TemplateArtworkView(template: template, height: 176, cornerRadius: 24)

            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 8) {
                        TagChip(
                            text: categoryName(for: template.categoryId),
                            systemImage: "tag.fill",
                            color: palette.accent,
                            style: .tinted
                        )
                        if template.isPremium {
                            Label("会员", systemImage: "crown.fill")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(TuTuColor.orange)
                        }
                    }

                    Text(template.title)
                        .font(.system(size: 21, weight: .bold, design: .rounded))
                        .foregroundStyle(TuTuColor.dark)
                        .lineLimit(1)
                    Text(template.scene)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                    Text(template.promptHint)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer(minLength: 0)

                VStack(alignment: .trailing, spacing: 8) {
                    Text("使用模板")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(palette.accent, in: Capsule())

                    Text(TemplateVisualBook.usageSummary(for: template.id))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: TuTuRadius.hero - 2, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: TuTuRadius.hero - 2, style: .continuous)
                .stroke(TuTuColor.softLine, lineWidth: 1)
        }
        .tuTuShadow(.soft)
    }

    private func categoryName(for id: String) -> String {
        session.categories.first(where: { $0.id == id })?.name ?? "未分类"
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
        ZStack(alignment: .bottomLeading) {
            TemplateArtworkView(template: template, height: 236, cornerRadius: 28)

            LinearGradient(colors: [Color.clear, Color.black.opacity(0.46)], startPoint: .center, endPoint: .bottom)
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))

            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    TagChip(
                        text: session.categories.first(where: { $0.id == template.categoryId })?.name ?? "未分类",
                        systemImage: "tag.fill",
                        color: .white,
                        style: .glass
                    )
                    if template.isPremium {
                        TagChip(text: "会员模板", systemImage: "crown.fill", color: TuTuColor.orange, style: .filled)
                    }
                }

                Text(template.title)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text(template.scene)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.92))
                    .lineLimit(3)
            }
            .padding(22)
        }
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
