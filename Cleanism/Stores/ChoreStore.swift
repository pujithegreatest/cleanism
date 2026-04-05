import Foundation
import SwiftUI

@MainActor
class ChoreStore: ObservableObject {
    @Published var chores: [Chore] = []

    private let saveKey = "cleanism_chores"

    init() {
        load()
    }

    // MARK: - Persistence

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: saveKey),
              let decoded = try? JSONDecoder().decode([Chore].self, from: data) else { return }
        chores = decoded
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(chores) else { return }
        UserDefaults.standard.set(data, forKey: saveKey)
    }

    // MARK: - CRUD

    @discardableResult
    func addChore(
        name: String,
        beforeImagePath: String? = nil,
        contextDescription: String,
        aiTip: String,
        areaTag: AreaTag,
        dueDate: Date? = nil,
        priority: Priority? = nil,
        estimatedMinutes: Int? = nil
    ) -> UUID {
        let chore = Chore(
            name: name,
            beforeImagePath: beforeImagePath,
            contextDescription: contextDescription,
            aiTip: aiTip,
            areaTag: areaTag,
            dueDate: dueDate,
            priority: priority,
            estimatedMinutes: estimatedMinutes
        )
        chores.insert(chore, at: 0)
        save()
        return chore.id
    }

    func updateChore(id: UUID, updates: (inout Chore) -> Void) {
        guard let index = chores.firstIndex(where: { $0.id == id }) else { return }
        updates(&chores[index])
        save()
    }

    func deleteChore(id: UUID) {
        chores.removeAll { $0.id == id }
        save()
    }

    func completeChore(id: UUID) {
        guard let index = chores.firstIndex(where: { $0.id == id }) else { return }
        chores[index].isCompleted = true
        chores[index].completedAt = Date()
        save()
    }

    func uncompleteChore(id: UUID) {
        guard let index = chores.firstIndex(where: { $0.id == id }) else { return }
        chores[index].isCompleted = false
        chores[index].completedAt = nil
        save()
    }

    func addNote(id: UUID, note: String) {
        guard let index = chores.firstIndex(where: { $0.id == id }) else { return }
        chores[index].notes = note
        save()
    }

    // MARK: - Queries

    func choreById(_ id: UUID) -> Chore? {
        chores.first { $0.id == id }
    }

    var pendingChores: [Chore] {
        chores.filter { !$0.isCompleted }
    }

    var completedChores: [Chore] {
        chores.filter { $0.isCompleted }
    }

    func choresByArea(_ area: AreaTag) -> [Chore] {
        chores.filter { $0.areaTag == area && !$0.isCompleted }
    }

    var overdueChores: [Chore] {
        let now = Date()
        return chores.filter { !$0.isCompleted && $0.dueDate != nil && $0.dueDate! < now }
    }

    // MARK: - Streak

    var streak: Int {
        let completed = completedChores
            .compactMap { $0.completedAt }
            .map { Calendar.current.startOfDay(for: $0) }
            .sorted(by: >)

        guard !completed.isEmpty else { return 0 }

        let uniqueDates = Array(Set(completed)).sorted(by: >)
        let today = Calendar.current.startOfDay(for: Date())
        var count = 0

        for i in 0..<uniqueDates.count {
            let expected = Calendar.current.date(byAdding: .day, value: -i, to: today)!
            if uniqueDates.contains(expected) {
                count += 1
            } else if i == 0, let first = uniqueDates.first,
                      first == Calendar.current.date(byAdding: .day, value: -1, to: today) {
                count += 1
            } else {
                break
            }
        }

        return count
    }
}
