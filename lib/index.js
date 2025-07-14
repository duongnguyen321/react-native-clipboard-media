import { NativeModules, Platform } from 'react-native';
const LINKING_ERROR = `The package 'react-native-media-clipboard' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({
        ios: "- You have run 'cd ios && pod install'\n",
        default: '',
    }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';
const MediaClipboardModule = NativeModules.MediaClipboard
    ? NativeModules.MediaClipboard
    : new Proxy({}, {
        get() {
            throw new Error(LINKING_ERROR);
        },
    });
/**
 * Content type enumeration for clipboard content
 */
export var ClipboardContentType;
(function (ClipboardContentType) {
    ClipboardContentType["TEXT"] = "text";
    ClipboardContentType["IMAGE"] = "image";
    ClipboardContentType["VIDEO"] = "video";
    ClipboardContentType["PDF"] = "pdf";
    ClipboardContentType["AUDIO"] = "audio";
    ClipboardContentType["FILE"] = "file";
    ClipboardContentType["UNKNOWN"] = "unknown";
})(ClipboardContentType || (ClipboardContentType = {}));
/**
 * MediaClipboard implementation
 */
class MediaClipboard {
    async copyText(text) {
        return MediaClipboardModule.copyText(text);
    }
    async copyImage(imagePath, options) {
        return MediaClipboardModule.copyImage(imagePath, options || {});
    }
    async copyVideo(videoPath, options) {
        return MediaClipboardModule.copyVideo(videoPath, options || {});
    }
    async copyPDF(pdfPath, options) {
        return MediaClipboardModule.copyPDF(pdfPath, options || {});
    }
    async copyAudio(audioPath, options) {
        return MediaClipboardModule.copyAudio(audioPath, options || {});
    }
    async copyFile(filePath, mimeType, options) {
        return MediaClipboardModule.copyFile(filePath, mimeType, options || {});
    }
    async copyLargeFile(filePath, mimeType, onProgress, options) {
        return MediaClipboardModule.copyLargeFile(filePath, mimeType, onProgress, options || {});
    }
    async hasContent() {
        return MediaClipboardModule.hasContent();
    }
    async getContent() {
        return MediaClipboardModule.getContent();
    }
    async clear() {
        return MediaClipboardModule.clear();
    }
}
// Create and export the default instance
const mediaClipboard = new MediaClipboard();
export default mediaClipboard;
// Export the class for custom instances
export { MediaClipboard };
