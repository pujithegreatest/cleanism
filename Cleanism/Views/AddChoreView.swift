import SwiftUI

struct AddChoreView: View {
    @EnvironmentObject var choreStore: ChoreStore
    @EnvironmentObject var themeStore: ThemeStore
    @Environment(\.dismiss) private var dismiss

    @State private var contextDescription = ""
    @State private var selectedArea: AreaTag = .kitchen
    @State private var priority: Priority = .medium
    @State private var estimatedMinutes: Int? = nil
    @State private var dueDate: Date? = nil
    @State private var showDatePicker = false
    @State private var isCreating = false
    @State private var showCamera = false
    @State private var choreWasCreated = false

    private let timeEstimates = [5, 10, 15, 30, 45, 60]

    var body: some View {
        let c = themeStore.colors

        NavigationStack {
            ZStack {
                c.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 0) {
                            descriptionSection(c)
                            areaSection(c)
                            prioritySection(c)
                            timeSection(c)
                            dueDateSection(c)
                            Spacer().frame(height: 160)
                        }
                        .padding(.horizontal, 20)
                    }
                    .scrollDismissesKeyboard(.interactively)

                    bottomButtons(c)
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(c.text)
                    }
                }
            }
            .fullScreenCover(isPresented: $showCamera, onDismiss: {
                if choreWasCreated {
                    dismiss()
                }
            }) {
                CameraView(
                    contextDescription: contextDescription.trimmingCharacters(in: .whitespaces),
                    areaTag: selectedArea,
                    dueDate: dueDate,
                    priority: priority,
                    estimatedMinutes: estimatedMinutes,
                    choreWasCreated: $choreWasCreated
                )
                .environmentObject(choreStore)
                .environmentObject(themeStore)
            }
        }
    }

    // MARK: - Description

    @ViewBuilder
    private func descriptionSection(_ c: ThemeColors) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("What needs cleaning?")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(c.text)
            Text("Be specific so the AI can give you the best tips")
                .font(.subheadline)
                .foregroundColor(c.secondaryText)
        }
        .padding(.top, 16)
        .padding(.bottom, 16)

        TextEditor(text: $contextDescription)
            .frame(minHeight: 110)
            .padding(12)
            .scrollContentBackground(.hidden)
            .background(c.secondaryText.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .foregroundColor(c.text)
            .overlay(alignment: .topLeading) {
                if contextDescription.isEmpty {
                    Text("e.g., bathtub with toys, dishes in the sink...")
                        .foregroundColor(c.secondaryText.opacity(0.5))
                        .padding(.horizontal, 16)
                        .padding(.top, 20)
                        .allowsHitTesting(false)
                }
            }
    }

    // MARK: - Area

    @ViewBuilder
    private func areaSection(_ c: ThemeColors) -> some View {
        Text("Select area")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(c.text)
            .padding(.top, 24)
            .padding(.bottom, 12)

        FlowLayout(spacing: 8) {
            ForEach(AreaTag.allCases, id: \.self) { area in
                let isSelected = selectedArea == area
                Button {
                    selectedArea = area
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: area.iconName)
                            .font(.system(size: 14))
                        Text(area.rawValue)
                            .font(.system(size: 14, weight: .medium))
                    }
                    .foregroundColor(isSelected ? .white : c.text)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(isSelected ? c.primary : c.secondaryText.opacity(0.06))
                    .clipShape(Capsule())
                }
            }
        }
    }

    // MARK: - Priority

    @ViewBuilder
    private func prioritySection(_ c: ThemeColors) -> some View {
        Text("Priority")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(c.text)
            .padding(.top, 24)
            .padding(.bottom, 12)

        HStack(spacing: 12) {
            ForEach(Priority.allCases, id: \.self) { p in
                let isSelected = priority == p
                let pColor = Color(hex: p.color)
                Button {
                    priority = p
                } label: {
                    VStack(spacing: 4) {
                        Circle()
                            .fill(pColor)
                            .frame(width: 12, height: 12)
                        Text(p.label)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(isSelected ? pColor : c.text)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(isSelected ? pColor.opacity(0.12) : c.secondaryText.opacity(0.06))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .strokeBorder(isSelected ? pColor : .clear, lineWidth: 2)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
    }

    // MARK: - Time

    @ViewBuilder
    private func timeSection(_ c: ThemeColors) -> some View {
        Text("Estimated time (optional)")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(c.text)
            .padding(.top, 24)
            .padding(.bottom, 12)

        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(timeEstimates, id: \.self) { mins in
                    let isSelected = estimatedMinutes == mins
                    Button {
                        estimatedMinutes = isSelected ? nil : mins
                    } label: {
                        Text(mins < 60 ? "\(mins) min" : "1 hr")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(isSelected ? .white : c.text)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(isSelected ? c.secondary : c.secondaryText.opacity(0.06))
                            .clipShape(Capsule())
                    }
                }
            }
        }
    }

    // MARK: - Due Date

    @ViewBuilder
    private func dueDateSection(_ c: ThemeColors) -> some View {
        Text("Due date (optional)")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(c.text)
            .padding(.top, 24)
            .padding(.bottom, 12)

        Button { showDatePicker.toggle() } label: {
            HStack {
                HStack(spacing: 12) {
                    Image(systemName: "calendar")
                        .foregroundColor(c.primary)
                        .frame(width: 40, height: 40)
                        .background(c.primary.opacity(0.12))
                        .clipShape(Circle())
                    Text(dueDate?.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day()) ?? "No due date")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(c.text)
                }
                Spacer()
                if dueDate != nil {
                    Button {
                        dueDate = nil
                        showDatePicker = false
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(c.secondaryText)
                    }
                }
            }
            .padding(16)
            .background(c.secondaryText.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 20))
        }

        if showDatePicker {
            DatePicker(
                "Due Date",
                selection: Binding(
                    get: { dueDate ?? Date() },
                    set: { dueDate = $0 }
                ),
                in: Date()...,
                displayedComponents: .date
            )
            .datePickerStyle(.wheel)
            .labelsHidden()
        }
    }

    // MARK: - Bottom Buttons

    @ViewBuilder
    private func bottomButtons(_ c: ThemeColors) -> some View {
        VStack(spacing: 12) {
            Button {
                guard !contextDescription.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                showCamera = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "camera")
                        .font(.system(size: 18))
                    Text("Take Photo")
                        .font(.system(size: 18, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    LinearGradient(
                        colors: canSubmit ? [c.primary, c.secondary] : [c.secondaryText.opacity(0.25), c.secondaryText.opacity(0.25)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 20))
            }
            .disabled(!canSubmit)

            Button {
                Task { await handleQuickAdd() }
            } label: {
                HStack(spacing: 8) {
                    if isCreating {
                        ProgressView()
                            .tint(c.text)
                        Text("Creating task...")
                    } else {
                        Image(systemName: "bolt.fill")
                            .foregroundColor(c.primary)
                        Text("Quick Add (No Photo)")
                    }
                }
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(c.text)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(canSubmit && !isCreating ? c.secondaryText.opacity(0.08) : c.secondaryText.opacity(0.04))
                .clipShape(RoundedRectangle(cornerRadius: 20))
            }
            .disabled(!canSubmit || isCreating)
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 24)
        .background(c.background)
    }

    private var canSubmit: Bool {
        !contextDescription.trimmingCharacters(in: .whitespaces).isEmpty
    }

    // MARK: - Quick Add

    private func handleQuickAdd() async {
        let desc = contextDescription.trimmingCharacters(in: .whitespaces)
        guard !desc.isEmpty else { return }
        isCreating = true

        do {
            let result = try await AIService.generateTaskFromDescription(
                description: desc,
                area: selectedArea.rawValue
            )
            choreStore.addChore(
                name: result.taskName,
                contextDescription: desc,
                aiTip: result.tip,
                areaTag: selectedArea,
                dueDate: dueDate,
                priority: priority,
                estimatedMinutes: estimatedMinutes
            )
            dismiss()
        } catch {
            // Fallback with default tip
            choreStore.addChore(
                name: String(desc.prefix(30)),
                contextDescription: desc,
                aiTip: "Keep your space clean and organized. daily smart!",
                areaTag: selectedArea,
                dueDate: dueDate,
                priority: priority,
                estimatedMinutes: estimatedMinutes
            )
            dismiss()
        }

        isCreating = false
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxX = max(maxX, x - spacing)
        }

        return (positions, CGSize(width: maxX, height: y + rowHeight))
    }
}
