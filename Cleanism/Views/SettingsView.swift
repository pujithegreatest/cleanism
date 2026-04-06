import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var choreStore: ChoreStore
    @EnvironmentObject var themeStore: ThemeStore

    @AppStorage("habitica_enabled") private var habiticaEnabled = false
    @AppStorage("habitica_userID") private var habiticaUserID = ""
    @AppStorage("habitica_apiToken") private var habiticaApiToken = ""
    @AppStorage("habitica_taskAlias") private var habiticaTaskAlias = "cleanism"

    var body: some View {
        let c = themeStore.colors
        let completed = choreStore.completedChores
        let pending = choreStore.pendingChores
        let total = completed.count + pending.count
        let rate = total > 0 ? Int(round(Double(completed.count) / Double(total) * 100)) : 0

        let areaStats = completed.reduce(into: [String: Int]()) { acc, chore in
            acc[chore.areaTag.rawValue, default: 0] += 1
        }
        let topArea = areaStats.max(by: { $0.value < $1.value })

        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    header(c)
                    statsOverview(c, completed: completed.count, rate: rate, topArea: topArea)
                    darkModeToggle(c)
                    themeSection(c)
                    habiticaSection(c)
                    quickTips(c)
                    achievements(c, completedCount: completed.count)
                    appInfo(c)
                }
            }
            .background(c.background)
            .navigationBarHidden(true)
        }
    }

    @ViewBuilder
    private func header(_ c: ThemeColors) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Settings")
                .font(.system(size: 30, weight: .bold))
                .foregroundColor(c.text)
            Text("Customize your experience")
                .font(.subheadline)
                .foregroundColor(c.secondaryText)
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
        .padding(.bottom, 16)
    }

    @ViewBuilder
    private func statsOverview(_ c: ThemeColors, completed: Int, rate: Int, topArea: Dictionary<String, Int>.Element?) -> some View {
        HStack {
            VStack(spacing: 4) {
                Text("\(completed)")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                Text("Completed")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            .frame(maxWidth: .infinity)

            Rectangle().fill(.white.opacity(0.3)).frame(width: 1, height: 48)

            VStack(spacing: 4) {
                Text("\(rate)%")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                Text("Success Rate")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            .frame(maxWidth: .infinity)

            Rectangle().fill(.white.opacity(0.3)).frame(width: 1, height: 48)

            VStack(spacing: 4) {
                Text("\(topArea?.value ?? 0)")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                Text(topArea?.key.components(separatedBy: " ").first ?? "Tasks")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            .frame(maxWidth: .infinity)
        }
        .padding(20)
        .background(
            LinearGradient(colors: [c.primary, c.secondary], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
    }

    @ViewBuilder
    private func darkModeToggle(_ c: ThemeColors) -> some View {
        HStack {
            HStack(spacing: 16) {
                Image(systemName: themeStore.isDarkMode ? "moon.fill" : "sun.max.fill")
                    .font(.system(size: 20))
                    .foregroundColor(c.primary)
                    .frame(width: 40, height: 40)
                    .background(c.primary.opacity(0.12))
                    .clipShape(Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text("Dark Mode")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(c.text)
                    Text(themeStore.isDarkMode ? "On" : "Off")
                        .font(.subheadline)
                        .foregroundColor(c.secondaryText)
                }
            }
            Spacer()
            Toggle("", isOn: Binding(
                get: { themeStore.isDarkMode },
                set: { _ in themeStore.toggleDarkMode() }
            ))
            .labelsHidden()
            .tint(c.primary)
        }
        .padding(16)
        .background(c.secondaryText.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
    }

    @ViewBuilder
    private func themeSection(_ c: ThemeColors) -> some View {
        Text("Theme")
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(c.text)
            .padding(.horizontal, 24)
            .padding(.bottom, 16)

        VStack(spacing: 12) {
            ForEach(AppTheme.allThemes) { theme in
                let isSelected = themeStore.themeId == theme.id
                let previewColors = themeStore.isDarkMode ? theme.dark : theme.light

                Button {
                    themeStore.setTheme(theme.id)
                } label: {
                    HStack {
                        HStack(spacing: -8) {
                            ForEach(0..<previewColors.accents.count, id: \.self) { idx in
                                Circle()
                                    .fill(previewColors.accents[idx])
                                    .frame(width: 32, height: 32)
                                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
                                    .zIndex(Double(4 - idx))
                            }
                        }
                        .padding(.trailing, 8)

                        Text(theme.name)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(c.text)

                        Spacer()

                        if isSelected {
                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 24, height: 24)
                                .background(c.primary)
                                .clipShape(Circle())
                        }
                    }
                    .padding(16)
                    .background(c.secondaryText.opacity(0.06))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .strokeBorder(isSelected ? c.primary : .clear, lineWidth: 2)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
    }

    @ViewBuilder
    private func quickTips(_ c: ThemeColors) -> some View {
        Text("Quick Tips")
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(c.text)
            .padding(.horizontal, 24)
            .padding(.bottom, 16)

        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "lightbulb.fill")
                .foregroundColor(c.success)
                .frame(width: 40, height: 40)
                .background(c.success.opacity(0.2))
                .clipShape(Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text("Pro Cleaning Tip")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(c.text)
                Text("Clean from top to bottom and left to right. This ensures dust and debris fall onto uncleaned areas, making your cleaning more efficient!")
                    .font(.system(size: 14))
                    .foregroundColor(c.secondaryText)
                    .lineSpacing(4)
            }
        }
        .padding(16)
        .background(c.success.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
    }

    @ViewBuilder
    private func achievements(_ c: ThemeColors, completedCount: Int) -> some View {
        Text("Achievements")
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(c.text)
            .padding(.horizontal, 24)
            .padding(.bottom, 16)

        HStack(spacing: 12) {
            achievementBadge(
                icon: "sparkles", label: "First Clean",
                unlocked: completedCount >= 1,
                color: c.tertiary, c: c
            )
            achievementBadge(
                icon: "star.fill", label: "10 Tasks",
                unlocked: completedCount >= 10,
                color: c.success, c: c
            )
            achievementBadge(
                icon: "trophy.fill", label: "50 Tasks",
                unlocked: completedCount >= 50,
                color: c.primary, c: c
            )
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
    }

    @ViewBuilder
    private func achievementBadge(icon: String, label: String, unlocked: Bool, color: Color, c: ThemeColors) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(unlocked ? .white : c.secondaryText)
                .frame(width: 48, height: 48)
                .background(unlocked ? color : c.secondaryText.opacity(0.25))
                .clipShape(Circle())
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(unlocked ? c.text : c.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(unlocked ? color.opacity(0.12) : c.secondaryText.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }

    @ViewBuilder
    private func habiticaSection(_ c: ThemeColors) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 16) {
                Image(systemName: "gamecontroller.fill")
                    .font(.system(size: 20))
                    .foregroundColor(c.primary)
                    .frame(width: 40, height: 40)
                    .background(c.primary.opacity(0.12))
                    .clipShape(Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text("Habitica Integration")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(c.text)
                    Text("Sync completed tasks to Habitica")
                        .font(.subheadline)
                        .foregroundColor(c.secondaryText)
                }
                Spacer()
                Toggle("", isOn: $habiticaEnabled)
                    .labelsHidden()
                    .tint(c.primary)
            }
            .padding(16)
            .background(c.secondaryText.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 20))

            if habiticaEnabled {
                VStack(spacing: 14) {
                    habiticaField(
                        title: "User ID",
                        placeholder: "Your Habitica User ID",
                        text: $habiticaUserID,
                        c: c
                    )
                    habiticaField(
                        title: "API Token",
                        placeholder: "Your Habitica API Token",
                        text: $habiticaApiToken,
                        c: c
                    )
                    habiticaField(
                        title: "Task Alias",
                        placeholder: "cleanism",
                        text: $habiticaTaskAlias,
                        c: c
                    )
                }
                .padding(16)
                .background(c.tertiary.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        }
        .padding(16)
        .background(c.secondaryText.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
    }

    private func habiticaField(title: String, placeholder: String, text: Binding<String>, c: ThemeColors) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(c.text)
            TextField(placeholder, text: text)
                .font(.system(size: 15))
                .foregroundColor(c.text)
                .padding(12)
                .background(c.background)
                .cornerRadius(12)
        }
    }

    @ViewBuilder
    private func appInfo(_ c: ThemeColors) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "sparkles")
                    .font(.system(size: 24))
                    .foregroundColor(c.primary)
                    .frame(width: 48, height: 48)
                    .background(c.primary.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Cleanism")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(c.text)
                    Text("Your AI-powered cleaning assistant")
                        .font(.subheadline)
                        .foregroundColor(c.secondaryText)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 4) {
                HStack {
                    Text("Version").font(.caption).foregroundColor(c.secondaryText)
                    Spacer()
                    Text("1.0.0").font(.caption.weight(.medium)).foregroundColor(c.text)
                }
                HStack {
                    Text("Made with").font(.caption).foregroundColor(c.secondaryText)
                    Spacer()
                    HStack(spacing: 4) {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 10))
                            .foregroundColor(Color(hex: "#EF4444"))
                        Text("for clean spaces")
                            .font(.caption.weight(.medium))
                            .foregroundColor(c.text)
                    }
                }
            }
            .padding(12)
            .background(c.secondaryText.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding(16)
        .background(c.secondaryText.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
    }
}
