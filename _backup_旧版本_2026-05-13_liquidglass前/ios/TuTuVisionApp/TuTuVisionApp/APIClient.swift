import Foundation

final class APIClient {
    static let shared = APIClient()

    private let baseURL: URL
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        let configured = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String
        self.baseURL = URL(string: configured?.isEmpty == false ? configured! : "http://127.0.0.1:3000")!
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }

    func get<T: Decodable>(_ path: String) async throws -> T {
        let request = URLRequest(url: baseURL.appendingAPIPath(path))
        return try await send(request)
    }

    func post<T: Decodable, Body: Encodable>(_ path: String, body: Body) async throws -> T {
        var request = URLRequest(url: baseURL.appendingAPIPath(path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(body)
        return try await send(request)
    }

    private func send<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse("服务器无响应，请检查后端服务是否运行。")
        }

        guard 200..<300 ~= http.statusCode else {
            if let serverError = try? decoder.decode(ServerErrorResponse.self, from: data) {
                throw APIError.invalidResponse(serverError.message)
            }
            throw APIError.invalidResponse("服务器响应异常：HTTP \(http.statusCode)")
        }

        return try decoder.decode(T.self, from: data)
    }
}

struct ServerErrorResponse: Decodable {
    let message: String
}

enum APIError: Error, LocalizedError {
    case invalidResponse(String)

    var errorDescription: String? {
        switch self {
        case .invalidResponse(let message): return message
        }
    }
}

extension URL {
    func appendingAPIPath(_ path: String) -> URL {
        var normalized = path
        if normalized.hasPrefix("/") { normalized.removeFirst() }
        return appendingPathComponent(normalized)
    }
}
