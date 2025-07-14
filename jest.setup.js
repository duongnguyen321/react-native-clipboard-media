/* eslint-env jest */
// Mock React Native modules that are not available in Node.js test environment
jest.mock('react-native', () => {
  return {
    NativeModules: {
      MediaClipboard: {
        copyText: jest.fn(() => Promise.resolve()),
        copyImage: jest.fn(() => Promise.resolve()),
        copyVideo: jest.fn(() => Promise.resolve()),
        copyPDF: jest.fn(() => Promise.resolve()),
        copyAudio: jest.fn(() => Promise.resolve()),
        copyFile: jest.fn(() => Promise.resolve()),
        copyLargeFile: jest.fn(() => Promise.resolve()),
        hasContent: jest.fn(() => Promise.resolve(true)),
        getContent: jest.fn(() =>
          Promise.resolve({ type: 'text', data: 'test' }),
        ),
        clear: jest.fn(() => Promise.resolve()),
      },
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((config) => config.ios || config.default),
    },
  };
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
