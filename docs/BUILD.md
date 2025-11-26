# Building and Distributing Oasis Write

This guide covers building Oasis Write for distribution across all supported platforms.

## Building for Your Platform

### Development Build
```bash
npm run tauri dev
```

### Production Build
```bash
npm run tauri build
```

This will create platform-specific installers in `src-tauri/target/release/bundle/`:

- **macOS**: `.dmg` and `.app` in `dmg/` and `macos/`
- **Windows**: `.msi` and `.exe` in `msi/` and `nsis/`
- **Linux**: `.deb`, `.AppImage`, and `.rpm` in respective folders

## Cross-Platform Building

### Building on macOS

**For macOS:**
```bash
npm run tauri build -- --target universal-apple-darwin
```
This creates a universal binary supporting both Intel and Apple Silicon.

**For Windows (from macOS):**
Cross-compilation from macOS to Windows is not officially supported by Tauri. Use GitHub Actions or a Windows machine.

**For Linux (from macOS):**
Not recommended. Use Docker or GitHub Actions instead.

### Building on Windows

**For Windows:**
```bash
npm run tauri build
```

**For Linux/macOS:**
Not supported. Use GitHub Actions or native machines.

### Building on Linux

**For Linux:**
```bash
npm run tauri build
```

**For other platforms:**
Use GitHub Actions for cross-platform builds.

## Automated Builds with GitHub Actions

We use GitHub Actions to build for all platforms automatically. See `.github/workflows/release.yml`.

### Creating a Release

1. Update version in `src-tauri/tauri.conf.json`
2. Update version in `package.json`
3. Commit changes
4. Create and push a tag:
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin v0.1.0
   ```
5. GitHub Actions will automatically build for all platforms
6. Installers will be attached to the GitHub Release

## Platform-Specific Configuration

### macOS

**Code Signing (for distribution):**
1. Get an Apple Developer account ($99/year)
2. Create certificates in Apple Developer Portal
3. Add secrets to GitHub Actions:
   - `APPLE_CERTIFICATE`
   - `APPLE_CERTIFICATE_PASSWORD`
   - `APPLE_ID`
   - `APPLE_PASSWORD`
   - `APPLE_TEAM_ID`

**Notarization:**
Required for macOS 10.15+. Configured in `tauri.conf.json`:
```json
"bundle": {
  "macOS": {
    "signingIdentity": null,
    "hardenedRuntime": true,
    "entitlements": null
  }
}
```

### Windows

**Code Signing (optional but recommended):**
1. Purchase a code signing certificate
2. Add to GitHub Actions secrets
3. Configure in build workflow

### Linux

No special requirements for basic distribution.

**Distribution formats:**
- `.deb` - Debian/Ubuntu
- `.AppImage` - Universal (recommended)
- `.rpm` - Fedora/RHEL

## File Size Optimization

### Reduce Bundle Size

1. **Strip debug symbols** (already done in release mode)
2. **Enable LTO** in `src-tauri/Cargo.toml`:
   ```toml
   [profile.release]
   lto = true
   opt-level = "z"
   codegen-units = 1
   ```
3. **Use UPX** (optional, for smaller executables):
   ```bash
   upx --best --lzma target/release/bundle/macos/oasis-write.app/Contents/MacOS/oasis-write
   ```

## Distribution Channels

### 1. GitHub Releases
- Automatic via GitHub Actions
- Free hosting
- Direct download links

### 2. Package Managers

**macOS (Homebrew):**
Create a Homebrew Cask formula:
```ruby
cask "oasis-write" do
  version "0.1.0"
  sha256 "..."
  url "https://github.com/yourusername/oasis-write/releases/download/v#{version}/oasis-write_#{version}_universal.dmg"
  name "Oasis Write"
  desc "Serene markdown writing environment"
  homepage "https://oasis-write.com"

  app "Oasis Write.app"
end
```

**Linux (AUR for Arch):**
Create a PKGBUILD file for Arch User Repository.

**Windows (Winget):**
Submit to Windows Package Manager repository.

### 3. App Stores

**macOS App Store:**
- Requires Apple Developer account
- More restrictions and review process
- Better discoverability

**Microsoft Store:**
- Requires developer account
- Better discoverability on Windows

**Snapcraft (Linux):**
- Universal Linux distribution
- Automatic updates

## Update System

Tauri supports built-in updates. Configure in `tauri.conf.json`:

```json
"updater": {
  "active": true,
  "endpoints": [
    "https://releases.oasis-write.com/{{target}}/{{current_version}}"
  ],
  "dialog": true,
  "pubkey": "YOUR_PUBLIC_KEY"
}
```

Generate keys:
```bash
npm run tauri signer generate
```

## Testing Builds

### Before Release
1. Test on clean machines (VMs recommended)
2. Verify all features work
3. Check file sizes
4. Test auto-update (if implemented)
5. Verify code signing

### Platforms to Test
- macOS: Intel and Apple Silicon
- Windows: Windows 10 and 11
- Linux: Ubuntu, Fedora, Arch (via AppImage)

## Analytics (Optional)

Consider adding privacy-respecting analytics:
- **Telemetry**: Version usage, crash reports
- **Update stats**: Which versions are most used
- Use opt-in only, respecting user privacy

## License and Legal

Before distribution:
1. Choose a license (add to `LICENSE` file)
2. Update `tauri.conf.json` with license
3. Include third-party licenses
4. Create privacy policy (if collecting any data)

## Checklist for First Release

- [ ] Update version numbers
- [ ] Test on all target platforms
- [ ] Set up code signing (macOS/Windows)
- [ ] Create GitHub Release
- [ ] Update website with download links
- [ ] Write release notes
- [ ] Test installers on clean systems
- [ ] Announce release (social media, forums, etc.)
