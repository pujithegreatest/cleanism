import Foundation

enum EnvConfig {
    private static var values: [String: String] = {
        guard let url = Bundle.main.url(forResource: ".env", withExtension: nil)
                ?? Bundle.main.url(forResource: "env", withExtension: nil),
              let contents = try? String(contentsOf: url, encoding: .utf8) else {
            return [:]
        }
        var dict: [String: String] = [:]
        for line in contents.components(separatedBy: .newlines) {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            guard !trimmed.isEmpty, !trimmed.hasPrefix("#") else { continue }
            let parts = trimmed.split(separator: "=", maxSplits: 1)
            guard parts.count == 2 else { continue }
            dict[String(parts[0]).trimmingCharacters(in: .whitespaces)] =
                String(parts[1]).trimmingCharacters(in: .whitespaces)
        }
        return dict
    }()

    static func get(_ key: String) -> String? {
        values[key]
    }
}
