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
                File imageFile = new File(imagePath);
                if (!imageFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Image file not found: " + imagePath);
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
                File videoFile = new File(videoPath);
                if (!videoFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Video file not found: " + videoPath);
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
                File pdfFile = new File(pdfPath);
                if (!pdfFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "PDF file not found: " + pdfPath);
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
                File audioFile = new File(audioPath);
                if (!audioFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Audio file not found: " + audioPath);
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
                File file = new File(filePath);
                if (!file.exists()) {
                    promise.reject("FILE_NOT_FOUND", "File not found: " + filePath);
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
                File file = new File(filePath);
                if (!file.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Large file not found: " + filePath);
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

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdown();
        }
    }
} 