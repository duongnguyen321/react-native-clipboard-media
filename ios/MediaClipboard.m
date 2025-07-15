#import "MediaClipboard.h"
#import <React/RCTLog.h>
#import <UIKit/UIKit.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>
#import <MobileCoreServices/MobileCoreServices.h>

@implementation MediaClipboard

RCT_EXPORT_MODULE()

// Indicate that this module wants to be initialized on the main queue
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

#pragma mark - React Native Methods

RCT_EXPORT_METHOD(copyText:(NSString *)text
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIPasteboard.generalPasteboard.string = text;
    resolve(nil);
  });
}

RCT_EXPORT_METHOD(copyImage:(NSString *)imagePath
                  options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      UIImage *image = [self loadImageFromPath:imagePath];
      if (image) {
        dispatch_async(dispatch_get_main_queue(), ^{
          UIPasteboard.generalPasteboard.image = image;
          resolve(nil);
        });
      } else {
        NSString *resolvedPath = [self normalizeFilePath:imagePath];
        NSString *errorMessage;
        
        // Check if this is a relative path issue
        if (!resolvedPath && ([imagePath hasPrefix:@"./"] || [imagePath hasPrefix:@"../"] || [imagePath containsString:@"/../"] || [imagePath containsString:@"/./"]) ) {
          errorMessage = [NSString stringWithFormat:@"Cannot copy from relative path '%@'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Convert to base64: data:image/jpeg;base64,<your_base64_data>\n2. Use HTTP/HTTPS URL: https://example.com/image.jpg\n3. Use absolute file path: /absolute/path/to/image.jpg\n4. Use file:// URL: file:///absolute/path/to/image.jpg", imagePath];
        } else {
          errorMessage = resolvedPath ? 
            [NSString stringWithFormat:@"Cannot copy image from resolved path: %@", resolvedPath] :
            [NSString stringWithFormat:@"Cannot resolve or copy image from path: %@", imagePath];
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
          reject(@"COPY_IMAGE_ERROR", errorMessage, nil);
        });
      }
    } @catch (NSException *exception) {
      dispatch_async(dispatch_get_main_queue(), ^{
        reject(@"COPY_IMAGE_ERROR", exception.reason, nil);
      });
    }
  });
}

RCT_EXPORT_METHOD(copyVideo:(NSString *)videoPath
                  options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSData *videoData = [self loadFileDataFromPath:videoPath];
      if (videoData) {
        dispatch_async(dispatch_get_main_queue(), ^{
          if (@available(iOS 14.0, *)) {
            UIPasteboard.generalPasteboard.items = @[@{UTTypeMovie.identifier: videoData}];
          } else {
            [UIPasteboard.generalPasteboard setData:videoData forPasteboardType:(__bridge NSString *)kUTTypeMovie];
          }
          resolve(nil);
        });
      } else {
        NSString *errorMessage;
        
        // Check if this is a relative path issue
        if ([videoPath hasPrefix:@"./"] || [videoPath hasPrefix:@"../"] || [videoPath containsString:@"/../"] || [videoPath containsString:@"/./"]) {
          errorMessage = [NSString stringWithFormat:@"Cannot copy from relative path '%@'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/video.mp4\n2. Use absolute file path: /absolute/path/to/video.mp4\n3. Use file:// URL: file:///absolute/path/to/video.mp4", videoPath];
        } else {
          errorMessage = [NSString stringWithFormat:@"Failed to load video from path: %@", videoPath];
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
          reject(@"COPY_VIDEO_ERROR", errorMessage, nil);
        });
      }
    } @catch (NSException *exception) {
      dispatch_async(dispatch_get_main_queue(), ^{
        reject(@"COPY_VIDEO_ERROR", exception.reason, nil);
      });
    }
  });
}

