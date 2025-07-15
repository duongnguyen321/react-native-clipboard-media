import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-clipboard-media' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({
    ios: "- You have run 'cd ios && pod install'\n",
    default: '',
  }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// Check if we're running on web platform
const isWeb = Platform.OS === 'web';

let MediaClipboardModule: any;

if (isWeb) {
  // Dynamically import web implementation for web platform
  try {
    const { MediaClipboardWeb } = require('./web/MediaClipboardWeb');
    MediaClipboardModule = new MediaClipboardWeb();
  } catch (error) {
    console.error('Failed to load web clipboard implementation:', error);
    MediaClipboardModule = new Proxy(
      {},
      {
        get() {
          throw new Error('Web clipboard implementation failed to load');
        },
      },
    );
  }
} else {
  // Use native module for iOS/Android
  MediaClipboardModule = NativeModules.MediaClipboard
    ? NativeModules.MediaClipboard
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        },
      );
}

/**
 * Content type enumeration for clipboard content
 */
export enum ClipboardContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf',
  AUDIO = 'audio',
  FILE = 'file',
  UNKNOWN = 'unknown',
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
 * MediaClipboard API interface
 */
export interface MediaClipboardInterface {
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
  copyFile(
    filePath: string,
    mimeType: string,
    options?: CopyFileOptions,
  ): Promise<void>;

  /**
   * Copy large file to clipboard with progress tracking
   * @param filePath Path to the large file
   * @param mimeType MIME type of the file
   * @param onProgress Progress callback function
   * @param options Optional copy configuration
   * @returns Promise that resolves when copy is complete
   */
  copyLargeFile(
    filePath: string,
    mimeType: string,
    onProgress?: ProgressCallback,
    options?: CopyFileOptions,
  ): Promise<void>;

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
class MediaClipboard implements MediaClipboardInterface {
  async copyText(text: string): Promise<void> {
    return MediaClipboardModule.copyText(text);
  }

  async copyImage(imagePath: string, options?: CopyFileOptions): Promise<void> {
    return MediaClipboardModule.copyImage(imagePath, options || {});
  }

  async copyVideo(videoPath: string, options?: CopyFileOptions): Promise<void> {
    return MediaClipboardModule.copyVideo(videoPath, options || {});
  }

  async copyPDF(pdfPath: string, options?: CopyFileOptions): Promise<void> {
    return MediaClipboardModule.copyPDF(pdfPath, options || {});
  }

  async copyAudio(audioPath: string, options?: CopyFileOptions): Promise<void> {
    return MediaClipboardModule.copyAudio(audioPath, options || {});
  }

  async copyFile(
    filePath: string,
    mimeType: string,
    options?: CopyFileOptions,
  ): Promise<void> {
    return MediaClipboardModule.copyFile(filePath, mimeType, options || {});
  }

  async copyLargeFile(
    filePath: string,
    mimeType: string,
    onProgress?: ProgressCallback,
    options?: CopyFileOptions,
  ): Promise<void> {
    return MediaClipboardModule.copyLargeFile(
      filePath,
      mimeType,
      onProgress,
      options || {},
    );
  }

  async hasContent(): Promise<boolean> {
    return MediaClipboardModule.hasContent();
  }

  async getContent(): Promise<ClipboardContent> {
    return MediaClipboardModule.getContent();
  }

  async clear(): Promise<void> {
    return MediaClipboardModule.clear();
  }
}

// Create and export the default instance
const mediaClipboard = new MediaClipboard();

export default mediaClipboard;

// Export the class for custom instances
export { MediaClipboard };
