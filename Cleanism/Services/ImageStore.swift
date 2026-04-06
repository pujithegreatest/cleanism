import UIKit

enum ImageStore {
    private static var documentsDir: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ChoreImages", isDirectory: true)
    }

    static func ensureDirectory() {
        try? FileManager.default.createDirectory(at: documentsDir, withIntermediateDirectories: true)
    }

    static func save(_ image: UIImage, name: String) -> String? {
        ensureDirectory()
        // Convert HEIC and other formats to JPEG with aggressive compression
        let scaledImage = image.withMaxDimension(800)
        guard let data = scaledImage.jpegData(compressionQuality: 0.4) else {
            print("[ImageStore] Failed to create JPEG data for \(name)")
            return nil
        }
        let filename = "\(name).jpg"
        let url = documentsDir.appendingPathComponent(filename)
        do {
            try data.write(to: url)
            let sizeInMB = Double(data.count) / (1024 * 1024)
            print("[ImageStore] Saved \(filename) - Size: \(String(format: "%.2f", sizeInMB))MB")
            return filename
        } catch {
            print("[ImageStore] Failed to write \(filename): \(error)")
            return nil
        }
    }

    static func load(name: String) -> UIImage? {
        let url = documentsDir.appendingPathComponent(name)
        guard let data = try? Data(contentsOf: url) else {
            print("[ImageStore] Failed to load data for \(name)")
            return nil
        }
        guard let image = UIImage(data: data) else {
            print("[ImageStore] Failed to decode image from \(name)")
            return nil
        }
        print("[ImageStore] Loaded \(name) - Size: \(image.size)")
        return image
    }

    static func imageToBase64(_ image: UIImage) -> String? {
        image.jpegData(compressionQuality: 0.7)?.base64EncodedString()
    }

    static func delete(name: String) {
        let url = documentsDir.appendingPathComponent(name)
        try? FileManager.default.removeItem(at: url)
    }
}

extension UIImage {
    func withMaxDimension(_ maxDimension: CGFloat) -> UIImage {
        let size = self.size
        let scale = min(maxDimension / size.width, maxDimension / size.height, 1.0)

        if scale >= 1.0 { return self }

        let newSize = CGSize(width: size.width * scale, height: size.height * scale)
        let renderer = UIGraphicsImageRenderer(size: newSize)
        return renderer.image { _ in
            self.draw(in: CGRect(origin: .zero, size: newSize))
        }
    }
}
