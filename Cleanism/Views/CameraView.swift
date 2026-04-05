import SwiftUI

struct CameraView: View {
    let contextDescription: String
    let areaTag: AreaTag
    let dueDate: Date?
    let priority: Priority
    let estimatedMinutes: Int?

    @Binding var choreWasCreated: Bool

    @EnvironmentObject var choreStore: ChoreStore
    @EnvironmentObject var themeStore: ThemeStore
    @Environment(\.dismiss) private var dismiss

    @State private var capturedImage: UIImage?
    @State private var isAnalyzing = false
    @State private var errorMessage: String?

    var body: some View {
        let c = themeStore.colors

        ZStack {
            if capturedImage == nil {
                NativePhotoView(selectedImage: $capturedImage, sourceType: .camera, onCancel: { dismiss() })
                    .ignoresSafeArea()
            }

            if let image = capturedImage {
                if isAnalyzing {
                    analyzingOverlay(c, image: image)
                } else {
                    previewOverlay(c, image: image)
                }
            }
        }
    }

    // MARK: - Preview Overlay

    @ViewBuilder
    private func previewOverlay(_ c: ThemeColors, image: UIImage) -> some View {
        ZStack {
            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .ignoresSafeArea()

            LinearGradient(colors: [.black.opacity(0.65), .clear], startPoint: .top, endPoint: .bottom)
                .frame(height: 100)
                .ignoresSafeArea()

            VStack {
                HStack {
                    Button { capturedImage = nil } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 20))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(Color.black.opacity(0.5))
                            .clipShape(Circle())
                    }
                    Spacer()
                    HStack(spacing: 6) {
                        Image(systemName: "photo")
                            .font(.system(size: 13))
                        Text("Preview")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.15))
                    .clipShape(Capsule())
                    Spacer()
                    Color.clear.frame(width: 44)
                }
                .padding(.horizontal, 24)
                .padding(.top, 56)

                Spacer()

                VStack(spacing: 12) {
                    if let error = errorMessage {
                        Text(error)
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                            .padding(12)
                            .frame(maxWidth: .infinity)
                            .background(Color.red.opacity(0.85))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    Text("Happy with the photo? Choose an option below.")
                        .font(.system(size: 15))
                        .foregroundColor(.white.opacity(0.75))
                        .multilineTextAlignment(.center)

                    VStack(spacing: 12) {
                        Button { capturedImage = nil } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "arrow.counterclockwise")
                                Text("Retake")
                            }
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.white.opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: 18))
                        }

                        HStack(spacing: 12) {
                            Button {
                                saveImageWithoutAI(image)
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: "bolt.fill")
                                    Text("Skip AI")
                                }
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color.white.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 18))
                            }

                            Button {
                                Task { await analyzeImage(image) }
                            } label: {
                                HStack(spacing: 8) {
                                    Image(systemName: "sparkles")
                                    Text("Analyze AI")
                                }
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(
                                    LinearGradient(colors: [c.primary, c.secondary], startPoint: .topLeading, endPoint: .bottomTrailing)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 18))
                            }
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
        }
    }

    // MARK: - Analyzing Overlay

    @ViewBuilder
    private func analyzingOverlay(_ c: ThemeColors, image: UIImage) -> some View {
        ZStack {
            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .ignoresSafeArea()

            Color.black.opacity(0.6).ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .controlSize(.large)
                    .tint(c.primary)
                Text("Analyzing your photo...")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(c.text)
                Text("Getting smart cleaning tips")
                    .font(.system(size: 14))
                    .foregroundColor(c.secondaryText)
            }
            .padding(32)
            .background(c.background)
            .clipShape(RoundedRectangle(cornerRadius: 24))
        }
    }

    // MARK: - Save Without AI

    private func saveImageWithoutAI(_ image: UIImage) {
        let imageName = ImageStore.save(image, name: UUID().uuidString)

        choreStore.addChore(
            name: contextDescription.trimmingCharacters(in: .whitespaces),
            beforeImagePath: imageName,
            contextDescription: contextDescription,
            aiTip: "Keep your space clean and organized. daily smart!",
            areaTag: areaTag,
            dueDate: dueDate,
            priority: priority,
            estimatedMinutes: estimatedMinutes
        )

        choreWasCreated = true
        dismiss()
    }

    // MARK: - Analyze

    private func analyzeImage(_ image: UIImage) async {
        isAnalyzing = true
        errorMessage = nil

        guard let base64 = ImageStore.imageToBase64(image) else {
            errorMessage = "Failed to process image."
            isAnalyzing = false
            return
        }

        do {
            let result = try await AIService.analyzeImage(base64Image: base64, contextDescription: contextDescription)
            print("DEBUG: AI Analysis successful. Task: \(result.taskName)")

            let imageName = ImageStore.save(image, name: UUID().uuidString)

            choreStore.addChore(
                name: result.taskName,
                beforeImagePath: imageName,
                contextDescription: contextDescription,
                aiTip: result.tip,
                areaTag: areaTag,
                dueDate: dueDate,
                priority: priority,
                estimatedMinutes: estimatedMinutes
            )

            choreWasCreated = true
            dismiss()
        } catch {
            isAnalyzing = false
            print("DEBUG: AI Analysis Error: \(error.localizedDescription)")
            errorMessage = "Analysis failed: \(error.localizedDescription)"
        }
    }
}
