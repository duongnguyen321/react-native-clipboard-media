# React Native Media Clipboard - Project Brief

## Overview

A cross-platform React Native library for copying various media types (text, images, videos, PDFs, audio, files) to the system clipboard across iOS, Android, and Web platforms.

## Core Requirements

- ✅ Copy text and URLs across all platforms
- ✅ Copy images (JPG, PNG, GIF, SVG) with multiple input formats
- ✅ Copy videos, PDFs, audio files on native platforms
- ✅ Copy any file type with custom MIME types
- ✅ Cross-platform support (iOS 11+, Android 8+, Web)
- ✅ TypeScript support with comprehensive type definitions
- ✅ Promise-based API for consistent async operations
- ✅ Comprehensive error handling

## Current Issues (Critical)

1. **iOS File Path Resolution**: File paths with URI schemes (file://, content://) fail to load properly
2. **Web Platform Support**: Complete absence of web implementation causes linking errors

## Success Criteria

- iOS successfully copies media from all supported path formats
- Web platform provides clipboard functionality without native module dependencies
- Maintains backward compatibility with existing API
- All platforms handle errors gracefully with appropriate fallbacks

## Technical Constraints

- No external dependencies beyond React Native core
- Must work with Expo and bare React Native projects
- Memory efficient for large file operations
- Secure file access following platform best practices
