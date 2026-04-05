import Foundation

enum AreaTag: String, Codable, CaseIterable {
    case kitchen = "Kitchen"
    case bathroom = "Bathroom"
    case bedroom = "Bedroom"
    case livingRoom = "Living Room"
    case garage = "Garage"
    case outdoor = "Outdoor"
    case other = "Other"

    var iconName: String {
        switch self {
        case .kitchen: return "fork.knife"
        case .bathroom: return "drop"
        case .bedroom: return "bed.double"
        case .livingRoom: return "tv"
        case .garage: return "car"
        case .outdoor: return "leaf"
        case .other: return "ellipsis"
        }
    }
}

enum Priority: String, Codable, CaseIterable {
    case low, medium, high

    var color: String {
        switch self {
        case .low: return "#22C55E"
        case .medium: return "#F59E0B"
        case .high: return "#EF4444"
        }
    }

    var label: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        }
    }
}

struct Chore: Identifiable, Codable {
    let id: UUID
    var name: String
    var beforeImagePath: String?
    var afterImagePath: String?
    var contextDescription: String
    var aiTip: String
    var areaTag: AreaTag
    var dueDate: Date?
    var isCompleted: Bool
    var createdAt: Date
    var completedAt: Date?
    var notes: String?
    var priority: Priority?
    var estimatedMinutes: Int?

    init(
        id: UUID = UUID(),
        name: String,
        beforeImagePath: String? = nil,
        afterImagePath: String? = nil,
        contextDescription: String,
        aiTip: String,
        areaTag: AreaTag,
        dueDate: Date? = nil,
        isCompleted: Bool = false,
        createdAt: Date = Date(),
        completedAt: Date? = nil,
        notes: String? = nil,
        priority: Priority? = nil,
        estimatedMinutes: Int? = nil
    ) {
        self.id = id
        self.name = name
        self.beforeImagePath = beforeImagePath
        self.afterImagePath = afterImagePath
        self.contextDescription = contextDescription
        self.aiTip = aiTip
        self.areaTag = areaTag
        self.dueDate = dueDate
        self.isCompleted = isCompleted
        self.createdAt = createdAt
        self.completedAt = completedAt
        self.notes = notes
        self.priority = priority
        self.estimatedMinutes = estimatedMinutes
    }
}
