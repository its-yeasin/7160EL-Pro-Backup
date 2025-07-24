#!/bin/bash

# Release preparation script for Pro Backup
# This script helps prepare a new release by updating version and creating a git tag

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "This script must be run from within a git repository"
    exit 1
fi

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    print_warning "Working directory is not clean. Please commit or stash changes first."
    git status --short
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Ask for new version
echo -n "Enter new version (current: $CURRENT_VERSION): "
read NEW_VERSION

if [[ -z "$NEW_VERSION" ]]; then
    print_error "Version cannot be empty"
    exit 1
fi

# Validate version format (basic semver check)
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Version must be in semver format (e.g., 1.2.3)"
    exit 1
fi

# Check if tag already exists
if git tag --list | grep -q "^v$NEW_VERSION$"; then
    print_error "Tag v$NEW_VERSION already exists"
    exit 1
fi

print_status "Updating version to $NEW_VERSION..."

# Update package.json version
npm version $NEW_VERSION --no-git-tag-version

# Commit the version change
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create and push tag
print_status "Creating tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

print_status "Pushing changes and tag to origin..."
git push origin main
git push origin "v$NEW_VERSION"

print_status "✅ Release v$NEW_VERSION has been prepared and pushed!"
print_status "GitHub Actions will now build and create the release automatically."
print_status "Check the Actions tab in your GitHub repository for progress."

# Show the release URL
REPO_URL=$(git remote get-url origin | sed 's/\.git$//')
if [[ $REPO_URL == git@* ]]; then
    REPO_URL=$(echo $REPO_URL | sed 's/git@github.com:/https:\/\/github.com\//')
fi

print_status "Release will be available at: $REPO_URL/releases/tag/v$NEW_VERSION"
