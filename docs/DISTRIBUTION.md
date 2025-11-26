# Distribution Guide

Complete guide to distributing Oasis Write to users.

## Quick Start

1. **Build for your platform**: `npm run tauri build`
2. **Create a release tag**: `git tag -a v0.1.0 -m "Release v0.1.0"`
3. **Push tag**: `git push origin v0.1.0`
4. **GitHub Actions will automatically**:
   - Build for macOS, Windows, and Linux
   - Create a GitHub Release
   - Attach installers to the release
   - Deploy the website

## Setup Instructions

### 1. GitHub Repository Setup

**Enable GitHub Pages:**
1. Go to Settings → Pages
2. Source: "GitHub Actions"
3. Your website will be live at `https://yourusername.github.io/oasis-write/`

**Add Repository Secrets (for code signing):**
- Go to Settings → Secrets and variables → Actions
- Add secrets for code signing (optional but recommended for macOS/Windows)

### 2. Update Configuration Files

**Update `website/script.js`:**
```javascript
const GITHUB_REPO = 'yourusername/oasis-write'; // Change this!
```

**Update `website/index.html`:**
- Replace GitHub links with your repository
- Update social media links
- Customize content as needed

**Update `src-tauri/tauri.conf.json`:**
```json
{
  "identifier": "com.yourdomain.oasis-write",
  "productName": "Oasis Write",
  "version": "0.1.0"
}
```

### 3. Version Your First Release

**Update version in both files:**
```bash
# package.json
{
  "version": "0.1.0"
}

# src-tauri/tauri.conf.json
{
  "version": "0.1.0"
}
```

**Create release:**
```bash
git add .
git commit -m "Prepare v0.1.0 release"
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin master
git push origin v0.1.0
```

### 4. Monitor the Build

1. Go to Actions tab on GitHub
2. Watch the "Release" workflow
3. Wait for all three platforms to build (10-20 minutes)
4. Check the Releases page for your binaries

## Distribution Channels

### GitHub Releases (Primary)

✅ **Pros:**
- Free hosting
- Automatic via GitHub Actions
- Built-in version history
- Direct download links

📝 **How it works:**
- Tauri Action automatically creates releases
- All platform binaries are attached
- Users download from Releases page or website

### Package Managers (Recommended)

#### Homebrew (macOS)

1. **Create a tap repository**: `homebrew-oasis-write`
2. **Add a Cask file**:

```ruby
# oasis-write.rb
cask "oasis-write" do
  version "0.1.0"
  sha256 "..." # Generate with: shasum -a 256 file.dmg

  url "https://github.com/yourusername/oasis-write/releases/download/v#{version}/oasis-write_#{version}_universal.dmg"
  name "Oasis Write"
  desc "Serene markdown writing environment"
  homepage "https://yourusername.github.io/oasis-write/"

  app "Oasis Write.app"

  zap trash: [
    "~/Library/Application Support/com.yourdomain.oasis-write",
    "~/Library/Preferences/com.yourdomain.oasis-write.plist",
    "~/Library/Saved Application State/com.yourdomain.oasis-write.savedState",
  ]
end
```

3. **Users install with**:
```bash
brew install --cask yourusername/tap/oasis-write
```

#### Winget (Windows)

