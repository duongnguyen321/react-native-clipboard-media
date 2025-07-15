/**
 * Content type enumeration for clipboard content
 */
export declare enum ClipboardContentType {
    TEXT = "text",
    IMAGE = "image",
    VIDEO = "video",
    PDF = "pdf",
    AUDIO = "audio",
    FILE = "file",
    UNKNOWN = "unknown"
}
/**
 * Interface for clipboard content
 */
export interface ClipboardContent {
    type: ClipboardContentType;
    data?: string;
    mimeType?: string;
    size?: number;
    filename?: string;
}
/**
 * Configuration options for copying files
 */
export interface CopyFileOptions {
    mimeType?: string;
    filename?: string;
    showNotification?: boolean;
}
/**
 * Progress callback for large file operations
 */
export type ProgressCallback = (progress: number) => void;
/**
 * Permission status interface
 */
export interface PermissionStatus {
    granted: boolean;
    status: string;
}
/**
 * MediaClipboard API interface
 */
export interface MediaClipboardInterface {
    /**
     * Request required permissions for clipboard operations
     * @returns Promise that resolves to true if permissions granted
     */
    requestPermissions(): Promise<boolean>;
    /**
     * Check current permission status
     * @returns Promise that resolves to permission status
     */
    checkPermissions(): Promise<PermissionStatus>;
    /**
     * Copy text or URL to clipboard
     * @param text The text or URL to copy
     * @returns Promise that resolves when copy is complete
     */
    copyText(text: string): Promise<void>;
    /**
     * Copy image to clipboard
     * @param imagePath Path to the image file or base64 data URI
     * @param options Optional copy configuration
     * @returns Promise that resolves when copy is complete
     */
    copyImage(imagePath: string, options?: CopyFileOptions): Promise<void>;
    /**
     * Copy video to clipboard
     * @param videoPath Path to the video file
     * @param options Optional copy configuration
     * @returns Promise that resolves when copy is complete
     */
    copyVideo(videoPath: string, options?: CopyFileOptions): Promise<void>;
    /**
     * Copy PDF to clipboard
     * @param pdfPath Path to the PDF file
     * @param options Optional copy configuration
     * @returns Promise that resolves when copy is complete
     */
    copyPDF(pdfPath: string, options?: CopyFileOptions): Promise<void>;
    /**
     * Copy audio file to clipboard
     * @param audioPath Path to the audio file
     * @param options Optional copy configuration
     * @returns Promise that resolves when copy is complete
     */
    copyAudio(audioPath: string, options?: CopyFileOptions): Promise<void>;
    /**
     * Copy any file to clipboard with specified MIME type
     * @param filePath Path to the file
     * @param mimeType MIME type of the file
     * @param options Optional copy configuration
     * @returns Promise that resolves when copy is complete
     */
    copyFile(filePath: string, mimeType: string, options?: CopyFileOptions): Promise<void>;
    /**
     * Copy large file to clipboard with progress tracking
     * @param filePath Path to the large file
     * @param mimeType MIME type of the file
     * @param onProgress Progress callback function
     * @param options Optional copy configuration
     * @returns Promise that resolves when copy is complete
     */
    copyLargeFile(filePath: string, mimeType: string, onProgress?: ProgressCallback, options?: CopyFileOptions): Promise<void>;
    /**
     * Check if clipboard has any content
     * @returns Promise that resolves to true if clipboard has content
     */
    hasContent(): Promise<boolean>;
    /**
     * Get current clipboard content information
     * @returns Promise that resolves to clipboard content info
     */
    getContent(): Promise<ClipboardContent>;
    /**
     * Clear clipboard content
     * @returns Promise that resolves when clipboard is cleared
     */
    clear(): Promise<void>;
}
/**
 * MediaClipboard implementation
 */
declare class MediaClipboard implements MediaClipboardInterface {
    requestPermissions(): Promise<boolean>;
    checkPermissions(): Promise<PermissionStatus>;
    copyText(text: string): Promise<void>;
    copyImage(imagePath: string, options?: CopyFileOptions): Promise<void>;
    copyVideo(videoPath: string, options?: CopyFileOptions): Promise<void>;
    copyPDF(pdfPath: string, options?: CopyFileOptions): Promise<void>;
    copyAudio(audioPath: string, options?: CopyFileOptions): Promise<void>;
    copyFile(filePath: string, mimeType: string, options?: CopyFileOptions): Promise<void>;
    copyLargeFile(filePath: string, mimeType: string, onProgress?: ProgressCallback, options?: CopyFileOptions): Promise<void>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<ClipboardContent>;
    clear(): Promise<void>;
}
declare const mediaClipboard: MediaClipboard;
export default mediaClipboard;
export { MediaClipboard };
