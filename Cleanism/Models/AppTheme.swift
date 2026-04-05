import SwiftUI

struct ThemeColors {
    let background: Color
    let text: Color
    let secondaryText: Color
    let accents: [Color]

    var primary: Color { accents[0] }
    var secondary: Color { accents.count > 1 ? accents[1] : accents[0] }
    var success: Color { accents.count > 2 ? accents[2] : accents[0] }
    var tertiary: Color { accents.count > 3 ? accents[3] : accents[0] }
}

struct AppTheme: Identifiable {
    let id: String
    let name: String
    let light: ThemeColors
    let dark: ThemeColors
}

extension AppTheme {
    static let allThemes: [AppTheme] = [
        AppTheme(
            id: "8bit-classic",
            name: "8-Bit Classic",
            light: ThemeColors(
                background: Color(hex: "#CFEFEC"),
                text: Color(hex: "#80171F"),
                secondaryText: Color(hex: "#3D3737"),
                accents: [Color(hex: "#2584BC"), Color(hex: "#06A7A1"), Color(hex: "#70A780"), Color(hex: "#C0A77F")]
            ),
            dark: ThemeColors(
                background: Color(hex: "#3D3737"),
                text: Color(hex: "#CFEFEC"),
                secondaryText: Color(hex: "#B8D4D2"),
                accents: [Color(hex: "#2584BC"), Color(hex: "#06A7A1"), Color(hex: "#70A780"), Color(hex: "#C0A77F")]
            )
        ),
        AppTheme(
            id: "ocean-blue",
            name: "Ocean Blue",
            light: ThemeColors(
                background: Color(hex: "#E0F7FA"),
                text: Color(hex: "#01579B"),
                secondaryText: Color(hex: "#263238"),
                accents: [Color(hex: "#0277BD"), Color(hex: "#00ACC1"), Color(hex: "#4DD0E1"), Color(hex: "#80DEEA")]
            ),
            dark: ThemeColors(
                background: Color(hex: "#263238"),
                text: Color(hex: "#E0F7FA"),
                secondaryText: Color(hex: "#B2EBF2"),
                accents: [Color(hex: "#0277BD"), Color(hex: "#00ACC1"), Color(hex: "#4DD0E1"), Color(hex: "#80DEEA")]
            )
        ),
        AppTheme(
            id: "sunset-orange",
            name: "Sunset Orange",
            light: ThemeColors(
                background: Color(hex: "#FFF3E0"),
                text: Color(hex: "#E65100"),
                secondaryText: Color(hex: "#3E2723"),
                accents: [Color(hex: "#F57C00"), Color(hex: "#FF6F00"), Color(hex: "#FFB74D"), Color(hex: "#FFCC80")]
            ),
            dark: ThemeColors(
                background: Color(hex: "#3E2723"),
                text: Color(hex: "#FFF3E0"),
                secondaryText: Color(hex: "#FFCCBC"),
                accents: [Color(hex: "#F57C00"), Color(hex: "#FF6F00"), Color(hex: "#FFB74D"), Color(hex: "#FFCC80")]
            )
        ),
        AppTheme(
            id: "forest-green",
            name: "Forest Green",
            light: ThemeColors(
                background: Color(hex: "#E8F5E9"),
                text: Color(hex: "#1B5E20"),
                secondaryText: Color(hex: "#263238"),
                accents: [Color(hex: "#2E7D32"), Color(hex: "#388E3C"), Color(hex: "#66BB6A"), Color(hex: "#81C784")]
            ),
            dark: ThemeColors(
                background: Color(hex: "#263238"),
                text: Color(hex: "#E8F5E9"),
                secondaryText: Color(hex: "#C8E6C9"),
                accents: [Color(hex: "#2E7D32"), Color(hex: "#388E3C"), Color(hex: "#66BB6A"), Color(hex: "#81C784")]
            )
        ),
        AppTheme(
            id: "royal-purple",
            name: "Royal Purple",
            light: ThemeColors(
                background: Color(hex: "#F3E5F5"),
                text: Color(hex: "#4A148C"),
                secondaryText: Color(hex: "#263238"),
                accents: [Color(hex: "#6A1B9A"), Color(hex: "#7B1FA2"), Color(hex: "#AB47BC"), Color(hex: "#BA68C8")]
            ),
            dark: ThemeColors(
                background: Color(hex: "#263238"),
                text: Color(hex: "#F3E5F5"),
                secondaryText: Color(hex: "#E1BEE7"),
                accents: [Color(hex: "#6A1B9A"), Color(hex: "#7B1FA2"), Color(hex: "#AB47BC"), Color(hex: "#BA68C8")]
            )
        ),
    ]
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)
        let r = Double((rgbValue & 0xFF0000) >> 16) / 255.0
        let g = Double((rgbValue & 0x00FF00) >> 8) / 255.0
        let b = Double(rgbValue & 0x0000FF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
