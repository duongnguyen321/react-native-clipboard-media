import { Platform } from 'react-native';
import { promises as fs } from 'fs';
import path from 'path';
import MediaClipboard, { ClipboardContentType } from '../index';

// Mock React Native's NativeModules for integration testing
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((config) => config.ios || config.default),
  },
  NativeModules: {
    MediaClipboard: {
      copyText: jest.fn().mockResolvedValue(undefined),
      copyImage: jest.fn().mockResolvedValue(undefined),
      copyVideo: jest.fn().mockResolvedValue(undefined),
      copyPDF: jest.fn().mockResolvedValue(undefined),
      copyAudio: jest.fn().mockResolvedValue(undefined),
      copyFile: jest.fn().mockResolvedValue(undefined),
      copyLargeFile: jest.fn().mockResolvedValue(undefined),
      hasContent: jest.fn().mockResolvedValue(true),
      getContent: jest.fn().mockResolvedValue({
        type: 'text',
        data: 'test content',
      }),
      clear: jest.fn().mockResolvedValue(undefined),
    },
  },
}));

describe('MediaClipboard Integration Tests', () => {
  const assetsPath = path.join(__dirname, 'assets');

  beforeAll(async () => {
    // Ensure test assets exist
    await expect(fs.access(assetsPath)).resolves.toBeUndefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Real Data Tests', () => {
    it('should copy real text content from file', async () => {
      const textFilePath = path.join(assetsPath, 'sample.txt');
      const textContent = await fs.readFile(textFilePath, 'utf8');

      await MediaClipboard.copyText(textContent);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyText).toHaveBeenCalledWith(
        textContent,
      );
      expect(textContent).toContain('MediaClipboard library');
    });

    it('should copy URL content', async () => {
      const testUrl =
        'https://github.com/duonguyen321/react-native-clipboard-media';

      await MediaClipboard.copyText(testUrl);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyText).toHaveBeenCalledWith(
        testUrl,
      );
    });

    it('should copy SVG image file with proper options', async () => {
      const imagePath = path.join(assetsPath, 'sample.svg');
      const options = {
        filename: 'test-image.svg',
        mimeType: 'image/svg+xml',
        showNotification: true,
      };

      // Verify file exists
      await expect(fs.access(imagePath)).resolves.toBeUndefined();

      await MediaClipboard.copyImage(imagePath, options);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyImage).toHaveBeenCalledWith(
        imagePath,
        options,
      );
    });

    it('should copy JSON file as generic file', async () => {
      const jsonFilePath = path.join(assetsPath, 'sample.json');
      const mimeType = 'application/json';
      const options = {
        filename: 'sample-data.json',
        showNotification: false,
      };

      // Verify file exists and read content
      const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
      const parsedContent = JSON.parse(jsonContent);
      expect(parsedContent.name).toBe('MediaClipboard Test File');

      await MediaClipboard.copyFile(jsonFilePath, mimeType, options);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyFile).toHaveBeenCalledWith(
        jsonFilePath,
        mimeType,
        options,
      );
    });

    it('should handle large file copying with progress callback', async () => {
      const filePath = path.join(assetsPath, 'sample.json');
      const mimeType = 'application/json';
      let progressUpdates: number[] = [];

      const progressCallback = (progress: number) => {
        progressUpdates.push(progress);
      };

      await MediaClipboard.copyLargeFile(filePath, mimeType, progressCallback);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyLargeFile).toHaveBeenCalledWith(
        filePath,
        mimeType,
        progressCallback,
        {},
      );
    });

    it('should get real file stats and validate content', async () => {
      const textFilePath = path.join(assetsPath, 'sample.txt');
      const svgFilePath = path.join(assetsPath, 'sample.svg');
      const jsonFilePath = path.join(assetsPath, 'sample.json');

      // Get file stats to validate real files
      const textStats = await fs.stat(textFilePath);
      const svgStats = await fs.stat(svgFilePath);
      const jsonStats = await fs.stat(jsonFilePath);

      expect(textStats.size).toBeGreaterThan(0);
      expect(svgStats.size).toBeGreaterThan(0);
      expect(jsonStats.size).toBeGreaterThan(0);

      // Verify file contents
      const textContent = await fs.readFile(textFilePath, 'utf8');
      const svgContent = await fs.readFile(svgFilePath, 'utf8');
      const jsonContent = await fs.readFile(jsonFilePath, 'utf8');

      expect(textContent).toContain('testing');
      expect(svgContent).toContain('<svg');
      expect(jsonContent).toContain('"name"');

      // Test clipboard content retrieval
      await MediaClipboard.getContent();

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.getContent).toHaveBeenCalled();
    });

    it('should handle different file types with correct MIME types', async () => {
      const testCases = [
        {
          file: 'sample.txt',
          mimeType: 'text/plain',
          method: 'copyFile',
        },
        {
          file: 'sample.svg',
          mimeType: 'image/svg+xml',
          method: 'copyImage',
        },
        {
          file: 'sample.json',
          mimeType: 'application/json',
          method: 'copyFile',
        },
      ];

      for (const testCase of testCases) {
        const filePath = path.join(assetsPath, testCase.file);
        const options = { filename: testCase.file };

        if (testCase.method === 'copyFile') {
          await MediaClipboard.copyFile(filePath, testCase.mimeType, options);
        } else if (testCase.method === 'copyImage') {
          await MediaClipboard.copyImage(filePath, options);
        }

        // Verify file exists
        await expect(fs.access(filePath)).resolves.toBeUndefined();
      }
    });

    it('should handle clipboard state operations', async () => {
      // Test hasContent
      const hasContent = await MediaClipboard.hasContent();
      expect(typeof hasContent).toBe('boolean');

      // Test getContent
      const content = await MediaClipboard.getContent();
      expect(content).toHaveProperty('type');
      expect(Object.values(ClipboardContentType)).toContain(content.type);

      // Test clear
      await MediaClipboard.clear();

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.hasContent).toHaveBeenCalled();
      expect(NativeModules.MediaClipboard.getContent).toHaveBeenCalled();
      expect(NativeModules.MediaClipboard.clear).toHaveBeenCalled();
    });

    it('should handle platform-specific behavior', async () => {
      const testText = 'Platform test content';

      // Mock different platforms
      Platform.OS = 'ios';
      await MediaClipboard.copyText(testText);

      Platform.OS = 'android';
      await MediaClipboard.copyText(testText);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyText).toHaveBeenCalledTimes(2);
    });

    it('should validate file paths and handle errors gracefully', async () => {
      const nonExistentPath = path.join(assetsPath, 'non-existent-file.txt');

      // Verify file doesn't exist
      await expect(fs.access(nonExistentPath)).rejects.toThrow();

      // The library should still call the native module (error handling is done natively)
      await expect(MediaClipboard.copyText('test')).resolves.toBeUndefined();

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyText).toHaveBeenCalled();
    });
  });

  describe('Real Data Content Validation', () => {
    it('should validate sample text file content', async () => {
      const textFilePath = path.join(assetsPath, 'sample.txt');
      const content = await fs.readFile(textFilePath, 'utf8');

      expect(content).toContain('MediaClipboard library');
      expect(content).toContain('Features:');
      expect(content).toContain('àáâãäåæçèéêë'); // Special characters
      expect(content).toContain('123456789'); // Numbers
      expect(content).toContain('!@#$%^&*()'); // Symbols
    });

    it('should validate sample SVG content', async () => {
      const svgFilePath = path.join(assetsPath, 'sample.svg');
      const content = await fs.readFile(svgFilePath, 'utf8');

      expect(content).toContain('<?xml version="1.0"');
      expect(content).toContain('<svg');
      expect(content).toContain('width="100"');
      expect(content).toContain('height="100"');
      expect(content).toContain('<circle');
      expect(content).toContain('<text');
      expect(content).toContain('Test');
    });

    it('should validate sample JSON content', async () => {
      const jsonFilePath = path.join(assetsPath, 'sample.json');
      const content = await fs.readFile(jsonFilePath, 'utf8');
      const parsed = JSON.parse(content);

      expect(parsed.name).toBe('MediaClipboard Test File');
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.features).toHaveLength(6);
      expect(parsed.features).toContain('Text copying');
      expect(parsed.metadata.author).toBe('duonguyen321');
      expect(parsed.metadata.testPurpose).toBe('integration_testing');
    });
  });
});
