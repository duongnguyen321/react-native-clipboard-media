var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MockClipboardItem_data;
import { MediaClipboardWeb } from '../web/MediaClipboardWeb';
import { ClipboardContentType } from '../index';
// Mock navigator.clipboard
const mockClipboard = {
    writeText: jest.fn(),
    readText: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
};
// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;
// Mock document
const mockDocument = {
    createElement: jest.fn(),
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
    },
    execCommand: jest.fn(),
};
global.document = mockDocument;
// Mock ClipboardItem with required 'supports' static method
class MockClipboardItem {
    constructor(data) {
        _MockClipboardItem_data.set(this, void 0);
        this.getType = jest.fn((type) => Promise.resolve(__classPrivateFieldGet(this, _MockClipboardItem_data, "f")[type]));
        this.types = Object.keys(data);
        __classPrivateFieldSet(this, _MockClipboardItem_data, data, "f");
    }
}
_MockClipboardItem_data = new WeakMap();
MockClipboardItem.supports = jest.fn(() => true);
global.ClipboardItem = MockClipboardItem;
describe('MediaClipboardWeb', () => {
    let clipboardWeb;
    beforeEach(() => {
        clipboardWeb = new MediaClipboardWeb();
        jest.clearAllMocks();
        // Setup default navigator mock
        Object.defineProperty(global, 'navigator', {
            value: {
                clipboard: mockClipboard,
            },
            writable: true,
        });
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('copyText', () => {
        it('should copy text using Clipboard API when available', async () => {
            mockClipboard.writeText.mockResolvedValue(undefined);
            await clipboardWeb.copyText('Hello World');
            expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello World');
        });
        it('should fallback to legacy method when Clipboard API fails', async () => {
            mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'));
            const mockTextarea = {
                value: '',
                style: {},
                focus: jest.fn(),
                select: jest.fn(),
            };
            mockDocument.createElement.mockReturnValue(mockTextarea);
            mockDocument.execCommand.mockReturnValue(true);
            await clipboardWeb.copyText('Hello World');
            expect(mockDocument.createElement).toHaveBeenCalledWith('textarea');
            expect(mockTextarea.value).toBe('Hello World');
            expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');
        });
        it('should fallback to legacy method when Clipboard API is not available', async () => {
            Object.defineProperty(global, 'navigator', {
                value: {},
                writable: true,
            });
            const mockTextarea = {
                value: '',
                style: {},
                focus: jest.fn(),
                select: jest.fn(),
            };
            mockDocument.createElement.mockReturnValue(mockTextarea);
            mockDocument.execCommand.mockReturnValue(true);
            await clipboardWeb.copyText('Hello World');
            expect(mockDocument.createElement).toHaveBeenCalledWith('textarea');
            expect(mockTextarea.value).toBe('Hello World');
        });
        it('should throw error when legacy method fails', async () => {
            Object.defineProperty(global, 'navigator', {
                value: {},
                writable: true,
            });
            mockDocument.createElement.mockImplementation(() => {
                throw new Error('DOM error');
            });
            await expect(clipboardWeb.copyText('Hello World')).rejects.toThrow('Failed to copy text: DOM error');
        });
    });
    describe('copyImage', () => {
        it('should copy base64 image data', async () => {
            const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
            const mockBlob = new Blob(['fake image data'], { type: 'image/png' });
            mockFetch.mockResolvedValue({
                blob: () => Promise.resolve(mockBlob),
            });
            mockClipboard.write.mockResolvedValue(undefined);
            await clipboardWeb.copyImage(base64Image);
            expect(mockFetch).toHaveBeenCalledWith(base64Image);
            expect(mockClipboard.write).toHaveBeenCalledWith([
                expect.objectContaining({
                    types: ['image/png'],
                }),
            ]);
        });
        it('should copy image from URL', async () => {
            const imageUrl = 'https://example.com/image.jpg';
            const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                blob: () => Promise.resolve(mockBlob),
            });
            mockClipboard.write.mockResolvedValue(undefined);
            await clipboardWeb.copyImage(imageUrl);
            expect(mockFetch).toHaveBeenCalledWith(imageUrl);
            expect(mockClipboard.write).toHaveBeenCalledWith([
                expect.objectContaining({
                    types: ['image/jpeg'],
                }),
            ]);
        });
        it('should throw error when advanced Clipboard API is not available', async () => {
            Object.defineProperty(global, 'navigator', {
                value: {
                    clipboard: {
                        writeText: jest.fn(),
                    },
                },
                writable: true,
            });
            await expect(clipboardWeb.copyImage('test.jpg')).rejects.toThrow('Image copying is not supported in this browser');
        });
        it('should throw error for relative paths', async () => {
            await expect(clipboardWeb.copyImage('./relative/path.jpg')).rejects.toThrow('Cannot copy from relative path');
        });
        it('should throw error when fetch fails', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });
            await expect(clipboardWeb.copyImage('https://example.com/missing.jpg')).rejects.toThrow('Failed to fetch image from URL');
        });
        it('should throw error for non-image content', async () => {
            const mockBlob = new Blob(['not an image'], { type: 'text/plain' });
            mockFetch.mockResolvedValue({
                ok: true,
                blob: () => Promise.resolve(mockBlob),
            });
            await expect(clipboardWeb.copyImage('https://example.com/text.txt')).rejects.toThrow('File is not a valid image');
        });
    });
    describe('copyVideo', () => {
        it('should throw error for video copying with resolved path info', async () => {
            await expect(clipboardWeb.copyVideo('https://example.com/video.mp4')).rejects.toThrow('Video copying is not supported in web browsers');
        });
        it('should throw error for relative paths', async () => {
            await expect(clipboardWeb.copyVideo('./video.mp4')).rejects.toThrow('Cannot copy from relative path');
        });
    });
    describe('copyPDF', () => {
        it('should throw error for PDF copying with resolved path info', async () => {
            await expect(clipboardWeb.copyPDF('https://example.com/document.pdf')).rejects.toThrow('PDF copying is not supported in web browsers');
        });
        it('should throw error for relative paths', async () => {
            await expect(clipboardWeb.copyPDF('./document.pdf')).rejects.toThrow('Cannot copy from relative path');
        });
    });
    describe('copyAudio', () => {
        it('should throw error for audio copying with resolved path info', async () => {
            await expect(clipboardWeb.copyAudio('https://example.com/audio.mp3')).rejects.toThrow('Audio copying is not supported in web browsers');
        });
        it('should throw error for relative paths', async () => {
            await expect(clipboardWeb.copyAudio('./audio.mp3')).rejects.toThrow('Cannot copy from relative path');
        });
    });
    describe('copyFile', () => {
        it('should copy image files by delegating to copyImage', async () => {
            const imageUrl = 'https://example.com/image.jpg';
            const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
            mockFetch.mockResolvedValue({
                ok: true,
                blob: () => Promise.resolve(mockBlob),
            });
            mockClipboard.write.mockResolvedValue(undefined);
            await clipboardWeb.copyFile(imageUrl, 'image/jpeg');
            expect(mockFetch).toHaveBeenCalledWith(imageUrl);
            expect(mockClipboard.write).toHaveBeenCalled();
        });
        it('should copy text files as text', async () => {
            const textUrl = 'https://example.com/file.txt';
            mockFetch.mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('Hello World'),
            });
            mockClipboard.writeText.mockResolvedValue(undefined);
            await clipboardWeb.copyFile(textUrl, 'text/plain');
            expect(mockFetch).toHaveBeenCalledWith(textUrl);
            expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello World');
        });
        it('should throw error for unsupported video MIME types', async () => {
            await expect(clipboardWeb.copyFile('https://example.com/video.mp4', 'video/mp4')).rejects.toThrow('Video files (video/mp4) are not supported');
        });
        it('should throw error for unsupported PDF MIME types', async () => {
            await expect(clipboardWeb.copyFile('https://example.com/doc.pdf', 'application/pdf')).rejects.toThrow('PDF files are not supported');
        });
        it('should throw error for unsupported audio MIME types', async () => {
            await expect(clipboardWeb.copyFile('https://example.com/audio.mp3', 'audio/mp3')).rejects.toThrow('Audio files (audio/mp3) are not supported');
        });
        it('should throw error for unsupported MIME types', async () => {
            await expect(clipboardWeb.copyFile('https://example.com/file.bin', 'application/octet-stream')).rejects.toThrow("MIME type 'application/octet-stream' is not supported");
        });
        it('should throw error when advanced Clipboard API is not available', async () => {
            Object.defineProperty(global, 'navigator', {
                value: {
                    clipboard: {
                        writeText: jest.fn(),
                    },
                },
                writable: true,
            });
            await expect(clipboardWeb.copyFile('https://example.com/file.bin', 'application/octet-stream')).rejects.toThrow('File copying is not supported in this browser');
        });
        it('should throw error for relative paths', async () => {
            await expect(clipboardWeb.copyFile('./file.txt', 'text/plain')).rejects.toThrow('Cannot copy from relative path');
        });
    });
    describe('copyLargeFile', () => {
        it('should call copyFile with progress tracking', async () => {
            const progressCallback = jest.fn();
            const textUrl = 'https://example.com/large.txt';
            mockFetch.mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('Large file content'),
            });
            mockClipboard.writeText.mockResolvedValue(undefined);
            await clipboardWeb.copyLargeFile(textUrl, 'text/plain', progressCallback);
            expect(progressCallback).toHaveBeenCalledWith(0);
            expect(progressCallback).toHaveBeenCalledWith(100);
            expect(mockFetch).toHaveBeenCalledWith(textUrl);
        });
        it('should work without progress callback', async () => {
            const textUrl = 'https://example.com/large.txt';
            mockFetch.mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('Large file content'),
            });
            mockClipboard.writeText.mockResolvedValue(undefined);
            await expect(clipboardWeb.copyLargeFile(textUrl, 'text/plain')).resolves.toBeUndefined();
        });
    });
    describe('hasContent', () => {
        it('should return true when clipboard has text content', async () => {
            mockClipboard.readText.mockResolvedValue('Some text');
            const result = await clipboardWeb.hasContent();
            expect(result).toBe(true);
            expect(mockClipboard.readText).toHaveBeenCalled();
        });
        it('should return false when clipboard is empty', async () => {
            mockClipboard.readText.mockResolvedValue('');
            const result = await clipboardWeb.hasContent();
            expect(result).toBe(false);
        });
        it('should return false when Clipboard API is not available', async () => {
            Object.defineProperty(global, 'navigator', {
                value: {},
                writable: true,
            });
            const result = await clipboardWeb.hasContent();
            expect(result).toBe(false);
        });
        it('should return false when reading clipboard fails', async () => {
            mockClipboard.readText.mockRejectedValue(new Error('Permission denied'));
            const result = await clipboardWeb.hasContent();
            expect(result).toBe(false);
        });
    });
    describe('getContent', () => {
        it('should return text content when available', async () => {
            mockClipboard.readText.mockResolvedValue('Hello World');
            const result = await clipboardWeb.getContent();
            expect(result).toEqual({
                type: ClipboardContentType.TEXT,
                data: 'Hello World',
                size: 11,
            });
        });
        it('should return image content when available', async () => {
            mockClipboard.readText.mockResolvedValue('');
            const mockBlob = new Blob(['image data'], {
                type: 'image/png',
                size: 100,
            });
            const mockClipboardItem = {
                types: ['image/png'],
                getType: jest.fn().mockResolvedValue(mockBlob),
            };
            mockClipboard.read.mockResolvedValue([mockClipboardItem]);
            const result = await clipboardWeb.getContent();
            expect(result).toEqual({
                type: ClipboardContentType.IMAGE,
                mimeType: 'image/png',
                size: 100,
            });
        });
        it('should return file content for other types', async () => {
            mockClipboard.readText.mockResolvedValue('');
            const mockClipboardItem = {
                types: ['application/pdf'],
                getType: jest.fn(),
            };
            mockClipboard.read.mockResolvedValue([mockClipboardItem]);
            const result = await clipboardWeb.getContent();
            expect(result).toEqual({
                type: ClipboardContentType.FILE,
                mimeType: 'application/pdf',
            });
        });
        it('should return unknown when no content available', async () => {
            mockClipboard.readText.mockResolvedValue('');
            mockClipboard.read.mockResolvedValue([]);
            const result = await clipboardWeb.getContent();
            expect(result).toEqual({
                type: ClipboardContentType.UNKNOWN,
            });
        });
        it('should return unknown when Clipboard API is not available', async () => {
            Object.defineProperty(global, 'navigator', {
                value: {},
                writable: true,
            });
            const result = await clipboardWeb.getContent();
            expect(result).toEqual({
                type: ClipboardContentType.UNKNOWN,
            });
        });
        it('should handle errors gracefully', async () => {
            mockClipboard.readText.mockRejectedValue(new Error('Permission denied'));
            const result = await clipboardWeb.getContent();
            expect(result).toEqual({
                type: ClipboardContentType.UNKNOWN,
            });
        });
    });
    describe('clear', () => {
        it('should clear clipboard using Clipboard API', async () => {
            mockClipboard.writeText.mockResolvedValue(undefined);
            await clipboardWeb.clear();
            expect(mockClipboard.writeText).toHaveBeenCalledWith('');
        });
        it('should fallback to legacy method when Clipboard API fails', async () => {
            mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'));
            const mockTextarea = {
                value: '',
                style: {},
                focus: jest.fn(),
                select: jest.fn(),
            };
            mockDocument.createElement.mockReturnValue(mockTextarea);
            mockDocument.execCommand.mockReturnValue(true);
            await clipboardWeb.clear();
            expect(mockDocument.createElement).toHaveBeenCalledWith('textarea');
            expect(mockTextarea.value).toBe('');
        });
        it('should work when Clipboard API is not available', async () => {
            Object.defineProperty(global, 'navigator', {
                value: {},
                writable: true,
            });
            const mockTextarea = {
                value: '',
                style: {},
                focus: jest.fn(),
                select: jest.fn(),
            };
            mockDocument.createElement.mockReturnValue(mockTextarea);
            mockDocument.execCommand.mockReturnValue(true);
            await clipboardWeb.clear();
            expect(mockDocument.createElement).toHaveBeenCalledWith('textarea');
        });
    });
});
