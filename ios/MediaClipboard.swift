import Foundation
import UIKit
import UniformTypeIdentifiers
import MobileCoreServices

@objc protocol MediaClipboardSwiftDelegate: AnyObject {
    func onProgressUpdate(_ progress: Double)
}

@objc(MediaClipboardSwift)
class MediaClipboardSwift: NSObject {
    
    @objc static let shared = MediaClipboardSwift()
    
    weak var delegate: MediaClipboardSwiftDelegate?
    
    private override init() {
        super.init()
    }
    
    @objc func setDelegate(_ delegate: MediaClipboardSwiftDelegate?) {
        self.delegate = delegate
    }
    
    // MARK: - Public Methods
    
    @objc func copyText(_ text: String, completion: @escaping (Error?) -> Void) {
        DispatchQueue.main.async {
            UIPasteboard.general.string = text
            completion(nil)
        }
    }
    
    @objc func copyImage(_ imagePath: String, options: [String: Any], completion: @escaping (Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let image = try self.loadImage(from: imagePath)
                DispatchQueue.main.async {
                    UIPasteboard.general.image = image
                    completion(nil)
                }
            } catch {
                DispatchQueue.main.async {
                    completion(error)
                }
            }
        }
    }
    
    @objc func copyVideo(_ videoPath: String, options: [String: Any], completion: @escaping (Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let videoData = try self.loadFileData(from: videoPath)
                DispatchQueue.main.async {
                    if #available(iOS 14.0, *) {
                        UIPasteboard.general.items = [[UTType.movie.identifier: videoData]]
                    } else {
                        UIPasteboard.general.setData(videoData, forPasteboardType: kUTTypeMovie as String)
                    }
                    completion(nil)
                }
            } catch {
                DispatchQueue.main.async {
                    completion(error)
                }
            }
        }
    }
    
    @objc func copyPDF(_ pdfPath: String, options: [String: Any], completion: @escaping (Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let pdfData = try self.loadFileData(from: pdfPath)
                DispatchQueue.main.async {
                    if #available(iOS 14.0, *) {
                        UIPasteboard.general.items = [[UTType.pdf.identifier: pdfData]]
                    } else {
                        UIPasteboard.general.setData(pdfData, forPasteboardType: kUTTypePDF as String)
                    }
                    completion(nil)
                }
            } catch {
                DispatchQueue.main.async {
                    completion(error)
                }
            }
        }
    }
    
    @objc func copyAudio(_ audioPath: String, options: [String: Any], completion: @escaping (Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let audioData = try self.loadFileData(from: audioPath)
                let audioType = self.getAudioUTType(for: audioPath)
                
                DispatchQueue.main.async {
                    if #available(iOS 14.0, *) {
                        UIPasteboard.general.items = [[audioType.identifier: audioData]]
                    } else {
                        UIPasteboard.general.setData(audioData, forPasteboardType: audioType.identifier)
                    }
                    completion(nil)
                }
            } catch {
                DispatchQueue.main.async {
                    completion(error)
                }
            }
        }
    }
    
    @objc func copyFile(_ filePath: String, mimeType: String, options: [String: Any], completion: @escaping (Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let fileData = try self.loadFileData(from: filePath)
                let utType = self.getUTType(for: mimeType)
                
                DispatchQueue.main.async {
                    if #available(iOS 14.0, *) {
                        UIPasteboard.general.items = [[utType.identifier: fileData]]
                    } else {
                        UIPasteboard.general.setData(fileData, forPasteboardType: utType.identifier)
                    }
                    completion(nil)
                }
            } catch {
                DispatchQueue.main.async {
                    completion(error)
                }
            }
        }
    }
    
    @objc func copyLargeFile(_ filePath: String, mimeType: String, options: [String: Any], completion: @escaping (Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let fileData = try self.loadLargeFileData(from: filePath) { [weak self] progress in
                    DispatchQueue.main.async {
                        self?.delegate?.onProgressUpdate(progress)
                    }
                }
                let utType = self.getUTType(for: mimeType)
                
                DispatchQueue.main.async {
                    if #available(iOS 14.0, *) {
                        UIPasteboard.general.items = [[utType.identifier: fileData]]
                    } else {
                        UIPasteboard.general.setData(fileData, forPasteboardType: utType.identifier)
                    }
                    completion(nil)
                }
            } catch {
                DispatchQueue.main.async {
                    completion(error)
                }
            }
        }
    }
    
    @objc func hasContent() -> Bool {
        return !UIPasteboard.general.items.isEmpty
    }
    
    @objc(getContentWithCompletion:)
    func getContent(completion: @escaping ([String: Any]?, Error?) -> Void) {
        DispatchQueue.main.async {
            let pasteboard = UIPasteboard.general
            var content: [String: Any] = [:]
            
            if let string = pasteboard.string {
                content["type"] = "text"
                content["data"] = string
            } else if let image = pasteboard.image {
                content["type"] = "image"
                if let imageData = image.pngData() {
                    content["size"] = imageData.count
                }
            } else if pasteboard.hasImages {
                content["type"] = "image"
            } else if pasteboard.hasURLs {
                content["type"] = "text"
                content["data"] = pasteboard.url?.absoluteString
            } else {
                // Check for other data types
                let items = pasteboard.items
                if !items.isEmpty {
                    content["type"] = "file"
                    content["size"] = items.first?.count ?? 0
                }
            }
            
            if content.isEmpty {
                content["type"] = "unknown"
            }
            
            completion(content, nil)
        }
    }
    
    @objc(clearWithCompletion:)
    func clear(completion: @escaping (Error?) -> Void) {
        DispatchQueue.main.async {
            UIPasteboard.general.items = []
            completion(nil)
        }
    }
    
    // MARK: - Private Helper Methods
    
    private func loadImage(from path: String) throws -> UIImage {
        // Handle base64 data URLs
        if path.hasPrefix("data:image/") {
            guard let url = URL(string: path),
                  let data = try? Data(contentsOf: url),
                  let image = UIImage(data: data) else {
                throw MediaClipboardError.invalidImagePath
            }
            return image
        }
        
        // Handle file paths
        let url = URL(fileURLWithPath: path)
        guard let image = UIImage(contentsOfFile: url.path) else {
            throw MediaClipboardError.invalidImagePath
        }
        return image
    }
    
    private func loadFileData(from path: String) throws -> Data {
        let url = URL(fileURLWithPath: path)
        guard FileManager.default.fileExists(atPath: url.path) else {
            throw MediaClipboardError.fileNotFound
        }
        
        do {
            return try Data(contentsOf: url)
        } catch {
            throw MediaClipboardError.fileReadError
        }
    }
    
    private func loadLargeFileData(from path: String, progressCallback: @escaping (Double) -> Void) throws -> Data {
        let url = URL(fileURLWithPath: path)
        guard FileManager.default.fileExists(atPath: url.path) else {
            throw MediaClipboardError.fileNotFound
        }
        
        guard let fileHandle = FileHandle(forReadingAtPath: url.path) else {
            throw MediaClipboardError.fileReadError
        }
        
        defer {
            fileHandle.closeFile()
        }
        
        let fileSize = try FileManager.default.attributesOfItem(atPath: url.path)[.size] as! UInt64
        var data = Data()
        let chunkSize = 1024 * 1024 // 1MB chunks
        var bytesRead: UInt64 = 0
        
        while bytesRead < fileSize {
            let chunk = fileHandle.readData(ofLength: chunkSize)
            if chunk.isEmpty { break }
            
            data.append(chunk)
            bytesRead += UInt64(chunk.count)
            
            let progress = Double(bytesRead) / Double(fileSize)
            progressCallback(progress)
        }
        
        return data
    }
    
    private func getUTType(for mimeType: String) -> UTType {
        if #available(iOS 14.0, *) {
            // iOS 14+ approach - use UTType initializer with mimeType
            if let utType = UTType(mimeType: mimeType) {
                return utType
            }
            return UTType.data
        } else {
            // Fallback for older iOS versions using legacy constants
            switch mimeType {
            case "image/jpeg", "image/jpg":
                return UTType(kUTTypeJPEG as String)!
            case "image/png":
                return UTType(kUTTypePNG as String)!
            case "video/mp4":
                return UTType(kUTTypeMPEG4 as String)!
            case "video/quicktime":
                return UTType(kUTTypeQuickTimeMovie as String)!
            case "application/pdf":
                return UTType(kUTTypePDF as String)!
            case "audio/mpeg", "audio/mp3":
                return UTType(kUTTypeMP3 as String)!
            case "audio/wav":
                return UTType("public.wav")!
            default:
                return UTType(kUTTypeData as String)!
            }
        }
    }
    
    private func getAudioUTType(for audioPath: String) -> UTType {
        let pathExtension = URL(fileURLWithPath: audioPath).pathExtension.lowercased()
        
        if #available(iOS 14.0, *) {
            switch pathExtension {
            case "mp3":
                return UTType.mp3
            case "wav":
                return UTType.wav
            case "m4a":
                return UTType.mpeg4Audio
            case "aac":
                return UTType("public.aac")!
            default:
                return UTType.audio
            }
        } else {
            switch pathExtension {
            case "mp3":
                return UTType(kUTTypeMP3 as String)!
            case "wav":
                return UTType(kUTTypeWaveformAudio as String)!
            case "m4a":
                return UTType(kUTTypeMPEG4Audio as String)!
            default:
                return UTType(kUTTypeAudio as String)!
            }
        }
    }
}

// MARK: - Error Types

enum MediaClipboardError: LocalizedError {
    case invalidImagePath
    case fileNotFound
    case fileReadError
    case unsupportedFormat
    
    var errorDescription: String? {
        switch self {
        case .invalidImagePath:
            return "Invalid image path or data"
        case .fileNotFound:
            return "File not found at specified path"
        case .fileReadError:
            return "Unable to read file data"
        case .unsupportedFormat:
            return "Unsupported file format"
        }
    }
} 