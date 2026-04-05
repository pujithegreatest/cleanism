import SwiftUI

struct ChoreCardView: View {
    let chore: Chore
    @EnvironmentObject var themeStore: ThemeStore

    private var c: ThemeColors { themeStore.colors }

    private var priorityColor: Color {
        guard let p = chore.priority else { return .gray }
        return Color(hex: p.color)
    }

    private var dueDateLabel: String? {
        guard let date = chore.dueDate else { return nil }
        if Calendar.current.isDateInToday(date) { return "Today" }
        if Calendar.current.isDateInTomorrow(date) { return "Tomorrow" }
        if date < Date() { return "Overdue" }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: date)
    }

    private var dueDateColor: Color {
        guard let date = chore.dueDate else { return c.secondaryText }
        if date < Date() && !Calendar.current.isDateInToday(date) { return Color(hex: "#EF4444") }
        if Calendar.current.isDateInToday(date) { return c.primary }
        return c.secondaryText
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let imagePath = chore.beforeImagePath, let image = ImageStore.load(name: imagePath) {
                imageHeader(image)
            } else {
                noImageHeader
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(chore.name)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(c.text)
                    .lineLimit(1)

                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "lightbulb.fill")
                        .font(.system(size: 14))
                        .foregroundColor(c.primary)
                        .padding(.top, 2)
                    Text(chore.aiTip)
                        .font(.system(size: 14))
                        .foregroundColor(c.text)
                        .lineLimit(2)
                }
                .padding(12)
                .background(c.primary.opacity(0.07))
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
            .padding(chore.beforeImagePath != nil ? EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16) : EdgeInsets(top: 0, leading: 16, bottom: 16, trailing: 16))
        }
        .background(c.secondaryText.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 24))
    }

    // MARK: - Image Header

    @ViewBuilder
    private func imageHeader(_ uiImage: UIImage) -> some View {
        ZStack(alignment: .topLeading) {
            Image(uiImage: uiImage)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(height: 176)
                .clipped()

            VStack {
                HStack {
                    areaTagBadge(dark: true)
                    Spacer()
                    if let label = dueDateLabel {
                        Text(label)
                            .font(.caption.bold())
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(dueDateColor)
                            .clipShape(Capsule())
                    }
                }
                .padding(12)
                Spacer()
            }
        }
    }

    // MARK: - No Image Header

    private var noImageHeader: some View {
        HStack {
            areaTagBadge(dark: false)
            Spacer()
            HStack(spacing: 8) {
                if chore.priority != nil {
                    Circle()
                        .fill(priorityColor)
                        .frame(width: 10, height: 10)
                }
                if let mins = chore.estimatedMinutes {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.system(size: 12))
                        Text(mins < 60 ? "\(mins)m" : "1h")
                            .font(.caption)
                    }
                    .foregroundColor(c.secondaryText)
                }
                if let label = dueDateLabel {
                    Text(label)
                        .font(.caption.weight(.semibold))
                        .foregroundColor(dueDateColor)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(dueDateColor.opacity(0.12))
                        .clipShape(Capsule())
                }
            }
        }
        .padding(16)
    }

    @ViewBuilder
    private func areaTagBadge(dark: Bool) -> some View {
        HStack(spacing: 6) {
            Image(systemName: chore.areaTag.iconName)
                .font(.system(size: 12))
            Text(chore.areaTag.rawValue)
                .font(.caption.weight(.medium))
        }
        .foregroundColor(dark ? .white : c.secondary)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(dark ? Color.black.opacity(0.5) : c.secondary.opacity(0.12))
        .clipShape(Capsule())
    }
}
