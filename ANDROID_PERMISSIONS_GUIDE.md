# Android Permissions Guide for Clipboard Media

This guide explains how to fix clipboard copying issues on Android by properly configuring permissions and handling modern Android requirements.

## Issues Fixed

1. **Missing Storage Permissions**: Added granular media permissions for Android 13+
2. **Clipboard Access Restrictions**: Improved error handling for background clipboard access
3. **FileProvider Configuration**: Enhanced file sharing security
4. **Scoped Storage Compatibility**: Better handling of modern Android storage restrictions

## Required Permissions

### 1. Update AndroidManifest.xml

Add these permissions to your app's `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Basic storage permissions -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- For Android 13+ (API 33), granular media permissions are required -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

<!-- For Android 11+ (API 30), if you need to access all files -->
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" 
  android:maxSdkVersion="32" />

<!-- Internet permission for downloading remote files -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Network state permission to check connectivity -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Write external storage for caching downloaded files -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
  android:maxSdkVersion="28" />
```

### 2. Request Permissions at Runtime

For Android 6.0+ (API 23), you need to request permissions at runtime. Add this to your React Native app:

```javascript
import { PermissionsAndroid, Platform } from 'react-native';

const requestStoragePermissions = async () => {
  if (Platform.OS !== 'android') return true;

  const androidVersion = Platform.Version;
  
  try {
    if (androidVersion >= 33) {
      // Android 13+ requires granular media permissions
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      ];
      
      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      return Object.values(results).some(
        result => result === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      // For older versions, request READ_EXTERNAL_STORAGE
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to storage to copy media files to clipboard.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (error) {
    console.warn('Permission request failed:', error);
    return false;
  }
};

// Use before copying media
const copyImageSafely = async (imagePath) => {
  const hasPermission = await requestStoragePermissions();
  
  if (!hasPermission) {
    throw new Error('Storage permission required to copy media files');
  }
  
  try {
    await MediaClipboard.copyImage(imagePath);
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      // Handle permission denied
      console.error('Permission denied:', error.message);
    } else if (error.code === 'CLIPBOARD_ACCESS_DENIED') {
      // Handle clipboard access issues
      console.error('Clipboard access denied:', error.message);
    } else {
      // Handle other errors
      console.error('Copy failed:', error.message);
    }
    throw error;
  }
};
```

## Common Error Codes and Solutions

### `PERMISSION_DENIED`
**Cause**: Missing required permissions for accessing media files.

**Solution**: 
- Add the required permissions to AndroidManifest.xml
- Request permissions at runtime using `PermissionsAndroid`

### `CLIPBOARD_ACCESS_DENIED`
**Cause**: Android restricts clipboard access for background apps or system security policies.

**Solutions**:
- Ensure your app is in the foreground when copying
- Check if device has clipboard access restrictions
- Some Android devices/ROMs have additional clipboard restrictions

### `FILE_NOT_FOUND`
**Cause**: The file path doesn't exist or is inaccessible.

**Solutions**:
- Use absolute file paths instead of relative paths
- Verify file exists before copying
- Use content:// URIs for media files from MediaStore
- For remote files, use HTTPS URLs (they will be downloaded automatically)

### `URI_CREATION_ERROR`
**Cause**: FileProvider configuration issues.

**Solution**: The library's FileProvider should work out of the box, but if you encounter issues:
- Ensure your app doesn't override the FileProvider configuration
- Check for authority conflicts in your AndroidManifest.xml

## Supported File Types and Sources

### Supported File Types
- **Images**: JPG, PNG, GIF, WebP, BMP
- **Videos**: MP4, AVI, MOV, 3GP
- **Audio**: MP3, WAV, AAC, OGG
- **Documents**: PDF
- **Any file type** with custom MIME type

### Supported Sources
1. **Absolute file paths**: `/storage/emulated/0/Download/image.jpg`
2. **HTTP/HTTPS URLs**: `https://example.com/image.jpg` (automatically downloaded)
3. **Content URIs**: `content://media/external/images/media/123`
4. **Base64 data URIs**: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`

### Unsupported Sources
- **Relative paths**: `./assets/image.jpg`, `../images/photo.png`
- **React Native bundled assets**: Use require() to get the asset and convert to absolute path

## Testing Your Implementation

1. **Test with different Android versions**:
   - Android 6-9 (API 23-28): READ_EXTERNAL_STORAGE
   - Android 10-12 (API 29-32): Scoped storage
   - Android 13+ (API 33+): Granular media permissions

2. **Test different scenarios**:
   - App in foreground vs background
   - Different file sources (local, remote, content URIs)
   - Permission granted vs denied

3. **Handle edge cases**:
   - Network connectivity for remote files
   - Large file downloads
   - Storage space limitations

## Best Practices

1. **Always request permissions before use**
2. **Provide clear error messages to users**
3. **Use content URIs when possible for better compatibility**
4. **Test on different Android versions and devices**
5. **Handle clipboard access restrictions gracefully**
6. **Use HTTPS URLs for remote files**
7. **Validate file existence before copying**

## Troubleshooting

If you're still experiencing issues:

1. Check the exact error message and code
2. Verify permissions are added to AndroidManifest.xml
3. Ensure permissions are requested at runtime for Android 6+
4. Test with a simple text copy first
5. Check device-specific clipboard restrictions
6. Verify your file paths are correct and accessible