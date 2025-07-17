package com.mediaclipboard;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.ContentResolver;
import android.content.Intent;
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
import com.facebook.react.module.annotations.ReactModule;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import android.util.Base64;
import java.util.ArrayList;
import java.util.List;
import android.content.ClipDescription;
import com.facebook.react.bridge.Invalidatable;

public class MediaClipboardModule extends ReactContextBaseJavaModule implements Invalidatable {

    private static final String MODULE_NAME = "MediaClipboard";
    private ClipboardManager clipboardManager;
    private ExecutorService executorService;
    private List<File> temporaryFiles; // Track temporary files for cleanup

    public MediaClipboardModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.clipboardManager = (ClipboardManager) reactContext.getSystemService(Context.CLIPBOARD_SERVICE);
        this.executorService = Executors.newCachedThreadPool();
        this.temporaryFiles = new ArrayList<>();
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
                // Handle base64 data URI
                if (imagePath.startsWith("data:image/")) {
                    handleBase64Image(imagePath, options, promise);
                    return;
                }
                
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
                    String mimeType = MediaClipboardUtils.getMimeType(imageFile.getAbsolutePath());
                    
                    // Create ClipData with proper permissions for FileProvider URIs
                    ClipData clip = createClipDataForImage(imageUri, mimeType);
                    
