package com.mediaclipboard;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.ContentResolver;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MediaClipboardModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "MediaClipboard";
    private ClipboardManager clipboardManager;
    private ExecutorService executorService;

    public MediaClipboardModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.clipboardManager = (ClipboardManager) reactContext.getSystemService(Context.CLIPBOARD_SERVICE);
        this.executorService = Executors.newCachedThreadPool();
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void copyText(String text, Promise promise) {
        try {
            ClipData clip = ClipData.newPlainText("text", text);
            clipboardManager.setPrimaryClip(clip);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("COPY_TEXT_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void copyImage(String imagePath, ReadableMap options, Promise promise) {
        executorService.execute(() -> {
            try {
                String resolvedPath = resolveAssetPath(imagePath);
                
                // Check if this is a relative path issue
                if (resolvedPath == null && (imagePath.startsWith("./") || imagePath.startsWith("../") || imagePath.contains("/../") || imagePath.contains("/./"))) {
                    promise.reject("RELATIVE_PATH_ERROR", "Cannot copy from relative path '" + imagePath + "'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Convert to base64: data:image/jpeg;base64,<your_base64_data>\n2. Use HTTP/HTTPS URL: https://example.com/image.jpg\n3. Use absolute file path: /absolute/path/to/image.jpg\n4. Use content:// URI: content://provider/path/to/image.jpg");
                    return;
                }
                
                File imageFile = new File(resolvedPath);
                if (!imageFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Image file not found: " + imagePath + " (resolved to: " + resolvedPath + ")");
                    return;
                }

                Uri imageUri = MediaClipboardUtils.getContentUri(getReactApplicationContext(), imageFile);
                if (imageUri != null) {
                    ClipData clip = ClipData.newUri(getReactApplicationContext().getContentResolver(), "image", imageUri);
                    clipboardManager.setPrimaryClip(clip);
                    promise.resolve(null);
                } else {
                    promise.reject("URI_CREATION_ERROR", "Failed to create content URI for image");
                }
            } catch (Exception e) {
                promise.reject("COPY_IMAGE_ERROR", e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void copyVideo(String videoPath, ReadableMap options, Promise promise) {
        executorService.execute(() -> {
            try {
                String resolvedPath = resolveAssetPath(videoPath);
                
                // Check if this is a relative path issue
                if (resolvedPath == null && (videoPath.startsWith("./") || videoPath.startsWith("../") || videoPath.contains("/../") || videoPath.contains("/./"))) {
                    promise.reject("RELATIVE_PATH_ERROR", "Cannot copy from relative path '" + videoPath + "'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/video.mp4\n2. Use absolute file path: /absolute/path/to/video.mp4\n3. Use content:// URI: content://provider/path/to/video.mp4");
                    return;
                }
                
                File videoFile = new File(resolvedPath);
                if (!videoFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Video file not found: " + videoPath + " (resolved to: " + resolvedPath + ")");
                    return;
                }

                Uri videoUri = MediaClipboardUtils.getContentUri(getReactApplicationContext(), videoFile);
                if (videoUri != null) {
                    ClipData clip = ClipData.newUri(getReactApplicationContext().getContentResolver(), "video", videoUri);
                    clipboardManager.setPrimaryClip(clip);
                    promise.resolve(null);
                } else {
                    promise.reject("URI_CREATION_ERROR", "Failed to create content URI for video");
                }
            } catch (Exception e) {
                promise.reject("COPY_VIDEO_ERROR", e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void copyPDF(String pdfPath, ReadableMap options, Promise promise) {
        executorService.execute(() -> {
            try {
                String resolvedPath = resolveAssetPath(pdfPath);
                
                // Check if this is a relative path issue
                if (resolvedPath == null && (pdfPath.startsWith("./") || pdfPath.startsWith("../") || pdfPath.contains("/../") || pdfPath.contains("/./"))) {
                    promise.reject("RELATIVE_PATH_ERROR", "Cannot copy from relative path '" + pdfPath + "'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/document.pdf\n2. Use absolute file path: /absolute/path/to/document.pdf\n3. Use content:// URI: content://provider/path/to/document.pdf");
                    return;
                }
                
                File pdfFile = new File(resolvedPath);
                if (!pdfFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "PDF file not found: " + pdfPath + " (resolved to: " + resolvedPath + ")");
                    return;
                }

                Uri pdfUri = MediaClipboardUtils.getContentUri(getReactApplicationContext(), pdfFile);
                if (pdfUri != null) {
                    ClipData clip = ClipData.newUri(getReactApplicationContext().getContentResolver(), "pdf", pdfUri);
                    clipboardManager.setPrimaryClip(clip);
                    promise.resolve(null);
                } else {
                    promise.reject("URI_CREATION_ERROR", "Failed to create content URI for PDF");
                }
            } catch (Exception e) {
                promise.reject("COPY_PDF_ERROR", e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void copyAudio(String audioPath, ReadableMap options, Promise promise) {
        executorService.execute(() -> {
            try {
                String resolvedPath = resolveAssetPath(audioPath);
                
                // Check if this is a relative path issue
                if (resolvedPath == null && (audioPath.startsWith("./") || audioPath.startsWith("../") || audioPath.contains("/../") || audioPath.contains("/./"))) {
                    promise.reject("RELATIVE_PATH_ERROR", "Cannot copy from relative path '" + audioPath + "'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/audio.mp3\n2. Use absolute file path: /absolute/path/to/audio.mp3\n3. Use content:// URI: content://provider/path/to/audio.mp3");
                    return;
                }
                
                File audioFile = new File(resolvedPath);
                if (!audioFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Audio file not found: " + audioPath + " (resolved to: " + resolvedPath + ")");
                    return;
                }

                Uri audioUri = MediaClipboardUtils.getContentUri(getReactApplicationContext(), audioFile);
                if (audioUri != null) {
                    ClipData clip = ClipData.newUri(getReactApplicationContext().getContentResolver(), "audio", audioUri);
                    clipboardManager.setPrimaryClip(clip);
                    promise.resolve(null);
                } else {
                    promise.reject("URI_CREATION_ERROR", "Failed to create content URI for audio");
                }
            } catch (Exception e) {
                promise.reject("COPY_AUDIO_ERROR", e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void copyFile(String filePath, String mimeType, ReadableMap options, Promise promise) {
        executorService.execute(() -> {
            try {
                String resolvedPath = resolveAssetPath(filePath);
                
                // Check if this is a relative path issue
                if (resolvedPath == null && (filePath.startsWith("./") || filePath.startsWith("../") || filePath.contains("/../") || filePath.contains("/./"))) {
                    promise.reject("RELATIVE_PATH_ERROR", "Cannot copy from relative path '" + filePath + "'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Convert to base64: data:" + mimeType + ";base64,<your_base64_data>\n2. Use HTTP/HTTPS URL: https://example.com/file\n3. Use absolute file path: /absolute/path/to/file\n4. Use content:// URI: content://provider/path/to/file");
                    return;
                }
                
                File file = new File(resolvedPath);
                if (!file.exists()) {
                    promise.reject("FILE_NOT_FOUND", "File not found: " + filePath + " (resolved to: " + resolvedPath + ")");
                    return;
                }

                Uri fileUri = MediaClipboardUtils.getContentUri(getReactApplicationContext(), file);
                if (fileUri != null) {
                    ClipData clip = ClipData.newUri(getReactApplicationContext().getContentResolver(), "file", fileUri);
                    clipboardManager.setPrimaryClip(clip);
                    promise.resolve(null);
                } else {
                    promise.reject("URI_CREATION_ERROR", "Failed to create content URI for file");
                }
            } catch (Exception e) {
                promise.reject("COPY_FILE_ERROR", e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void copyLargeFile(String filePath, String mimeType, ReadableMap options, Promise promise) {
        executorService.execute(() -> {
            try {
                String resolvedPath = resolveAssetPath(filePath);
                
                // Check if this is a relative path issue
                if (resolvedPath == null && (filePath.startsWith("./") || filePath.startsWith("../") || filePath.contains("/../") || filePath.contains("/./"))) {
                    promise.reject("RELATIVE_PATH_ERROR", "Cannot copy from relative path '" + filePath + "'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Convert to base64: data:" + mimeType + ";base64,<your_base64_data>\n2. Use HTTP/HTTPS URL: https://example.com/file\n3. Use absolute file path: /absolute/path/to/file\n4. Use content:// URI: content://provider/path/to/file");
                    return;
                }
                
                File file = new File(resolvedPath);
                if (!file.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Large file not found: " + filePath + " (resolved to: " + resolvedPath + ")");
                    return;
                }

                // For large files, we might want to implement progress tracking
                // For now, we'll treat it the same as regular file copy
                Uri fileUri = MediaClipboardUtils.getContentUri(getReactApplicationContext(), file);
                if (fileUri != null) {
                    ClipData clip = ClipData.newUri(getReactApplicationContext().getContentResolver(), "file", fileUri);
                    clipboardManager.setPrimaryClip(clip);
                    promise.resolve(null);
                } else {
                    promise.reject("URI_CREATION_ERROR", "Failed to create content URI for large file");
                }
            } catch (Exception e) {
                promise.reject("COPY_LARGE_FILE_ERROR", e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void hasContent(Promise promise) {
        try {
            boolean hasContent = clipboardManager.hasPrimaryClip() &&
                    clipboardManager.getPrimaryClip() != null &&
                    clipboardManager.getPrimaryClip().getItemCount() > 0;
            promise.resolve(hasContent);
        } catch (Exception e) {
            promise.reject("HAS_CONTENT_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getContent(Promise promise) {
        try {
            ClipData clip = clipboardManager.getPrimaryClip();
            WritableMap result = Arguments.createMap();

            if (clip == null || clip.getItemCount() == 0) {
                result.putString("type", "unknown");
                promise.resolve(result);
                return;
            }

            ClipData.Item item = clip.getItemAt(0);

            if (item.getText() != null) {
                result.putString("type", "text");
                result.putString("data", item.getText().toString());
            } else if (item.getUri() != null) {
                Uri uri = item.getUri();
                ContentResolver resolver = getReactApplicationContext().getContentResolver();
                String mimeType = resolver.getType(uri);

                if (mimeType != null) {
                    if (mimeType.startsWith("image/")) {
                        result.putString("type", "image");
                    } else if (mimeType.startsWith("video/")) {
                        result.putString("type", "video");
                    } else if (mimeType.startsWith("audio/")) {
                        result.putString("type", "audio");
                    } else if (mimeType.equals("application/pdf")) {
                        result.putString("type", "pdf");
                    } else {
                        result.putString("type", "file");
                    }
                    result.putString("mimeType", mimeType);
                } else {
                    result.putString("type", "file");
                }
            } else {
                result.putString("type", "unknown");
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("GET_CONTENT_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void clear(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                clipboardManager.clearPrimaryClip();
            } else {
                // For older versions, set an empty clip
                ClipData emptyClip = ClipData.newPlainText("", "");
                clipboardManager.setPrimaryClip(emptyClip);
            }
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("CLEAR_ERROR", e.getMessage(), e);
        }
    }

    /**
     * Resolve React Native asset paths to actual file system paths or handle URLs
     */
    private String resolveAssetPath(String path) {
        // Handle HTTP/HTTPS URLs - download and cache them
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return downloadAndCacheFile(path);
        }
        
        // If it's already an absolute path, return as-is
        if (path.startsWith("/")) {
            return path;
        }

        // Check for relative paths with dots - these are ambiguous and should be rejected
        if (path.startsWith("./") || path.startsWith("../") || path.contains("/../") || path.contains("/./")) {
            android.util.Log.e("MediaClipboard", "ERROR: Relative paths with dots are not supported: " + path);
            return null; // This will cause the calling method to show an error
        }
        
        // Use the path as-is since dots have already been checked and rejected
        String cleanPath = path;

        // Get Android app directories
        Context context = getReactApplicationContext();
        File[] basePaths = {
            context.getFilesDir(),                          // Internal storage files directory
            context.getExternalFilesDir(null),              // External storage files directory
            context.getCacheDir(),                          // Internal cache directory
            context.getExternalCacheDir(),                  // External cache directory
            new File(context.getFilesDir(), "assets"),      // Custom assets directory
            new File(context.getFilesDir(), "www"),         // Web assets directory
            new File(context.getFilesDir(), "public"),      // Public directory
            context.getDataDir()                            // App data directory
        };

        // Common subdirectory patterns for React Native assets
        String[] subPaths = {
            cleanPath,                          // Direct path
            "assets/" + cleanPath,              // assets/
            "src/assets/" + cleanPath,          // src/assets/
            "app/assets/" + cleanPath,          // app/assets/
            "resources/" + cleanPath,           // resources/
            "www/" + cleanPath,                 // www/
            "public/" + cleanPath,              // public/
            "static/" + cleanPath               // static/
        };

        // Try all combinations of base paths and sub paths
        for (File basePath : basePaths) {
            if (basePath != null) {
                for (String subPath : subPaths) {
                    File testFile = new File(basePath, subPath);
                    if (testFile.exists()) {
                        android.util.Log.d("MediaClipboard", "Found asset at: " + testFile.getAbsolutePath());
                        return testFile.getAbsolutePath();
                    }
                }
            }
        }

        android.util.Log.d("MediaClipboard", "Asset not found, using original path: " + path);
        // If not found in any location, return the original path (might be absolute or in a different location)
        return path;
    }

    /**
     * Download file from HTTP/HTTPS URL and cache it locally
     */
    private String downloadAndCacheFile(String urlString) {
        try {
            android.util.Log.d("MediaClipboard", "Downloading from URL: " + urlString);
            
            java.net.URL url = new java.net.URL(urlString);
            java.net.URLConnection connection = url.openConnection();
            connection.setConnectTimeout(10000); // 10 second timeout
            connection.setReadTimeout(30000);    // 30 second read timeout
            
            // Get file extension from URL or content type
            String fileName = "downloaded_file";
            String urlPath = url.getPath();
            if (urlPath != null && urlPath.contains(".")) {
                fileName = urlPath.substring(urlPath.lastIndexOf("/") + 1);
                if (fileName.length() > 50) { // Limit filename length
                    fileName = "file_" + System.currentTimeMillis() + fileName.substring(fileName.lastIndexOf("."));
                }
            } else {
                // Try to get extension from content type
                String contentType = connection.getContentType();
                if (contentType != null) {
                    if (contentType.startsWith("image/")) {
                        fileName += ".jpg"; // Default image extension
                    } else if (contentType.startsWith("video/")) {
                        fileName += ".mp4"; // Default video extension
                    } else if (contentType.startsWith("audio/")) {
                        fileName += ".mp3"; // Default audio extension
                    } else if (contentType.equals("application/pdf")) {
                        fileName += ".pdf";
                    }
                }
            }
            
            // Create cache file
            File cacheDir = getReactApplicationContext().getCacheDir();
            File cacheFile = new File(cacheDir, "clipboard_" + fileName);
            
            // Download file
            java.io.InputStream inputStream = connection.getInputStream();
            java.io.FileOutputStream outputStream = new java.io.FileOutputStream(cacheFile);
            
            byte[] buffer = new byte[8192];
            int bytesRead;
            long totalBytes = 0;
            
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
                totalBytes += bytesRead;
            }
            
            inputStream.close();
            outputStream.close();
            
            android.util.Log.d("MediaClipboard", "Downloaded " + totalBytes + " bytes to: " + cacheFile.getAbsolutePath());
            return cacheFile.getAbsolutePath();
            
        } catch (Exception e) {
            android.util.Log.e("MediaClipboard", "Failed to download from URL: " + urlString, e);
            return urlString; // Return original URL so error message shows the URL
        }
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdown();
        }
    }
} 