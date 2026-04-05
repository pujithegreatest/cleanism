import SwiftUI
import PhotosUI

struct NativePhotoView: UIViewControllerRepresentable {
    @Binding var selectedImage: UIImage?
    var sourceType: UIImagePickerController.SourceType = .camera
    var onCancel: () -> Void = {}

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(sourceType) ? sourceType : .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(selectedImage: $selectedImage, onCancel: onCancel)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        @Binding var selectedImage: UIImage?
        let onCancel: () -> Void

        init(selectedImage: Binding<UIImage?>, onCancel: @escaping () -> Void) {
            _selectedImage = selectedImage
            self.onCancel = onCancel
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                selectedImage = image
            }
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            onCancel()
        }
    }
}
