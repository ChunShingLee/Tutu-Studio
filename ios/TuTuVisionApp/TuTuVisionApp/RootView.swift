import SwiftUI

struct RootView: View {
    @Environment(GenerationTaskStore.self) private var generationTaskStore
    @EnvironmentObject private var session: AppSession
    @State private var selectedTab: AppTab

    init() {
        #if DEBUG
        let initialTab = ProcessInfo.processInfo.environment["TUTU_INITIAL_TAB"]
            .flatMap(AppTab.init(rawValue:))
            ?? .home
        #else
        let initialTab: AppTab = .home
        #endif
        _selectedTab = State(initialValue: initialTab)
    }

    var body: some View {
        rootContent
        .tint(DesignTokens.Colors.primarySelected)
        .ignoresSafeArea(.keyboard, edges: .bottom)
        .sensoryFeedback(.selection, trigger: selectedTab)
        .task {
            await session.bootstrap()
            generationTaskStore.sync(jobs: session.jobHistory, assets: session.assets)
        }
        .onChange(of: session.jobHistory) { _, newValue in
            generationTaskStore.sync(jobs: newValue, assets: session.assets)
        }
        .onChange(of: session.assets) { _, newValue in
            generationTaskStore.sync(jobs: session.jobHistory, assets: newValue)
        }
        .alert("提示", isPresented: Binding(get: { session.errorMessage != nil }, set: { if !$0 { session.errorMessage = nil } })) {
            Button("知道了", role: .cancel) { session.errorMessage = nil }
        } message: {
            Text(session.errorMessage ?? "")
        }
    }

    @ViewBuilder
    private var rootContent: some View {
        if #available(iOS 18.0, *) {
            modernTabView
        } else {
            legacyTabView
        }
    }

    @available(iOS 18.0, *)
    @ViewBuilder
    private var modernTabView: some View {
        if #available(iOS 26.0, *) {
            modernTabs
                .tabViewSearchActivation(.searchTabSelection)
        } else {
            modernTabs
        }
    }

    @available(iOS 18.0, *)
    private var modernTabs: some View {
        TabView(selection: $selectedTab) {
            Tab(AppTab.home.title, systemImage: AppTab.home.systemImage, value: AppTab.home) {
                NavigationStack {
                    HomeView()
                }
            }

            Tab(AppTab.templates.title, systemImage: AppTab.templates.systemImage, value: AppTab.templates) {
                NavigationStack {
                    TemplatesView()
                }
            }

            Tab(AppTab.create.title, systemImage: AppTab.create.systemImage, value: AppTab.create) {
                NavigationStack {
                    CreateView()
                }
            }

            Tab(AppTab.community.title, systemImage: AppTab.community.systemImage, value: AppTab.community) {
                NavigationStack {
                    #if DEBUG
                    // DEBUG-only swap so the full Liquid Glass demo is reachable on device/simulator.
                    LiquidGlassDemoView()
                    #else
                    CommunityView()
                    #endif
                }
            }

            Tab(value: AppTab.search, role: .search) {
                NavigationStack {
                    SearchView()
                }
            }
        }
    }

    private var legacyTabView: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                HomeView()
            }
            .tag(AppTab.home)
            .tabItem {
                Label(AppTab.home.title, systemImage: AppTab.home.systemImage)
            }

            NavigationStack {
                TemplatesView()
            }
            .tag(AppTab.templates)
            .tabItem {
                Label(AppTab.templates.title, systemImage: AppTab.templates.systemImage)
            }

            NavigationStack {
                CreateView()
            }
            .tag(AppTab.create)
            .tabItem {
                Label(AppTab.create.title, systemImage: AppTab.create.systemImage)
            }

            NavigationStack {
                #if DEBUG
                // DEBUG-only swap so the full Liquid Glass demo is reachable on device/simulator.
                LiquidGlassDemoView()
                #else
                CommunityView()
                #endif
            }
            .tag(AppTab.community)
            .tabItem {
                Label(AppTab.community.title, systemImage: AppTab.community.systemImage)
            }

            NavigationStack {
                SearchView()
            }
            .tag(AppTab.search)
            .tabItem {
                Label(AppTab.search.title, systemImage: AppTab.search.systemImage)
            }
        }
    }

}

private enum AppTab: String, CaseIterable, Identifiable {
    case home
    case templates
    case create
    case community
    case search

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home: return "首页"
        case .templates: return "模板"
        case .create: return "创作"
        case .community: return "社区"
        case .search: return "搜索"
        }
    }

    var systemImage: String {
        switch self {
        case .home: return "house.fill"
        case .templates: return "square.grid.2x2.fill"
        case .create: return "plus"
        case .community: return "bubble.left.and.bubble.right.fill"
        case .search: return "magnifyingglass"
        }
    }
}
