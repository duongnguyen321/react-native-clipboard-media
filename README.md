# React Native Media Clipboard

A comprehensive React Native library for copying various media types (text, images, videos, PDFs, audio files) to the system clipboard on both iOS and Android platforms.

## 🚀 Features

- ✅ Copy text and URLs
- ✅ Copy images (JPG, PNG, GIF, SVG)
- ✅ Copy videos (MP4, MOV, AVI)
- ✅ Copy PDF documents
- ✅ Copy audio files (MP3, WAV, AAC)
- ✅ Copy any file type with custom MIME types
- ✅ Large file support with progress tracking
- ✅ Cross-platform (iOS 11+ and Android 8+)
- ✅ TypeScript support
- ✅ Promise-based API
- ✅ Comprehensive error handling

## 📦 Installation

```bash
# Using npm
npm install react-native-media-clipboard

# Using yarn
yarn add react-native-media-clipboard

# Using bun
bun add react-native-media-clipboard
```

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

No additional setup required. The library uses autolinking.

## 🎯 Quick Start

```typescript
import MediaClipboard from 'react-native-media-clipboard';

// Copy text
await MediaClipboard.copyText('Hello, World!');

// Copy image
await MediaClipboard.copyImage('/path/to/image.jpg');

// Copy video
await MediaClipboard.copyVideo('/path/to/video.mp4');

// Check if clipboard has content
const hasContent = await MediaClipboard.hasContent();

// Get clipboard content info
const content = await MediaClipboard.getContent();
```

## 📖 API Reference

### Methods

#### `copyText(text: string): Promise<void>`

Copy text or URL to clipboard.

```typescript
await MediaClipboard.copyText('Hello, World!');
await MediaClipboard.copyText('https://example.com');
```

**Parameters:**

- `text` (string): The text or URL to copy

---

#### `copyImage(imagePath: string, options?: CopyFileOptions): Promise<void>`

Copy image to clipboard from file path or base64 data URI.

```typescript
await MediaClipboard.copyImage('/path/to/image.jpg');
await MediaClipboard.copyImage('/path/to/image.png', {
  filename: 'my-image.png',
  showNotification: true,
});
```

**Parameters:**

- `imagePath` (string): Path to image file or base64 data URI
- `options` (CopyFileOptions, optional): Copy configuration options

---

#### `copyVideo(videoPath: string, options?: CopyFileOptions): Promise<void>`

Copy video file to clipboard.

```typescript
await MediaClipboard.copyVideo('/path/to/video.mp4');
await MediaClipboard.copyVideo('/path/to/video.mov', {
  filename: 'my-video.mov',
});
```

**Parameters:**

- `videoPath` (string): Path to video file
- `options` (CopyFileOptions, optional): Copy configuration options

---

#### `copyPDF(pdfPath: string, options?: CopyFileOptions): Promise<void>`

Copy PDF document to clipboard.

```typescript
await MediaClipboard.copyPDF('/path/to/document.pdf');
await MediaClipboard.copyPDF('/path/to/document.pdf', {
  filename: 'my-document.pdf',
});
```

**Parameters:**

- `pdfPath` (string): Path to PDF file
- `options` (CopyFileOptions, optional): Copy configuration options

---

#### `copyAudio(audioPath: string, options?: CopyFileOptions): Promise<void>`

Copy audio file to clipboard.

```typescript
await MediaClipboard.copyAudio('/path/to/audio.mp3');
await MediaClipboard.copyAudio('/path/to/audio.wav', {
  filename: 'my-audio.wav',
});
```

**Parameters:**

- `audioPath` (string): Path to audio file
- `options` (CopyFileOptions, optional): Copy configuration options

---

#### `copyFile(filePath: string, mimeType: string, options?: CopyFileOptions): Promise<void>`

Copy any file to clipboard with specified MIME type.

```typescript
await MediaClipboard.copyFile('/path/to/file.txt', 'text/plain');
await MediaClipboard.copyFile('/path/to/data.json', 'application/json', {
  filename: 'data.json',
  showNotification: true,
});
```

**Parameters:**

- `filePath` (string): Path to file
- `mimeType` (string): MIME type of the file
- `options` (CopyFileOptions, optional): Copy configuration options

---

