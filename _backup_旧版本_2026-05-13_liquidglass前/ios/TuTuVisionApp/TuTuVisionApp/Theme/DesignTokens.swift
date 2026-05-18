import SwiftUI

enum DesignTokens {
    enum Colors {
        static let primary = Color(hex: 0xFF6B35)
        static let primarySelected = Color(hex: 0xF25E2A)
        static let secondary = Color(hex: 0x7B61FF)
        static let creativeYellow = Color(hex: 0xFFD93D)
        static let textPrimary = Color(hex: 0x2D3436)
        static let background = Color(.systemGroupedBackground)
        static let cardBackground = Color(.secondarySystemGroupedBackground)
        static let surface = Color.white
        static let hairline = Color.black.opacity(0.06)
        static let softLine = Color.white.opacity(0.72)
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

        static let surface = LinearGradient(
            colors: [Color.white, Color(hex: 0xFFF8F4), Color(hex: 0xF6F7FB)],
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
