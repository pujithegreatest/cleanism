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
        guard let data = image.jpegData(compressionQuality: 0.8) else { return nil }
        let filename = "\(name).jpg"
        let url = documentsDir.appendingPathComponent(filename)
        do {
            try data.write(to: url)
            return filename
        } catch {
            return nil
        }
    }

    static func load(name: String) -> UIImage? {
        let url = documentsDir.appendingPathComponent(name)
        guard let data = try? Data(contentsOf: url) else { return nil }
        return UIImage(data: data)
    }

    static func imageToBase64(_ image: UIImage) -> String? {
        image.jpegData(compressionQuality: 0.7)?.base64EncodedString()
    }

    static func delete(name: String) {
        let url = documentsDir.appendingPathComponent(name)
        try? FileManager.default.removeItem(at: url)
    }
}
