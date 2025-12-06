# How to Release a New Version to GitHub

Follow these steps to publish a new Oasis Write release using the GitHub Actions release workflow.

1) **Prereqs**
   - Ensure `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` all have the new version (semver, e.g. 0.4.0).
   - Update `CHANGELOG.md` with the release notes.
   - Build locally if you want a sanity check: `npm run build` (Node 20+) or `npm run tauri build`.

2) **Commit and Tag**
   ```bash
   git status          # clean workspace
   git add .
   git commit -m "Release vX.Y.Z"
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin master
   git push origin vX.Y.Z
   ```

3) **Trigger CI Release**
   - Pushing the tag starts the `Release` workflow automatically (or run it manually via “Run workflow” on GitHub with the tag ref).
   - The workflow uses Node 20, runs `npm ci`, builds the Tauri bundles for macOS, Windows, and Linux, and drafts a GitHub release with attached artifacts.

4) **Monitor**
   - Open GitHub Actions → `Release` workflow; wait for all matrix jobs to finish.
   - Verify the draft release has the platform artifacts (.dmg, .msi/.exe, .AppImage/.deb/.rpm).

5) **Publish**
   - Edit the draft release notes if needed (paste from `CHANGELOG.md`).
   - Publish the release (the workflow’s final job flips draft → published).

6) **Post-Release**
   - Download an installer from the release page and spot-check.
   - Announce/communicate as needed.

Notes:
- Always tag the commit that already contains the final version numbers.
- The frontend bundle embeds `package.json` version; ensure you built/tagged after bumping. CI will rebuild from source at that tag.***
