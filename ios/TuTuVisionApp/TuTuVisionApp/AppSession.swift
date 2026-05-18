import Foundation

@MainActor
final class AppSession: ObservableObject {
    @Published var profile = UserProfile(id: "local-user", nickname: "兔兔创作者", plan: "免费版", dailyQuotaRemaining: 5)
    @Published var categories: [TemplateCategory] = PreviewFixture.categories
    @Published var templates: [CreativeTemplate] = PreviewFixture.templates
    @Published var assets: [Asset] = PreviewFixture.assets
    @Published var jobHistory: [GenerationJob] = []
    @Published var latestJob: GenerationJob?
    @Published var selectedAsset: Asset?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let api = APIClient.shared

    private var usesPreviewData: Bool {
        let environment = ProcessInfo.processInfo.environment
        return environment["TUTU_PREVIEW_MODE"] == "1" || environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1"
    }

    var featuredTemplates: [CreativeTemplate] {
        Array(templates.prefix(6))
    }

    var recentAssets: [Asset] {
        assets.sorted { $0.createdAt > $1.createdAt }
    }

    var recentJobs: [GenerationJob] {
        jobHistory.sorted { $0.createdAt > $1.createdAt }
    }

    var remainingQuotaText: String {
        profile.dailyQuotaRemaining < 0 ? "不限量" : "今日剩余额度 \(profile.dailyQuotaRemaining)"
    }

    func bootstrap() async {
        if usesPreviewData {
            loadPreviewData()
            return
        }
        await loadTemplates()
        await loadAssets()
        await loadJobs()
        await loadProfile()
    }

    func refreshAll() async {
        if usesPreviewData {
            loadPreviewData()
            return
        }
        await bootstrap()
    }

    func loadProfile() async {
        if usesPreviewData {
            loadPreviewData()
            return
        }
        do { profile = try await api.get("/api/me") } catch { errorMessage = error.localizedDescription }
    }

    func loadTemplates() async {
        if usesPreviewData {
            loadPreviewData()
            return
        }
        do {
            let response: TemplatesResponse = try await api.get("/api/templates")
            // 只有在拿到真实数据时才覆盖；API 失败时保留 fixture，避免页面瞬时变空。
            if !response.categories.isEmpty {
                categories = response.categories
            }
            if !response.templates.isEmpty {
                templates = response.templates
            }
        } catch { errorMessage = error.localizedDescription }
    }

