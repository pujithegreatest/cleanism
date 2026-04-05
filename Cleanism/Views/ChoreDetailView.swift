import SwiftUI

struct ChoreDetailView: View {
    let choreId: UUID
    @EnvironmentObject var choreStore: ChoreStore
    @EnvironmentObject var themeStore: ThemeStore
    @Environment(\.dismiss) private var dismiss

    @State private var isEditingNotes = false
    @State private var notesText = ""
    @State private var showAfterCamera = false
    @State private var showBeforeCamera = false

    private var chore: Chore? { choreStore.choreById(choreId) }

    var body: some View {
        let c = themeStore.colors

        ZStack {
            c.background.ignoresSafeArea()

            if let chore {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        imageSection(chore, c)
                        titleSection(chore, c)
                        badgesSection(chore, c)
                        dueDateSection(chore, c)
                        aiTipSection(chore, c)
                        descriptionSection(chore, c)
                        notesSection(chore, c)
                        Spacer().frame(height: 120)
                    }
                }

                // Bottom button
                VStack {
                    Spacer()
                    completeButton(chore, c)
                }
            } else {
                notFoundView(c)
            }
        }
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button { dismiss() } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(c.text)
                }
            }
            if chore != nil {
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack(spacing: 8) {
                        Button { shareChore() } label: {
                            Image(systemName: "square.and.arrow.up")
                                .foregroundColor(c.primary)
                        }
                        Button { deleteAndDismiss() } label: {
                            Image(systemName: "trash")
                                .foregroundColor(Color(hex: "#EF4444"))
                        }
                    }
                }
            }
        }
        .fullScreenCover(isPresented: $showAfterCamera) {
            AfterCameraView(choreId: choreId)
                .environmentObject(choreStore)
                .environmentObject(themeStore)
        }
        .fullScreenCover(isPresented: $showBeforeCamera) {
            AfterCameraView(choreId: choreId, isBeforePhoto: true)
                .environmentObject(choreStore)
                .environmentObject(themeStore)
        }
    }

    // MARK: - Image Section

    @ViewBuilder
    private func imageSection(_ chore: Chore, _ c: ThemeColors) -> some View {
        let hasBeforeImage = chore.beforeImagePath != nil
        let hasAfterImage = chore.afterImagePath != nil

        if hasBeforeImage {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("Before & After")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(c.text)
                    Spacer()
                    if hasAfterImage {
                        HStack(spacing: 4) {
                            Image(systemName: "trophy.fill")
                                .font(.system(size: 12))
                            Text("Completed!")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .foregroundColor(c.success)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(c.success.opacity(0.12))
                        .clipShape(Capsule())
                    }
                }

                HStack(spacing: 10) {
                    // Before
                    if let path = chore.beforeImagePath, let img = ImageStore.load(name: path) {
                        ZStack(alignment: .bottomLeading) {
                            Image(uiImage: img)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(height: 170)
                                .clipped()
                                .clipShape(RoundedRectangle(cornerRadius: 20))
                            Text("BEFORE")
                                .font(.system(size: 11, weight: .heavy))
                                .tracking(1)
                                .foregroundColor(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.white.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .padding(12)
                        }
                    }

                    // After
                    if hasAfterImage, let path = chore.afterImagePath, let img = ImageStore.load(name: path) {
                        Button { showAfterCamera = true } label: {
                            ZStack(alignment: .bottomLeading) {
                                Image(uiImage: img)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(height: 170)
                                    .clipped()
                                    .clipShape(RoundedRectangle(cornerRadius: 20))
                                Text("AFTER")
                                    .font(.system(size: 11, weight: .heavy))
                                    .tracking(1)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(Color.white.opacity(0.2))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                    .padding(12)
                            }
                        }
                    } else {
                        Button { showAfterCamera = true } label: {
                            VStack(spacing: 8) {
                                Image(systemName: "camera")
                                    .font(.system(size: 26))
                                    .foregroundColor(c.primary)
                                    .frame(width: 48, height: 48)
                                    .background(c.primary.opacity(0.12))
                                    .clipShape(Circle())
                                Text("Add After\nPhoto")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(c.primary)
                                    .multilineTextAlignment(.center)
                                Text("Show your work!")
                                    .font(.system(size: 11))
                                    .foregroundColor(c.secondaryText)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 170)
                            .background(c.primary.opacity(0.05))
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .strokeBorder(c.primary.opacity(0.3), style: StrokeStyle(lineWidth: 2, dash: [8]))
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 20))
                        }
                    }
                }

                if hasAfterImage {
                    HStack(spacing: 10) {
                        Text("\u{1F389}")
                            .font(.system(size: 22))
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Great work!")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(c.text)
                            Text("You should be proud of what you accomplished.")
                                .font(.system(size: 12))
                                .foregroundColor(c.secondaryText)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(c.success.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
        } else {
            // No before image - show area badge and add after photo option
            VStack(spacing: 10) {
                HStack {
                    HStack(spacing: 8) {
                        Image(systemName: chore.areaTag.iconName)
                            .font(.system(size: 16))
                        Text(chore.areaTag.rawValue)
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundColor(c.secondary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(c.secondary.opacity(0.12))
                    .clipShape(Capsule())

                    Spacer()

                    if chore.isCompleted {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 12))
                            Text("Done")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(c.success)
                        .clipShape(Capsule())
                    }
                }

                Button { showBeforeCamera = true } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "camera")
                            .font(.system(size: 18))
                            .foregroundColor(c.secondary)
                            .frame(width: 44, height: 44)
                            .background(c.secondary.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Add Before Photo")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(c.secondary)
                            Text("Capture the starting point")
                                .font(.system(size: 12))
                                .foregroundColor(c.secondaryText)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14))
                            .foregroundColor(c.secondary)
                    }
                    .padding(16)
                    .background(c.secondary.opacity(0.05))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .strokeBorder(c.secondary.opacity(0.25), style: StrokeStyle(lineWidth: 1.5, dash: [6]))
                    )
                }

                Button { showAfterCamera = true } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "camera")
                            .font(.system(size: 18))
                            .foregroundColor(c.primary)
                            .frame(width: 44, height: 44)
                            .background(c.primary.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Add After Photo")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(c.primary)
                            Text("Capture your results and feel proud")
                                .font(.system(size: 12))
                                .foregroundColor(c.secondaryText)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14))
                            .foregroundColor(c.primary)
                    }
                    .padding(16)
                    .background(c.primary.opacity(0.05))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .strokeBorder(c.primary.opacity(0.25), style: StrokeStyle(lineWidth: 1.5, dash: [6]))
                    )
                }
            }
            .padding(20)
            .background(c.secondaryText.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 24))
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
        }
    }

    // MARK: - Title

    @ViewBuilder
    private func titleSection(_ chore: Chore, _ c: ThemeColors) -> some View {
        Text(chore.name)
            .font(.system(size: 24, weight: .bold))
            .foregroundColor(c.text)
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
    }

    // MARK: - Badges

    @ViewBuilder
    private func badgesSection(_ chore: Chore, _ c: ThemeColors) -> some View {
        if chore.priority != nil || chore.estimatedMinutes != nil {
            HStack(spacing: 8) {
                if let p = chore.priority {
                    let pColor = Color(hex: p.color)
                    HStack(spacing: 6) {
                        Circle().fill(pColor).frame(width: 8, height: 8)
                        Text("\(p.label) Priority")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(pColor)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(pColor.opacity(0.12))
                    .clipShape(Capsule())
                }
                if let mins = chore.estimatedMinutes {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.system(size: 12))
                        Text(mins < 60 ? "\(mins) min" : "1 hour")
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundColor(c.secondaryText)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(c.secondaryText.opacity(0.08))
                    .clipShape(Capsule())
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
        }
    }

    // MARK: - Due Date

    @ViewBuilder
    private func dueDateSection(_ chore: Chore, _ c: ThemeColors) -> some View {
        if let date = chore.dueDate {
            HStack(spacing: 12) {
                Image(systemName: "calendar")
                    .foregroundColor(c.primary)
                    .frame(width: 40, height: 40)
                    .background(c.primary.opacity(0.12))
                    .clipShape(Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text("Due Date")
                        .font(.caption)
                        .foregroundColor(c.secondaryText)
                    Text(date.formatted(.dateTime.weekday(.wide).month(.wide).day()))
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(c.text)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(c.secondaryText.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
        }
    }

    // MARK: - AI Tip

    @ViewBuilder
    private func aiTipSection(_ chore: Chore, _ c: ThemeColors) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(c.primary)
                    .frame(width: 32, height: 32)
                    .background(c.primary.opacity(0.2))
                    .clipShape(Circle())
                Text("Smart Tip")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(c.primary)
            }
            Text(chore.aiTip)
                .font(.system(size: 16))
                .foregroundColor(c.text)
                .lineSpacing(4)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [c.primary.opacity(0.12), c.secondary.opacity(0.08)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 20)
        .padding(.bottom, 16)
    }

    // MARK: - Description

    @ViewBuilder
    private func descriptionSection(_ chore: Chore, _ c: ThemeColors) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "doc.text")
                    .foregroundColor(c.secondaryText)
                Text("Your Description")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(c.secondaryText)
            }
            Text(chore.contextDescription)
                .font(.system(size: 16))
                .foregroundColor(c.text)
                .lineSpacing(4)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(c.secondaryText.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 20)
        .padding(.bottom, 16)
    }

    // MARK: - Notes

    @ViewBuilder
    private func notesSection(_ chore: Chore, _ c: ThemeColors) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "pencil")
                        .foregroundColor(c.tertiary)
                    Text("Personal Notes")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(c.tertiary)
                }
                Spacer()
                if !isEditingNotes {
                    Button {
                        notesText = chore.notes ?? ""
                        isEditingNotes = true
                    } label: {
                        Text(chore.notes != nil ? "Edit" : "Add")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(c.primary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(c.primary.opacity(0.12))
                            .clipShape(Capsule())
                    }
                }
            }

            if isEditingNotes {
                TextEditor(text: $notesText)
                    .frame(minHeight: 80)
                    .padding(8)
                    .scrollContentBackground(.hidden)
                    .background(c.background)
                    .foregroundColor(c.text)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .strokeBorder(c.primary.opacity(0.25), lineWidth: 1)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                HStack {
                    Spacer()
                    Button {
                        isEditingNotes = false
                        notesText = chore.notes ?? ""
                    } label: {
                        Text("Cancel")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(c.text)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(c.secondaryText.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    Button {
                        choreStore.addNote(id: choreId, note: notesText)
                        isEditingNotes = false
                    } label: {
                        Text("Save")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(c.primary)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
            } else {
                Text(chore.notes ?? "No notes added yet. Tap \"Add\" to add personal notes.")
                    .font(.system(size: 16))
                    .foregroundColor(chore.notes != nil ? c.text : c.secondaryText)
                    .lineSpacing(4)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(c.tertiary.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 20)
        .padding(.bottom, 24)
    }

    // MARK: - Complete Button

    @ViewBuilder
    private func completeButton(_ chore: Chore, _ c: ThemeColors) -> some View {
        Button {
            if chore.isCompleted {
                choreStore.uncompleteChore(id: choreId)
            } else {
                choreStore.completeChore(id: choreId)
            }
        } label: {
            HStack(spacing: 8) {
                Image(systemName: chore.isCompleted ? "arrow.counterclockwise" : "checkmark.circle.fill")
                    .font(.system(size: 20))
                Text(chore.isCompleted ? "Mark as Incomplete" : "Mark as Done")
                    .font(.system(size: 18, weight: .semibold))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                Group {
                    if chore.isCompleted {
                        c.secondaryText.opacity(0.3)
                    } else {
                        LinearGradient(colors: [c.success, c.secondary], startPoint: .topLeading, endPoint: .bottomTrailing)
                    }
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: 20))
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 24)
        .background(
            LinearGradient(colors: [c.background.opacity(0), c.background], startPoint: .top, endPoint: .bottom)
        )
    }

    // MARK: - Not Found

    @ViewBuilder
    private func notFoundView(_ c: ThemeColors) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 64))
                .foregroundColor(c.secondaryText)
            Text("Task not found")
                .font(.title2.bold())
                .foregroundColor(c.text)
            Button { dismiss() } label: {
                Text("Go Back")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(c.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    // MARK: - Actions

    private func shareChore() {
        guard let chore else { return }
        let text = "\(chore.name)\n\n\(chore.aiTip)\n\nShared from Cleanism"
        let av = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(av, animated: true)
        }
    }

    private func deleteAndDismiss() {
        dismiss()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            choreStore.deleteChore(id: choreId)
        }
    }
}
