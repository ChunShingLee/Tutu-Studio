import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var session: AppSession

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                profileHeroCard
                quotaCard
                membershipCard
                shortcutCard
                supportCard
                adminCard
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 28)
        }
        .refreshable { await session.loadProfile() }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("我的")
        .navigationBarTitleDisplayMode(.large)
    }

    private var profileHeroCard: some View {
        HeroCard(height: 212) {
            RoundedRectangle(cornerRadius: TuTuRadius.primary, style: .continuous)
                .fill(.white.opacity(0.12))
                .frame(width: 116, height: 144)
                .rotationEffect(.degrees(-9))
                .offset(x: 224, y: 42)
                .overlay(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 8) {
                        Image(systemName: "person.crop.circle.fill")
                            .font(.title3.weight(.bold))
                        Text("创作者\n账户")
                            .font(.headline.weight(.bold))
                    }
                    .foregroundStyle(.white)
                    .padding(16)
                }
        } content: {
            VStack(alignment: .leading, spacing: 14) {
                Label("我的账户", systemImage: "sparkles")
                    .font(.subheadline.weight(.semibold))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(.white.opacity(0.22), in: Capsule())

                HStack(alignment: .center, spacing: 14) {
                    Circle()
                        .fill(LinearGradient(colors: [Color.white.opacity(0.92), Color.white.opacity(0.70)], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 64, height: 64)
                        .overlay {
                            Text("兔")
                                .font(.title.weight(.bold))
                                .foregroundStyle(TuTuColor.orange)
                        }

                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 8) {
                            Text(session.profile.nickname)
                                .font(.system(size: 26, weight: .bold, design: .rounded))
                            TagChip(text: session.profile.plan, systemImage: "crown.fill", color: .white, style: .glass)
                        }
                        Text("把账户、额度和常用管理收口在这里。")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.88))
                            .lineLimit(2)
                    }
                    .foregroundStyle(.white)
                }
            }
        }
    }

    private var quotaCard: some View {
        PrimaryCard(style: .solid, padding: 18, corner: 24) {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("剩余额度")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        HStack(spacing: 8) {
                            Image(systemName: "bolt.fill")
                                .foregroundStyle(TuTuColor.orange)
                            Text(session.remainingQuotaText)
                                .font(.title3.weight(.bold))
                                .foregroundStyle(TuTuColor.dark)
                        }
                    }
                    Spacer()
                    Text("去创作")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(TuTuColor.orange, in: Capsule())
                }

                HStack(spacing: 10) {
                    quotaMetric(title: "当前套餐", value: session.profile.plan, tint: TuTuColor.purple)
                    quotaMetric(title: "已存素材", value: "\(session.assets.count)", tint: TuTuColor.mint)
                    quotaMetric(title: "最近任务", value: "\(session.jobHistory.count)", tint: TuTuColor.yellow)
                }
            }
        }
        .tuTuShadow(.soft)
    }

    private func quotaMetric(title: String, value: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(tint)
                .frame(width: 24, height: 4)
            Text(value)
                .font(.headline.weight(.bold))
                .foregroundStyle(TuTuColor.dark)
                .lineLimit(1)
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private var membershipCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionTitle("会员与订阅")

            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Color(red: 0.24, green: 0.19, blue: 0.18), Color(red: 0.37, green: 0.29, blue: 0.23)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )

                Circle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 118, height: 118)
                    .offset(x: 240, y: -20)

                HStack {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(session.profile.plan == "免费版" ? "免费版账户" : session.profile.plan)
                            .font(.title3.weight(.bold))
                            .foregroundStyle(.white)
                        Text("后续可继续补全订阅购买、订单记录与算力包。")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.80))
                    }
                    Spacer()
                    Text("查看权益")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color(red: 0.29, green: 0.22, blue: 0.12))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(Color(red: 0.96, green: 0.82, blue: 0.58), in: Capsule())
                }
                .padding(18)
            }
            .frame(height: 112)

            HStack(spacing: 10) {
                benefitPill(title: "会员模板", icon: "crown.fill", tint: TuTuColor.orange)
                benefitPill(title: "高清导出", icon: "arrow.down.circle.fill", tint: TuTuColor.purple)
                benefitPill(title: "优先队列", icon: "bolt.badge.clock.fill", tint: TuTuColor.mint)
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func benefitPill(title: String, icon: String, tint: Color) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.caption.weight(.bold))
            Text(title)
                .font(.caption.weight(.semibold))
        }
        .foregroundStyle(tint)
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(tint.opacity(0.10), in: Capsule())
    }

    private var shortcutCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                sectionTitle("常用入口")
                Spacer()
                Text("保留高频")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 10) {
                NavigationLink {
                    AssetsView()
                } label: {
                    profileRow(
                        title: "项目与素材库",
                        subtitle: "查看已沉淀成果，继续用于提案、投放或二次创作",
                        icon: "square.stack.fill",
                        tint: TuTuColor.orange
                    )
                }
                .buttonStyle(.plain)

                profileRow(
                    title: "订单与算力包",
                    subtitle: "预留订阅购买与补充算力入口",
                    icon: "creditcard.fill",
                    tint: TuTuColor.purple
                )

                profileRow(
                    title: "我的收藏",
                    subtitle: "后续可汇总常用模板与喜欢的灵感作品",
                    icon: "star.fill",
                    tint: TuTuColor.yellow
                )
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var supportCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionTitle("帮助与设置")

            VStack(spacing: 10) {
                profileRow(
                    title: "帮助中心",
                    subtitle: "新手引导、Prompt 手册与常见问题",
                    icon: "questionmark.circle.fill",
                    tint: TuTuColor.mint
                )

                profileRow(
                    title: "关于兔兔",
                    subtitle: "查看产品说明、版本信息与品牌介绍",
                    icon: "info.circle.fill",
                    tint: Color(red: 0.27, green: 0.60, blue: 0.96)
                )

                profileRow(
                    title: "设置",
                    subtitle: "通知、隐私和模型偏好后续都收在这里",
                    icon: "gearshape.fill",
                    tint: Color.gray
                )
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var adminCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionTitle("管理")

            NavigationLink {
                AdminPreviewView()
            } label: {
                HStack(spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [TuTuColor.orange.opacity(0.92), TuTuColor.purple.opacity(0.82)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 54, height: 54)

                        Image(systemName: "chart.xyaxis.line")
                            .foregroundStyle(.white)
                            .font(.title3.weight(.bold))
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("后台管理预览")
                            .font(.headline)
                            .foregroundStyle(TuTuColor.dark)
                        Text("查看运营数据、模板内容与系统配置的演示入口")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundStyle(.tertiary)
                }
                .padding(14)
                .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
            .buttonStyle(.plain)
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func sectionTitle(_ title: String) -> some View {
        Text(title)
            .font(TuTuTypography.sectionTitle)
            .foregroundStyle(TuTuColor.dark)
    }

    private func profileRow(title: String, subtitle: String, icon: String, tint: Color) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(tint.opacity(0.14))
                    .frame(width: 54, height: 54)

                Image(systemName: icon)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(tint)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(TuTuColor.dark)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            Spacer()
            Image(systemName: "chevron.right")
                .foregroundStyle(.tertiary)
        }
        .padding(14)
        .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

struct AdminPreviewView: View {
    @State private var metric = AdminMetric(users: 0, jobsToday: 0, assets: 0, conversionRate: 0)

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                metricsCard
                modulesCard
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 28)
        }
        .background(TuTuColor.groupedBackground.ignoresSafeArea())
        .navigationTitle("后台管理")
        .navigationBarTitleDisplayMode(.inline)
        .task { metric = (try? await APIClient.shared.get("/api/admin/metrics")) ?? metric }
    }

    private var metricsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("数据看板")
                .font(.title3.weight(.bold))
                .foregroundStyle(TuTuColor.dark)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                metricTile(title: "用户", value: "\(metric.users)", tint: TuTuColor.orange)
                metricTile(title: "今日生成", value: "\(metric.jobsToday)", tint: TuTuColor.purple)
                metricTile(title: "素材", value: "\(metric.assets)", tint: TuTuColor.yellow)
                metricTile(title: "转化率", value: "\(String(format: "%.1f", metric.conversionRate * 100))%", tint: Color(red: 0.20, green: 0.67, blue: 0.45))
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var modulesCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("后台模块")
                .font(.title3.weight(.bold))
                .foregroundStyle(TuTuColor.dark)

            VStack(spacing: 10) {
                moduleRow(title: "用户 / 角色 / 权限", icon: "person.2.fill", tint: TuTuColor.orange)
                moduleRow(title: "模板与内容管理", icon: "square.grid.2x2.fill", tint: TuTuColor.purple)
                moduleRow(title: "系统配置与模型 Provider", icon: "slider.horizontal.3", tint: TuTuColor.yellow)
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func metricTile(title: String, value: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(tint)
                .frame(width: 24, height: 4)

            Text(value)
                .font(.title3.weight(.bold))
                .foregroundStyle(TuTuColor.dark)

            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private func moduleRow(title: String, icon: String, tint: Color) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(tint.opacity(0.14))
                    .frame(width: 46, height: 46)

                Image(systemName: icon)
                    .foregroundStyle(tint)
            }

            Text(title)
                .font(.subheadline)
                .foregroundStyle(TuTuColor.dark)

            Spacer()
        }
        .padding(12)
        .background(TuTuColor.groupedBackground, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}