#### `copyLargeFile(filePath: string, mimeType: string, onProgress?: ProgressCallback, options?: CopyFileOptions): Promise<void>`

Copy large file to clipboard with progress tracking.

```typescript
await MediaClipboard.copyLargeFile(
  '/path/to/large-video.mp4',
  'video/mp4',
  (progress) => {
    console.log(`Copy progress: ${progress}%`);
  },
  { filename: 'large-video.mp4' },
);
```

**Parameters:**

- `filePath` (string): Path to large file
- `mimeType` (string): MIME type of the file
- `onProgress` (ProgressCallback, optional): Progress callback function
- `options` (CopyFileOptions, optional): Copy configuration options

---

#### `hasContent(): Promise<boolean>`

Check if clipboard has any content.

```typescript
const hasContent = await MediaClipboard.hasContent();
if (hasContent) {
  console.log('Clipboard has content');
}
```

**Returns:** Promise that resolves to `true` if clipboard has content

---

#### `getContent(): Promise<ClipboardContent>`

Get current clipboard content information.

```typescript
const content = await MediaClipboard.getContent();
console.log('Content type:', content.type);
console.log('Content data:', content.data);
console.log('File size:', content.size);
```

**Returns:** Promise that resolves to `ClipboardContent` object

---

#### `clear(): Promise<void>`

Clear clipboard content.

```typescript
await MediaClipboard.clear();
```

### Types

#### `ClipboardContentType`

Enumeration of supported content types:

```typescript
enum ClipboardContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf',
  AUDIO = 'audio',
  FILE = 'file',
  UNKNOWN = 'unknown',
}
```

#### `ClipboardContent`

Interface for clipboard content information:

```typescript
interface ClipboardContent {
  type: ClipboardContentType;
  data?: string;
  mimeType?: string;
  size?: number;
  filename?: string;
}
```

#### `CopyFileOptions`

Configuration options for copying files:

```typescript
interface CopyFileOptions {
  mimeType?: string;
  filename?: string;
  showNotification?: boolean;
}
```

#### `ProgressCallback`

Progress callback function type:

```typescript
type ProgressCallback = (progress: number) => void;
```

## 🎨 Usage Examples

### Basic Text and URL Copying

```typescript
import MediaClipboard from 'react-native-media-clipboard';

// Copy simple text
await MediaClipboard.copyText('Hello, React Native!');

// Copy URL
await MediaClipboard.copyText('https://reactnative.dev');

// Copy multi-line text
await MediaClipboard.copyText(`
Line 1
Line 2
Line 3
`);
```

### Image Copying

```typescript
// Copy image from app bundle
await MediaClipboard.copyImage('file:///path/to/image.jpg');

// Copy image with options
await MediaClipboard.copyImage('/path/to/photo.png', {
  filename: 'my-photo.png',
  showNotification: true,
});

// Copy base64 image
await MediaClipboard.copyImage(
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
);
```

### Video and Media Copying

```typescript
// Copy video file
await MediaClipboard.copyVideo('/path/to/video.mp4', {
  filename: 'my-video.mp4',
});

// Copy audio file
await MediaClipboard.copyAudio('/path/to/song.mp3', {
  filename: 'favorite-song.mp3',
});

// Copy PDF document
await MediaClipboard.copyPDF('/path/to/document.pdf');
```

### Large File Handling

```typescript
// Copy large file with progress tracking
await MediaClipboard.copyLargeFile(
  '/path/to/large-file.zip',
  'application/zip',
  (progress) => {
    // Update UI with progress
    setUploadProgress(progress);
    console.log(`Progress: ${progress}%`);
  },
  {
    filename: 'backup.zip',
    showNotification: true,
  },
);
```

### Custom File Types

```typescript
// Copy JSON file
await MediaClipboard.copyFile('/path/to/data.json', 'application/json');

// Copy XML file
await MediaClipboard.copyFile('/path/to/config.xml', 'application/xml');

// Copy custom file type
await MediaClipboard.copyFile(
  '/path/to/custom.xyz',
  'application/octet-stream',
  {
    filename: 'custom-file.xyz',
  },
);
```

### Clipboard State Management

