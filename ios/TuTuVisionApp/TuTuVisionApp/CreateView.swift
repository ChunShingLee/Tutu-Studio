import SwiftUI
import PhotosUI
import UIKit

struct CreateView: View {
    @EnvironmentObject private var session: AppSession
    @State private var prompt: String
    @State private var selectedTemplate: CreativeTemplate?
    @State private var style = "商业摄影"
    @State private var aspectRatio = "1:1"
    @State private var createMode: CreateMode
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var selectedUIImage: UIImage?
    @State private var selectedDemoMaterial: DemoPhoto?
    @State private var localEditInstruction: String
    @State private var localEditArea: String
    @State private var localEditStrength: String

    private let promptIdeas = [
        "产品主体置中，背景高级，适合电商主图",
        "保留大面积留白，便于后期加入营销文案",
        "画面年轻有活力，适合小红书和社媒传播"
    ]

    private let styleOptions = ["商业摄影", "插画海报", "极简设计", "国潮风"]
    private let ratioOptions = ["1:1", "3:4", "9:16", "16:9"]
    private let editAreas = ["主体", "背景", "局部文字区", "边缘扩展"]
    private let editStrengthOptions = ["轻微", "标准", "明显"]
    private let demoMaterials = DemoPhoto.sample

    init(
        selectedTemplate: CreativeTemplate? = nil,
        initialPrompt: String = "",
        initialMode: CreateMode = .textToImage,
        initialReferenceImageUrl: String? = nil,
        initialLocalEditInstruction: String = "",
        initialEditArea: String = "主体",
        initialEditStrength: String = "标准"
    ) {
        _selectedTemplate = State(initialValue: selectedTemplate)
        _prompt = State(initialValue: initialPrompt)
        _createMode = State(initialValue: initialMode)
        _localEditInstruction = State(initialValue: initialLocalEditInstruction)
        _localEditArea = State(initialValue: initialEditArea)
        _localEditStrength = State(initialValue: initialEditStrength)

        if let initialReferenceImageUrl {
            _selectedDemoMaterial = State(initialValue: DemoPhoto.remote(url: initialReferenceImageUrl))
        }
    }

    private var cleanedPrompt: String {
        prompt.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var hasReferenceImage: Bool {
        selectedUIImage != nil || selectedDemoMaterial != nil
    }

    private var referenceImageURL: String? {
        selectedDemoMaterial?.imageURL
    }

    private var referenceImageBase64: String? {
        guard let selectedUIImage,
              let data = selectedUIImage.jpegData(compressionQuality: 0.82) else { return nil }
        return data.base64EncodedString()
    }

    private var canSubmit: Bool {
        switch createMode {
        case .textToImage:
            return !cleanedPrompt.isEmpty && !session.isLoading
        case .imageToImage:
            return !cleanedPrompt.isEmpty && hasReferenceImage && !session.isLoading
        case .localEdit:
            return !cleanedPrompt.isEmpty && hasReferenceImage && !localEditInstruction.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !session.isLoading
        }
    }

    private var submitTitle: String {
        if session.isLoading { return "生成中..." }
        switch createMode {
        case .textToImage: return "提交文生图任务"
        case .imageToImage: return "提交图生图任务"
        case .localEdit: return "提交局部修改任务"
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                AppPageHeader(title: "开始创作")
                headerCard
                workflowSummaryCard
                modeCard
                creationEditorCard
                inspirationCard
                templateCard
                localEditCard
                resultCard
                historyCard
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 28)
        }
        .background(DesignTokens.Colors.background.ignoresSafeArea())
        .navigationBarHidden(true)
        .task(id: selectedPhotoItem) {
            await loadSelectedPhoto()
        }
    }

