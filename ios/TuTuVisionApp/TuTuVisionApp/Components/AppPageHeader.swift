import SwiftUI

/// iOS 26 Apple Music / Photos 风格的大标题页眉。
/// 左侧超大 rounded title，右侧 AvatarBadgeButton 持平。
/// 随页面一起滚动（不受 navigationBar 影响），字号和行距在 Dynamic Type 下自适应。
struct AppPageHeader: View {
    let title: String
    var subtitle: String? = nil

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 34, weight: .heavy, design: .rounded))
                    .foregroundStyle(TuTuColor.dark)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                    .accessibilityAddTraits(.isHeader)

                if let subtitle {
                    Text(subtitle)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer(minLength: 8)

            // Toolbar 里的 avatar 是系统级位置；这里是页内 header，两者择其一即可
            AvatarBadgeButton {
                ProfileView()
            } badgeDestination: {
                GenerationTaskInboxView()
            }
        }
        .padding(.top, 4)
        .padding(.bottom, 12)
    }
}
