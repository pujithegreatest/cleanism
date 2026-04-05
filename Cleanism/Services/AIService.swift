import Foundation

struct AIAnalysisResult: Decodable {
    let taskName: String
    let tip: String
}

class AIService {
    static var apiKey: String {
        EnvConfig.get("OPENAI_API_KEY") ?? ""
    }

    static func analyzeImage(base64Image: String, contextDescription: String) async throws -> AIAnalysisResult {
        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "model": "gpt-4o",
            "messages": [
                [
                    "role": "user",
                    "content": [
                        [
                            "type": "text",
                            "text": """
                            You are a helpful cleaning assistant. The user took a photo of something that needs cleaning. \
                            They described it as: "\(contextDescription)"

                            Based on the image and description:
                            1. Give a short task name (2-4 words, like "Clean Dishes", "Sweep Floor")
                            2. Provide a cleaning tip that is EXACTLY 110 characters or less. Make it actionable and specific. End with "daily smart!"

                            Respond in this exact JSON format:
                            {"taskName": "short name here", "tip": "your 110 char max tip here ending with daily smart!"}
                            """
                        ],
                        [
                            "type": "image_url",
                            "image_url": ["url": "data:image/jpeg;base64,\(base64Image)"]
                        ]
                    ]
                ]
            ],
            "max_tokens": 300,
            "temperature": 0.7
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw AIError.requestFailed
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let choices = json?["choices"] as? [[String: Any]],
              let message = choices.first?["message"] as? [String: Any],
              let content = message["content"] as? String else {
            throw AIError.invalidResponse
        }

        return try parseAnalysisResult(from: content)
    }

    static func generateTaskFromDescription(description: String, area: String) async throws -> AIAnalysisResult {
        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "model": "gpt-4o",
            "messages": [
                [
                    "role": "user",
                    "content": """
                    You are a helpful cleaning assistant. The user needs to clean: "\(description)" in the \(area).

                    Provide:
                    1. A short task name (2-4 words, like "Clean Dishes", "Sweep Floor", "Fold Clothes")
                    2. A cleaning tip that is EXACTLY 110 characters or less. Make it actionable and specific. End with "daily smart!"

                    Respond in this exact JSON format:
                    {"taskName": "short name here", "tip": "your 110 char max tip here ending with daily smart!"}
                    """
                ]
            ],
            "max_tokens": 300,
            "temperature": 0.7
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw AIError.requestFailed
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let choices = json?["choices"] as? [[String: Any]],
              let message = choices.first?["message"] as? [String: Any],
              let content = message["content"] as? String else {
            throw AIError.invalidResponse
        }

        return try parseAnalysisResult(from: content)
    }

    private static func parseAnalysisResult(from content: String) throws -> AIAnalysisResult {
        let pattern = #"\{[\s\S]*\}"#
        guard let range = content.range(of: pattern, options: .regularExpression),
              let data = content[range].data(using: .utf8) else {
            throw AIError.invalidResponse
        }
        return try JSONDecoder().decode(AIAnalysisResult.self, from: data)
    }

    enum AIError: LocalizedError {
        case requestFailed
        case invalidResponse

        var errorDescription: String? {
            switch self {
            case .requestFailed: return "AI request failed"
            case .invalidResponse: return "Could not parse AI response"
            }
        }
    }
}
