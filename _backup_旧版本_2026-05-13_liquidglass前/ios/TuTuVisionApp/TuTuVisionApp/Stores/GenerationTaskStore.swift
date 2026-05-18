import Foundation
import Observation

enum AvatarBadgeState: Equatable {
    case none
    case running(count: Int)
    case completed
}

enum TaskStatus: String, Hashable {
    case pending
    case running
    case completed
    case failed
}

enum CreationMode: String, Hashable, Codable {
    case textToImage
    case imageToImage
    case outpaint
    case inpaint

    init(generationMode: GenerationMode) {
        switch generationMode {
        case .textToImage:
            self = .textToImage
        case .imageToImage:
            self = .imageToImage
        case .localEdit:
            self = .inpaint
        }
    }
}

struct GeneratedImage: Identifiable, Hashable {
    let id: UUID
    var url: URL?

    init(id: UUID = UUID(), url: URL?) {
        self.id = id
        self.url = url
    }
}

struct CreationParams: Hashable {
    var mode: CreationMode
    var style: String
    var ratio: String
    var model: String
    var quantity: Int
    var seed: Int?

    init(
        mode: CreationMode = .textToImage,
        style: String = "商业摄影",
        ratio: String = "1:1",
        model: String = "v3 精细",
        quantity: Int = 1,
        seed: Int? = nil
    ) {
        self.mode = mode
        self.style = style
        self.ratio = ratio
        self.model = model
        self.quantity = quantity
        self.seed = seed
    }
}

struct CreationDraft: Hashable {
    var mode: CreationMode
    var prompt: String
    var referenceImageURL: URL?
    var style: String?
    var ratio: String?
    var model: String?
    var seed: Int?
}

struct GenerationTask: Identifiable, Hashable {
    let id: UUID
    var remoteJobID: String?
    let prompt: String
    let params: CreationParams
    var status: TaskStatus
    var results: [GeneratedImage]
    var viewed: Bool
    let createdAt: Date
}

@MainActor
@Observable
final class GenerationTaskStore {
    var tasks: [GenerationTask] = []

    var currentRunning: Int {
        tasks.filter { $0.status == .pending || $0.status == .running }.count
    }

    var hasCompleted: Bool {
        tasks.contains { $0.status == .completed && !$0.viewed }
    }

    var badgeState: AvatarBadgeState {
        if hasCompleted { return .completed }
        if currentRunning > 0 { return .running(count: currentRunning) }
        return .none
    }

    var latestCompletedTask: GenerationTask? {
        tasks.first { $0.status == .completed }
    }

    func sync(jobs: [GenerationJob], assets: [Asset]) {
        let previousViewed = Dictionary(uniqueKeysWithValues: tasks.map { task in
            (task.remoteJobID ?? task.id.uuidString, task.viewed)
        })

        let remoteTasks = jobs.map { job in
            let fallbackAsset = assets.first { asset in
                asset.imageUrl == job.imageUrl
            }
            let imageURL = job.imageUrl.flatMap(URL.init(string:))
                ?? fallbackAsset.flatMap { URL(string: $0.imageUrl) }
            let lookupKey = job.id

            return GenerationTask(
                id: Self.stableUUID(for: job.id),
                remoteJobID: job.id,
                prompt: job.prompt,
                params: CreationParams(
                    mode: CreationMode(generationMode: job.mode ?? .textToImage),
                    style: job.style ?? "商业摄影",
                    ratio: job.aspectRatio ?? "1:1",
                    model: "v3 精细",
                    quantity: 1,
                    seed: nil
                ),
                status: status(for: job.status),
                results: imageURL.map { [GeneratedImage(url: $0)] } ?? [],
                viewed: previousViewed[lookupKey] ?? false,
                createdAt: job.createdAt
            )
        }

        let localOnlyTasks = tasks.filter { task in
            guard task.remoteJobID == nil else { return false }
            return task.status == .pending || task.status == .running
        }

        tasks = (localOnlyTasks + remoteTasks)
            .sorted { $0.createdAt > $1.createdAt }
    }

    @discardableResult
    func enqueue(prompt: String, params: CreationParams) -> UUID {
        let task = GenerationTask(
            id: UUID(),
            remoteJobID: nil,
            prompt: prompt,
            params: params,
            status: .pending,
            results: [],
            viewed: false,
            createdAt: Date()
        )
        tasks.insert(task, at: 0)
        return task.id
    }

    func attachRemoteJob(localID: UUID, remoteJobID: String) {
        guard let index = tasks.firstIndex(where: { $0.id == localID }) else { return }
        tasks[index].remoteJobID = remoteJobID
        tasks[index].status = .running
    }

    func markTaskRunning(id: UUID) {
        guard let index = tasks.firstIndex(where: { $0.id == id }) else { return }
        tasks[index].status = .running
    }

    func markCompletedTasksViewed() {
        for index in tasks.indices where tasks[index].status == .completed {
            tasks[index].viewed = true
        }
    }

    func markTaskFailed(remoteJobID: String?) {
        guard let remoteJobID,
              let index = tasks.firstIndex(where: { $0.remoteJobID == remoteJobID }) else { return }
        tasks[index].status = .failed
    }

    private func status(for jobStatus: JobStatus) -> TaskStatus {
        switch jobStatus {
        case .queued:
            return .pending
        case .running:
            return .running
        case .succeeded:
            return .completed
        case .failed:
            return .failed
        }
    }

    private static func stableUUID(for rawValue: String) -> UUID {
        var bytes = [UInt8](repeating: 0, count: 16)
        for (index, byte) in rawValue.utf8.enumerated() {
            bytes[index % 16] = bytes[index % 16] &+ byte
        }

        bytes[6] = (bytes[6] & 0x0F) | 0x40
        bytes[8] = (bytes[8] & 0x3F) | 0x80

        return UUID(uuid: (
            bytes[0], bytes[1], bytes[2], bytes[3],
            bytes[4], bytes[5], bytes[6], bytes[7],
            bytes[8], bytes[9], bytes[10], bytes[11],
            bytes[12], bytes[13], bytes[14], bytes[15]
        ))
    }
}