RCT_EXPORT_METHOD(copyPDF:(NSString *)pdfPath
                 options:(NSDictionary *)options
                withResolver:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSData *pdfData = [self loadFileDataFromPath:pdfPath];
      if (pdfData) {
        dispatch_async(dispatch_get_main_queue(), ^{
          if (@available(iOS 14.0, *)) {
            UIPasteboard.generalPasteboard.items = @[@{UTTypePDF.identifier: pdfData}];
          } else {
            [UIPasteboard.generalPasteboard setData:pdfData forPasteboardType:(__bridge NSString *)kUTTypePDF];
          }
          resolve(nil);
        });
      } else {
        NSString *errorMessage;
        
        // Check if this is a relative path issue
        if ([pdfPath hasPrefix:@"./"] || [pdfPath hasPrefix:@"../"] || [pdfPath containsString:@"/../"] || [pdfPath containsString:@"/./"]) {
          errorMessage = [NSString stringWithFormat:@"Cannot copy from relative path '%@'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/document.pdf\n2. Use absolute file path: /absolute/path/to/document.pdf\n3. Use file:// URL: file:///absolute/path/to/document.pdf", pdfPath];
        } else {
          errorMessage = [NSString stringWithFormat:@"Failed to load PDF from path: %@", pdfPath];
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
          reject(@"COPY_PDF_ERROR", errorMessage, nil);
        });
      }
    } @catch (NSException *exception) {
      dispatch_async(dispatch_get_main_queue(), ^{
        reject(@"COPY_PDF_ERROR", exception.reason, nil);
      });
    }
  });
}

RCT_EXPORT_METHOD(copyAudio:(NSString *)audioPath
                  options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSData *audioData = [self loadFileDataFromPath:audioPath];
      if (audioData) {
        NSString *audioType = [self getAudioUTTypeForPath:audioPath];
        dispatch_async(dispatch_get_main_queue(), ^{
          if (@available(iOS 14.0, *)) {
            UIPasteboard.generalPasteboard.items = @[@{audioType: audioData}];
          } else {
            [UIPasteboard.generalPasteboard setData:audioData forPasteboardType:audioType];
          }
          resolve(nil);
        });
      } else {
        NSString *errorMessage;
        
        // Check if this is a relative path issue
        if ([audioPath hasPrefix:@"./"] || [audioPath hasPrefix:@"../"] || [audioPath containsString:@"/../"] || [audioPath containsString:@"/./"]) {
          errorMessage = [NSString stringWithFormat:@"Cannot copy from relative path '%@'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Use HTTP/HTTPS URL: https://example.com/audio.mp3\n2. Use absolute file path: /absolute/path/to/audio.mp3\n3. Use file:// URL: file:///absolute/path/to/audio.mp3", audioPath];
        } else {
          errorMessage = [NSString stringWithFormat:@"Failed to load audio from path: %@", audioPath];
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
          reject(@"COPY_AUDIO_ERROR", errorMessage, nil);
        });
      }
    } @catch (NSException *exception) {
      dispatch_async(dispatch_get_main_queue(), ^{
        reject(@"COPY_AUDIO_ERROR", exception.reason, nil);
      });
    }
  });
}

RCT_EXPORT_METHOD(copyFile:(NSString *)filePath
                  mimeType:(NSString *)mimeType
                  options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSData *fileData = [self loadFileDataFromPath:filePath];
      if (fileData) {
        NSString *utType = [self getUTTypeForMimeType:mimeType];
        dispatch_async(dispatch_get_main_queue(), ^{
          if (@available(iOS 14.0, *)) {
            UIPasteboard.generalPasteboard.items = @[@{utType: fileData}];
          } else {
            [UIPasteboard.generalPasteboard setData:fileData forPasteboardType:utType];
          }
          resolve(nil);
        });
      } else {
        NSString *errorMessage;
        
        // Check if this is a relative path issue
        if ([filePath hasPrefix:@"./"] || [filePath hasPrefix:@"../"] || [filePath containsString:@"/../"] || [filePath containsString:@"/./"]) {
          errorMessage = [NSString stringWithFormat:@"Cannot copy from relative path '%@'. Relative paths like './' and '../' are not supported. Please use one of these alternatives:\n1. Convert to base64: data:%@;base64,<your_base64_data>\n2. Use HTTP/HTTPS URL: https://example.com/file\n3. Use absolute file path: /absolute/path/to/file\n4. Use file:// URL: file:///absolute/path/to/file", filePath, mimeType];
        } else {
          errorMessage = [NSString stringWithFormat:@"Failed to load file from path: %@", filePath];
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
          reject(@"COPY_FILE_ERROR", errorMessage, nil);
        });
      }
    } @catch (NSException *exception) {
      dispatch_async(dispatch_get_main_queue(), ^{
        reject(@"COPY_FILE_ERROR", exception.reason, nil);
      });
    }
  });
}

RCT_EXPORT_METHOD(copyLargeFile:(NSString *)filePath
                       mimeType:(NSString *)mimeType
                       options:(NSDictionary *)options
                      withResolver:(RCTPromiseResolveBlock)resolve
                      withRejecter:(RCTPromiseRejectBlock)reject)
{
  // For large files, we'll use the same implementation as copyFile for simplicity
  [self copyFile:filePath mimeType:mimeType options:options withResolver:resolve withRejecter:reject];
}

