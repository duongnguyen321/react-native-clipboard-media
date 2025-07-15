import { ClipboardContent, CopyFileOptions, MediaClipboardInterface, ProgressCallback } from '../index';
/**
 * Web implementation of MediaClipboard using browser Clipboard API
 */
export declare class MediaClipboardWeb implements MediaClipboardInterface {
    /**
     * Check if the Clipboard API is available
     */
    private isClipboardApiAvailable;
    /**
     * Check if advanced clipboard features are available (images, etc.)
     */
    private isAdvancedClipboardApiAvailable;
    /**
     * Check if we're in a secure context (required for Clipboard API)
     */
    private isSecureContext;
    /**
     * Request clipboard permissions
     */
    requestPermissions(): Promise<boolean>;
    /**
     * Check clipboard permissions
     */
    checkPermissions(): Promise<{
        granted: boolean;
        status: string;
    }>;
    copyText(text: string): Promise<void>;
    copyImage(imagePath: string, _options?: CopyFileOptions): Promise<void>;
    copyVideo(videoPath: string, _options?: CopyFileOptions): Promise<void>;
    copyPDF(pdfPath: string, _options?: CopyFileOptions): Promise<void>;
    copyAudio(audioPath: string, _options?: CopyFileOptions): Promise<void>;
    copyFile(filePath: string, mimeType: string, options?: CopyFileOptions): Promise<void>;
    copyLargeFile(filePath: string, mimeType: string, onProgress?: ProgressCallback, options?: CopyFileOptions): Promise<void>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<ClipboardContent>;
    clear(): Promise<void>;
    /**
     * Resolve asset paths for web platform
     */
    private resolveAssetPath;
    /**
     * Fallback method for copying text in older browsers
     */
    private fallbackCopyText;
}
export default MediaClipboardWeb;
