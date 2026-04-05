import SwiftUI

struct HistoryView: View {
    @EnvironmentObject var choreStore: ChoreStore
    @EnvironmentObject var themeStore: ThemeStore
    @State private var selectedChoreId: UUID?

    var body: some View {
        let c = themeStore.colors
        let completed = choreStore.completedChores
        let pending = choreStore.pendingChores
        let total = completed.count + pending.count
        let rate = total > 0 ? Int(round(Double(completed.count) / Double(total) * 100)) : 0

        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    header(c)
                    statsCards(c, completed: completed.count, pending: pending.count)
                    if total > 0 { progressBar(c, rate: rate) }
                    sectionLabel(c)
                    completedList(c, completed: completed)
                }
            }
            .background(c.background)
            .navigationBarHidden(true)
        }
        .navigationDestination(isPresented: Binding(
            get: { selectedChoreId != nil },
            set: { if !$0 { selectedChoreId = nil } }
        )) {
            if let choreId = selectedChoreId {
                ChoreDetailView(choreId: choreId)
                    .environmentObject(choreStore)
                    .environmentObject(themeStore)
            }
        }
    }

    @ViewBuilder
    private func header(_ c: ThemeColors) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("History")
                .font(.system(size: 30, weight: .bold))
                .foregroundColor(c.text)
            Text("Track your cleaning progress")
                .font(.subheadline)
                .foregroundColor(c.secondaryText)
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
        .padding(.bottom, 16)
    }

    @ViewBuilder
    private func statsCards(_ c: ThemeColors, completed: Int, pending: Int) -> some View {
        HStack(spacing: 12) {
            StatCard(icon: "checkmark.circle.fill", value: "\(completed)", label: "Completed",
                     color: c.success, bgColor: c.success.opacity(0.08), textColor: c.text, secondaryColor: c.secondaryText)
            StatCard(icon: "hourglass", value: "\(pending)", label: "Pending",
                     color: c.primary, bgColor: c.primary.opacity(0.08), textColor: c.text, secondaryColor: c.secondaryText)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 20)
    }

    @ViewBuilder
    private func progressBar(_ c: ThemeColors, rate: Int) -> some View {
        VStack(spacing: 12) {
            HStack {
                Text("Completion Rate")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(c.text)
                Spacer()
                Text("\(rate)%")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(c.success)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(c.secondaryText.opacity(0.12))
                    RoundedRectangle(cornerRadius: 6)
                        .fill(
                            LinearGradient(colors: [c.success, c.secondary], startPoint: .leading, endPoint: .trailing)
                        )
                        .frame(width: geo.size.width * CGFloat(rate) / 100)
                }
            }
            .frame(height: 12)
        }
        .padding(16)
        .background(c.secondaryText.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 24)
        .padding(.bottom, 20)
    }

    @ViewBuilder
    private func sectionLabel(_ c: ThemeColors) -> some View {
        Text("Completed Tasks")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(c.text)
            .padding(.horizontal, 24)
            .padding(.bottom, 12)
    }

    @ViewBuilder
    private func completedList(_ c: ThemeColors, completed: [Chore]) -> some View {
        if completed.isEmpty {
            VStack(spacing: 16) {
                Image(systemName: "sparkles")
                    .font(.system(size: 40))
                    .foregroundColor(c.success)
                    .frame(width: 80, height: 80)
                    .background(c.success.opacity(0.12))
                    .clipShape(Circle())
                Text("No completed tasks yet")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(c.text)
                Text("Complete some tasks to see them here")
                    .font(.subheadline)
                    .foregroundColor(c.secondaryText)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 32)
            .background(c.secondaryText.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 24))
            .padding(.horizontal, 24)
        } else {
            VStack(spacing: 12) {
                ForEach(completed) { chore in
                    Button {
                        selectedChoreId = chore.id
                    } label: {
                        HStack(spacing: 12) {
                            if let path = chore.beforeImagePath, let img = ImageStore.load(name: path) {
                                Image(uiImage: img)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(width: 96, height: 96)
                                    .clipped()
                                    .clipShape(RoundedRectangle(cornerRadius: 16))
                            } else {
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(c.secondaryText.opacity(0.1))
                                    .frame(width: 96, height: 96)
                                    .overlay(
                                        Image(systemName: chore.areaTag.iconName)
                                            .font(.system(size: 24))
                                            .foregroundColor(c.secondaryText.opacity(0.4))
                                    )
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                HStack(spacing: 8) {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(.white)
                                        .frame(width: 20, height: 20)
                                        .background(c.success)
                                        .clipShape(Circle())
                                    Text(chore.name)
                                        .font(.system(size: 16, weight: .bold))
                                        .foregroundColor(c.text)
                                        .lineLimit(1)
                                }
                                HStack(spacing: 4) {
                                    Image(systemName: chore.areaTag.iconName)
                                        .font(.system(size: 11))
                                    Text(chore.areaTag.rawValue)
                                        .font(.caption)
                                }
                                .foregroundColor(c.secondaryText)

                                if let completedAt = chore.completedAt {
                                    Text(completedAt.formatted(.dateTime.month(.abbreviated).day().hour().minute()))
                                        .font(.caption)
                                        .foregroundColor(c.secondaryText)
                                }
                            }
                            Spacer()
                        }
                        .padding(4)
                        .background(c.secondaryText.opacity(0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
        }
    }
}
