# Release Process

This document describes how to create a new release for Pro Backup.

## Automated Release Process

The project uses GitHub Actions to automatically build and release the application when a new version tag is pushed.

### Quick Release (Recommended)

1. **Use the preparation script:**
   ```bash
   npm run release:prepare
   ```
   
   This script will:
   - Prompt you for a new version number
   - Update `package.json`
   - Create a git commit
   - Create and push a version tag
   - Trigger the automated build and release

2. **Monitor the release:**
   - Go to the [Actions tab](https://github.com/its-yeasin/7160EL-Pro-Backup/actions) in your GitHub repository
   - Watch the "Build and Release" workflow progress
   - Once complete, the release will be available in the [Releases section](https://github.com/its-yeasin/7160EL-Pro-Backup/releases)

### Manual Release Process

If you prefer to handle the version management manually:

1. **Update the version in package.json:**
   ```bash
   npm version patch  # for bug fixes (1.1.2 → 1.1.3)
   npm version minor  # for new features (1.1.2 → 1.2.0)
   npm version major  # for breaking changes (1.1.2 → 2.0.0)
   ```

2. **Push the changes and tag:**
   ```bash
   git push origin main
   git push origin --tags
   ```

3. **GitHub Actions will automatically:**
   - Build the application for Windows, macOS, and Linux
   - Create a GitHub release
   - Upload all necessary files including auto-updater metadata

### Manual Workflow Trigger

You can also trigger the build manually:

1. Go to the [Actions tab](https://github.com/its-yeasin/7160EL-Pro-Backup/actions)
2. Select "Build and Release" workflow
3. Click "Run workflow"
4. Choose whether to create a release

## What Gets Built

The automated process creates the following files:

### Windows
- `Pro-Backup-Setup-{version}.exe` - Windows installer
- `latest.yml` - Auto-updater metadata

### macOS
- `Pro-Backup-{version}.dmg` - Intel Mac disk image
- `Pro-Backup-{version}-arm64.dmg` - Apple Silicon Mac disk image
- `Pro-Backup-{version}-mac.zip` - Intel Mac auto-updater package
- `Pro-Backup-{version}-arm64-mac.zip` - Apple Silicon Mac auto-updater package
- `latest-mac.yml` - Auto-updater metadata

### Linux
- `pro-backup_{version}_amd64.deb` - Debian/Ubuntu package
- `latest-linux.yml` - Auto-updater metadata

## Auto-Updater Support

The application includes auto-updater functionality that checks for new releases:

- **Windows**: Uses the `.exe` installer and `latest.yml`
- **macOS**: Uses the `.zip` files and `latest-mac.yml`
- **Linux**: Uses the `.deb` package and `latest-linux.yml`

The auto-updater will only work with applications that are installed from official releases, not development builds.

## Troubleshooting

### Build Fails
- Check the Actions logs for specific error messages
- Ensure all dependencies are correctly specified in `package.json`
- Verify that the build scripts work locally

### Auto-Updater Issues
- Ensure both `.dmg` and `.zip` files are present for macOS releases
- Verify that the `latest-*.yml` files are included in the release
- Check that the version number follows semantic versioning (x.y.z)

### GitHub Actions Not Triggering
- Ensure you're pushing tags (not just commits)
- Verify the workflow file syntax
- Check repository permissions and GitHub token access

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **PATCH** (x.y.Z) - Bug fixes
- **MINOR** (x.Y.z) - New features (backward compatible)
- **MAJOR** (X.y.z) - Breaking changes

## Utilities

- `npm run version:check` - Display current version
- `npm run release:check` - Test build process without publishing
- `npm run release:prepare` - Interactive release preparation
