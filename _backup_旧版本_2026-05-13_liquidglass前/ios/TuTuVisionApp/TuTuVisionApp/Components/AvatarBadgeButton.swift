import SwiftUI

struct AvatarBadgeButton<AvatarDestination: View, BadgeDestination: View>: View {
    @Environment(GenerationTaskStore.self) private var generationTaskStore
    @EnvironmentObject private var session: AppSession

    private let avatarSize: CGFloat = 44
    private let badgeSize: CGFloat = 22
    private let frameSize: CGFloat = 56

    @State private var isBadgeRotating = false
    @State private var haloVisible = false

    @ViewBuilder var avatarDestination: () -> AvatarDestination
    @ViewBuilder var badgeDestination: () -> BadgeDestination

    private var badgeState: AvatarBadgeState {
        generationTaskStore.badgeState
    }

    var body: some View {
        ZStack {
            completionGlow

            NavigationLink {
                avatarDestination()
            } label: {
                avatarBody
            }
            .buttonStyle(.plain)
            .frame(width: avatarSize, height: avatarSize)
            .contentShape(Circle())
            .accessibilityLabel("我的 \(session.profile.nickname)")
        }
        .frame(width: frameSize, height: frameSize)
        .overlay(alignment: .topTrailing) {
            if badgeState != .none {
                NavigationLink {
                    badgeDestination()
                        .onAppear {
                            generationTaskStore.markCompletedTasksViewed()
                        }
                } label: {
                    badgeBody
                }
                .buttonStyle(.plain)
                .frame(width: 28, height: 28)
                .contentShape(Circle())
                .padding(.top, 1)
                .padding(.trailing, 1)
                .accessibilityLabel("生成结果")
            }
        }
        .sensoryFeedback(.selection, trigger: badgeState)
        .onAppear {
            startAnimations()
        }
        .onChange(of: badgeState) { _, _ in
            startAnimations()
        }
    }

    @ViewBuilder
    private var completionGlow: some View {
        if case .completed = badgeState {
            Circle()
                .fill(DesignTokens.Colors.primary.opacity(haloVisible ? 0.18 : 0.08))
                .blur(radius: haloVisible ? 12 : 6)
                .scaleEffect(haloVisible ? 1.24 : 1.08)
                .frame(width: avatarSize, height: avatarSize)
                .allowsHitTesting(false)
        }
    }

    private var avatarBody: some View {
        ZStack {
            // 底层：品牌渐变圆盘（避免"白底橙字"在亮色背景下对比度不足）
            Circle()
                .fill(
                    LinearGradient(
                        colors: [
                            Color(hex: 0xFFB78A),
                            DesignTokens.Colors.primary,
                            DesignTokens.Colors.primarySelected
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            // 内描边：轻微高光
            Circle()
                .strokeBorder(
                    LinearGradient(
                        colors: [Color.white.opacity(0.6), Color.white.opacity(0.12)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
                .padding(0.5)

            // 兔兔 mascot：用 SF Symbol hare.fill（iOS 17+ 自带），再用 symbolEffect 做呼吸感
            Image(systemName: "hare.fill")
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(.white)
                .shadow(color: Color.black.opacity(0.18), radius: 2, y: 1)
                .symbolEffect(.bounce, value: badgeState)
                .accessibilityHidden(true)
        }
        .frame(width: avatarSize, height: avatarSize)
        .overlay {
            Circle()
                .stroke(Color.white.opacity(0.96), lineWidth: 1)
        }
        .shadow(color: DesignTokens.Colors.primary.opacity(0.28), radius: 10, y: 4)
        .shadow(color: Color.black.opacity(0.06), radius: 6, y: 2)
    }

    @ViewBuilder
    private var badgeBody: some View {
        switch badgeState {
        case .none:
            EmptyView()
        case .running(let count):
            ZStack {
                Circle()
                    .fill(.thinMaterial)

                Circle()
                    .fill(DesignTokens.Colors.secondary.opacity(0.90))
                    .padding(1.5)

                Circle()
                    .trim(from: 0.16, to: 0.92)
                    .stroke(Color.white.opacity(0.92), style: StrokeStyle(lineWidth: 2, lineCap: .round))
                    .rotationEffect(.degrees(isBadgeRotating ? 360 : 0))

                Text(count > 9 ? "9+" : "\(count)")
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }
            .frame(width: badgeSize, height: badgeSize)
            .overlay {
                Circle()
                    .stroke(Color.white.opacity(0.92), lineWidth: 1)
            }
            .shadow(color: DesignTokens.Colors.secondary.opacity(0.25), radius: 6, y: 2)
        case .completed:
            ZStack {
                Circle()
                    .fill(.thinMaterial)

                Circle()
                    .fill(DesignTokens.Colors.primarySelected)
                    .padding(1.5)

                Image(systemName: "checkmark")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.white)
            }
            .frame(width: badgeSize, height: badgeSize)
            .overlay {
                Circle()
                    .stroke(Color.white.opacity(0.94), lineWidth: 1)
            }
            .shadow(color: DesignTokens.Colors.primary.opacity(0.28), radius: 6, y: 2)
        }
    }

    private func startAnimations() {
        isBadgeRotating = false
        haloVisible = false

        if case .running = badgeState {
            withAnimation(DesignTokens.Motion.badgeSpin) {
                isBadgeRotating = true
            }
        }

        if case .completed = badgeState {
            withAnimation(DesignTokens.Motion.badgePulse) {
                haloVisible = true
            }
        }
    }
}

private struct GlobalAvatarToolbarButton: View {
    var body: some View {
        AvatarBadgeButton {
            ProfileView()
        } badgeDestination: {
            GenerationTaskInboxView()
        }
    }
}

struct GenerationTaskInboxView: View {
    @Environment(GenerationTaskStore.self) private var generationTaskStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DesignTokens.Spacing.sectionGap) {
                summarySection

                if generationTaskStore.tasks.isEmpty {
                    EmptyStateView(
                        title: "队列里还没有生成结果",
                        subtitle: "先去创作页提交一个任务，完成后就会从这里回看。",
                        systemImage: "sparkles.rectangle.stack"
                    )
                } else {
                    LazyVStack(spacing: DesignTokens.Spacing.cardGap) {
                        ForEach(generationTaskStore.tasks) { task in
                            taskCard(task)
                        }
                    }
                }
            }
            .padding(.horizontal, DesignTokens.Spacing.pageHorizontal)
            .padding(.top, 12)
            .padding(.bottom, DesignTokens.Spacing.tabBarClearance)
        }
        .background(DesignTokens.Colors.background.ignoresSafeArea())
        .navigationTitle("生成结果")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            generationTaskStore.markCompletedTasksViewed()
        }
    }

    private var summarySection: some View {
        HStack(spacing: 12) {
            summaryCard(title: "进行中", value: "\(generationTaskStore.currentRunning)", tint: DesignTokens.Colors.secondary, icon: "clock.badge")
            summaryCard(title: "待查看", value: generationTaskStore.hasCompleted ? "1+" : "0", tint: DesignTokens.Colors.primary, icon: "sparkles")
        }
    }

    private func summaryCard(title: String, value: String, tint: Color, icon: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.footnote.weight(.bold))
                .foregroundStyle(tint)
            Text(value)
                .font(.title3.bold())
                .foregroundStyle(DesignTokens.Colors.textPrimary)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(.background, in: RoundedRectangle(cornerRadius: DesignTokens.Corner.card, style: .continuous))
    }

