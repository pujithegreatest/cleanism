import SwiftUI

struct HomeView: View {
    @EnvironmentObject var choreStore: ChoreStore
    @EnvironmentObject var themeStore: ThemeStore

    @State private var selectedFilter: AreaTag? = nil
    @State private var affirmation = Self.randomAffirmation()
    @State private var showAddChore = false
 
    private static let affirmations = [
        "You are capable of amazing things",
        "Today is going to be a great day",
        "You've got this",
        "Progress, not perfection",
        "Be proud of yourself",
        "You are stronger than you think",
        "Keep going, you're doing great",
        "Every step forward counts",
        "You are enough",
        "Your effort matters",
        "You're making a difference",
        "Stay focused on what you can control",
        "You have what it takes",
        "Good things take time",
        "You deserve to feel proud",
        "Success is a journey, not a destination",
        "You are unstoppable",
        "Your hard work will pay off",
        "Keep pushing, you're almost there",
        "You are a work in progress, and that's okay",
        "Believe in yourself",
        "You are worthy of your own love and respect",
        "Today is your day",
        "You've accomplished so much",
        "Your potential is limitless",
        "You are making progress every day",
        "Don't give up, you're doing amazing",
        "You are braver than you believe",
        "Success starts with self-belief",
        "You are the architect of your own success",
        "Keep that positive energy flowing",
        "You have the power within you",
        "Every accomplishment starts with the decision to try",
        "You are stronger than your challenges",
        "Your dedication is inspiring",
        "You are becoming who you want to be",
        "The best is yet to come",
        "You've overcome challenges before, you'll do it again",
        "Your effort is noticed and appreciated",
        "You are filled with endless potential",
        "You deserve all the success coming your way",
        "Today, you choose to be amazing",
        "You are a fighter and a winner",
        "Your goals are within reach",
        "Keep believing in yourself",
        "You are unstoppable when you put your mind to it",
        "Progress looks good on you",
        "You've earned this moment",
        "Your dreams are achievable",
        "You are doing better than you think"
    ]

    private static func randomAffirmation() -> String {
        affirmations.randomElement() ?? "You've got this!"
    }

    private var filteredChores: [Chore] {
        let pending = choreStore.pendingChores
        guard let filter = selectedFilter else { return pending }
        return pending.filter { $0.areaTag == filter }
    }