RCT_EXPORT_METHOD(hasContent:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    BOOL hasContent = UIPasteboard.generalPasteboard.items.count > 0;
    resolve(@(hasContent));
  });
}

RCT_EXPORT_METHOD(getContent:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIPasteboard *pasteboard = UIPasteboard.generalPasteboard;
    NSMutableDictionary *content = [NSMutableDictionary dictionary];
    
    if (pasteboard.string) {
      content[@"type"] = @"text";
      content[@"data"] = pasteboard.string;
    } else if (pasteboard.image) {
      content[@"type"] = @"image";
      NSData *imageData = UIImagePNGRepresentation(pasteboard.image);
      if (imageData) {
        content[@"size"] = @(imageData.length);
      }
    } else if (pasteboard.hasImages) {
      content[@"type"] = @"image";
    } else if (pasteboard.hasURLs) {
      content[@"type"] = @"text";
      content[@"data"] = pasteboard.URL.absoluteString;
    } else if (pasteboard.items.count > 0) {
      content[@"type"] = @"file";
      content[@"size"] = @(pasteboard.items.count);
    } else {
      content[@"type"] = @"unknown";
    }
    
    resolve(content);
  });
}

RCT_EXPORT_METHOD(clear:(RCTPromiseResolveBlock)resolve
          withRejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIPasteboard.generalPasteboard.items = @[];
    resolve(nil);
  });
}

#pragma mark - Helper Methods

- (UIImage *)loadImageFromPath:(NSString *)path {
  // Handle base64 data URLs
  if ([path hasPrefix:@"data:image/"]) {
    NSRange range = [path rangeOfString:@","];
    if (range.location != NSNotFound) {
      NSString *base64String = [path substringFromIndex:range.location + 1];
      NSData *data = [[NSData alloc] initWithBase64EncodedString:base64String options:NSDataBase64DecodingIgnoreUnknownCharacters];
      return [UIImage imageWithData:data];
    }
    return nil;
  }
  
  // Handle HTTP/HTTPS URLs
  if ([path hasPrefix:@"http://"] || [path hasPrefix:@"https://"]) {
    return [self loadImageFromURL:path];
  }
  
  // Normalize file path and handle different URI schemes
  NSString *normalizedPath = [self normalizeFilePath:path];
  if (!normalizedPath) {
    NSLog(@"[MediaClipboard] Failed to resolve path: %@ -> null", path);
    return nil;
  }
  
  UIImage *image = [UIImage imageWithContentsOfFile:normalizedPath];
  if (!image) {
    NSLog(@"[MediaClipboard] Failed to load image from resolved path: %@", normalizedPath);
  }
  
  return image;
}

- (NSData *)loadFileDataFromPath:(NSString *)path {
  // Handle HTTP/HTTPS URLs
  if ([path hasPrefix:@"http://"] || [path hasPrefix:@"https://"]) {
    return [self loadDataFromURL:path];
  }
  
  // Normalize file path and handle different URI schemes
  NSString *normalizedPath = [self normalizeFilePath:path];
  if (!normalizedPath) {
    NSLog(@"[MediaClipboard] Failed to resolve path: %@ -> null", path);
    return nil;
  }
  
  if (![[NSFileManager defaultManager] fileExistsAtPath:normalizedPath]) {
    NSLog(@"[MediaClipboard] File does not exist at resolved path: %@", normalizedPath);
    return nil;
  }
  
  NSData *data = [NSData dataWithContentsOfFile:normalizedPath];
  if (!data) {
    NSLog(@"[MediaClipboard] Failed to load data from resolved path: %@", normalizedPath);
  }
  
  return data;
}

- (NSString *)getUTTypeForMimeType:(NSString *)mimeType {
  if (@available(iOS 14.0, *)) {
    UTType *utType = [UTType typeWithMIMEType:mimeType];
    return utType ? utType.identifier : UTTypeData.identifier;
  } else {
    // Fallback for older iOS versions
    if ([mimeType isEqualToString:@"image/jpeg"] || [mimeType isEqualToString:@"image/jpg"]) {
      return (__bridge NSString *)kUTTypeJPEG;
    } else if ([mimeType isEqualToString:@"image/png"]) {
      return (__bridge NSString *)kUTTypePNG;
    } else if ([mimeType isEqualToString:@"video/mp4"]) {
      return (__bridge NSString *)kUTTypeMPEG4;
    } else if ([mimeType isEqualToString:@"application/pdf"]) {
      return (__bridge NSString *)kUTTypePDF;
    } else if ([mimeType isEqualToString:@"audio/mpeg"] || [mimeType isEqualToString:@"audio/mp3"]) {
      return (__bridge NSString *)kUTTypeMP3;
    } else if ([mimeType isEqualToString:@"audio/wav"]) {
      return (__bridge NSString *)kUTTypeWaveformAudio;
    }
    return (__bridge NSString *)kUTTypeData;
  }
}