    private func taskCard(_ task: GenerationTask) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let imageURL = task.results.first?.url {
                GenerationTaskThumbnail(url: imageURL)
                    .frame(height: 180)
                    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Corner.card, style: .continuous))
            }

            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(task.prompt)
                        .font(.headline)
                        .foregroundStyle(DesignTokens.Colors.textPrimary)
                        .lineLimit(2)

                    Text(task.createdAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer(minLength: 0)

                Text(task.status.displayText)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(task.status.tintColor)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(task.status.tintColor.opacity(0.10), in: Capsule())
            }
        }
        .padding(16)
        .background(.background, in: RoundedRectangle(cornerRadius: DesignTokens.Corner.card, style: .continuous))
    }
}

private struct GenerationTaskThumbnail: View {
    let url: URL

    var body: some View {
        Group {
            if url.isFileURL, let uiImage = UIImage(contentsOfFile: url.path) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
            } else {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    default:
                        Rectangle()
                            .fill(Color(.systemGray5))
                    }
                }
            }
        }
    }
}

private extension TaskStatus {
    var displayText: String {
        switch self {
        case .pending:
            return "排队中"
        case .running:
            return "生成中"
        case .completed:
            return "已完成"
        case .failed:
            return "已失败"
        }
    }

    var tintColor: Color {
        switch self {
        case .pending:
            return DesignTokens.Colors.warning
        case .running:
            return DesignTokens.Colors.secondary
        case .completed:
            return DesignTokens.Colors.primary
        case .failed:
            return Color.red
        }
    }
}

extension View {
    func appProfileToolbar() -> some View {
        toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                GlobalAvatarToolbarButton()
            }
        }
    }
}

#Preview("Avatar Badge States") {
    @Previewable @State var runningStore = GenerationTaskStore()
    @Previewable @State var completedStore = GenerationTaskStore()

    runningStore.tasks = [
        GenerationTask(
            id: UUID(),
            remoteJobID: "preview-running",
            prompt: "生成一张奶油系咖啡海报",
            params: CreationParams(mode: .textToImage),
            status: .running,
            results: [],
            viewed: false,
            createdAt: .now
        )
    ]

    completedStore.tasks = [
        GenerationTask(
            id: UUID(),
            remoteJobID: "preview-done",
            prompt: "生成一张节日促销主视觉",
            params: CreationParams(mode: .textToImage),
            status: .completed,
            results: [],
            viewed: false,
            createdAt: .now
        )
    ]

    return HStack(spacing: 24) {
        AvatarBadgeButton {
            Text("我的")
        } badgeDestination: {
            Text("结果")
        }

        AvatarBadgeButton {
            Text("我的")
        } badgeDestination: {
            Text("结果")
        }
        .environment(completedStore)
    }
    .environment(runningStore)
    .environmentObject(AppSession.previewLoaded())
    .padding()
}
