import { ClipboardContentType, } from '../index';
/**
 * Web implementation of MediaClipboard using browser Clipboard API
 */
export class MediaClipboardWeb {
    /**
     * Check if the Clipboard API is available
     */
    isClipboardApiAvailable() {
        return (typeof navigator !== 'undefined' &&
            typeof navigator.clipboard !== 'undefined' &&
            typeof navigator.clipboard.writeText !== 'undefined');
    }
    /**
     * Check if advanced clipboard features are available (images, etc.)
     */
    isAdvancedClipboardApiAvailable() {
        return (this.isClipboardApiAvailable() &&
            typeof navigator.clipboard.write !== 'undefined');
    }
    async copyText(text) {
        if (this.isClipboardApiAvailable()) {
            try {
                await navigator.clipboard.writeText(text);
                return;
            }
            catch (error) {
                console.warn('Clipboard API failed, falling back to legacy method:', error);
            }
        }
        // Fallback for older browsers
        return this.fallbackCopyText(text);
    }
    async copyImage(imagePath, _options) {
        if (!this.isAdvancedClipboardApiAvailable()) {
            throw new Error('Image copying is not supported in this browser. Use a modern browser with Clipboard API support.');
        }
        try {
            // Resolve the image path for web (handle relative paths)
            const resolvedPath = this.resolveAssetPath(imagePath);
            // Handle base64 data URLs
            if (imagePath.startsWith('data:image/')) {
                const response = await fetch(imagePath);
                const blob = await response.blob();
                const clipboardItem = new ClipboardItem({ [blob.type]: blob });
                await navigator.clipboard.write([clipboardItem]);
                return;
            }
            // Handle regular image URLs/paths
            const response = await fetch(resolvedPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch image from URL: ${resolvedPath} (${response.status}: ${response.statusText})`);
            }
            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) {
                throw new Error(`File is not a valid image at URL: ${resolvedPath} (received ${blob.type})`);
            }
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([clipboardItem]);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Check if this is a relative path error
            if (errorMessage.includes('RELATIVE_PATH_ERROR')) {
                throw new Error(`Cannot copy from relative path '${imagePath}'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Convert to base64: data:image/jpeg;base64,<your_base64_data>\n2. Use HTTP/HTTPS URL: https://example.com/image.jpg\n3. Use absolute path: /absolute/path/to/image.jpg\n4. Use blob URL: blob:https://example.com/uuid`);
            }
            throw new Error(`Cannot copy image from path: ${imagePath} - ${errorMessage}`);
        }
    }
    async copyVideo(videoPath, _options) {
        try {
            // Resolve path to validate it exists (even though we can't copy videos)
            const resolvedPath = this.resolveAssetPath(videoPath);
            throw new Error(`Video copying is not supported in web browsers. Video path resolved to: ${resolvedPath}. Consider copying the video URL instead.`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Check if this is a relative path error
            if (errorMessage.includes('RELATIVE_PATH_ERROR')) {
                throw new Error(`Cannot copy from relative path '${videoPath}'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/video.mp4\n2. Use absolute path: /absolute/path/to/video.mp4\n3. Use blob URL: blob:https://example.com/uuid`);
            }
            throw error;
        }
    }
    async copyPDF(pdfPath, _options) {
        try {
            // Resolve path to validate it exists (even though we can't copy PDFs)
            const resolvedPath = this.resolveAssetPath(pdfPath);
            throw new Error(`PDF copying is not supported in web browsers. PDF path resolved to: ${resolvedPath}. Consider copying the PDF URL instead.`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Check if this is a relative path error
            if (errorMessage.includes('RELATIVE_PATH_ERROR')) {
                throw new Error(`Cannot copy from relative path '${pdfPath}'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/document.pdf\n2. Use absolute path: /absolute/path/to/document.pdf\n3. Use blob URL: blob:https://example.com/uuid`);
            }
            throw error;
        }
    }
    async copyAudio(audioPath, _options) {
        try {
            // Resolve path to validate it exists (even though we can't copy audio)
            const resolvedPath = this.resolveAssetPath(audioPath);
            throw new Error(`Audio copying is not supported in web browsers. Audio path resolved to: ${resolvedPath}. Consider copying the audio URL instead.`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Check if this is a relative path error
            if (errorMessage.includes('RELATIVE_PATH_ERROR')) {
                throw new Error(`Cannot copy from relative path '${audioPath}'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/audio.mp3\n2. Use absolute path: /absolute/path/to/audio.mp3\n3. Use blob URL: blob:https://example.com/uuid`);
            }
            throw error;
        }
    }
    async copyFile(filePath, mimeType, options) {
        try {
            // Always resolve the asset path first
            const resolvedPath = this.resolveAssetPath(filePath);
            if (!this.isAdvancedClipboardApiAvailable()) {
                throw new Error(`File copying is not supported in this browser. Use a modern browser with Clipboard API support. File path resolved to: ${resolvedPath}`);
            }
            // Handle different MIME types that browsers can support
            if (mimeType.startsWith('image/')) {
                return this.copyImage(filePath, options);
            }
            if (mimeType === 'text/plain' || mimeType === 'text/html') {
                // Fetch text content and copy as text
                try {
                    const response = await fetch(resolvedPath);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch file from URL: ${resolvedPath} (${response.status}: ${response.statusText})`);
                    }
                    const text = await response.text();
                    return this.copyText(text);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    throw new Error(`Cannot copy text file from resolved path: ${resolvedPath} - ${errorMessage}`);
                }
            }
            // For unsupported MIME types, provide detailed error with resolved path
            if (mimeType.startsWith('video/')) {
                throw new Error(`Video files (${mimeType}) are not supported for copying in web browsers. File path resolved to: ${resolvedPath}. Consider copying the file URL instead.`);
            }
            if (mimeType === 'application/pdf') {
                throw new Error(`PDF files are not supported for copying in web browsers. File path resolved to: ${resolvedPath}. Consider copying the file URL instead.`);
            }
            if (mimeType.startsWith('audio/')) {
                throw new Error(`Audio files (${mimeType}) are not supported for copying in web browsers. File path resolved to: ${resolvedPath}. Consider copying the file URL instead.`);
            }
            throw new Error(`MIME type '${mimeType}' is not supported for copying in web browsers. File path resolved to: ${resolvedPath}. Supported types: images, text files.`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Check if this is a relative path error
            if (errorMessage.includes('RELATIVE_PATH_ERROR')) {
                throw new Error(`Cannot copy from relative path '${filePath}'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Convert to base64: data:${mimeType};base64,<your_base64_data>\n2. Use HTTP/HTTPS URL: https://example.com/file\n3. Use absolute path: /absolute/path/to/file\n4. Use blob URL: blob:https://example.com/uuid`);
            }
            throw error;
        }
    }
    async copyLargeFile(filePath, mimeType, onProgress, options) {
        // For web, we don't have true progress tracking for clipboard operations
        if (onProgress) {
            onProgress(0);
        }
        await this.copyFile(filePath, mimeType, options);
        if (onProgress) {
            onProgress(100);
        }
    }
    async hasContent() {
        if (!this.isClipboardApiAvailable()) {
            return false;
        }
        try {
            const text = await navigator.clipboard.readText();
            return text.length > 0;
        }
        catch (error) {
            // Reading clipboard might fail due to permissions or focus
            console.warn('Could not check clipboard content:', error);
            return false;
        }
    }
    async getContent() {
        if (!this.isClipboardApiAvailable()) {
            return { type: ClipboardContentType.UNKNOWN };
        }
        try {
            // Try to read text first
            const text = await navigator.clipboard.readText();
            if (text && text.length > 0) {
                return {
                    type: ClipboardContentType.TEXT,
                    data: text,
                    size: text.length,
                };
            }
            // Try to read other content types if advanced API is available
            if (this.isAdvancedClipboardApiAvailable()) {
                try {
                    const clipboardItems = await navigator.clipboard.read();
                    if (clipboardItems.length > 0) {
                        const item = clipboardItems[0];
                        const types = item.types;
                        // Check for images
                        for (const type of types) {
                            if (type.startsWith('image/')) {
                                const blob = await item.getType(type);
                                return {
                                    type: ClipboardContentType.IMAGE,
                                    mimeType: type,
                                    size: blob.size,
                                };
                            }
                        }
                        // Check for other types
                        if (types.length > 0) {
                            return {
                                type: ClipboardContentType.FILE,
                                mimeType: types[0],
                            };
                        }
                    }
                }
                catch (error) {
                    console.warn('Could not read advanced clipboard content:', error);
                }
            }
            return { type: ClipboardContentType.UNKNOWN };
        }
        catch (error) {
            console.warn('Could not read clipboard content:', error);
            return { type: ClipboardContentType.UNKNOWN };
        }
    }
    async clear() {
        if (this.isClipboardApiAvailable()) {
            try {
                await navigator.clipboard.writeText('');
                return;
            }
            catch (error) {
                console.warn('Could not clear clipboard:', error);
            }
        }
        // Fallback: try to copy empty string using legacy method
        this.fallbackCopyText('');
    }
    /**
     * Resolve asset paths for web platform
     */
    resolveAssetPath(path) {
        // If it's already an absolute URL (including HTTP/HTTPS), return as-is
        if (path.startsWith('http://') ||
            path.startsWith('https://') ||
            path.startsWith('data:') ||
            path.startsWith('blob:')) {
            return path;
        }
        // If it's an absolute path, return as-is
        if (path.startsWith('/')) {
            return path;
        }
        // Check for relative paths with dots - these are ambiguous and should be rejected
        if (path.startsWith('./') ||
            path.startsWith('../') ||
            path.includes('/../') ||
            path.includes('/./')) {
            throw new Error('RELATIVE_PATH_ERROR: Relative paths with dots are not supported');
        }
        // Handle relative paths - treat them as-is since dots have been checked
        let cleanPath = path;
        // For React Native web, assets are typically served from the root or assets folder
        // Try common asset paths
        const possiblePaths = [
            `/${cleanPath}`, // Root relative
            `/assets/${cleanPath}`, // Assets folder
            `/static/${cleanPath}`, // Static folder (common in React apps)
            `/public/${cleanPath}`, // Public folder
            `/assets/images/${cleanPath}`, // Specific images folder
        ];
        // For now, return the first possibility (root relative)
        // In a real implementation, you might want to check which path exists
        return possiblePaths[0];
    }
    /**
     * Fallback method for copying text in older browsers
     */
    fallbackCopyText(text) {
        return new Promise((resolve, reject) => {
            try {
                // Create a temporary textarea element
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-999999px';
                textarea.style.top = '-999999px';
                document.body.appendChild(textarea);
                // Select and copy the text
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                // Clean up
                document.body.removeChild(textarea);
                resolve();
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                reject(new Error(`Failed to copy text: ${errorMessage}`));
            }
        });
    }
}
export default MediaClipboardWeb;