1. Fork [winget-pkgs](https://github.com/microsoft/winget-pkgs)
2. Create manifest in `manifests/y/YourName/OasisWrite/`
3. Submit PR

Users install with:
```powershell
winget install OasisWrite
```

#### Snapcraft (Linux)

1. Create `snap/snapcraft.yaml`
2. Build and publish to Snap Store
3. Users install with `snap install oasis-write`

### App Stores (Optional)

#### Mac App Store
- **Cost**: $99/year Apple Developer membership
- **Pros**: Better discoverability, automatic updates, trust
- **Cons**: Strict review process, sandboxing restrictions
- **Setup**: Requires Apple Developer account and certificates

#### Microsoft Store
- **Cost**: One-time $19 registration
- **Pros**: Better discoverability on Windows
- **Cons**: Review process, packaging requirements

## Custom Domain (Optional)

Point a custom domain to your GitHub Pages site:

1. **Buy a domain** (e.g., `oasis-write.com`)
2. **Add CNAME file** to `website/` directory:
   ```
   oasis-write.com
   ```
3. **Configure DNS** with your registrar:
   ```
   CNAME @ yourusername.github.io
   ```
4. **Enable HTTPS** in GitHub Pages settings

## Marketing and Distribution

### Launch Checklist

- [ ] Create GitHub Release with detailed notes
- [ ] Update website with download links
- [ ] Post on Product Hunt
- [ ] Share on Reddit (r/opensource, r/markdown, r/writing)
- [ ] Post on Hacker News
- [ ] Share on Twitter/X
- [ ] Create demo video/GIF
- [ ] Write a blog post
- [ ] Submit to alternative.to and other directories

### Content to Prepare

1. **Screenshots**: Clean, high-quality screenshots showing key features
2. **Demo Video**: 30-60 second video showing the app in action
3. **GIFs**: Animated GIFs for README and website
4. **Release Notes**: Clear changelog for each version
5. **Blog Post**: Story behind the app, design decisions

### Where to Share

**Developer Communities:**
- [Hacker News](https://news.ycombinator.com/)
- [Product Hunt](https://www.producthunt.com/)
- [Reddit](https://reddit.com/r/opensource)
- [Lobsters](https://lobste.rs/)
- [Dev.to](https://dev.to/)

**Markdown/Writing Communities:**
- r/markdown
- r/writing
- r/Writers
- Writing forums and Discord servers

**App Directories:**
- [AlternativeTo](https://alternativeto.net/)
- [Slant](https://www.slant.co/)
- [SourceForge](https://sourceforge.net/)
- [FossHub](https://www.fosshub.com/)

## Update Strategy

### Semantic Versioning

Follow [semver](https://semver.org/):
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backwards compatible
- **Patch** (0.1.1): Bug fixes

### Release Cycle

**Recommended schedule:**
- **Patch releases**: As needed for critical bugs
- **Minor releases**: Every 2-4 weeks
- **Major releases**: When ready for breaking changes

### Release Process

1. **Update versions** in `package.json` and `tauri.conf.json`
2. **Update CHANGELOG.md** with changes
3. **Test thoroughly** on all platforms
4. **Create and push tag**:
   ```bash
   git tag -a v0.2.0 -m "Release v0.2.0"
   git push origin v0.2.0
   ```
5. **Wait for GitHub Actions** to build and release
6. **Announce** on social media and communities

## Analytics (Optional)

If you want to track downloads and usage (opt-in only!):

### Download Statistics
- GitHub provides download counts for releases
- Use GitHub API to display stats on website

### Usage Telemetry
⚠️ **Privacy First**: Only collect with explicit user consent

Options:
- [PostHog](https://posthog.com/) - Open source analytics
- [Plausible](https://plausible.io/) - Privacy-focused analytics
- Custom solution with user opt-in

**What to track (with consent):**
- App version
- Platform/OS
- Crash reports
- Feature usage (anonymized)

**Never track:**
- User content
- File names/paths
- Personal information
- Anything without explicit consent

## Support and Community

### Issue Tracking
- Use GitHub Issues for bug reports
- Create issue templates
- Label issues (bug, enhancement, question)

### Discussions
- Enable GitHub Discussions
- Create Discord server (optional)
- Monitor social media mentions

### Documentation
- Keep README up to date
- Create user guides
- Record tutorial videos
- Write FAQ

## Legal Considerations

### License
- Add LICENSE file (MIT recommended for open source)
- Include license in app about section
- List third-party licenses

### Privacy Policy
Required if collecting any data:
- What data is collected
- How it's used
- How it's stored
- User rights (GDPR compliance if applicable)

### Trademark
Consider trademarking "Oasis Write" if the project grows.

## Monitoring and Maintenance

### After Launch

**Week 1:**
- Monitor for critical bugs
- Respond to issues quickly
- Gather user feedback

**Month 1:**
- Analyze usage patterns
- Plan next features based on feedback
- Fix reported bugs

**Ongoing:**
- Keep dependencies updated
- Security patches
- Feature development
- Community engagement

### Success Metrics

Track these to measure success:
- GitHub stars
- Download counts
- Active issues/PRs
- Community growth
- User testimonials
- Social media mentions

## Conclusion

Distribution is an ongoing process. Start simple with GitHub Releases and website, then expand to package managers as your user base grows. Focus on quality, listen to users, and iterate based on feedback.

Good luck with Oasis Write! 🚀
