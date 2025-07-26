module.exports = {
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'its-yeasin',
          name: '7160EL-Pro-Backup',
        },
        prerelease: false,
        draft: false,
      },
    },
  ],
  packagerConfig: {
    icon: './src/assets/backup-pro-logo',
    appBundleId: 'com.bikiran.probackup',
    appCategoryType: 'public.app-category.productivity',
    osxSign: false, // Disable signing for now to avoid signature errors
    osxNotarize: false,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'pro-backup',
        setupIcon: './src/assets/backup-pro-logo.png'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        macUpdateManifestBaseUrl: 'https://github.com/its-yeasin/7160EL-Pro-Backup/releases/latest/download/'
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        name: 'Pro Backup',
        title: 'Pro Backup ${version}',
        icon: './src/assets/backup-pro-logo.png',
        background: './src/assets/backup-pro-logo.png',
        format: 'UDZO'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Bikiran',
          homepage: 'https://bikiran.com',
          description: 'Pro Backup - Professional Backup Solution'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Bikiran',
          homepage: 'https://bikiran.com',
          description: 'Pro Backup - Professional Backup Solution'
        }
      },
    },
  ],
};
