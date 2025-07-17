package com.mediaclipboard;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.webkit.MimeTypeMap;
import androidx.core.content.FileProvider;

import java.io.File;

public class MediaClipboardUtils {

    private static final String FILE_PROVIDER_AUTHORITY = ".mediaclipboard.fileprovider";

    /**
     * Get content URI for a file, handling different Android versions and storage access
     */
    public static Uri getContentUri(Context context, File file) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // Use FileProvider for Android 7.0+
                String authority = context.getPackageName() + FILE_PROVIDER_AUTHORITY;
                android.util.Log.d("MediaClipboard", "Using FileProvider authority: " + authority);
                android.util.Log.d("MediaClipboard", "File path: " + file.getAbsolutePath());
                android.util.Log.d("MediaClipboard", "File exists: " + file.exists());
                android.util.Log.d("MediaClipboard", "File readable: " + file.canRead());
                
                Uri uri = FileProvider.getUriForFile(context, authority, file);
                android.util.Log.d("MediaClipboard", "Generated FileProvider URI: " + uri.toString());
                
                // Grant temporary read permission to the clipboard system
                // This helps prevent "exposed beyond app" errors
                if (uri != null) {
                    context.grantUriPermission("com.android.systemui", uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    // Grant permission to common clipboard handlers
                    try {
                        context.grantUriPermission("android", uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    } catch (Exception e) {
                        // Ignore if this fails, it's not critical
                        android.util.Log.d("MediaClipboard", "Could not grant permission to android system: " + e.getMessage());
                    }
                }
                
                return uri;
            } else {
                // Use file URI for older versions
                android.util.Log.d("MediaClipboard", "Using file URI for Android < 7.0");
                return Uri.fromFile(file);
            }
        } catch (Exception e) {
            android.util.Log.e("MediaClipboard", "Error creating content URI", e);
            // Fallback to file URI if FileProvider fails
            return Uri.fromFile(file);
        }
    }

    /**
     * Get MIME type for a file
     */
    public static String getMimeType(String filePath) {
        String extension = getFileExtension(filePath);
        if (extension != null) {
            return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
        }
        return "application/octet-stream"; // Default MIME type
    }

    /**
     * Get file extension from file path
     */
    private static String getFileExtension(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return null;
        }
        
        int lastDotIndex = filePath.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filePath.length() - 1) {
            return filePath.substring(lastDotIndex + 1).toLowerCase();
        }
        return null;
    }

    /**
     * Check if file is an image based on MIME type
     */
    public static boolean isImageFile(String filePath) {
        String mimeType = getMimeType(filePath);
        return mimeType != null && mimeType.startsWith("image/");
    }

    /**
     * Check if file is a video based on MIME type
     */
    public static boolean isVideoFile(String filePath) {
        String mimeType = getMimeType(filePath);
        return mimeType != null && mimeType.startsWith("video/");
    }

    /**
     * Check if file is an audio file based on MIME type
     */
    public static boolean isAudioFile(String filePath) {
        String mimeType = getMimeType(filePath);
        return mimeType != null && mimeType.startsWith("audio/");
    }

    /**
     * Check if file is a PDF based on MIME type
     */
    public static boolean isPdfFile(String filePath) {
        String mimeType = getMimeType(filePath);
        return "application/pdf".equals(mimeType);
    }
} 