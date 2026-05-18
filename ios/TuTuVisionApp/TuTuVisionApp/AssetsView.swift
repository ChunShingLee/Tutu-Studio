import SwiftUI

struct AssetsView: View {
    @EnvironmentObject private var session: AppSession
    @State private var selectedSort = "最新"

    private var sortedAssets: [Asset] {
        switch selectedSort {
        case "名称":
            return session.assets.sorted { $0.title.localizedCompare($1.title) == .orderedAscending }
        default:
            return session.assets.sorted { $0.createdAt > $1.createdAt }
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                sortCard
                assetListSection
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 28)
        }
        .refreshable { await session.loadAssets() }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("项目与素材库")
        .navigationBarTitleDisplayMode(.large)
    }

    private var sortCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                sectionTitle("素材管理")
                Spacer()
                Text("结果回流")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Picker("排序", selection: $selectedSort) {
                Text("最新").tag("最新")
                Text("名称").tag("名称")
            }
            .pickerStyle(.segmented)
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    @ViewBuilder
    private var assetListSection: some View {
        if sortedAssets.isEmpty {
            ContentUnavailableView("还没有素材", systemImage: "photo", description: Text("去创作页提交一次生成任务，结果会自动进入素材库。"))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
                .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        } else {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    sectionTitle("素材列表")
                    Spacer()
                    Text("共 \(sortedAssets.count) 个")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                LazyVStack(spacing: 14) {
                    ForEach(sortedAssets) { asset in
                        NavigationLink {
                            AssetDetailView(asset: asset)
                        } label: {
                            assetCard(asset)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func assetCard(_ asset: Asset) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            AsyncImage(url: URL(string: asset.imageUrl)) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(Color(.systemGray5))
            }
            .frame(height: 196)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))

            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(asset.title)
                        .font(.headline)
                        .foregroundStyle(TuTuColor.dark)
                    Text(asset.prompt)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                Spacer()
                if let mode = asset.mode {
                    assetModeChip(mode)
                }
            }

            Text(asset.createdAt.formatted(date: .abbreviated, time: .shortened))
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 10) {
                NavigationLink {
                    CreateView(
                        initialPrompt: asset.prompt,
                        initialMode: .imageToImage,
                        initialReferenceImageUrl: asset.imageUrl
                    )
                } label: {
                    actionChip(title: "再次图生图", systemImage: "photo.on.rectangle.angled")
                }
                .buttonStyle(.plain)

                NavigationLink {
                    CreateView(
                        initialPrompt: asset.prompt,
                        initialMode: .localEdit,
                        initialReferenceImageUrl: asset.imageUrl,
                        initialLocalEditInstruction: asset.editInstruction ?? "",
                        initialEditArea: asset.editArea ?? "主体",
                        initialEditStrength: asset.editStrength ?? "标准"
                    )
                } label: {
                    actionChip(title: "局部修改", systemImage: "paintbrush.pointed")
                }
                .buttonStyle(.plain)
            }
        }
        .padding(16)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func sectionTitle(_ title: String) -> some View {
        Text(title)
            .font(.title3.weight(.bold))
            .foregroundStyle(TuTuColor.dark)
    }

    private func assetModeChip(_ mode: GenerationMode) -> some View {
        Text(modeTitle(mode))
            .font(.caption.weight(.semibold))
            .foregroundStyle(TuTuColor.orange)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(TuTuColor.orange.opacity(0.12), in: Capsule())
    }

    private func actionChip(title: String, systemImage: String) -> some View {
        Label(title, systemImage: systemImage)
            .font(.caption.weight(.medium))
            .foregroundStyle(TuTuColor.dark)
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .background(TuTuColor.groupedBackground, in: Capsule())
    }

    private func modeTitle(_ mode: GenerationMode) -> String {
        switch mode {
        case .textToImage: return "文生图"
        case .imageToImage: return "图生图"
        case .localEdit: return "局部修改"
        }
    }
}