- (NSString *)getAudioUTTypeForPath:(NSString *)audioPath {
  NSString *pathExtension = [audioPath.pathExtension lowercaseString];
  
  if (@available(iOS 14.0, *)) {
    if ([pathExtension isEqualToString:@"mp3"]) {
      return UTTypeMP3.identifier;
    } else if ([pathExtension isEqualToString:@"wav"]) {
      return UTTypeWAV.identifier;
    } else if ([pathExtension isEqualToString:@"m4a"]) {
      return UTTypeMPEG4Audio.identifier;
    } else if ([pathExtension isEqualToString:@"aac"]) {
      return [UTType typeWithIdentifier:@"public.aac"].identifier;
    }
    return UTTypeAudio.identifier;
  } else {
    if ([pathExtension isEqualToString:@"mp3"]) {
      return (__bridge NSString *)kUTTypeMP3;
    } else if ([pathExtension isEqualToString:@"wav"]) {
      return (__bridge NSString *)kUTTypeWaveformAudio;
    } else if ([pathExtension isEqualToString:@"m4a"]) {
      return (__bridge NSString *)kUTTypeMPEG4Audio;
    }
    return (__bridge NSString *)kUTTypeAudio;
  }
}

- (NSString *)normalizeFilePath:(NSString *)path {
  if (!path || path.length == 0) {
    return nil;
  }
  
  // Handle file:// URLs
  if ([path hasPrefix:@"file://"]) {
    NSURL *url = [NSURL URLWithString:path];
    return url.path;
  }
  
  // Handle content:// URLs (Android-style, but sometimes passed to iOS)
  if ([path hasPrefix:@"content://"]) {
    // Content URLs are not directly supported on iOS, but we can try to extract the path
    // This is mainly for compatibility if Android paths are mistakenly passed to iOS
    NSLog(@"Warning: content:// URLs are not supported on iOS: %@", path);
    return nil;
  }
  
  // Handle React Native asset paths (relative paths that might be bundle resources)
  if (![path hasPrefix:@"/"] && ![path hasPrefix:@"file://"] && ![path hasPrefix:@"data:"]) {
    NSLog(@"[MediaClipboard] Processing relative path: %@", path);
    
    // Check for relative paths with dots - these are ambiguous and should be rejected
    if ([path hasPrefix:@"./"] || [path hasPrefix:@"../"] || [path containsString:@"/../"] || [path containsString:@"/./"]) {
      NSLog(@"[MediaClipboard] ERROR: Relative paths with dots are not supported: %@", path);
      return nil; // This will cause the calling method to show an error
    }
    
    // Try multiple resolution strategies for React Native assets
    NSString *resolvedPath = [self resolveReactNativeAssetPath:path];
    if (resolvedPath) {
      return resolvedPath;
    }
    
    NSLog(@"[MediaClipboard] Asset resolution failed, using Documents directory fallback");
    // Fallback: treat as relative path in Documents directory
    NSString *documentsPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
    return [documentsPath stringByAppendingPathComponent:path];
  }
  
  // Handle absolute paths as-is
  return path;
}

