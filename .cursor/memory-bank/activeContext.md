# Active Context - React Native Media Clipboard

## Current Focus

✅ COMPLETED: Relative path blocking with helpful error messages

## Latest Change Implemented

**Issue**: Relative paths with dots (./,../) were causing unpredictable behavior and user confusion
**Root Cause**: Previous implementation tried to resolve relative paths by removing dots, leading to unreliable guessing
**Solution**: Block relative paths with dots and provide clear error messages with alternatives

### Previous Behavior

- Paths like `../assets/image.png` would have dots removed and be searched in common locations
- This led to unpredictable results and hard-to-debug failures

### New Behavior

- Paths with `./`, `../`, `/../`, `/./` patterns are immediately blocked
- Clear error messages suggest reliable alternatives:
  1. Base64 data URLs
  2. HTTP/HTTPS URLs
  3. Absolute file paths
  4. File:// URLs

## Implementation Details

### Relative Path Blocking Implementation

#### iOS (ios/MediaClipboard.m)

- **`normalizeFilePath`**: Added early detection of dot patterns:
  ```objc
  if ([path hasPrefix:@"./"] || [path hasPrefix:@"../"] ||
      [path containsString:@"/../"] || [path containsString:@"/./"]) {
    return nil; // Triggers specific error in calling methods
  }
  ```
- **All copy methods**: Enhanced error handling to detect relative path failures and show helpful messages
- **Error message format**: Shows 4 alternatives (base64, HTTP/HTTPS, absolute path, file://)

#### Android (android/...MediaClipboardModule.java)

- **`resolveAssetPath`**: Added dot pattern detection:
  ```java
  if (path.startsWith("./") || path.startsWith("../") ||
      path.contains("/../") || path.contains("/./")) {
    return null; // Triggers RELATIVE_PATH_ERROR
  }
  ```
- **All copy methods**: Check for null return and show RELATIVE_PATH_ERROR with alternatives
- **Error message format**: Shows 4 alternatives including content:// URIs

#### Web (src/web/MediaClipboardWeb.ts)

- **`resolveAssetPath`**: Throws specific error for dot patterns:
  ```typescript
  if (
    path.startsWith('./') ||
    path.startsWith('../') ||
    path.includes('/../') ||
    path.includes('/./')
  ) {
    throw new Error(
      'RELATIVE_PATH_ERROR: Relative paths with dots are not supported',
    );
  }
  ```
- **All copy methods**: Enhanced error handling to catch and re-format relative path errors
- **Error message format**: Shows 4 alternatives including blob URLs

### Previous Asset Resolution (Still Active)

#### iOS - Comprehensive Asset Search

- Systematic search across iOS directories: bundle, documents, caches, library, temp
- Subdirectory patterns: assets/, src/assets/, app/assets/, resources/, www/, public/, static/

#### Android - Multi-Directory Search

- Search across internal/external files, cache directories, custom asset locations
- Same subdirectory patterns as iOS for consistency

#### Web - Common Web Locations

- Resolves to: /, /assets/, /static/, /public/, /assets/images/

## Current Status

🎉 **PRODUCTION READY** - Relative path safety implemented with helpful user guidance!

## Files Modified (Latest Change)

- `ios/MediaClipboard.m` - added relative path blocking in `normalizeFilePath` and enhanced error messages in all copy methods
- `android/src/main/java/com/mediaclipboard/MediaClipboardModule.java` - added relative path detection in `resolveAssetPath` and enhanced error handling
- `src/web/MediaClipboardWeb.ts` - added relative path blocking in `resolveAssetPath` and enhanced error handling
- All changes compiled successfully

## Testing Status

- ✅ All 24 tests pass
- ✅ TypeScript compilation successful
- ✅ No regressions introduced
- ✅ Relative path blocking works as expected
- ✅ Error messages provide clear alternatives

## Path Support Summary

**✅ SUPPORTED:**

- Asset paths without dots: `assets/images/icon.png`
- Absolute paths: `/path/to/file`, `file:///path/to/file`
- HTTP/HTTPS URLs: `https://example.com/file`
- Base64 data: `data:image/jpeg;base64,...`

**❌ BLOCKED (with helpful errors):**

- Relative paths with dots: `./file`, `../file`, `folder/../file`, `folder/./file`

**Error Message Example:**

```
Cannot copy from relative path './image.jpg'. Relative paths like './' and '../' are not supported.
Please use one of these alternatives:
1. Convert to base64: data:image/jpeg;base64,<your_base64_data>
2. Use HTTP/HTTPS URL: https://example.com/image.jpg
3. Use absolute file path: /absolute/path/to/image.jpg
4. Use file:// URL: file:///absolute/path/to/image.jpg
```

This eliminates user confusion and provides clear guidance toward reliable alternatives.