struct AssetDetailView: View {
    @EnvironmentObject private var session: AppSession
    let asset: Asset

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                previewCard
                infoCard
                latestJobCard
                actionCard
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 28)
        }
        .task { session.selectAsset(asset) }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("素材详情")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var previewCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            AsyncImage(url: URL(string: asset.imageUrl)) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color(.systemGray5))
            }
            .frame(height: 320)
            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

            if let mode = asset.mode {
                assetModeChip(mode)
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var infoCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            cardTitle("素材信息")
            Text(asset.title)
                .font(.headline)
                .foregroundStyle(TuTuColor.dark)
            Text(asset.prompt)
                .foregroundStyle(.secondary)
            Text("生成时间：\(asset.createdAt.formatted(date: .complete, time: .shortened))")
                .font(.caption)
                .foregroundStyle(.secondary)

            if let editInstruction = asset.editInstruction, !editInstruction.isEmpty {
                Text("局部修改说明：\(editInstruction)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    @ViewBuilder
    private var latestJobCard: some View {
        if let latestJob = session.latestJob,
           latestJob.imageUrl == asset.imageUrl {
            VStack(alignment: .leading, spacing: 14) {
                cardTitle("最近任务信息")
                Text("状态：\(jobStatusTitle(latestJob.status))")
                if let style = latestJob.style, let aspectRatio = latestJob.aspectRatio {
                    Text("风格：\(style) · 比例：\(aspectRatio)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                if let mode = latestJob.mode {
                    Text("模式：\(modeTitle(mode))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(18)
            .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        }
    }

    private var actionCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            cardTitle("继续创作")

            NavigationLink {
                CreateView(
                    initialPrompt: asset.prompt,
                    initialMode: .imageToImage,
                    initialReferenceImageUrl: asset.imageUrl
                )
            } label: {
                primaryAction(title: "基于该素材再次图生图")
            }
            .buttonStyle(.plain)

            NavigationLink {
                CreateView(
                    initialPrompt: asset.prompt,
                    initialMode: .localEdit,
                    initialReferenceImageUrl: asset.imageUrl,
                    initialLocalEditInstruction: asset.editInstruction ?? "",
                    initialEditArea: asset.editArea ?? "主体",
                    initialEditStrength: asset.editStrength ?? "标准"
                )
            } label: {
                secondaryAction(title: "基于该素材继续局部修改")
            }
            .buttonStyle(.plain)

            NavigationLink {
                CreateView(initialPrompt: asset.prompt)
            } label: {
                secondaryAction(title: "仅复用提示词重新创作")
            }
            .buttonStyle(.plain)

            if let template = inferredTemplate {
                NavigationLink("查看可能关联模板：\(template.title)") {
                    TemplateDetailView(template: template)
                }
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var inferredTemplate: CreativeTemplate? {
        session.templates.first(where: { asset.title.contains($0.title) || asset.prompt.contains($0.title) })
    }

    private func primaryAction(title: String) -> some View {
        HStack {
            Spacer()
            Text(title)
                .font(.headline)
            Spacer()
        }
        .padding(.vertical, 15)
        .background(
            LinearGradient(colors: [TuTuColor.orange, TuTuColor.purple], startPoint: .leading, endPoint: .trailing),
            in: RoundedRectangle(cornerRadius: 20, style: .continuous)
        )
        .foregroundStyle(.white)
    }

    private func secondaryAction(title: String) -> some View {
        HStack {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(TuTuColor.dark)
            Spacer()
            Image(systemName: "arrow.up.right")
                .foregroundStyle(.tertiary)
        }
        .padding(14)
        .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private func cardTitle(_ title: String) -> some View {
        Text(title)
            .font(.title3.weight(.bold))
            .foregroundStyle(TuTuColor.dark)
    }

    private func assetModeChip(_ mode: GenerationMode) -> some View {
        Text(modeTitle(mode))
            .font(.caption.weight(.semibold))
            .foregroundStyle(TuTuColor.orange)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(TuTuColor.orange.opacity(0.12), in: Capsule())
    }

    private func modeTitle(_ mode: GenerationMode) -> String {
        switch mode {
        case .textToImage: return "文生图"
        case .imageToImage: return "图生图"
        case .localEdit: return "局部修改"
        }
    }

    private func jobStatusTitle(_ status: JobStatus) -> String {
        switch status {
        case .queued: return "排队中"
        case .running: return "生成中"
        case .succeeded: return "已完成"
        case .failed: return "失败"
        }
    }
}
