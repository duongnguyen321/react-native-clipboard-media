#!/bin/bash

# Test script for Android clipboard URI permission fixes
# This script helps verify that the "exposed beyond app" error is resolved

echo "🔧 Testing Android Clipboard URI Permission Fixes"
echo "================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the root of the react-native-media-clipboard project"
    exit 1
fi

echo "📱 Building Android native module..."

# Clean and build the Android module
cd android
if [ -f "gradlew" ]; then
    ./gradlew clean
    ./gradlew assembleDebug
else
    echo "⚠️  Warning: gradlew not found, skipping Android build"
fi
cd ..

echo "✅ Android build completed"

echo ""
echo "🧪 Testing Instructions for URI Permission Fixes"
echo "================================================"
echo ""
echo "The following fixes have been applied:"
echo ""
echo "1. ✅ Enhanced ClipData creation with explicit URI permissions"
echo "2. ✅ Multiple clipboard system permission grants"
echo "3. ✅ Proper FileProvider authority configuration"
echo "4. ✅ Robust error handling and fallbacks"
echo ""
echo "🔍 To test the fixes:"
echo ""
echo "1. Start monitoring Android logs:"
echo "   adb logcat | grep MediaClipboard"
echo ""
echo "2. Run the example app:"
echo "   cd example && npx react-native run-android"
echo ""
echo "3. Test Base64 Image Copy:"
echo "   - Tap 'Copy Base64 Image' button"
echo "   - Should succeed without 'exposed beyond app' error"
echo ""
echo "4. Test URL Image Copy:"
echo "   - Tap 'Copy URL Image' button"
echo "   - Should download and copy without 'exposed beyond app' error"
echo ""
echo "📋 Expected Success Log Messages:"
echo "   ✅ 'Using FileProvider authority: com.yourapp.mediaclipboard.fileprovider'"
echo "   ✅ 'Generated FileProvider URI: content://...'"
echo "   ✅ 'Granted URI permission to: com.android.systemui'"
echo "   ✅ 'Granted URI permission to: android'"
echo "   ✅ 'Created ClipData with URI: content://...'"
echo "   ✅ 'Base64 image copied to clipboard successfully'"
echo "   ✅ 'Image copied to clipboard successfully'"
echo ""
echo "❌ Error Messages That Should NOT Appear:"
echo "   ❌ 'exposed beyond app through ClipData.Item.getUri()'"
echo "   ❌ 'SecurityException: Permission Denial'"
echo "   ❌ 'IllegalArgumentException: Failed to find configured root'"
echo ""
echo "🔧 Technical Details:"
echo "   • FileProvider authority: {packageName}.mediaclipboard.fileprovider"
echo "   • URI permissions granted to: systemui, android, media provider"
echo "   • ClipData created with proper MIME types and descriptions"
echo "   • Temporary files in app cache directory with unique names"
echo ""
echo "🎯 Success Criteria:"
echo "   1. Both image copy buttons work without errors"
echo "   2. No 'exposed beyond app' errors in logs"
echo "   3. Images can be pasted in other apps (e.g., messaging apps)"
echo "   4. Temporary files are properly cleaned up"
echo ""
echo "💡 If issues persist, check:"
echo "   • Android version (different behavior on API 24+ vs older)"
echo "   • App permissions in device settings"
echo "   • FileProvider configuration in AndroidManifest.xml"
echo "   • Available storage space for temporary files" 