    func loadAssets() async {
        if usesPreviewData {
            loadPreviewData()
            return
        }
        do {
            let remote: [Asset] = try await api.get("/api/assets")
            if !remote.isEmpty {
                assets = remote
            }
            if let selectedAsset {
                self.selectedAsset = assets.first(where: { $0.id == selectedAsset.id })
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadJobs() async {
        if usesPreviewData {
            loadPreviewData()
            return
        }
        do {
            jobHistory = try await api.get("/api/generation-jobs")
            latestJob = recentJobs.first
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func selectAsset(_ asset: Asset) {
        selectedAsset = asset
    }

    func template(for id: String?) -> CreativeTemplate? {
        guard let id else { return nil }
        return templates.first(where: { $0.id == id })
    }

    func relatedTemplates(for template: CreativeTemplate, limit: Int = 3) -> [CreativeTemplate] {
        templates
            .filter { $0.categoryId == template.categoryId && $0.id != template.id }
            .prefix(limit)
            .map { $0 }
    }

    func create(
        prompt: String,
        template: CreativeTemplate?,
        style: String,
        aspectRatio: String,
        mode: GenerationMode = .textToImage,
        referenceImageUrl: String? = nil,
        referenceImageBase64: String? = nil,
        editInstruction: String? = nil,
        editArea: String? = nil,
        editStrength: String? = nil
    ) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let request = GenerationRequest(
                prompt: prompt,
                templateId: template?.id,
                style: style,
                aspectRatio: aspectRatio,
                referenceImageUrl: referenceImageUrl,
                referenceImageBase64: referenceImageBase64,
                mode: mode,
                editInstruction: editInstruction,
                editArea: editArea,
                editStrength: editStrength
            )
            latestJob = try await api.post("/api/generation-jobs", body: request)
            if let id = latestJob?.id {
                latestJob = try await pollJob(id: id)
                await loadAssets()
                await loadJobs()
                await loadProfile()
                if let imageUrl = latestJob?.imageUrl,
                   let matchingAsset = assets.first(where: { $0.imageUrl == imageUrl }) {
                    selectedAsset = matchingAsset
                }
            }
        } catch { errorMessage = error.localizedDescription }
    }

    func retryLatestJob() async {
        guard let latestJob else { return }
        await create(
            prompt: latestJob.prompt,
            template: template(for: latestJob.templateId),
            style: latestJob.style ?? "商业摄影",
            aspectRatio: latestJob.aspectRatio ?? "1:1",
            mode: latestJob.mode ?? .textToImage,
            referenceImageUrl: latestJob.referenceImageUrl,
            referenceImageBase64: nil,
            editInstruction: latestJob.editInstruction,
            editArea: latestJob.editArea,
            editStrength: latestJob.editStrength
        )
    }

    private func pollJob(id: String, maxAttempts: Int = 8) async throws -> GenerationJob {
        var current = try await api.get("/api/generation-jobs/\(id)") as GenerationJob

        for _ in 0..<maxAttempts where current.status == .queued || current.status == .running {
            try await Task.sleep(nanoseconds: 900_000_000)
            current = try await api.get("/api/generation-jobs/\(id)")
        }

        return current
    }

    private func loadPreviewData() {
        profile = UserProfile(id: "preview-user", nickname: "兔兔创作者", plan: "灵感会员", dailyQuotaRemaining: 5)
        categories = PreviewFixture.categories
        templates = PreviewFixture.templates
        assets = PreviewFixture.assets
        jobHistory = PreviewFixture.jobs
        latestJob = recentJobs.first
        errorMessage = nil
    }
}

extension AppSession {
    static func previewLoaded() -> AppSession {
        let session = AppSession()
        session.loadPreviewData()
        return session
    }
}

/// 预置演示数据——未登录、API 未返回或首次启动时都用这套数据兜底，避免出现"空白模板广场"。
enum PreviewFixture {
    static let categories: [TemplateCategory] = [
        .init(id: "ecommerce", name: "电商"),
        .init(id: "social", name: "社媒"),
        .init(id: "branding", name: "品牌"),
        .init(id: "portrait", name: "人像"),
        .init(id: "illustration", name: "插画"),
        .init(id: "strategy", name: "提案")
    ]

    static let templates: [CreativeTemplate] = [
        .init(id: "product-main", title: "高转化产品主图", categoryId: "ecommerce", scene: "电商首屏", promptHint: "突出商品主体，保留品牌留白", isPremium: false),
        .init(id: "detail-poster", title: "详情页长图海报", categoryId: "ecommerce", scene: "活动详情", promptHint: "适合主副卖点分层展示", isPremium: true),
        .init(id: "beauty-single", title: "护肤单品大片", categoryId: "ecommerce", scene: "美妆单品", promptHint: "突出瓶身质感和高级棚拍光线", isPremium: true),
        .init(id: "food-menu", title: "餐饮菜单封面", categoryId: "ecommerce", scene: "餐饮上新", promptHint: "把菜品拍出高级菜单封面的层次", isPremium: false),
        .init(id: "redbook-cover", title: "小红书封面模板", categoryId: "social", scene: "种草封面", promptHint: "适合带标题留白和封面主体强化", isPremium: false),
        .init(id: "festival", title: "节日营销海报", categoryId: "social", scene: "节日专题", promptHint: "适合节点促销和限时活动封面", isPremium: true),
        .init(id: "brand-poster", title: "品牌提案 KV", categoryId: "branding", scene: "品牌 Campaign", promptHint: "做出杂志级的品牌视觉语气", isPremium: true),
        .init(id: "portrait-photo", title: "人像写真海报", categoryId: "portrait", scene: "人物表达", promptHint: "强调人物气质和光影质感", isPremium: false),
        .init(id: "report-cover", title: "方案汇报封面", categoryId: "strategy", scene: "方案汇报", promptHint: "更适合提案封面和汇报首页", isPremium: false),
        .init(id: "storybook-scene", title: "绘本场景插画", categoryId: "illustration", scene: "童趣插画", promptHint: "适合构建完整场景和角色氛围", isPremium: false)
    ]

    static let assets: [Asset] = [
        .init(
            id: "asset-1",
            title: "春季咖啡主视觉",
            imageUrl: GeneratedMedia.urlString("DemoMaterials/demo-coffee-20260508-164529.png"),
            prompt: "商业摄影风格的咖啡杯主视觉，暖橙色光线，适合作为春季上新横幅",
            createdAt: .now.addingTimeInterval(-2_400),
            sourceImageUrl: nil,
            mode: .textToImage,
            editInstruction: nil,
            editArea: nil,
            editStrength: nil
        )
    ]

    static let jobs: [GenerationJob] = [
        .init(
            id: "job-preview-completed",
            status: .succeeded,
            prompt: "春季咖啡主视觉，适合作为品牌首页横幅",
            templateId: "product-main",
            style: "商业摄影",
            aspectRatio: "16:9",
            imageUrl: GeneratedMedia.urlString("DemoMaterials/demo-coffee-20260508-164529.png"),
            errorMessage: nil,
            referenceImageUrl: nil,
            mode: .textToImage,
            editInstruction: nil,
            editArea: nil,
            editStrength: nil,
            createdAt: .now.addingTimeInterval(-900)
        ),
        .init(
            id: "job-preview-running",
            status: .running,
            prompt: "客厅场景延展，增加阳光和植物层次",
            templateId: "brand-poster",
            style: "空间写实",
            aspectRatio: "4:3",
            imageUrl: nil,
            errorMessage: nil,
            referenceImageUrl: GeneratedMedia.urlString("DemoMaterials/demo-livingroom-20260508-164846.png"),
            mode: .imageToImage,
            editInstruction: nil,
            editArea: nil,
            editStrength: nil,
            createdAt: .now.addingTimeInterval(-300)
        )
    ]
}