    private var workflowSummaryCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .brandFluid
        ) {
            VStack(alignment: .leading, spacing: 16) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("创作工作流")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(Color.primary)
                        Text(createMode.workflowSummary)
                            .font(.subheadline)
                            .foregroundStyle(Color.secondary)
                    }

                    Spacer(minLength: 12)

                    quotaCapsule
                }

                HStack(spacing: 12) {
                    workflowStep(
                        index: 0,
                        label: "01",
                        title: createMode == .textToImage ? "描述画面" : "准备参考图",
                        subtitle: createMode == .textToImage ? "先明确主体、场景和用途" : "上传素材或先选演示照片",
                        tint: TuTuColor.orange
                    )

                    workflowStep(
                        index: 1,
                        label: "02",
                        title: createMode == .localEdit ? "圈定修改目标" : "补充风格参数",
                        subtitle: createMode == .localEdit ? "指定区域、强度和改动说明" : "设置风格、比例与模板场景",
                        tint: TuTuColor.purple
                    )

                    workflowStep(
                        index: 2,
                        label: "03",
                        title: "生成并回看",
                        subtitle: "结果会同步进素材库与详情页",
                        tint: TuTuColor.mint
                    )
                }

                if createMode != .textToImage || selectedTemplate != nil || hasReferenceImage {
                    HStack(spacing: 10) {
                        if createMode != .textToImage {
                            compactBadge(title: createMode.title, systemImage: createMode.symbol, emphasis: TuTuColor.orange)
                        }
                        if let selectedTemplate {
                            compactBadge(title: selectedTemplate.title, systemImage: "square.grid.2x2.fill", emphasis: TuTuColor.purple)
                        }
                        if hasReferenceImage {
                            compactBadge(title: selectedUIImage != nil ? "已上传参考图" : "已选演示素材", systemImage: "photo.fill", emphasis: Color(red: 0.17, green: 0.58, blue: 0.43))
                        }
                    }
                }
            }
        }
    }

    private var quotaCapsule: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("今日额度")
                .font(.caption)
                .foregroundStyle(Color.secondary)
            Text(session.remainingQuotaText)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Color.primary)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private func workflowStep(index: Int, label: String, title: String, subtitle: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 6) {
                Text(label)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(tint)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(tint.opacity(0.12), in: Capsule())

                Spacer(minLength: 0)

                if createMode != .textToImage && index == 1 {
                    Image(systemName: "sparkles")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(tint)
                } else if index == 2 {
                    Image(systemName: "wand.and.stars")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(tint)
                }
            }

            Text(title)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Color.primary)
                .fixedSize(horizontal: false, vertical: true)

            Text(subtitle)
                .font(.caption2)
                .foregroundStyle(Color.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private func compactBadge(title: String, systemImage: String, emphasis: Color) -> some View {
        Label(title, systemImage: systemImage)
            .font(.caption.weight(.medium))
            .foregroundStyle(emphasis)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(emphasis.opacity(0.10), in: Capsule())
    }

    private var headerCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            // 图片区
            headerArtwork
                .frame(maxWidth: .infinity)
                .frame(height: 170)
                .clipped()

            // 文字区
            HStack(spacing: 8) {
                Label(createMode.title, systemImage: createMode.symbol)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(TuTuColor.orange)

                if createMode != .textToImage {
                    Text(headerReferenceStatus)
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(hasReferenceImage ? Color(red: 0.18, green: 0.64, blue: 0.46) : Color.secondary)
                }

                Spacer()

                Text(aspectRatio)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Color.secondary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: TuTuRadius.hero - 2, style: .continuous))
        .shadow(color: Color.black.opacity(0.08), radius: 12, y: 6)
    }

    private var headerReferenceStatus: String {
        hasReferenceImage ? "参考图已就绪" : "等待参考图"
    }

    @ViewBuilder
    private var headerArtwork: some View {
        if createMode != .textToImage, let selectedUIImage {
            Image(uiImage: selectedUIImage)
                .resizable()
                .scaledToFill()
        } else if let selectedDemoMaterial {
            headerImage(from: selectedDemoMaterial.imageURL, placeholder: selectedDemoMaterial.gradient)
        } else if let artworkURL = createMode.heroArtworkURL?.absoluteString {
            headerImage(from: artworkURL, placeholder: createMode.iconGradient)
        } else {
            Rectangle()
                .fill(createMode.iconGradient)
        }
    }

    @ViewBuilder
    private func headerImage(from source: String, placeholder: LinearGradient) -> some View {
        if let url = URL(string: source), url.isFileURL, let image = UIImage(contentsOfFile: url.path) {
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
        } else if let url = URL(string: source) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                default:
                    Rectangle()
                        .fill(placeholder)
                }
            }
        } else {
            Rectangle()
                .fill(placeholder)
        }
    }

    private func headerMetric(title: String, systemImage: String) -> some View {
        HeroMetric(title: title, systemImage: systemImage)
    }

    private var modeCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .blueFluid
        ) {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    cardTitle("创作模式")
                    Spacer()
                    Text("选择当前任务")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                }

                HStack(spacing: 12) {
                    ForEach(CreateMode.allCases) { mode in
                        Button {
                            createMode = mode
                            if mode != .localEdit {
                                localEditInstruction = ""
                            }
                        } label: {
                            CreateModeOptionCard(mode: mode, isSelected: mode == createMode)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var localEditCard: some View {
        if createMode == .localEdit {
            LiquidGlassCard(
                style: .feature,
                cornerRadius: 24,
                accentBlobs: .pinkPurpleFluid
            ) {
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        cardTitle("局部修改")
                        Spacer()
                        Text("涂一涂原型")
                            .font(.caption)
                            .foregroundStyle(TuTuColor.orange)
                    }

                    Text("这一轮先把交互原型补齐：选参考图、指定修改区域、输入改动指令，后续再接真实蒙版与编辑接口。")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)

                    VStack(alignment: .leading, spacing: 10) {
                        Text("修改区域")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.primary)

                        HStack(spacing: 10) {
                            ForEach(editAreas, id: \.self) { area in
                                parameterChip(title: area, isSelected: localEditArea == area) {
                                    localEditArea = area
                                }
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Text("修改强度")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.primary)

                        HStack(spacing: 10) {
                            ForEach(editStrengthOptions, id: \.self) { option in
                                parameterChip(title: option, isSelected: localEditStrength == option) {
                                    localEditStrength = option
                                }
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Text("修改说明")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.primary)

                        ZStack(alignment: .topLeading) {
                            RoundedRectangle(cornerRadius: 20, style: .continuous)
                                .fill(Color(.secondarySystemGroupedBackground))

                            TextEditor(text: $localEditInstruction)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 110)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 8)

                            if localEditInstruction.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                                Text("例如：只把杯子上的 logo 改成兔兔视觉，保留光影与透视；或者把背景桌面改成奶油风材质。")
                                    .font(.subheadline)
                                    .foregroundStyle(Color.secondary)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 18)
                                    .allowsHitTesting(false)
                            }
                        }
                        .frame(minHeight: 110)
                    }
                }
            }
        }
    }

    private var templateCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .blueFluid
        ) {
            VStack(alignment: .leading, spacing: 14) {
                cardTitle("模板场景")

                if let selectedTemplate {
                    HStack(alignment: .top, spacing: 14) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [TuTuColor.orange.opacity(0.92), TuTuColor.purple.opacity(0.86)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 72, height: 72)

                            Image(systemName: "square.grid.2x2.fill")
                                .font(.title3.weight(.bold))
                                .foregroundStyle(.white)
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text(selectedTemplate.title)
                                .font(.headline)
                                .foregroundStyle(Color.primary)
                            Text(selectedTemplate.scene)
                                .font(.subheadline)
                                .foregroundStyle(Color.secondary)
                                .lineLimit(2)
                            Text("可直接套用提示词，再微调风格与比例。")
                                .font(.caption)
                                .foregroundStyle(Color.secondary)
                        }

                        Spacer()

                        Button("清除") {
                            self.selectedTemplate = nil
                        }
                        .buttonStyle(.bordered)
                    }
                } else {
                    NavigationLink {
                        TemplatesView()
                    } label: {
                        HStack(spacing: 14) {
                            Image(systemName: "square.grid.2x2")
                                .font(.title3.weight(.bold))
                                .foregroundStyle(TuTuColor.orange)
                                .frame(width: 48, height: 48)
                                .background(TuTuColor.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 16, style: .continuous))

                            VStack(alignment: .leading, spacing: 4) {
                                Text("从模板广场选择场景")
                                    .font(.headline)
                                    .foregroundStyle(Color.primary)
                                Text("适合先选行业场景，再补充自己的品牌与画面要求。")
                                    .font(.caption)
                                    .foregroundStyle(Color.secondary)
                            }

                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(.tertiary)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Combined Creation Editor Card

    private var creationEditorCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .brandFluid
        ) {
            VStack(alignment: .leading, spacing: 24) {
                // ── Section 1: 创作描述 ──
                creationPromptSection

                Divider().opacity(0.3)

                // ── Section 2: 参考图片 ──
                creationReferenceSection

                Divider().opacity(0.3)

                // ── Section 3: 生成参数 ──
                creationParametersSection

                Divider().opacity(0.3)

                // ── Section 4: 提交 ──
                creationSubmitSection
            }
        }
    }

    // MARK: Section 1 — Prompt

    private var creationPromptSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    cardTitle("创作描述")
                    Text(createMode.promptWritingHint)
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(cleanedPrompt.count) 字")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(cleanedPrompt.count > 80 ? TuTuColor.orange : Color.secondary)
                    Text(cleanedPrompt.isEmpty ? "待输入" : "可直接生成")
                        .font(.caption2)
                        .foregroundStyle(Color.secondary)
                }
            }

            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color(.secondarySystemGroupedBackground))

                TextEditor(text: $prompt)
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: 160)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 8)

                if cleanedPrompt.isEmpty {
                    Text(createMode.promptPlaceholder)
                        .font(.subheadline)
                        .foregroundStyle(Color.secondary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 18)
                        .allowsHitTesting(false)
                }
            }
            .frame(minHeight: 160)

            HStack(spacing: 10) {
                Button("一键增强") {
                    prompt = cleanedPrompt.isEmpty
                        ? createMode.enhancedStarter
                        : "\(cleanedPrompt)，构图高级，商业摄影质感，画面层次清晰，文字区域干净，适合正式发布"
                }
                .buttonStyle(.borderedProminent)
                .tint(TuTuColor.orange)

                if let selectedTemplate {
                    Button("套用模板提示词") {
                        prompt = selectedTemplate.promptHint
                    }
                    .buttonStyle(.bordered)
                }
            }

            HStack(spacing: 10) {
                promptQualityBadge(title: "主体清晰", isActive: cleanedPrompt.contains("主体") || cleanedPrompt.contains("产品") || cleanedPrompt.contains("人物"))
                promptQualityBadge(title: "光影明确", isActive: cleanedPrompt.contains("光") || cleanedPrompt.contains("阴影") || cleanedPrompt.contains("采光"))
                promptQualityBadge(title: "用途完整", isActive: cleanedPrompt.contains("海报") || cleanedPrompt.contains("主图") || cleanedPrompt.contains("投放") || cleanedPrompt.contains("社媒"))
            }
        }
    }

    private func promptQualityBadge(title: String, isActive: Bool) -> some View {
        HStack(spacing: 6) {
            Image(systemName: isActive ? "checkmark.circle.fill" : "circle")
                .font(.caption)
            Text(title)
                .font(.caption.weight(.medium))
        }
        .foregroundStyle(isActive ? TuTuColor.orange : .secondary)
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background((isActive ? TuTuColor.orange.opacity(0.10) : Color.secondary.opacity(0.08)), in: Capsule())
    }

    // MARK: Section 2 — Reference Image

    private var creationReferenceSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("参考图片")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Color.primary)
                    Text(createMode.referenceCardSummary)
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                }
                Spacer()
                Text(createMode == .textToImage ? "可选" : "必选")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(createMode == .textToImage ? Color.secondary : TuTuColor.orange)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background((createMode == .textToImage ? Color.secondary.opacity(0.08) : TuTuColor.orange.opacity(0.10)), in: Capsule())
            }

            if let selectedUIImage {
                selectedImagePreview(
                    image: Image(uiImage: selectedUIImage),
                    title: "已上传参考图",
                    subtitle: createMode == .localEdit ? "可继续指定局部重绘区域与修改说明" : "会作为风格和主体参考"
                )
            } else if let selectedDemoMaterial {
                selectedImagePreview(
                    image: Image(systemName: selectedDemoMaterial.symbol),
                    remoteURL: selectedDemoMaterial.imageURL,
                    title: selectedDemoMaterial.title,
                    subtitle: selectedDemoMaterial.subtitle
                )
            } else {
                HStack(spacing: 14) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(createMode.accent.opacity(0.10))
                            .frame(width: 74, height: 74)
                        Image(systemName: createMode == .textToImage ? "photo.badge.plus" : "photo.on.rectangle.angled")
                            .font(.title2.weight(.bold))
                            .foregroundStyle(createMode.accent)
                    }
                    VStack(alignment: .leading, spacing: 6) {
                        Text(createMode == .textToImage ? "可以上传一张图做风格参考" : "请先上传一张参考图片")
                            .font(.headline)
                            .foregroundStyle(Color.primary)
                        Text(createMode == .localEdit ? "支持后续做局部修改、重绘和边缘扩图原型演示。" : "适合拿现有商品图、空间图或人物图继续延展。")
                            .font(.caption)
                            .foregroundStyle(Color.secondary)
                    }
                    Spacer(minLength: 0)
                }
                .padding(14)
                .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }

            HStack(spacing: 10) {
                PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                    Label(hasReferenceImage ? "重新上传" : "上传图片", systemImage: "photo.badge.plus")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(TuTuColor.orange)

                Button("清除图片") {
                    selectedPhotoItem = nil
                    selectedUIImage = nil
                    if selectedDemoMaterial != nil {
                        selectedDemoMaterial = nil
                    }
                }
                .buttonStyle(.bordered)
                .disabled(!hasReferenceImage)
            }

            // Demo materials inline
            if !hasReferenceImage {
                VStack(alignment: .leading, spacing: 10) {
                    Text("或选择演示素材")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.secondary)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(demoMaterials) { material in
                                Button {
                                    selectedDemoMaterial = material
                                    selectedPhotoItem = nil
                                    selectedUIImage = nil
                                    if cleanedPrompt.isEmpty { prompt = material.defaultPrompt }
                                    if createMode == .textToImage { createMode = .imageToImage }
                                } label: {
                                    VStack(alignment: .leading, spacing: 0) {
                                        AsyncImage(url: URL(string: material.imageURL)) { image in
                                            image.resizable().scaledToFill()
                                        } placeholder: {
                                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                                .fill(material.gradient)
                                                .overlay {
                                                    Image(systemName: material.symbol)
                                                        .font(.title3.weight(.bold))
                                                        .foregroundStyle(.white)
                                                }
                                        }
                                        .frame(width: 110, height: 72)
                                        .clipped()

                                        // 文字区
                                        Text(material.title)
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundStyle(Color.primary)
                                            .lineLimit(1)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 5)
                                    }
                                    .frame(width: 110)
                                    .background(Color(.systemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                    .shadow(color: Color.black.opacity(0.06), radius: 4, y: 2)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: Section 3 — Parameters

    private var creationParametersSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("生成参数")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Color.primary)
                Spacer()
                Text("微调成片气质")
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
            }

            VStack(alignment: .leading, spacing: 10) {
                Text("风格")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.secondary)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(styleOptions, id: \.self) { option in
                        parameterChip(title: option, isSelected: style == option) {
                            style = option
                        }
                    }
                }
            }

            VStack(alignment: .leading, spacing: 10) {
                Text("画幅比例")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.secondary)

                HStack(spacing: 10) {
                    ForEach(ratioOptions, id: \.self) { option in
                        parameterChip(title: option, isSelected: aspectRatio == option) {
                            aspectRatio = option
                        }
                    }
                }
            }
        }
    }

    // MARK: Section 4 — Submit

    private var creationSubmitSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                Text(createMode.submitHint)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
                Spacer()
                Text(createMode.readinessText(hasReferenceImage: hasReferenceImage, hasPrompt: !cleanedPrompt.isEmpty, hasLocalInstruction: !localEditInstruction.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty))
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(canSubmit ? Color(red: 0.17, green: 0.58, blue: 0.43) : TuTuColor.orange)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background((canSubmit ? Color(red: 0.17, green: 0.58, blue: 0.43).opacity(0.10) : TuTuColor.orange.opacity(0.10)), in: Capsule())
            }

            Button {
                Task {
                    await session.create(
                        prompt: submitPrompt,
                        template: selectedTemplate,
                        style: style,
                        aspectRatio: aspectRatio,
                        mode: createMode.generationMode,
                        referenceImageUrl: referenceImageURL,
                        referenceImageBase64: referenceImageBase64,
                        editInstruction: createMode == .localEdit ? localEditInstruction.trimmingCharacters(in: .whitespacesAndNewlines) : nil,
                        editArea: createMode == .localEdit ? localEditArea : nil,
                        editStrength: createMode == .localEdit ? localEditStrength : nil
                    )
                }
            } label: {
                BrandButtonLabel(
                    title: submitTitle,
                    systemImage: canSubmit && !session.isLoading ? "sparkles" : nil,
                    isLoading: session.isLoading,
                    enabled: canSubmit
                )
            }
            .buttonStyle(.plain)
            .disabled(!canSubmit)

            HStack(spacing: 12) {
                readinessChip(title: "Prompt", isReady: !cleanedPrompt.isEmpty)
                readinessChip(title: "参考图", isReady: createMode == .textToImage || hasReferenceImage)
                readinessChip(title: "修改说明", isReady: createMode != .localEdit || !localEditInstruction.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }

    private var inspirationCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .pinkPurpleFluid
        ) {
            VStack(alignment: .leading, spacing: 14) {
                cardTitle("灵感补充")

                VStack(spacing: 10) {
                    ForEach(promptIdeas, id: \.self) { idea in
                        Button {
                            if cleanedPrompt.isEmpty {
                                prompt = idea
                            } else if !cleanedPrompt.contains(idea) {
                                prompt = "\(cleanedPrompt)，\(idea)"
                            }
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: "sparkle.magnifyingglass")
                                    .foregroundStyle(TuTuColor.purple)
                                Text(idea)
                                    .font(.subheadline)
                                    .foregroundStyle(Color.primary)
                                    .multilineTextAlignment(.leading)
                                Spacer()
                                Image(systemName: "plus.circle.fill")
                                    .foregroundStyle(TuTuColor.orange)
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func parameterChip(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(isSelected ? .white : Color.primary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(isSelected ? AnyShapeStyle(LinearGradient(colors: [TuTuColor.orange, TuTuColor.purple], startPoint: .topLeading, endPoint: .bottomTrailing)) : AnyShapeStyle(Color(.secondarySystemGroupedBackground)))
                )
        }
        .buttonStyle(.plain)
    }

    private func readinessChip(title: String, isReady: Bool) -> some View {
        HStack(spacing: 6) {
            Image(systemName: isReady ? "checkmark.circle.fill" : "exclamationmark.circle")
            Text(title)
                .font(.caption.weight(.medium))
        }
        .foregroundStyle(isReady ? Color(red: 0.17, green: 0.58, blue: 0.43) : TuTuColor.orange)
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background((isReady ? Color(red: 0.17, green: 0.58, blue: 0.43).opacity(0.10) : TuTuColor.orange.opacity(0.10)), in: Capsule())
    }

    private var resultCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .pinkPurpleFluid
        ) {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    cardTitle("生成结果")
                    Spacer()
                    if let job = session.latestJob {
                        Text(statusTitle(job.status))
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(statusColor(job.status))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(statusColor(job.status).opacity(0.10), in: Capsule())
                    }
                }

                if let job = session.latestJob {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(resultHeadline(for: job))
                                    .font(.headline)
                                    .foregroundStyle(Color.primary)
                                Text(job.createdAt.formatted(date: .abbreviated, time: .shortened))
                                    .font(.caption)
                                    .foregroundStyle(Color.secondary)
                            }
                            Spacer()
                        }

                        if hasReferenceImage {
                            VStack(alignment: .leading, spacing: 10) {
                                Text(createMode == .localEdit ? "修改参考图" : "参考图")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(Color.secondary)

                                referenceResultPreview
                            }
                        }

                        if let imageUrl = job.imageUrl, let url = URL(string: imageUrl) {
                            AsyncImage(url: url) { image in
                                image.resizable().scaledToFill()
                            } placeholder: {
                                ProgressView()
                                    .frame(maxWidth: .infinity, minHeight: 240)
                            }
                            .frame(height: 252)
                            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                        }

                        Text(job.prompt)
                            .font(.subheadline)
                            .foregroundStyle(Color.secondary)

                        if createMode == .localEdit && !localEditInstruction.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                            Text("局部修改：\(localEditArea) · 强度：\(localEditStrength) · 指令：\(localEditInstruction)")
                                .font(.caption)
                                .foregroundStyle(Color.secondary)
                        }

                        if let style = job.style, let aspectRatio = job.aspectRatio {
                            HStack(spacing: 10) {
                                compactBadge(title: style, systemImage: "camera.filters", emphasis: TuTuColor.orange)
                                compactBadge(title: aspectRatio, systemImage: "aspectratio", emphasis: TuTuColor.purple)
                            }
                        }

                        if let errorMessage = job.errorMessage, job.status == .failed {
                            Text("失败原因：\(errorMessage)")
                                .font(.caption)
                                .foregroundStyle(.red)
                        }

                        if job.status == .failed {
                            Button(session.isLoading ? "重新提交中..." : "重试本次任务") {
                                Task { await session.retryLatestJob() }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(TuTuColor.orange)
                            .disabled(session.isLoading)
                        }

                        if job.status == .succeeded {
                            VStack(spacing: 10) {
                                HStack(spacing: 10) {
                                    resultActionButton(icon: "square.and.arrow.down.fill", title: "保存到素材库", tint: TuTuColor.orange)
                                    resultActionButton(icon: "square.and.arrow.up.fill", title: "分享作品", tint: TuTuColor.purple)
                                }
                                HStack(spacing: 10) {
                                    resultActionButton(icon: "arrow.clockwise", title: "再生成一张", tint: TuTuColor.mint) {
                                        Task { await session.retryLatestJob() }
                                    }
                                    resultActionButton(icon: "slider.horizontal.3", title: "微调参数再次出图", tint: TuTuColor.coral)
                                }
                            }

                            if let asset = session.selectedAsset {
                                NavigationLink {
                                    AssetDetailView(asset: asset)
                                } label: {
                                    HStack {
                                        Label("查看素材详情", systemImage: "sparkles")
                                            .font(.subheadline.weight(.semibold))
                                            .foregroundStyle(Color.primary)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.caption.weight(.bold))
                                            .foregroundStyle(.tertiary)
                                    }
                                    .padding(12)
                                    .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                } else {
                    Text("提交任务后，生成结果会在这里展示，并同步进入素材库。图生图与局部修改的参考图预览也会保留在这里。")
                        .foregroundStyle(Color.secondary)
                }
            }
        }
    }

    @ViewBuilder
    private func resultActionButton(icon: String, title: String, tint: Color, action: (() -> Void)? = nil) -> some View {
        Button {
            action?()
        } label: {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.subheadline.weight(.bold))
                Text(title)
                    .font(.caption.weight(.semibold))
                    .lineLimit(1)
            }
            .foregroundStyle(tint)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(tint.opacity(0.20), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private func resultHeadline(for job: GenerationJob) -> String {
        switch job.status {
        case .queued:
            return "任务已进入队列，正在准备生成"
        case .running:
            return "正在生成中，稍后会自动回流到素材库"
        case .succeeded:
            return "本次结果已完成，可继续查看详情或二次创作"
        case .failed:
            return "本次生成失败，可调整参数后重试"
        }
    }

    @ViewBuilder
    private var referenceResultPreview: some View {
        if let selectedUIImage {
            Image(uiImage: selectedUIImage)
                .resizable()
                .scaledToFill()
                .frame(height: 180)
                .frame(maxWidth: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        } else if let selectedDemoMaterial {
            AsyncImage(url: URL(string: selectedDemoMaterial.imageURL)) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(selectedDemoMaterial.gradient)
                    .overlay {
                        Image(systemName: selectedDemoMaterial.symbol)
                            .font(.title2.weight(.bold))
                            .foregroundStyle(.white)
                    }
            }
            .frame(height: 180)
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
    }

    private var historyCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .blueFluid
        ) {
            VStack(alignment: .leading, spacing: 14) {
                cardTitle("最近任务")

                if session.jobHistory.isEmpty {
                    Text("你还没有历史生成任务，提交后会自动沉淀在这里，方便回看和重试。")
                        .foregroundStyle(Color.secondary)
                } else {
                    VStack(spacing: 10) {
                        ForEach(Array(session.recentJobs.prefix(5))) { job in
                            VStack(alignment: .leading, spacing: 8) {
                                HStack(alignment: .top) {
                                    Text(job.prompt)
                                        .font(.subheadline)
                                        .foregroundStyle(Color.primary)
                                        .lineLimit(2)
                                    Spacer()
                                    Text(statusTitle(job.status))
                                        .font(.caption)
                                        .foregroundStyle(statusColor(job.status))
                                }
                                Text(job.createdAt.formatted(date: .abbreviated, time: .shortened))
                                    .font(.caption)
                                    .foregroundStyle(Color.secondary)
                                if let style = job.style, let aspectRatio = job.aspectRatio {
                                    Text("风格：\(style) · 比例：\(aspectRatio)")
                                        .font(.caption)
                                        .foregroundStyle(Color.secondary)
                                }
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        }
                    }
                }
            }
        }
    }

    private var submitPrompt: String {
        switch createMode {
        case .textToImage, .imageToImage:
            return cleanedPrompt
        case .localEdit:
            return "\(cleanedPrompt)。局部修改区域：\(localEditArea)。修改强度：\(localEditStrength)。补充说明：\(localEditInstruction)"
        }
    }

    private func loadSelectedPhoto() async {
        guard let selectedPhotoItem else { return }
        if let data = try? await selectedPhotoItem.loadTransferable(type: Data.self),
           let image = UIImage(data: data) {
            await MainActor.run {
                selectedUIImage = image
                selectedDemoMaterial = nil
                if createMode == .textToImage {
                    createMode = .imageToImage
                }
            }
        }
    }

    @ViewBuilder
    private func selectedImagePreview(image: Image, remoteURL: String? = nil, title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let remoteURL, let url = URL(string: remoteURL) {
                AsyncImage(url: url) { asyncImage in
                    asyncImage.resizable().scaledToFill()
                } placeholder: {
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(Color(.secondarySystemGroupedBackground))
                        .overlay {
                            image
                                .font(.title2.weight(.bold))
                                .foregroundStyle(TuTuColor.orange)
                        }
                }
                .frame(height: 188)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            } else {
                image
                    .resizable()
                    .scaledToFill()
                    .frame(height: 188)
                    .frame(maxWidth: .infinity)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(Color.primary)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
            }
        }
        .padding(14)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private func cardTitle(_ title: String) -> some View {
        Text(title)
            .font(.title3.weight(.bold))
            .foregroundStyle(Color.primary)
    }

    private func statusTitle(_ status: JobStatus) -> String {
        switch status {
        case .queued: return "排队中"
        case .running: return "生成中"
        case .succeeded: return "已完成"
        case .failed: return "失败"
        }
    }

    private func statusColor(_ status: JobStatus) -> Color {
        switch status {
        case .queued: return TuTuColor.purple
        case .running: return TuTuColor.orange
        case .succeeded: return .green
        case .failed: return .red
        }
    }
}

