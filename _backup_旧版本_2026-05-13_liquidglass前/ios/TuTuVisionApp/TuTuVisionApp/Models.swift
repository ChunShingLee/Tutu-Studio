import Foundation

struct UserProfile: Codable, Identifiable {
    let id: String
    var nickname: String
    var plan: String
    var dailyQuotaRemaining: Int
}

struct TemplateCategory: Codable, Identifiable, Hashable {
    let id: String
    let name: String
}

struct CreativeTemplate: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let categoryId: String
    let scene: String
    let promptHint: String
    let isPremium: Bool
}

struct TemplatesResponse: Codable {
    let categories: [TemplateCategory]
    let templates: [CreativeTemplate]
}

struct GenerationRequest: Codable {
    let prompt: String
    let templateId: String?
    let style: String
    let aspectRatio: String
    let referenceImageUrl: String?
    let referenceImageBase64: String?
    let mode: GenerationMode
    let editInstruction: String?
    let editArea: String?
    let editStrength: String?
}

struct GenerationJob: Codable, Identifiable, Hashable {
    let id: String
    var status: JobStatus
    var prompt: String
    var templateId: String?
    var style: String?
    var aspectRatio: String?
    var imageUrl: String?
    var errorMessage: String?
    var referenceImageUrl: String?
    var mode: GenerationMode?
    var editInstruction: String?
    var editArea: String?
    var editStrength: String?
    var createdAt: Date
}

enum JobStatus: String, Codable {
    case queued, running, succeeded, failed
}

enum GenerationMode: String, Codable, CaseIterable {
    case textToImage
    case imageToImage
    case localEdit
}

struct Asset: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let imageUrl: String
    let prompt: String
    let createdAt: Date
    let sourceImageUrl: String?
    let mode: GenerationMode?
    let editInstruction: String?
    let editArea: String?
    let editStrength: String?
}

struct AdminMetric: Codable {
    let users: Int
    let jobsToday: Int
    let assets: Int
    let conversionRate: Double
}
