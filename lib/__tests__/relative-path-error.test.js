import { Platform } from 'react-native';
import MediaClipboard from '../index';
// Mock React Native's NativeModules for testing
jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: jest.fn((config) => config.ios || config.default),
    },
    NativeModules: {
        MediaClipboard: {
            copyImage: jest.fn().mockRejectedValue(new Error('COPY_IMAGE_ERROR')),
            copyVideo: jest.fn().mockRejectedValue(new Error('COPY_VIDEO_ERROR')),
            copyPDF: jest.fn().mockRejectedValue(new Error('COPY_PDF_ERROR')),
            copyAudio: jest.fn().mockRejectedValue(new Error('COPY_AUDIO_ERROR')),
            copyFile: jest.fn().mockRejectedValue(new Error('COPY_FILE_ERROR')),
        },
    },
}));
describe('Relative Path Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const relativePaths = [
        './image.jpg',
        '../assets/image.png',
        'folder/../image.gif',
        'folder/./image.svg',
        '../../../deep/path/image.jpg',
    ];
    describe('copyImage', () => {
        it.each(relativePaths)('should show helpful error for relative path: %s', async (path) => {
            await expect(MediaClipboard.copyImage(path)).rejects.toThrow();
            try {
                await MediaClipboard.copyImage(path);
            }
            catch (error) {
                expect(error.message).toContain('Cannot copy from relative path');
                expect(error.message).toContain('Relative paths like');
                expect(error.message).toContain('base64');
                expect(error.message).toContain('HTTP/HTTPS URL');
                expect(error.message).toContain('absolute file path');
            }
        });
    });
    describe('copyVideo', () => {
        it.each(relativePaths)('should show helpful error for relative path: %s', async (path) => {
            await expect(MediaClipboard.copyVideo(path)).rejects.toThrow();
            try {
                await MediaClipboard.copyVideo(path);
            }
            catch (error) {
                expect(error.message).toContain('Cannot copy from relative path');
                expect(error.message).toContain('Relative paths like');
                expect(error.message).toContain('HTTP/HTTPS URL');
                expect(error.message).toContain('absolute file path');
            }
        });
    });
    describe('copyPDF', () => {
        it.each(relativePaths)('should show helpful error for relative path: %s', async (path) => {
            await expect(MediaClipboard.copyPDF(path)).rejects.toThrow();
            try {
                await MediaClipboard.copyPDF(path);
            }
            catch (error) {
                expect(error.message).toContain('Cannot copy from relative path');
                expect(error.message).toContain('Relative paths like');
                expect(error.message).toContain('HTTP/HTTPS URL');
                expect(error.message).toContain('absolute file path');
            }
        });
    });
    describe('copyAudio', () => {
        it.each(relativePaths)('should show helpful error for relative path: %s', async (path) => {
            await expect(MediaClipboard.copyAudio(path)).rejects.toThrow();
            try {
                await MediaClipboard.copyAudio(path);
            }
            catch (error) {
                expect(error.message).toContain('Cannot copy from relative path');
                expect(error.message).toContain('Relative paths like');
                expect(error.message).toContain('HTTP/HTTPS URL');
                expect(error.message).toContain('absolute file path');
            }
        });
    });
    describe('copyFile', () => {
        it.each(relativePaths)('should show helpful error for relative path: %s', async (path) => {
            await expect(MediaClipboard.copyFile(path, 'application/json')).rejects.toThrow();
            try {
                await MediaClipboard.copyFile(path, 'application/json');
            }
            catch (error) {
                expect(error.message).toContain('Cannot copy from relative path');
                expect(error.message).toContain('Relative paths like');
                expect(error.message).toContain('base64');
                expect(error.message).toContain('HTTP/HTTPS URL');
                expect(error.message).toContain('absolute file path');
            }
        });
    });
    describe('Web Platform', () => {
        beforeEach(() => {
            Platform.OS = 'web';
        });
        afterEach(() => {
            Platform.OS = 'ios';
        });
        it('should show helpful error for relative path on web', async () => {
            await expect(MediaClipboard.copyImage('./image.jpg')).rejects.toThrow();
            try {
                await MediaClipboard.copyImage('./image.jpg');
            }
            catch (error) {
                expect(error.message).toContain('Cannot copy from relative path');
                expect(error.message).toContain('Relative paths like');
                expect(error.message).toContain('base64');
                expect(error.message).toContain('HTTP/HTTPS URL');
                expect(error.message).toContain('absolute path');
            }
        });
    });
    describe('Valid paths should not trigger relative path errors', () => {
        const validPaths = [
            '/absolute/path/to/image.jpg',
            'file:///absolute/path/to/image.jpg',
            'https://example.com/image.jpg',
            'http://example.com/image.jpg',
            'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...',
            'assets/image.jpg', // This should work as it has no dots
            'folder/subfolder/image.jpg', // This should work as it has no dots
        ];
        it.each(validPaths)('should not show relative path error for valid path: %s', async (path) => {
            try {
                await MediaClipboard.copyImage(path);
            }
            catch (error) {
                // Should fail for other reasons, but not for relative path issues
                expect(error.message).not.toContain('Cannot copy from relative path');
                expect(error.message).not.toContain('Relative paths like');
            }
        });
    });
});