private struct CreateModeOptionCard: View {
    let mode: CreateMode
    let isSelected: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            iconTile

            VStack(alignment: .leading, spacing: 6) {
                Text(mode.title)
                    .font(.headline)
                    .foregroundStyle(Color.primary)
                Text(mode.description)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
                    .lineLimit(3)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)

            HStack(spacing: 6) {
                Text(mode.badgeDisplayTitle)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(isSelected ? mode.accent : Color.secondary)
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "arrow.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(isSelected ? mode.accent : Color.black.opacity(0.25))
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, minHeight: 176, alignment: .topLeading)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(isSelected ? mode.accent.opacity(0.28) : Color.black.opacity(0.03), lineWidth: isSelected ? 2 : 1)
        }
    }

    private var iconTile: some View {
        ZStack {
            if isSelected {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(mode.iconGradient)
            } else {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color(.secondarySystemGroupedBackground))
            }

            Image(systemName: mode.symbol)
                .foregroundStyle(isSelected ? .white : mode.accent)
                .font(.title3.weight(.bold))
        }
        .frame(width: 56, height: 56)
    }
}

enum CreateMode: String, CaseIterable, Identifiable {
    case textToImage
    case imageToImage
    case localEdit

    var id: String { rawValue }

    var generationMode: GenerationMode {
        switch self {
        case .textToImage: return .textToImage
        case .imageToImage: return .imageToImage
        case .localEdit: return .localEdit
        }
    }