                    if (clip != null) {
                        clipboardManager.setPrimaryClip(clip);
                        
                        // Show success notification if requested
                        if (options != null && options.hasKey("showNotification") && options.getBoolean("showNotification")) {
                            android.util.Log.d("MediaClipboard", "Image copied to clipboard successfully");
                        }
                        
                        promise.resolve(null);
                    } else {
                        promise.reject("CLIPDATA_CREATION_ERROR", "Failed to create ClipData for image");
                    }
                } else {
                    promise.reject("URI_CREATION_ERROR", "Failed to create content URI for image");
                }
            } catch (Exception e) {
                promise.reject("COPY_IMAGE_ERROR", e.getMessage(), e);
            }
        });
    }

    /**
     * Handle base64 data URI images
     */
    private void handleBase64Image(String dataUri, ReadableMap options, Promise promise) {
        try {
            // Clean up old temp files before creating new ones
            cleanupOldTempFiles();
            
            // Parse the data URI: data:image/png;base64,iVBORw0K...
            if (!dataUri.contains(";base64,")) {
                promise.reject("INVALID_BASE64", "Invalid base64 data URI format. Expected format: data:image/type;base64,<data>");
                return;
            }
            
            String[] parts = dataUri.split(";base64,");
            if (parts.length != 2) {
                promise.reject("INVALID_BASE64", "Invalid base64 data URI format. Expected format: data:image/type;base64,<data>");
                return;
            }
            
            // Extract MIME type (e.g., "image/png" from "data:image/png;base64,...")
            String mimeTypePart = parts[0];
            if (!mimeTypePart.startsWith("data:")) {
                promise.reject("INVALID_BASE64", "Invalid data URI - must start with 'data:'");
                return;
            }
            String mimeType = mimeTypePart.substring(5); // Remove "data:" prefix
            
            // Get file extension from MIME type
            String extension = "jpg"; // default
            if (mimeType.equals("image/png")) {
                extension = "png";
            } else if (mimeType.equals("image/gif")) {
                extension = "gif";
            } else if (mimeType.equals("image/webp")) {
                extension = "webp";
            } else if (mimeType.equals("image/bmp")) {
                extension = "bmp";
            } else if (mimeType.equals("image/jpeg")) {
                extension = "jpg";
            } else if (mimeType.equals("image/svg+xml")) {
                extension = "svg";
            }
            
            // Decode base64 data
            String base64Data = parts[1];
            byte[] imageData;
            try {
                imageData = Base64.decode(base64Data, Base64.DEFAULT);
            } catch (IllegalArgumentException e) {
                promise.reject("BASE64_DECODE_ERROR", "Failed to decode base64 data: " + e.getMessage());
                return;
            }
            
            if (imageData.length == 0) {
                promise.reject("BASE64_DECODE_ERROR", "Decoded base64 data is empty");
                return;
            }
            
            // Create temporary file
            File cacheDir = getReactApplicationContext().getCacheDir();
            String filename = createTempFileName("clipboard_image", extension);
            File tempFile = new File(cacheDir, filename);
            temporaryFiles.add(tempFile); // Add to list for cleanup
            
            // Write decoded data to temporary file
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.write(imageData);
                fos.flush();
            }
            
            android.util.Log.d("MediaClipboard", "Created temporary image file: " + tempFile.getAbsolutePath() + " (" + imageData.length + " bytes)");
            
            // Create content URI and copy to clipboard
            Uri imageUri = MediaClipboardUtils.getContentUri(getReactApplicationContext(), tempFile);
            if (imageUri != null) {
                // Create ClipData with proper permissions for FileProvider URIs
                ClipData clip = createClipDataForImage(imageUri, mimeType);
                
                if (clip != null) {
                    clipboardManager.setPrimaryClip(clip);
                    
                    // Show success notification if requested
                    if (options != null && options.hasKey("showNotification") && options.getBoolean("showNotification")) {
                        android.util.Log.d("MediaClipboard", "Base64 image copied to clipboard successfully");
                    }
                    
                    promise.resolve(null);
                } else {
                    promise.reject("CLIPDATA_CREATION_ERROR", "Failed to create ClipData for base64 image");
                }
            } else {
                promise.reject("URI_CREATION_ERROR", "Failed to create content URI for base64 image");
            }
            
        } catch (Exception e) {
            android.util.Log.e("MediaClipboard", "Error handling base64 image", e);
            promise.reject("BASE64_IMAGE_ERROR", "Failed to process base64 image: " + e.getMessage(), e);
        }
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
            
            // Clean up old temp files before downloading new ones
            cleanupOldTempFiles();
            
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
                    String extension = "";
                    if (fileName.contains(".")) {
                        extension = fileName.substring(fileName.lastIndexOf("."));
                    }
                    fileName = "file_" + System.currentTimeMillis() + extension;
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
            
            // Create cache file with unique name
            File cacheDir = getReactApplicationContext().getCacheDir();
            String prefix = "clipboard";
            String extension = "";
            if (fileName.contains(".")) {
                extension = fileName.substring(fileName.lastIndexOf(".") + 1);
                prefix += "_" + fileName.substring(0, fileName.lastIndexOf("."));
            } else {
                prefix += "_" + fileName;
                extension = "dat"; // Default extension
            }
            
            String uniqueFileName = createTempFileName(prefix, extension);
            File cacheFile = new File(cacheDir, uniqueFileName);
            temporaryFiles.add(cacheFile); // Add to list for cleanup
            
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

    /**
     * Clean up old temporary files to prevent cache bloat
     */
    private void cleanupOldTempFiles() {
        try {
            File cacheDir = getReactApplicationContext().getCacheDir();
            File[] files = cacheDir.listFiles();
            if (files != null) {
                long currentTime = System.currentTimeMillis();
                for (File file : files) {
                    // Delete files older than 1 hour and starting with "clipboard_"
                    if (file.getName().startsWith("clipboard_") && 
                        (currentTime - file.lastModified()) > 3600000) { // 1 hour in milliseconds
                        if (file.delete()) {
                            android.util.Log.d("MediaClipboard", "Cleaned up old temp file: " + file.getName());
                        }
                    }
                }
            }
        } catch (Exception e) {
            android.util.Log.e("MediaClipboard", "Error cleaning up temp files", e);
        }
    }

    /**
     * Create a unique temporary file name
     */
    private String createTempFileName(String prefix, String extension) {
        return prefix + "_" + System.currentTimeMillis() + "_" + Math.random() * 1000 + "." + extension;
    }

    /**
     * Alternative method to create a content URI by inserting into MediaStore
     * This can be used as a fallback when FileProvider URIs cause issues
     */
    private Uri createMediaStoreUri(File imageFile, String mimeType) {
        try {
            ContentResolver resolver = getReactApplicationContext().getContentResolver();
            
            // For Android 10+ (API 29+), we stick with FileProvider as it's more secure
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // For newer Android versions, we'll stick with FileProvider as it's more secure
                return null;
            }
            
            // For older versions, we could use MediaStore.Images.Media.insertImage
            // but this requires WRITE_EXTERNAL_STORAGE permission and isn't recommended
            return null;
            
        } catch (Exception e) {
            android.util.Log.e("MediaClipboard", "Failed to create MediaStore URI", e);
            return null;
        }
    }

    /**
     * Enhanced method to create ClipData with better error handling and fallbacks
     */
    private ClipData createClipDataForImage(Uri imageUri, String mimeType) {
        try {
            ClipData clip;
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // For Android 7.0+, use ClipData.Item with explicit URI permissions
                ClipData.Item item = new ClipData.Item(imageUri);
                ClipDescription description = new ClipDescription("image", new String[]{mimeType != null ? mimeType : "image/*"});
                clip = new ClipData(description, item);
                
                // Grant read permission to multiple potential clipboard consumers
                Context context = getReactApplicationContext();
                int flags = Intent.FLAG_GRANT_READ_URI_PERMISSION;
                
                // Grant permissions to common clipboard and system processes
                String[] clipboardPackages = {
                    "com.android.systemui",     // System UI (clipboard)
                    "android",                  // Android system
                    "com.android.providers.media", // Media provider
                    context.getPackageName()    // Our own app
                };
                
                for (String packageName : clipboardPackages) {
                    try {
                        context.grantUriPermission(packageName, imageUri, flags);
                        android.util.Log.d("MediaClipboard", "Granted URI permission to: " + packageName);
                    } catch (Exception e) {
                        android.util.Log.d("MediaClipboard", "Could not grant permission to " + packageName + ": " + e.getMessage());
                    }
                }
                
                // ClipData created with proper MIME type and permissions
                android.util.Log.d("MediaClipboard", "Created ClipData with URI: " + imageUri.toString());
                
            } else {
                // For older Android versions, use the standard approach
                clip = ClipData.newUri(getReactApplicationContext().getContentResolver(), "image", imageUri);
            }
            
            return clip;
            
        } catch (Exception e) {
            android.util.Log.e("MediaClipboard", "Error creating ClipData", e);
            return null;
        }
    }

    @Override
    public void invalidate() {
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdown();
        }
        // Clean up temporary files on module destroy
        for (File tempFile : temporaryFiles) {
            if (tempFile.exists()) {
                if (tempFile.delete()) {
                    android.util.Log.d("MediaClipboard", "Deleted temporary file: " + tempFile.getName());
                } else {
                    android.util.Log.e("MediaClipboard", "Failed to delete temporary file: " + tempFile.getName());
                }
            }
        }
        temporaryFiles.clear(); // Clear the list after cleanup
    }
} 