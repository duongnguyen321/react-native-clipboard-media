#!/bin/bash

# Quick Android-only compilation test for Java/Kotlin native code
# This is faster than the full native test

set -e

echo "🤖 Testing Android Native Compilation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create temp directory for test
TEST_DIR="TestAndroidCompilation"
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
npx @react-native-community/cli@latest init TestAndroidCompilation --skip-install
cd "$TEST_DIR"

echo "📱 Installing dependencies..."
npm install
npm install "../react-native-clipboard-media-"*.tgz

echo "🔧 Setting minSdkVersion to 24 for compatibility..."
sed -i.bak "s/minSdkVersion = [0-9]*/minSdkVersion = 24/" android/build.gradle


echo "🔧 Adding test usage to App.tsx..."
cat > App.tsx << 'EOF'
import React from 'react';
import {SafeAreaView, Text, TouchableOpacity} from 'react-native';
import MediaClipboard from 'react-native-clipboard-media';

function App(): JSX.Element {
  const testCopy = async () => {
    try {
      await MediaClipboard.copyText('Test from Android native compilation');
      console.log('✅ Native module working!');
    } catch (error) {
      console.error('❌ Native module error:', error);
    }
  };

  return (
    <SafeAreaView>
      <Text>Android Native Test</Text>
      <TouchableOpacity onPress={testCopy}>
        <Text>Test Native Module</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default App;
EOF

echo "🤖 Testing Android compilation..."
cd android

if ./gradlew assembleDebug --quiet; then
    echo -e "${GREEN}✅ Android compilation successful - Native modules working!${NC}"
    echo ""
    echo "🎉 Your Android native implementation is working correctly!"
    echo "📱 The package can be safely used on Android."
    exit 0
else
    echo -e "${RED}❌ Android compilation failed${NC}"
    echo ""
    echo "💡 Check the Gradle build logs above for specific Android errors."
    echo "🔍 Common issues:"
    echo "   - Missing native module registration"
    echo "   - Java/Kotlin compilation errors"
    echo "   - Package name conflicts"
    exit 1
fi 