    var title: String {
        switch self {
        case .textToImage: return "文生图"
        case .imageToImage: return "图生图"
        case .localEdit: return "局部重绘"
        }
    }

    var description: String {
        switch self {
        case .textToImage: return "一句中文直接出图，适合全新创意表达"
        case .imageToImage: return "上传现有图片，继续延展风格、主体和构图"
        case .localEdit: return "像“涂一涂”一样只改局部，保留整体画面"
        }
    }

    var symbol: String {
        switch self {
        case .textToImage: return "character.textbox"
        case .imageToImage: return "photo.on.rectangle.angled"
        case .localEdit: return "paintbrush.pointed.fill"
        }
    }

    var badgeTitle: String {
        switch self {
        case .textToImage: return "创意\n出图"
        case .imageToImage: return "图像\n延展"
        case .localEdit: return "局部\n修改"
        }
    }

    var badgeDisplayTitle: String {
        switch self {
        case .textToImage: return "创意 · 出图"
        case .imageToImage: return "图像 · 延展"
        case .localEdit: return "局部 · 修改"
        }
    }

    var heroTitle: String {
        switch self {
        case .textToImage: return "一句话生成\n专业级主视觉"
        case .imageToImage: return "基于现有图片\n继续延展成片"
        case .localEdit: return "只改指定区域\n整体风格不跑偏"
        }
    }

