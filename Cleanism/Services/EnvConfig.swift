import Foundation

enum EnvConfig {
    private static var values: [String: String] = {
        print("DEBUG EnvConfig: Loading environment variables")
        guard let url = Bundle.main.url(forResource: ".env", withExtension: nil)
                ?? Bundle.main.url(forResource: "env", withExtension: nil) else {
            print("DEBUG EnvConfig: .env file not found in bundle")
            return [:]
        }

        guard let contents = try? String(contentsOf: url, encoding: .utf8) else {
            print("DEBUG EnvConfig: Could not read .env file")
            return [:]
        }

        var dict: [String: String] = [:]
        for line in contents.components(separatedBy: .newlines) {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            guard !trimmed.isEmpty, !trimmed.hasPrefix("#") else { continue }
            let parts = trimmed.split(separator: "=", maxSplits: 1)
            guard parts.count == 2 else { continue }
            let key = String(parts[0]).trimmingCharacters(in: .whitespaces)
            let value = String(parts[1]).trimmingCharacters(in: .whitespaces)
            dict[key] = value
            print("DEBUG EnvConfig: Loaded \(key)")
        }
        print("DEBUG EnvConfig: Total keys loaded: \(dict.count)")
        return dict
    }()

    static func get(_ key: String) -> String? {
        let value = values[key]
        print("DEBUG EnvConfig: get(\(key)) = \(value != nil ? "***" : "nil")")
        return value
    }
}
