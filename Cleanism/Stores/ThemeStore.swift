import SwiftUI

@MainActor
class ThemeStore: ObservableObject {
    @Published var themeId: String {
        didSet { UserDefaults.standard.set(themeId, forKey: "cleanism_themeId") }
    }
    @Published var isDarkMode: Bool {
        didSet { UserDefaults.standard.set(isDarkMode, forKey: "cleanism_isDarkMode") }
    }

    init() {
        self.themeId = UserDefaults.standard.string(forKey: "cleanism_themeId") ?? "8bit-classic"
        self.isDarkMode = UserDefaults.standard.bool(forKey: "cleanism_isDarkMode")
    }

    var currentTheme: AppTheme {
        AppTheme.allThemes.first { $0.id == themeId } ?? AppTheme.allThemes[0]
    }

    var colors: ThemeColors {
        isDarkMode ? currentTheme.dark : currentTheme.light
    }

    func setTheme(_ id: String) {
        themeId = id
    }

    func toggleDarkMode() {
        isDarkMode.toggle()
    }
}