    var heroSubtitle: String {
        switch self {
        case .textToImage:
            return "适合从零起稿，把主体、场景、光线和商业用途整理成更稳定的生成描述。"
        case .imageToImage:
            return "适合拿现有商品图、人物图或空间图继续升级，成片会更贴近真实业务素材。"
        case .localEdit:
            return "适合微调局部细节、替换元素和修正瑕疵，同时尽量保留原始画面的整体关系。"
        }
    }

    var heroArtworkURL: URL? {
        switch self {
        case .textToImage:
            return GeneratedMedia.url("Templates/template-brand-poster-20260511-012654.png")
        case .imageToImage:
            return GeneratedMedia.url("DemoMaterials/demo-livingroom-20260508-164846.png")
        case .localEdit:
            return GeneratedMedia.url("DemoMaterials/demo-cosmetics-20260508-164710.png")
        }
    }

    var workflowSummary: String {
        switch self {
        case .textToImage:
            return "先把场景、主体和用途说清楚，再微调风格与比例，适合快速从零出图。"
        case .imageToImage:
            return "围绕已有实拍素材继续做风格升级、构图延展或商业化包装，更接近真实业务链路。"
        case .localEdit:
            return "围绕单张图片的局部区域做精修、替换和重绘，更像真实设计师在改最终成片。"
        }
    }

