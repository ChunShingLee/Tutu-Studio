import SwiftUI
import UIKit

enum DesignTokens {
    enum Colors {
        static let primary = Color(hex: 0xFF6B35)
        static let primarySelected = Color(hex: 0xF25E2A)
        static let secondary = Color(hex: 0x7B61FF)
        static let creativeYellow = Color(hex: 0xFFD93D)

        // 深浅双模文字 — 浅模式 #2D3436,深模式近白(带极淡紫)
        static let textPrimary = Color(uiColor: UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.94, green: 0.94, blue: 0.97, alpha: 1.0)
                : UIColor(red: 0x2D/255.0, green: 0x34/255.0, blue: 0x36/255.0, alpha: 1.0)
        })

        // 页面底色 — 浅模式 #EAEAEA 级,深模式近黑略带紫
        static let background = Color(uiColor: UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.07, green: 0.07, blue: 0.09, alpha: 1.0)      // #121216
                : UIColor(red: 0.918, green: 0.918, blue: 0.918, alpha: 1.0)   // #EAEAEA
        })

        static let cardBackground = Color(.secondarySystemGroupedBackground)
        static let surface = Color.white

        // 发丝线/卡片边 — 双模都可见
        static let hairline = Color(uiColor: UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor.white.withAlphaComponent(0.10)
                : UIColor.black.withAlphaComponent(0.06)
        })

        // 玻璃软线 — 深色模式下要更亮以保持对比
        static let softLine = Color(uiColor: UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor.white.withAlphaComponent(0.28)
                : UIColor.white.withAlphaComponent(0.72)
        })

        static let avatarFill = Color.white.opacity(0.22)
        static let success = Color(hex: 0x28B56B)
        static let warning = Color(hex: 0xFFB020)
    }

    enum Spacing {
        static let xxxs: CGFloat = 4
        static let xxs: CGFloat = 8
        static let xs: CGFloat = 12
        static let sm: CGFloat = 16
        static let md: CGFloat = 20
        static let lg: CGFloat = 24
        static let pageHorizontal: CGFloat = 16
        static let cardGap: CGFloat = 12
        static let sectionGap: CGFloat = 24
        static let tabBarClearance: CGFloat = 100
    }

    enum Corner {
        static let card: CGFloat = 20
        static let button: CGFloat = 16
        static let capsule: CGFloat = 999
        static let hero: CGFloat = 30
        static let avatar: CGFloat = 22
    }

    enum Typography {
        static let pageTitle = Font.largeTitle.bold()
        static let sectionTitle = Font.title2.bold()
        static let cardTitle = Font.headline.weight(.semibold)
        static let body = Font.body
        static let helper = Font.subheadline
    }

    enum Motion {
        static let badgePulse = Animation.easeInOut(duration: 1.2).repeatForever(autoreverses: true)
        static let badgeSpin = Animation.linear(duration: 0.9).repeatForever(autoreverses: false)
    }

    enum Gradients {
        static let brand = LinearGradient(
            colors: [Colors.primary, Color(hex: 0xFF8C5A), Colors.secondary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let brandFlat = LinearGradient(
            colors: [Colors.primary, Colors.secondary],
            startPoint: .leading,
            endPoint: .trailing
        )

        // 页面底面渐变 — 浅模式奶油白三段,深模式近黑三段
        // 用 dynamic UIColor 包 stops,同一 LinearGradient 自动跟 colorScheme
        static let surface = LinearGradient(
            colors: [
                Color(uiColor: UIColor { trait in
                    trait.userInterfaceStyle == .dark
                        ? UIColor(red: 0.08, green: 0.08, blue: 0.10, alpha: 1)
                        : UIColor.white
                }),
                Color(uiColor: UIColor { trait in
                    trait.userInterfaceStyle == .dark
                        ? UIColor(red: 0.09, green: 0.08, blue: 0.11, alpha: 1)
                        : UIColor(red: 1.0, green: 0.972, blue: 0.956, alpha: 1)
                }),
                Color(uiColor: UIColor { trait in
                    trait.userInterfaceStyle == .dark
                        ? UIColor(red: 0.07, green: 0.07, blue: 0.09, alpha: 1)
                        : UIColor(red: 0.964, green: 0.968, blue: 0.984, alpha: 1)
                })
            ],
            startPoint: .top,
            endPoint: .bottom
        )

        static let avatar = LinearGradient(
            colors: [Color.white.opacity(0.95), Color.white.opacity(0.72)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

extension Color {
    init(hex: UInt, opacity: Double = 1.0) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255.0,
            green: Double((hex >> 8) & 0xFF) / 255.0,
            blue: Double(hex & 0xFF) / 255.0,
            opacity: opacity
        )
    }
}
