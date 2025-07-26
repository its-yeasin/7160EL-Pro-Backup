#!/bin/bash

# Build script for unsigned releases
# This script builds the app without code signing to avoid signature validation errors

echo "Building unsigned release for macOS..."

# Set environment variables to disable signing
export CSC_IDENTITY_AUTO_DISCOVERY=false
export ELECTRON_UPDATER_ALLOW_UNSIGNED=true

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/
rm -rf out/

# Build for macOS using electron-builder
echo "Building for macOS with electron-builder..."
yarn build:mac:unsigned

# Also build with electron-forge for additional installer formats
echo "Building DMG installer with electron-forge..."
yarn build:forge:mac

echo "Build completed!"
echo "You can find the built app in:"
echo "  - dist/ directory (electron-builder output)"
echo "  - out/ directory (electron-forge output)"
echo ""
echo "Note: This build is unsigned and may show security warnings when distributed."
echo "For production releases, consider setting up proper code signing."
