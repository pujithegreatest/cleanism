import SwiftUI

struct ContentView: View {
    @EnvironmentObject var themeStore: ThemeStore

    var body: some View {
        let c = themeStore.colors

        TabView {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Chores")
                }

            HistoryView()
                .tabItem {
                    Image(systemName: "clock.fill")
                    Text("History")
                }

            SettingsView()
                .tabItem {
                    Image(systemName: "gearshape.fill")
                    Text("Settings")
                }
        }
        .tint(c.primary)
    }
}
