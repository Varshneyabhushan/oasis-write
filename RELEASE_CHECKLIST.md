# Release Checklist

Use this checklist when preparing a new release of Oasis Write.

## Pre-Release

### Code Preparation
- [ ] All features for this release are complete
- [ ] All tests pass
- [ ] Code has been reviewed
- [ ] No console warnings or errors
- [ ] Dependencies are up to date (`npm audit`)

### Documentation
- [ ] README.md is up to date
- [ ] FEATURES.md reflects current state
- [ ] CHANGELOG.md has entries for this version
- [ ] Code comments are clear and helpful

### Version Bumping
- [ ] Update version in `package.json`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Versions match in both files
- [ ] Version follows semver (major.minor.patch)

## Testing

### Local Build Testing
- [ ] Development build runs: `npm run tauri dev`
- [ ] Production build succeeds: `npm run tauri build`
- [ ] Installer opens and installs correctly
- [ ] App launches from installed version
- [ ] All features work in production build

### Feature Testing
- [ ] File operations (create, rename, delete)
- [ ] Markdown rendering
- [ ] Auto-save functionality
- [ ] Keyboard shortcuts
- [ ] Sidebar toggling (files/outline)
- [ ] Font size adjustment
- [ ] No crashes or freezes

### Cross-Platform (if possible)
- [ ] Test on macOS (Intel and/or Apple Silicon)
- [ ] Test on Windows 10/11
- [ ] Test on Linux (Ubuntu/Fedora)

## Release Preparation

### Website Updates
- [ ] Update `website/script.js` with correct GITHUB_REPO
- [ ] Update all GitHub links in `website/index.html`
- [ ] Test website locally
- [ ] Website mentions latest version features

### Commit and Tag
- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Release v0.x.0"
  ```
- [ ] Create annotated tag:
  ```bash
  git tag -a v0.x.0 -m "Release v0.x.0"
  ```
- [ ] Push commits and tags:
  ```bash
  git push origin master
  git push origin v0.x.0
  ```

## During Release

### Monitor Build
- [ ] Go to GitHub Actions tab
- [ ] Watch "Release" workflow
- [ ] Check all three platform builds succeed
  - [ ] macOS build completes
  - [ ] Windows build completes
  - [ ] Linux build completes
- [ ] Verify builds take ~15-20 minutes total

### GitHub Release
- [ ] Draft release is created automatically
- [ ] All platform installers are attached:
  - [ ] macOS .dmg file
  - [ ] Windows .msi file
  - [ ] Windows .exe file (if configured)
  - [ ] Linux .AppImage file
  - [ ] Linux .deb package
  - [ ] Linux .rpm package (if configured)
- [ ] Edit release notes with highlights
- [ ] Publish release (change from draft)

## Post-Release

### Verification
- [ ] Download installers from GitHub Releases
- [ ] Test each installer on respective platform
- [ ] Verify download counts increment
- [ ] Check website auto-updates with new version
- [ ] Download links work correctly

### Documentation
- [ ] GitHub Releases page is clean and clear
- [ ] README reflects current version
- [ ] Documentation is accessible

### Distribution

#### Immediate
- [ ] Tweet/post announcement
- [ ] Update product description if needed
- [ ] Reply to any waiting issues about the feature
- [ ] Thank contributors (if any)

#### Optional (for major releases)
- [ ] Post on Product Hunt
- [ ] Share on Reddit (r/opensource, r/markdown)
- [ ] Post on Hacker News
- [ ] Write blog post about the release
- [ ] Update Homebrew Cask (if applicable)
- [ ] Submit to package managers
- [ ] Email newsletter (if you have one)

### Monitoring
- [ ] Watch for bug reports in first 24 hours
- [ ] Monitor GitHub Issues
- [ ] Check discussion forums
- [ ] Be ready for hotfix if needed

## Hotfix Process (if needed)

If critical bug is found:

- [ ] Create fix immediately
- [ ] Bump patch version (0.1.0 → 0.1.1)
- [ ] Follow this checklist again (abbreviated)
- [ ] Release within 24-48 hours
- [ ] Communicate clearly about the fix

## Next Steps

### Planning
- [ ] Close milestone for this version
- [ ] Create milestone for next version
- [ ] Review roadmap
- [ ] Prioritize next features based on feedback
- [ ] Update project board

### Community
- [ ] Respond to feedback
- [ ] Thank users for support
- [ ] Address urgent issues
- [ ] Plan next release timeline

---

## Quick Commands Reference

```bash
# Version bump (do manually in files)
# Update package.json and src-tauri/tauri.conf.json

# Build and test
npm run tauri build

# Create release
git add .
git commit -m "Release v0.x.0"
git tag -a v0.x.0 -m "Release v0.x.0"
git push origin master
git push origin v0.x.0

# Watch build progress
# Go to: https://github.com/yourusername/oasis-write/actions

# After release
# Check: https://github.com/yourusername/oasis-write/releases
```

---

**Remember**: Quality over speed. It's better to delay a release than to ship bugs!
