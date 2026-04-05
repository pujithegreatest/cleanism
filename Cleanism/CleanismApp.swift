import SwiftUI

@main
struct CleanismApp: App {
    @StateObject private var choreStore = ChoreStore()
    @StateObject private var themeStore = ThemeStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(choreStore)
                .environmentObject(themeStore)
        }
    }
}
