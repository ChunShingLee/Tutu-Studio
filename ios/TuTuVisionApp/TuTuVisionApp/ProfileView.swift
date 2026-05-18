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
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 28)
        }
        .refreshable { await session.loadProfile() }
        .background(DesignTokens.Colors.background.ignoresSafeArea())
        .navigationTitle("我的")
        .navigationBarTitleDisplayMode(.large)
    }

    // MARK: - Hero Card

    private var profileHeroCard: some View {
        LiquidGlassCard(
            style: .hero,
            cornerRadius: 32,
            padding: EdgeInsets(top: 28, leading: 24, bottom: 28, trailing: 24),
            accentBlobs: .brandFluid
        ) {
            HStack(alignment: .center, spacing: 16) {
                Circle()
                    .fill(Color.white)
                    .frame(width: 64, height: 64)
                    .overlay {
                        Text("兔")
                            .font(.title.weight(.bold))
                            .foregroundStyle(TuTuColor.orange)
                    }
                    .shadow(color: Color.black.opacity(0.06), radius: 8, y: 4)

                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 8) {
                        Text(session.profile.nickname)
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.primary)
                        Text(session.profile.plan)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.primary)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.white.opacity(0.55), in: Capsule())
                    }
                    Text("把账户、额度和常用管理收口在这里。")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                        .lineLimit(2)
                }
            }
        }
    }

    // MARK: - Quota Card

    private var quotaCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .blueFluid
        ) {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("剩余额度")
                            .font(.subheadline)
                            .foregroundStyle(Color.secondary)
                        HStack(spacing: 8) {
                            Image(systemName: "bolt.fill")
                                .foregroundStyle(TuTuColor.orange)
                            Text(session.remainingQuotaText)
                                .font(.title3.weight(.bold))
                                .foregroundStyle(Color.primary)
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
    }

    private func quotaMetric(title: String, value: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(tint)
                .frame(width: 24, height: 4)
            Text(value)
                .font(.headline.weight(.bold))
                .foregroundStyle(Color.primary)
                .lineLimit(1)
            Text(title)
                .font(.caption2)
                .foregroundStyle(Color.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    // MARK: - Membership Card

    private var membershipCard: some View {
        NavigationLink {
            MembershipCenterView()
        } label: {
            LiquidGlassCard(
                style: .feature,
            cornerRadius: 24,
            accentBlobs: .pinkPurpleFluid
        ) {
            VStack(alignment: .leading, spacing: 14) {
                Text("会员与订阅")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(Color.primary)

                HStack {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(session.profile.plan == "免费版" ? "免费版账户" : session.profile.plan)
                            .font(.title3.weight(.bold))
                            .foregroundStyle(Color.primary)
                        Text("后续可继续补全订阅购买、订单记录与算力包。")
                            .font(.caption)
                            .foregroundStyle(Color.secondary)
                    }
                    Spacer()
                    Text("查看权益")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(TuTuColor.orange)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(Color.white.opacity(0.7), in: Capsule())
                }

                HStack(spacing: 10) {
                    benefitPill(title: "会员模板", icon: "crown.fill", tint: TuTuColor.orange)
                    benefitPill(title: "高清导出", icon: "arrow.down.circle.fill", tint: TuTuColor.purple)
                    benefitPill(title: "优先队列", icon: "bolt.badge.clock.fill", tint: TuTuColor.mint)
                }
            }
        }
        }
        .buttonStyle(.plain)
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
        .background(tint.opacity(0.12), in: Capsule())
    }

    // MARK: - Shortcut Card

    private var shortcutCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .blueFluid
        ) {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    Text("常用入口")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(Color.primary)
                    Spacer()
                    Text("保留高频")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                }

                VStack(spacing: 10) {
                    NavigationLink {
                        AssetsView()
                    } label: {
                        profileRow(
                            title: "项目与素材库",
                            subtitle: "查看已沉淀成果，继续用于提案、投放或二次创作",
                            icon: "tray.full.fill",
                            tint: TuTuColor.orange
                        )
                    }
                    .buttonStyle(.plain)

                    profileRow(
                        title: "订单与算力包",
                        subtitle: "预留订阅购买与补充算力入口",
                        icon: "bag.fill",
                        tint: TuTuColor.purple
                    )

                    profileRow(
                        title: "我的收藏",
                        subtitle: "后续可汇总常用模板与喜欢的灵感作品",
                        icon: "heart.rectangle.fill",
                        tint: TuTuColor.yellow
                    )
                }
            }
        }
    }

    // MARK: - Support Card

    private var supportCard: some View {
        LiquidGlassCard(
            style: .feature,
            cornerRadius: 24,
            accentBlobs: .brandFluid
        ) {
            VStack(alignment: .leading, spacing: 14) {
                Text("帮助与设置")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(Color.primary)

                VStack(spacing: 10) {
                    profileRow(
                        title: "帮助中心",
                        subtitle: "新手引导、Prompt 手册与常见问题",
                        icon: "book.closed.fill",
                        tint: TuTuColor.mint
                    )

                    profileRow(
                        title: "关于兔兔",
                        subtitle: "查看产品说明、版本信息与品牌介绍",
                        icon: "sparkle.magnifyingglass",
                        tint: Color(red: 0.27, green: 0.60, blue: 0.96)
                    )

                    profileRow(
                        title: "设置",
                        subtitle: "通知、隐私和模型偏好后续都收在这里",
                        icon: "gearshape.2.fill",
                        tint: Color.gray
                    )
                }
            }
        }
    }

    // MARK: - Row Helper

    private func profileRow(title: String, subtitle: String, icon: String, tint: Color) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(tint.opacity(0.15))
                    .frame(width: 46, height: 46)

                Image(systemName: icon)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(tint)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Color.primary)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
                    .lineLimit(2)
            }

            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.secondary)
        }
        .padding(12)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}
