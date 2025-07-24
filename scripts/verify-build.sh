#!/bin/bash

# Build verification script for Pro Backup

echo "🔍 Verifying Pro Backup build files..."

DIST_DIR="./dist"
VERSION=$(node -p "require('./package.json').version")

echo "📦 Version: $VERSION"
echo "📁 Checking dist directory: $DIST_DIR"

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Error: dist directory not found"
    exit 1
fi

echo ""
echo "📋 Build files verification:"

# Check DMG files
if [ -f "$DIST_DIR/Pro Backup-$VERSION.dmg" ]; then
    SIZE=$(ls -lh "$DIST_DIR/Pro Backup-$VERSION.dmg" | awk '{print $5}')
    echo "✅ Intel DMG: Pro Backup-$VERSION.dmg ($SIZE)"
else
    echo "❌ Missing: Pro Backup-$VERSION.dmg"
fi

if [ -f "$DIST_DIR/Pro Backup-$VERSION-arm64.dmg" ]; then
    SIZE=$(ls -lh "$DIST_DIR/Pro Backup-$VERSION-arm64.dmg" | awk '{print $5}')
    echo "✅ Apple Silicon DMG: Pro Backup-$VERSION-arm64.dmg ($SIZE)"
else
    echo "❌ Missing: Pro Backup-$VERSION-arm64.dmg"
fi

# Check ZIP files (for auto-updater)
if [ -f "$DIST_DIR/Pro Backup-$VERSION-mac.zip" ]; then
    SIZE=$(ls -lh "$DIST_DIR/Pro Backup-$VERSION-mac.zip" | awk '{print $5}')
    echo "✅ Intel ZIP: Pro Backup-$VERSION-mac.zip ($SIZE)"
else
    echo "❌ Missing: Pro Backup-$VERSION-mac.zip"
fi

if [ -f "$DIST_DIR/Pro Backup-$VERSION-arm64-mac.zip" ]; then
    SIZE=$(ls -lh "$DIST_DIR/Pro Backup-$VERSION-arm64-mac.zip" | awk '{print $5}')
    echo "✅ Apple Silicon ZIP: Pro Backup-$VERSION-arm64-mac.zip ($SIZE)"
else
    echo "❌ Missing: Pro Backup-$VERSION-arm64-mac.zip"
fi

# Check metadata
if [ -f "$DIST_DIR/latest-mac.yml" ]; then
    echo "✅ Auto-updater metadata: latest-mac.yml"
else
    echo "❌ Missing: latest-mac.yml"
fi

echo ""
echo "🎯 Summary:"
echo "   • Build version: $VERSION"
echo "   • Total files in dist/: $(ls -1 "$DIST_DIR" | wc -l | tr -d ' ')"
echo "   • Total size: $(du -sh "$DIST_DIR" | awk '{print $1}')"

echo ""
echo "🚀 Next steps:"
echo "   1. Test the DMG files by mounting them"
echo "   2. Use GitHub Actions workflow for automated releases"
echo "   3. The ZIP files will handle auto-updates"

echo ""
echo "✅ Build verification complete!"
