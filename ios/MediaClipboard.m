#import "MediaClipboard.h"
#import <React/RCTLog.h>

#if __has_include("ReactNativeClipboardMedia-Swift.h")
#import "ReactNativeClipboardMedia-Swift.h"
#else
#import <ReactNativeClipboardMedia/ReactNativeClipboardMedia-Swift.h>
#endif

@interface MediaClipboard() <MediaClipboardSwiftDelegate>
@end

@implementation MediaClipboard

RCT_EXPORT_MODULE()

// Indicate that this module wants to be initialized on the main queue
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    // Initialize the Swift implementation
    [[MediaClipboardSwift shared] setDelegate:self];
  }
  return self;
}

#pragma mark - React Native Methods

RCT_EXPORT_METHOD(copyText:(NSString *)text
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] copyText:text
                            completion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"COPY_TEXT_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(copyImage:(NSString *)imagePath
                  options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] copyImage:imagePath
                                options:options
                             completion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"COPY_IMAGE_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(copyVideo:(NSString *)videoPath
                  options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] copyVideo:videoPath
                                options:options
                             completion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"COPY_VIDEO_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(copyPDF:(NSString *)pdfPath
                 options:(NSDictionary *)options
                withResolver:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] copyPDF:pdfPath
                              options:options
                           completion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"COPY_PDF_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(copyAudio:(NSString *)audioPath
                  options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] copyAudio:audioPath
                                options:options
                             completion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"COPY_AUDIO_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(copyFile:(NSString *)filePath
                  mimeType:(NSString *)mimeType
                  options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] copyFile:filePath
                               mimeType:mimeType
                                options:options
                             completion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"COPY_FILE_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(copyLargeFile:(NSString *)filePath
                       mimeType:(NSString *)mimeType
                       options:(NSDictionary *)options
                      withResolver:(RCTPromiseResolveBlock)resolve
                      withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] copyLargeFile:filePath
                                   mimeType:mimeType
                                    options:options
                                 completion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"COPY_LARGE_FILE_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(hasContent:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  BOOL hasContent = [[MediaClipboardSwift shared] hasContent];
  resolve(@(hasContent));
}

RCT_EXPORT_METHOD(getContent:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] getContentWithCompletion:^(NSDictionary * _Nullable content, NSError * _Nullable error) {
    if (error) {
      reject(@"GET_CONTENT_ERROR", error.localizedDescription, error);
    } else {
      resolve(content);
    }
  }];
}

RCT_EXPORT_METHOD(clear:(RCTPromiseResolveBlock)resolve
          withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[MediaClipboardSwift shared] clearWithCompletion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"CLEAR_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  }];
}

#pragma mark - MediaClipboardSwiftDelegate

- (void)onProgressUpdate:(double)progress {
  // This could be used to send progress events to React Native
  // For now, we'll just log it
  RCTLogInfo(@"Copy progress: %.2f%%", progress * 100);
}

@end 