```typescript
// Check clipboard state
const hasContent = await MediaClipboard.hasContent();

if (hasContent) {
  // Get clipboard info
  const content = await MediaClipboard.getContent();

  switch (content.type) {
    case 'text':
      console.log('Clipboard contains text:', content.data);
      break;
    case 'image':
      console.log('Clipboard contains image, size:', content.size);
      break;
    case 'video':
      console.log('Clipboard contains video:', content.filename);
      break;
    default:
      console.log('Clipboard contains:', content.type);
  }
}

// Clear clipboard
await MediaClipboard.clear();
```

### Error Handling

```typescript
try {
  await MediaClipboard.copyImage('/invalid/path/image.jpg');
} catch (error) {
  if (error.code === 'FILE_NOT_FOUND') {
    console.log('Image file not found');
  } else if (error.code === 'PERMISSION_DENIED') {
    console.log('Permission denied to access file');
  } else {
    console.log('Copy failed:', error.message);
  }
}
```

### React Component Example

```typescript
import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import MediaClipboard from 'react-native-media-clipboard';

const ClipboardDemo = () => {
  const [hasContent, setHasContent] = useState(false);
  const [contentInfo, setContentInfo] = useState(null);

  const copyText = async () => {
    try {
      await MediaClipboard.copyText('Hello from React Native!');
      Alert.alert('Success', 'Text copied to clipboard');
      checkContent();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const copyImage = async () => {
    try {
      await MediaClipboard.copyImage('/path/to/image.jpg');
      Alert.alert('Success', 'Image copied to clipboard');
      checkContent();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const checkContent = async () => {
    const has = await MediaClipboard.hasContent();
    setHasContent(has);

    if (has) {
      const content = await MediaClipboard.getContent();
      setContentInfo(content);
    }
  };

  const clearClipboard = async () => {
    await MediaClipboard.clear();
    setHasContent(false);
    setContentInfo(null);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Copy Text" onPress={copyText} />
      <Button title="Copy Image" onPress={copyImage} />
      <Button title="Check Content" onPress={checkContent} />
      <Button title="Clear Clipboard" onPress={clearClipboard} />

      <Text>Has Content: {hasContent ? 'Yes' : 'No'}</Text>
      {contentInfo && (
        <Text>Content Type: {contentInfo.type}</Text>
      )}
    </View>
  );
};

export default ClipboardDemo;
```

## 🔧 Common MIME Types

| File Type  | MIME Type                  |
| ---------- | -------------------------- |
| Text       | `text/plain`               |
| JSON       | `application/json`         |
| XML        | `application/xml`          |
| HTML       | `text/html`                |
| JPEG Image | `image/jpeg`               |
| PNG Image  | `image/png`                |
| GIF Image  | `image/gif`                |
| SVG Image  | `image/svg+xml`            |
| MP4 Video  | `video/mp4`                |
| MOV Video  | `video/quicktime`          |
| AVI Video  | `video/x-msvideo`          |
| MP3 Audio  | `audio/mpeg`               |
| WAV Audio  | `audio/wav`                |
| AAC Audio  | `audio/aac`                |
| PDF        | `application/pdf`          |
| ZIP        | `application/zip`          |
| Binary     | `application/octet-stream` |

## 🛠️ Platform Support

### iOS (11.0+)

- Uses `UIPasteboard` API
- Supports all major media formats
- File sharing through app sandbox
- Memory-efficient large file handling

### Android (API 26+)

- Uses `ClipboardManager` API
- Content URI support for media files
- FileProvider for secure file sharing
- Scoped storage compatibility

## ⚠️ Known Limitations

### iOS

- Some apps may not support certain file types from clipboard
- Large files may have memory constraints
- File access limited to app sandbox

### Android

- Android 12+ shows clipboard access notifications
- Some MIME types may not be supported by target apps
- Scoped storage affects file access on Android 10+

## 🧪 Testing

The library includes comprehensive tests:

```bash
# Run unit tests
npm test

# Run integration tests with real files
npm run test:integration

# Run all tests
npm run test:all
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**duonguyen321** - [duongcoilc2004@gmail.com](mailto:duongcoilc2004@gmail.com)

## 🙏 Acknowledgments

- React Native team for the excellent framework
- Contributors and users of this library
- Open source community for inspiration and support

---

Made with ❤️ for the React Native community
