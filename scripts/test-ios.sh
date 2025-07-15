#!/bin/bash

# Quick iOS-only compilation test for Swift/Objective-C bridging
# This is faster than the full native test

set -e

echo "🍎 Testing iOS Swift/Objective-C Compilation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create temp directory for test
TEST_DIR="TestIOSCompilation"
PACKAGE_TGZ="react-native-clipboard-media-*.tgz"

cleanup() {
    echo "🧹 Cleaning up..."
    cd ..
    rm -rf "$TEST_DIR"
    rm -f react-native-clipboard-media-*.tgz
}

# Set up cleanup on exit
trap cleanup EXIT

echo "📦 Packing current package..."
npm pack

echo "🏗️ Creating minimal test React Native project..."
npx @react-native-community/cli@latest init TestIOSCompilation --skip-install
cd "$TEST_DIR"

echo "📱 Installing dependencies..."
npm install
npm install "../react-native-clipboard-media-"*.tgz

echo "🔧 Adding test usage to App.tsx..."
cat > App.tsx << 'EOF'
import React from 'react';
import {SafeAreaView, Text, TouchableOpacity} from 'react-native';
import MediaClipboard from 'react-native-clipboard-media';

function App(): JSX.Element {
  const testCopy = async () => {
    try {
      await MediaClipboard.copyText('Test from native compilation');
      console.log('✅ Native module working!');
    } catch (error) {
      console.error('❌ Native module error:', error);
    }
  };

  return (
    <SafeAreaView>
      <Text>iOS Native Test</Text>
      <TouchableOpacity onPress={testCopy}>
        <Text>Test Native Module</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default App;
EOF

echo "🍎 Testing iOS pod install and compilation..."
cd ios

if pod install; then
    echo -e "${GREEN}✅ iOS pod install successful${NC}"
    
    echo "🔨 Testing Xcode build..."
    # Try to build iOS project
    if xcodebuild -workspace TestIOSCompilation.xcworkspace -scheme TestIOSCompilation -sdk iphonesimulator -configuration Debug -quiet ONLY_ACTIVE_ARCH=NO CODE_SIGNING_ALLOWED=NO build; then
        echo -e "${GREEN}✅ iOS compilation successful - Swift/ObjC bridging working!${NC}"
        echo ""
        echo "🎉 Your Swift/Objective-C bridging fixes are working correctly!"
        echo "📱 The package can now be safely installed as a dependency."
        exit 0
    else
        echo -e "${RED}❌ iOS compilation failed${NC}"
        echo ""
        echo "💡 Check the Xcode build logs above for specific Swift/ObjC bridging errors."
        echo "🔍 Common issues:"
        echo "   - Module import problems"
        echo "   - Swift class not exposed to Objective-C"
        echo "   - Protocol declaration issues"
        exit 1
    fi
else
    echo -e "${RED}❌ iOS pod install failed${NC}"
    echo "💡 This might indicate podspec configuration issues."
    exit 1
fi 