- (NSString *)resolveReactNativeAssetPath:(NSString *)relativePath {
  NSLog(@"[MediaClipboard] Resolving React Native asset path: %@", relativePath);
  
  // Use the path as-is since dots have already been checked and rejected
  NSString *cleanPath = relativePath;
  
  // Remove leading / if present
  if ([cleanPath hasPrefix:@"/"]) {
    cleanPath = [cleanPath substringFromIndex:1];
  }
  
  NSLog(@"[MediaClipboard] Processing path: %@", cleanPath);
  
  NSFileManager *fileManager = [NSFileManager defaultManager];
  
  // Get common iOS app directories
  NSBundle *mainBundle = [NSBundle mainBundle];
  NSString *bundlePath = [mainBundle bundlePath];
  NSString *documentsPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
  NSString *libraryPath = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) firstObject];
  NSString *cachesPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) firstObject];
  NSString *tmpPath = NSTemporaryDirectory();
  
  // Strategy 1: Try common React Native asset locations in order of likelihood
  NSArray *basePaths = @[
    bundlePath,                    // Main app bundle
    documentsPath,                 // Documents directory
    [libraryPath stringByAppendingPathComponent:@"Application Support"], // Application Support
    cachesPath,                    // Caches directory  
    tmpPath,                       // Temporary directory
    libraryPath                    // Library directory
  ];
  
  NSArray *subPaths = @[
    cleanPath,                                    // Direct path
    [NSString stringWithFormat:@"assets/%@", cleanPath],          // assets/
    [NSString stringWithFormat:@"src/assets/%@", cleanPath],      // src/assets/
    [NSString stringWithFormat:@"app/assets/%@", cleanPath],      // app/assets/
    [NSString stringWithFormat:@"resources/%@", cleanPath],       // resources/
    [NSString stringWithFormat:@"www/%@", cleanPath],            // www/ (for hybrid apps)
    [NSString stringWithFormat:@"public/%@", cleanPath],         // public/
    [NSString stringWithFormat:@"static/%@", cleanPath]          // static/
  ];
  
  for (NSString *basePath in basePaths) {
    for (NSString *subPath in subPaths) {
      NSString *fullPath = [basePath stringByAppendingPathComponent:subPath];
      if ([fileManager fileExistsAtPath:fullPath]) {
        NSLog(@"[MediaClipboard] Found asset at: %@", fullPath);
        return fullPath;
      }
    }
  }
  
  // Strategy 2: Try NSBundle resource lookup (for truly bundled resources)
  NSString *filename = [cleanPath lastPathComponent];
  NSString *directory = [cleanPath stringByDeletingLastPathComponent];
  NSString *name = [filename stringByDeletingPathExtension];
  NSString *extension = [filename pathExtension];
  
  if (name.length > 0) {
    NSString *resourcePath;
    if (directory.length > 0) {
      resourcePath = [mainBundle pathForResource:name ofType:extension inDirectory:directory];
    } else {
      resourcePath = [mainBundle pathForResource:name ofType:extension];
    }
    
    if (resourcePath && [fileManager fileExistsAtPath:resourcePath]) {
      NSLog(@"[MediaClipboard] Found bundle resource at: %@", resourcePath);
      return resourcePath;
    }
  }
  
  NSLog(@"[MediaClipboard] React Native asset not found: %@", relativePath);
  return nil;
}

- (UIImage *)loadImageFromURL:(NSString *)urlString {
  NSLog(@"[MediaClipboard] Loading image from URL: %@", urlString);
  
  NSURL *url = [NSURL URLWithString:urlString];
  if (!url) {
    NSLog(@"[MediaClipboard] Invalid URL: %@", urlString);
    return nil;
  }
  
  // Synchronous download (for simplicity, in production consider async)
  NSError *error;
  NSData *data = [NSData dataWithContentsOfURL:url options:NSDataReadingUncached error:&error];
  
  if (error) {
    NSLog(@"[MediaClipboard] Failed to download from URL %@: %@", urlString, error.localizedDescription);
    return nil;
  }
  
  if (!data) {
    NSLog(@"[MediaClipboard] No data received from URL: %@", urlString);
    return nil;
  }
  
  UIImage *image = [UIImage imageWithData:data];
  if (!image) {
    NSLog(@"[MediaClipboard] Failed to create image from downloaded data from URL: %@", urlString);
  } else {
    NSLog(@"[MediaClipboard] Successfully loaded image from URL: %@", urlString);
  }
  
  return image;
}

- (NSData *)loadDataFromURL:(NSString *)urlString {
  NSLog(@"[MediaClipboard] Loading data from URL: %@", urlString);
  
  NSURL *url = [NSURL URLWithString:urlString];
  if (!url) {
    NSLog(@"[MediaClipboard] Invalid URL: %@", urlString);
    return nil;
  }
  
  // Synchronous download (for simplicity, in production consider async)
  NSError *error;
  NSData *data = [NSData dataWithContentsOfURL:url options:NSDataReadingUncached error:&error];
  
  if (error) {
    NSLog(@"[MediaClipboard] Failed to download from URL %@: %@", urlString, error.localizedDescription);
    return nil;
  }
  
  if (!data) {
    NSLog(@"[MediaClipboard] No data received from URL: %@", urlString);
    return nil;
  }
  
  NSLog(@"[MediaClipboard] Successfully loaded %lu bytes from URL: %@", (unsigned long)data.length, urlString);
  return data;
}

@end 