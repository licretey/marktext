import EnvPaths from 'common/envPaths'

// In packaged builds the ripgrep binary is copied to resources/ripgrep/rg via
// electron-builder extraResources so it is accessible outside the asar archive.
// asarUnpack extraction is unreliable across platforms and packaging formats.
const resolveRgPath = () => {
  if (process.env.MARKTEXT_RIPGREP_PATH) {
    return process.env.MARKTEXT_RIPGREP_PATH
  }

  // When running from an asar the path contains 'app.asar' — use the
  // extraResources copy that lives outside the archive.
  if (window.rgPath.includes('app.asar')) {
    return window.path.join(process.resourcesPath, 'ripgrep', 'rg')
  }

  return window.rgPath
}

const rgDiskPath = resolveRgPath()

class RendererPaths extends EnvPaths {
  /**
   * Configure and sets all application paths.
   *
   * @param {string} userDataPath The user data path.
   */
  constructor(userDataPath) {
    if (!userDataPath) {
      throw new Error('No user data path is given.')
    }

    // Initialize environment paths
    super(userDataPath)

    // Allow to use a local ripgrep binary (e.g. an optimized version).
    if (process.env.MARKTEXT_RIPGREP_PATH) {
      // NOTE: Binary must be a compatible version, otherwise the searcher may fail.
      this._ripgrepBinaryPath = process.env.MARKTEXT_RIPGREP_PATH
    } else {
      this._ripgrepBinaryPath = rgDiskPath
    }
  }

  // Returns the path to ripgrep on disk.
  get ripgrepBinaryPath() {
    return this._ripgrepBinaryPath
  }
}

export default RendererPaths