    var promptWritingHint: String {
        switch self {
        case .textToImage:
            return "建议写清主体、场景、光线和用途，生成效果会更稳定。"
        case .imageToImage:
            return "除了描述想要的成片感，也建议说明要保留的主体结构与拍摄关系。"
        case .localEdit:
            return "Prompt 负责整体成片方向，具体局部改动再放到修改说明里。"
        }
    }

    var promptPlaceholder: String {
        switch self {
        case .textToImage:
            return "例如：生成一张高转化电商商品主图，主体清晰，光影自然，留出文案区域"
        case .imageToImage:
            return "例如：基于参考图延展成更有品牌感的商业海报，保留主体结构与光线关系，背景更高级"
        case .localEdit:
            return "例如：整体保持真实摄影质感，只让最终成片更统一；具体要修改的局部内容请写在下面的修改说明里"
        }
    }

    var referenceCardSummary: String {
        switch self {
        case .textToImage:
            return "可选上传参考图，也可以直接用下面的演示素材快速进入图生图。"
        case .imageToImage:
            return "参考图会影响主体结构、镜头视角和整体光线关系。"
        case .localEdit:
            return "先选中要修改的图片，再补充区域和改动说明。"
        }
    }

    func readinessText(hasReferenceImage: Bool, hasPrompt: Bool, hasLocalInstruction: Bool) -> String {
        switch self {
        case .textToImage:
            return hasPrompt ? "可以提交" : "待补 Prompt"
        case .imageToImage:
            if !hasReferenceImage { return "待补参考图" }
            return hasPrompt ? "可以提交" : "待补 Prompt"
        case .localEdit:
            if !hasReferenceImage { return "待补参考图" }
            if !hasLocalInstruction { return "待补修改说明" }
            return hasPrompt ? "可以提交" : "待补 Prompt"
        }
    }

