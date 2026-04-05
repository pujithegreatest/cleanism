import SwiftUI

struct AfterCameraView: View {
    let choreId: UUID
    var isBeforePhoto: Bool = false
    @EnvironmentObject var choreStore: ChoreStore
    @EnvironmentObject var themeStore: ThemeStore
    @Environment(\.dismiss) private var dismiss

    @State private var capturedImage: UIImage?

    var body: some View {
        let c = themeStore.colors

        ZStack {
            if capturedImage == nil {
                NativePhotoView(selectedImage: $capturedImage, sourceType: .camera, onCancel: { dismiss() })
                    .ignoresSafeArea()
            }

            if let image = capturedImage {
                previewOverlay(c, image: image)
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

            VStack {
                LinearGradient(colors: [.black.opacity(0.65), .clear], startPoint: .top, endPoint: .bottom)
                    .frame(height: 100)
                Spacer()
                LinearGradient(colors: [.clear, .black.opacity(0.8)], startPoint: .top, endPoint: .bottom)
                    .frame(height: 120)
            }
            .ignoresSafeArea()

            VStack {
                HStack {
                    Spacer()
                    HStack(spacing: 6) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "#FFD700"))
                        Text(isBeforePhoto ? "Before Photo" : "After Photo")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.15))
                    .clipShape(Capsule())
                    Spacer()
                }
                .padding(.top, 60)

                Spacer()

                VStack(spacing: 20) {
                    Text(isBeforePhoto ? "Save this as your before photo?" : "Looking good! Save this as your after photo?")
                        .font(.system(size: 15))
                        .foregroundColor(.white.opacity(0.8))
                        .multilineTextAlignment(.center)

                    HStack(spacing: 12) {
                        Button {
                            capturedImage = nil
                        } label: {
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

                        Button {
                            savePhoto(image)
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Save")
                            }
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(colors: [c.success, c.secondary], startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 18))
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
        }
    }

    private func savePhoto(_ image: UIImage) {
        let suffix = isBeforePhoto ? "before" : "after"
        if let filename = ImageStore.save(image, name: "\(choreId.uuidString)-\(suffix)") {
            choreStore.updateChore(id: choreId) { chore in
                if isBeforePhoto {
                    chore.beforeImagePath = filename
                } else {
                    chore.afterImagePath = filename
                }
            }
        }
        dismiss()
    }
}
