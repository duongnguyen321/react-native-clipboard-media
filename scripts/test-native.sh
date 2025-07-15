#!/bin/bash

# Script to test native iOS and Android compilation
# This creates a minimal React Native project and tests our package compilation

set -e

echo "🧪 Testing Native iOS/Android Compilation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create temp directory for test
TEST_DIR="TestNativeCompilation"
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

echo "🏗️ Creating test React Native project..."
npx @react-native-community/cli@latest init TestNativeCompilation --skip-install
cd "$TEST_DIR"

echo "📱 Installing dependencies..."
npm install
npm install "../react-native-clipboard-media-"*.tgz

echo "🍎 Testing iOS compilation..."
cd ios
if pod install; then
    echo -e "${GREEN}✅ iOS pod install successful${NC}"
    
    # Try to build iOS project
    if xcodebuild -workspace TestNativeCompilation.xcworkspace -scheme TestNativeCompilation -sdk iphonesimulator -configuration Debug -quiet ONLY_ACTIVE_ARCH=NO CODE_SIGNING_ALLOWED=NO build; then
        echo -e "${GREEN}✅ iOS compilation successful${NC}"
        IOS_SUCCESS=true
    else
        echo -e "${RED}❌ iOS compilation failed${NC}"
        IOS_SUCCESS=false
    fi
else
    echo -e "${RED}❌ iOS pod install failed${NC}"
    IOS_SUCCESS=false
fi

cd ..

echo "🤖 Testing Android compilation..."
cd android
if ./gradlew assembleDebug --quiet; then
    echo -e "${GREEN}✅ Android compilation successful${NC}"
    ANDROID_SUCCESS=true
else
    echo -e "${RED}❌ Android compilation failed${NC}"
    ANDROID_SUCCESS=false
fi

cd ..

# Summary
echo ""
echo "📊 Test Results:"
if [ "$IOS_SUCCESS" = true ]; then
    echo -e "iOS: ${GREEN}✅ PASS${NC}"
else
    echo -e "iOS: ${RED}❌ FAIL${NC}"
fi

if [ "$ANDROID_SUCCESS" = true ]; then
    echo -e "Android: ${GREEN}✅ PASS${NC}"
else
    echo -e "Android: ${RED}❌ FAIL${NC}"
fi

if [ "$IOS_SUCCESS" = true ] && [ "$ANDROID_SUCCESS" = true ]; then
    echo -e "\n${GREEN}🎉 All native compilations successful!${NC}"
    exit 0
else
    echo -e "\n${RED}💥 Some native compilations failed!${NC}"
    exit 1
fi 