    var body: some View {
        let c = themeStore.colors

        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    header(c)
                    quote(c)
                    statsRow(c)
                    addButton(c)
                    filterPills(c)
                    sectionLabel(c)
                    choresList(c)
                }
            }
            .background(c.background)
            .navigationBarHidden(true)
            .sheet(isPresented: $showAddChore) {
                AddChoreView()
                    .environmentObject(choreStore)
                    .environmentObject(themeStore)
            }
        }
    }

    // MARK: - Header

    @ViewBuilder
    private func header(_ c: ThemeColors) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Cleanism")
                    .font(.system(size: 30, weight: .bold))
                    .foregroundColor(c.text)
                Text("\(choreStore.pendingChores.count) task\(choreStore.pendingChores.count != 1 ? "s" : "") remaining")
                    .font(.subheadline)
                    .foregroundColor(c.secondaryText)
            }
            Spacer()
            HStack(spacing: 8) {
                Button {
                    affirmation = Self.randomAffirmation()
                } label: {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(c.primary)
                        .frame(width: 40, height: 40)
                        .background(c.secondaryText.opacity(0.08))
                        .clipShape(Circle())
                }

                if choreStore.streak > 0 {
                    HStack(spacing: 6) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(c.success)
                        Text("\(choreStore.streak)")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(c.success)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(c.success.opacity(0.12))
                    .clipShape(Capsule())
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
        .padding(.bottom, 8)
    }

    // MARK: - Quote

    @ViewBuilder
    private func quote(_ c: ThemeColors) -> some View {
        Text("\"\(affirmation)\"")
            .font(.subheadline)
            .italic()
            .foregroundColor(c.secondaryText)
            .padding(.horizontal, 24)
            .padding(.bottom, 16)
    }

    // MARK: - Stats Row

    @ViewBuilder
    private func statsRow(_ c: ThemeColors) -> some View {
        HStack(spacing: 12) {
            StatCard(
                icon: "list.bullet",
                value: "\(choreStore.pendingChores.count)",
                label: "To Do",
                color: c.primary,
                bgColor: c.primary.opacity(0.08),
                textColor: c.text,
                secondaryColor: c.secondaryText
            )
            StatCard(
                icon: "checkmark.circle.fill",
                value: "\(choreStore.completedChores.count)",
                label: "Done",
                color: c.success,
                bgColor: c.success.opacity(0.08),
                textColor: c.text,
                secondaryColor: c.secondaryText
            )
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 20)
    }

    // MARK: - Add Button

    @ViewBuilder
    private func addButton(_ c: ThemeColors) -> some View {
        Button { showAddChore = true } label: {
            HStack(spacing: 12) {
                Image(systemName: "plus")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 40, height: 40)
                    .background(Color.white.opacity(0.25))
                    .clipShape(Circle())
                Text("Add New Task")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(
                LinearGradient(colors: [c.primary, c.secondary], startPoint: .topLeading, endPoint: .bottomTrailing)
            )
            .clipShape(RoundedRectangle(cornerRadius: 20))
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 20)
    }

    // MARK: - Filter Pills

    @ViewBuilder
    private func filterPills(_ c: ThemeColors) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                FilterPill(label: "All", icon: nil, isSelected: selectedFilter == nil, colors: c) {
                    selectedFilter = nil
                }
                ForEach(AreaTag.allCases, id: \.self) { tag in
                    let count = choreStore.pendingChores.filter { $0.areaTag == tag }.count
                    if count > 0 {
                        FilterPill(
                            label: "\(tag.rawValue) (\(count))",
                            icon: tag.iconName,
                            isSelected: selectedFilter == tag,
                            colors: c
                        ) {
                            selectedFilter = tag
                        }
                    }
                }
            }
            .padding(.horizontal, 24)
        }
        .padding(.bottom, 16)
    }

    // MARK: - Section Label

    @ViewBuilder
    private func sectionLabel(_ c: ThemeColors) -> some View {
        Text(selectedFilter == nil ? "All Tasks" : selectedFilter!.rawValue)
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(c.text)
            .padding(.horizontal, 24)
            .padding(.bottom, 12)
    }

    // MARK: - Chores List

    @ViewBuilder
    private func choresList(_ c: ThemeColors) -> some View {
        if filteredChores.isEmpty {
            VStack(spacing: 16) {
                Image(systemName: "sparkles")
                    .font(.system(size: 40))
                    .foregroundColor(c.success)
                    .frame(width: 80, height: 80)
                    .background(c.success.opacity(0.12))
                    .clipShape(Circle())
                Text("All Clean!")
                    .font(.title2.bold())
                    .foregroundColor(c.text)
                Text("Add a new task to keep your space sparkling")
                    .font(.subheadline)
                    .foregroundColor(c.secondaryText)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 32)
            .padding(.horizontal, 24)
            .background(c.secondaryText.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 24))
            .padding(.horizontal, 24)
        } else {
            VStack(spacing: 16) {
                ForEach(filteredChores) { chore in
                    NavigationLink(value: chore.id) {
                        ChoreCardView(chore: chore)
                            .environmentObject(themeStore)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
            .navigationDestination(for: UUID.self) { choreId in
                ChoreDetailView(choreId: choreId)
                    .environmentObject(choreStore)
                    .environmentObject(themeStore)
            }
        }
    }
}

// MARK: - Stat Card

struct StatCard: View {
    let icon: String
    let value: String
    let label: String
    let color: Color
    let bgColor: Color
    let textColor: Color
    let secondaryColor: Color

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)
                .frame(width: 40, height: 40)
                .background(color.opacity(0.2))
                .clipShape(Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.title3.bold())
                    .foregroundColor(textColor)
                Text(label)
                    .font(.caption)
                    .foregroundColor(secondaryColor)
            }
            Spacer()
        }
        .padding(16)
        .background(bgColor)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
}

// MARK: - Filter Pill

struct FilterPill: View {
    let label: String
    let icon: String?
    let isSelected: Bool
    let colors: ThemeColors
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 14))
                }
                Text(label)
                    .font(.system(size: 14, weight: .semibold))
            }
            .foregroundColor(isSelected ? .white : colors.text)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? colors.primary : colors.secondaryText.opacity(0.08))
            .clipShape(Capsule())
        }
    }
}
