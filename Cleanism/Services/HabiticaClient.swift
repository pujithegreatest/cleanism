import Foundation

struct HabiticaTaskEnvelope: Decodable {
    let data: [HabiticaTaskSummary]
}

struct HabiticaTaskSummary: Decodable {
    let id: String
    let alias: String?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case alias
    }
}

struct HabiticaEmptyEnvelope: Decodable {
    let success: Bool?
}

enum HabiticaError: Error, LocalizedError {
    case missingAlias
    case invalidResponse(String)
    case missingCredentials

    var errorDescription: String? {
        switch self {
        case .missingAlias:
            return "The configured Habitica task alias was not found."
        case .invalidResponse(let message):
            return message
        case .missingCredentials:
            return "Habitica credentials are not configured."
        }
    }
}

struct HabiticaClient {
    private let baseURL = URL(string: "https://habitica.com/api/v3")!

    func scoreTaskUp(userID: String, apiToken: String, taskAlias: String) async throws {
        guard !userID.isEmpty && !apiToken.isEmpty else {
            throw HabiticaError.missingCredentials
        }

        let taskID = try await findTaskID(alias: taskAlias, userID: userID, apiToken: apiToken)
        _ = try await request(
            path: "tasks/\(taskID)/score/up",
            method: "POST",
            userID: userID,
            apiToken: apiToken
        ) as HabiticaEmptyEnvelope
    }

    private func findTaskID(alias: String, userID: String, apiToken: String) async throws -> String {
        let tasks: HabiticaTaskEnvelope = try await request(
            path: "tasks/user",
            method: "GET",
            userID: userID,
            apiToken: apiToken
        )
        guard let taskID = tasks.data.first(where: { $0.alias == alias })?.id else {
            throw HabiticaError.missingAlias
        }
        return taskID
    }

    private func request<T: Decodable>(path: String, method: String, userID: String, apiToken: String) async throws -> T {
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = method
        request.setValue(userID, forHTTPHeaderField: "x-api-user")
        request.setValue(apiToken, forHTTPHeaderField: "x-api-key")
        request.setValue("Cleanism-App", forHTTPHeaderField: "x-client")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw HabiticaError.invalidResponse("Habitica did not return a valid response.")
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            let text = String(data: data, encoding: .utf8) ?? "Unknown Habitica error."
            print("[HabiticaClient] Error: \(text)")
            throw HabiticaError.invalidResponse(text)
        }

        return try JSONDecoder().decode(T.self, from: data)
    }
}
