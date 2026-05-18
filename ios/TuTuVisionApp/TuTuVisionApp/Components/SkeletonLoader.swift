import SwiftUI

struct SkeletonLoader: View {
    var height: CGFloat = 160
    var cornerRadius: CGFloat = DesignTokens.Corner.card

    @State private var phase: CGFloat = -0.8

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            .fill(Color.secondary.opacity(0.10))
            .overlay {
                LinearGradient(
                    colors: [Color.clear, Color.white.opacity(0.42), Color.clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .mask(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
                .offset(x: phase * 280)
            }
            .frame(height: height)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .onAppear {
                withAnimation(.linear(duration: 1.1).repeatForever(autoreverses: false)) {
                    phase = 1.0
                }
            }
    }
}

#Preview("Banner Skeleton") {
    SkeletonLoader(height: 160)
        .padding()
        .background(DesignTokens.Gradients.surface)
}
