import SwiftUI

@main
struct TuTuVisionApp: App {
    @StateObject private var session = AppSession()
    @State private var generationTaskStore = GenerationTaskStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
                .environment(generationTaskStore)
        }
    }
}
