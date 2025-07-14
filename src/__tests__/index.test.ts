import MediaClipboard from '../index';

describe('MediaClipboard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(MediaClipboard).toBeDefined();
  });

  it('should implement MediaClipboardInterface', () => {
    expect(MediaClipboard).toEqual(
      expect.objectContaining({
        copyText: expect.any(Function),
        copyImage: expect.any(Function),
        copyVideo: expect.any(Function),
        copyPDF: expect.any(Function),
        copyAudio: expect.any(Function),
        copyFile: expect.any(Function),
        copyLargeFile: expect.any(Function),
        hasContent: expect.any(Function),
        getContent: expect.any(Function),
        clear: expect.any(Function),
      }),
    );
  });

  describe('copyText', () => {
    it('should copy text to clipboard', async () => {
      const testText = 'Hello, World!';
      await MediaClipboard.copyText(testText);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyText).toHaveBeenCalledWith(
        testText,
      );
    });
  });

  describe('copyImage', () => {
    it('should copy image to clipboard', async () => {
      const imagePath = '/path/to/image.jpg';
      const options = { filename: 'test.jpg' };
      await MediaClipboard.copyImage(imagePath, options);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyImage).toHaveBeenCalledWith(
        imagePath,
        options,
      );
    });
  });

  describe('copyVideo', () => {
    it('should copy video to clipboard', async () => {
      const videoPath = '/path/to/video.mp4';
      const options = { filename: 'test.mp4' };
      await MediaClipboard.copyVideo(videoPath, options);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyVideo).toHaveBeenCalledWith(
        videoPath,
        options,
      );
    });
  });

  describe('copyPDF', () => {
    it('should copy PDF to clipboard', async () => {
      const pdfPath = '/path/to/document.pdf';
      const options = { filename: 'test.pdf' };
      await MediaClipboard.copyPDF(pdfPath, options);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyPDF).toHaveBeenCalledWith(
        pdfPath,
        options,
      );
    });
  });

  describe('copyAudio', () => {
    it('should copy audio to clipboard', async () => {
      const audioPath = '/path/to/audio.mp3';
      const options = { filename: 'test.mp3' };
      await MediaClipboard.copyAudio(audioPath, options);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyAudio).toHaveBeenCalledWith(
        audioPath,
        options,
      );
    });
  });

  describe('copyFile', () => {
    it('should copy file to clipboard', async () => {
      const filePath = '/path/to/file.txt';
      const mimeType = 'text/plain';
      const options = { filename: 'test.txt' };
      await MediaClipboard.copyFile(filePath, mimeType, options);

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.copyFile).toHaveBeenCalledWith(
        filePath,
        mimeType,
        options,
      );
    });
  });

  describe('hasContent', () => {
    it('should check if clipboard has content', async () => {
      const result = await MediaClipboard.hasContent();

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.hasContent).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getContent', () => {
    it('should get clipboard content', async () => {
      const result = await MediaClipboard.getContent();

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.getContent).toHaveBeenCalled();
      expect(result).toEqual({
        type: 'text',
        data: 'test',
      });
    });
  });

  describe('clear', () => {
    it('should clear clipboard', async () => {
      await MediaClipboard.clear();

      const { NativeModules } = require('react-native');
      expect(NativeModules.MediaClipboard.clear).toHaveBeenCalled();
    });
  });
});