    var accent: Color {
        switch self {
        case .textToImage: return TuTuColor.orange
        case .imageToImage: return TuTuColor.purple
        case .localEdit: return Color(red: 0.17, green: 0.58, blue: 0.43)
        }
    }

    var iconGradient: LinearGradient {
        switch self {
        case .textToImage:
            return LinearGradient(colors: [TuTuColor.orange, Color(red: 1.0, green: 0.56, blue: 0.39)], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .imageToImage:
            return LinearGradient(colors: [TuTuColor.purple, Color(red: 0.44, green: 0.44, blue: 0.93)], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .localEdit:
            return LinearGradient(colors: [Color(red: 0.17, green: 0.58, blue: 0.43), Color(red: 0.44, green: 0.77, blue: 0.58)], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }

    var enhancedStarter: String {
        switch self {
        case .textToImage:
            return "生成一张高级商业视觉海报，主体清晰，光影自然，适合社交媒体投放"
        case .imageToImage:
            return "基于参考图做高质感风格延展，保留主体识别度，提升商业摄影氛围和构图层次"
        case .localEdit:
            return "基于参考图做局部重绘优化，尽量保留原始拍摄关系，只调整指定区域的细节和质感"
        }
    }

    var submitHint: String {
        switch self {
        case .textToImage:
            return "提交后任务会进入队列，并在结果区与素材库同步更新。"
        case .imageToImage:
            return "提交时会同时带上参考图片语义，原型阶段先完整展示上传、参考和结果链路。"
        case .localEdit:
            return "当前先补齐“上传图 + 指定区域 + 修改说明”的产品原型，后续可继续接真实蒙版编辑。"
        }
    }
}

private struct DemoPhoto: Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let imageURL: String
    let defaultPrompt: String
    let symbol: String
    let gradient: LinearGradient
    let sceneTag: String
    let emphasis: Color

    static func remote(url: String) -> DemoPhoto {
        .init(
            id: "remote-\(url)",
            title: "当前素材参考图",
            subtitle: "来自素材库，可直接继续图生图或局部修改",
            imageURL: url,
            defaultPrompt: "基于当前素材继续优化视觉表现，保留主体结构与光线关系",
            symbol: "photo.fill",
            gradient: LinearGradient(colors: [TuTuColor.orange.opacity(0.85), TuTuColor.purple.opacity(0.82)], startPoint: .topLeading, endPoint: .bottomTrailing),
            sceneTag: "素材回流",
            emphasis: TuTuColor.orange
        )
    }

    static let sample: [DemoPhoto] = [
        .init(
            id: "coffee",
            title: "咖啡杯实拍",
            subtitle: "适合演示商品换背景、换 logo、补文案留白",
            imageURL: GeneratedMedia.urlString(
                "DemoMaterials/demo-coffee-20260508-164529.png",
                fallback: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
            ),
            defaultPrompt: "基于这张咖啡杯实拍图，延展成适合精品咖啡品牌投放的商业海报，保留真实杯型与光线关系",
            symbol: "cup.and.saucer.fill",
            gradient: LinearGradient(colors: [Color(red: 0.57, green: 0.38, blue: 0.26), Color(red: 0.84, green: 0.69, blue: 0.54)], startPoint: .topLeading, endPoint: .bottomTrailing),
            sceneTag: "电商主图",
            emphasis: Color(red: 0.72, green: 0.41, blue: 0.23)
        ),
        .init(
            id: "cosmetics",
            title: "护肤品棚拍",
            subtitle: "适合演示电商主图、局部修瑕和风格升级",
            imageURL: GeneratedMedia.urlString(
                "DemoMaterials/demo-cosmetics-20260508-164710.png",
                fallback: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
            ),
            defaultPrompt: "基于这张护肤品实拍图，提升成高端电商主图，保留瓶身结构与投影逻辑，背景更干净高级",
            symbol: "sparkles.tv.fill",
            gradient: LinearGradient(colors: [Color(red: 0.97, green: 0.75, blue: 0.80), Color(red: 0.84, green: 0.62, blue: 0.79)], startPoint: .topLeading, endPoint: .bottomTrailing),
            sceneTag: "品牌包装",
            emphasis: Color(red: 0.81, green: 0.47, blue: 0.72)
        ),
        .init(
            id: "livingroom",
            title: "客厅空间照",
            subtitle: "适合演示软装替换、局部改色和边缘扩图",
            imageURL: GeneratedMedia.urlString(
                "DemoMaterials/demo-livingroom-20260508-164846.png",
                fallback: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
            ),
            defaultPrompt: "基于这张客厅空间照延展成更有杂志感的室内场景，保留采光方向和空间结构，软装更统一",
            symbol: "sofa.fill",
            gradient: LinearGradient(colors: [Color(red: 0.79, green: 0.84, blue: 0.75), Color(red: 0.90, green: 0.85, blue: 0.76)], startPoint: .topLeading, endPoint: .bottomTrailing),
            sceneTag: "空间提案",
            emphasis: Color(red: 0.43, green: 0.60, blue: 0.39)
        )
    ]
}
