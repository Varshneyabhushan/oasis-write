---
name: release
description: The complete, authoritative release procedure for Oasis Write — bump the version across every file that carries it, update CHANGELOG.md, commit, tag, push both branch and tag, and monitor the GitHub Actions build. Use this skill whenever the user wants to ship, release, publish, cut, or tag a version, "trigger the build", make installers, or push a new version to GitHub — even when they only ask for one step ("just tag it", "trigger the build for 0.8.2"), because the surrounding invariants still apply and skipping them silently breaks the release. Also use it when a release has gone wrong and needs diagnosing (missing artifacts, workflow didn't fire, release points at the wrong commit).
---

# Releasing Oasis Write

This is the single source of truth for releasing this project. `CLAUDE.md`,
`AGENTS.md`, and `RELEASE_CHECKLIST.md` all defer to this file — if any of them
disagrees with what's written here, this file wins, and the other should be
fixed.

A release is one atomic idea: **a git tag `vX.Y.Z` pointing at a commit whose
`package.json` already says `X.Y.Z`.** Everything below exists to make that true
and to get it onto GitHub. Hold onto that sentence — most release failures are
some version of it being violated.

## Where the version lives

The version is duplicated across five files. They must all agree before you tag.

| File | Form | How to update |
|---|---|---|
| `package.json` | `"version": "X.Y.Z"` | edit directly |
| `src-tauri/tauri.conf.json` | `"version": "X.Y.Z"` | edit directly |
| `src-tauri/Cargo.toml` | `version = "X.Y.Z"` | edit directly |
| `src-tauri/Cargo.lock` | `oasis-write` package entry | `cd src-tauri && cargo update -p oasis-write` |
| `package-lock.json` | top-level + `packages[""]` | `npm install --package-lock-only` |

Never hand-edit the two lockfiles — run the commands and let the tools write
them, so the rest of the lockfile stays internally consistent.

`package-lock.json` has historically been forgotten (it sat at `0.8.0` while the
app shipped `0.8.2`). It doesn't break the build — `npm ci` only fails on
*dependency* drift, not the version field — but it makes the lockfile lie about
which release it belongs to. Include it.

## Step 0 — Work out which situation you're in

Don't assume the user wants the full sequence. Check the ground truth first:

```bash
node -p "require('./package.json').version"
git tag --sort=-v:refname | head -5
git status --short
git status -sb | head -1        # is the branch ahead of origin?
```

Three situations come up, and they need different work:

- **Nothing bumped yet** — the normal case. Run every step below.
- **Version already bumped and committed, no tag** — skip to Step 4. This is
  common when the version bump rode along with a feature commit. Do *not* create
  a fresh "Release vX.Y.Z" commit just to have one; tag the commit that already
  carries the version.
- **Tag already exists** — stop and ask. Never `git tag -f` or delete-and-repush
  a tag that has already been pushed: the workflow may have already produced a
  release from it, and moving the tag makes the published installers untraceable
  to any commit. Cut a new patch version instead.

If the working tree is dirty (it often is — this repo tends to have feature work
in flight), ask what the release should contain before touching anything:
tag the current `HEAD` as-is, or commit the pending work first? Those produce
materially different installers, and only the user can decide. Tagging `HEAD`
with a dirty tree is perfectly safe — CI builds from the tag, not your disk —
but the user should be the one choosing to leave that work out.

## Step 1 — Pre-flight

If the user hasn't named a version, ask for one and follow semver: patch for
fixes, minor for features, major for breaking changes.

Then confirm the code is actually shippable — CI builds on three platforms and
takes 15–20 minutes, so a failure caught here saves a long round trip:

```bash
npm test                      # vitest
cd src-tauri && cargo test    # rust
npm run build                 # typecheck + vite build
```

Report failures to the user rather than pushing through them. A red test isn't
automatically a blocker (it may be unrelated and known), but it's their call.

## Step 2 — Bump the version

Edit the three source files, then regenerate the two lockfiles:

```bash
cd src-tauri && cargo update -p oasis-write
npm install --package-lock-only
```

Verify all five agree before continuing — a mismatch here is the single most
expensive mistake in this process, and it's free to check:

```bash
grep -n '"version"' package.json src-tauri/tauri.conf.json | head
grep -n '^version' src-tauri/Cargo.toml
grep -m1 -A2 'name = "oasis-write"' src-tauri/Cargo.lock
sed -n '3p' package-lock.json
```

## Step 3 — Update CHANGELOG.md

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/). Match the
existing entries exactly — square brackets around the version, an en-dash-free
ISO date, and `###` sections in the order Added / Changed / Fixed / Removed
(include only the sections that apply):

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- User-facing description of the new capability, written for someone who uses
  the app rather than someone who wrote it

### Changed
- ...

### Fixed
- ...
```

Insert the new entry directly above the previous version's heading, under the
intro paragraph. Use today's real date.

Write entries from the user's point of view, matching the voice of what's
already there ("Copy button on code blocks: hover a block to reveal it, click to
copy the snippet"). If you don't know what changed, read `git log` since the last
tag and draft from that — then show the user your draft and let them correct it,
since they know which changes actually matter to people using the app.

## Step 4 — Commit

Stage only release-related files. The tree often contains unrelated in-progress
work, and sweeping it into a release commit is how unfinished features
accidentally ship:

```bash
git add package.json package-lock.json \
        src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Cargo.lock \
        CHANGELOG.md
git status --short          # confirm nothing unexpected is staged
git commit -m "Release vX.Y.Z"
```

(If the version was already committed as part of a feature commit, there's
nothing to commit here — move on.)

## Step 5 — Tag and push both refs

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin master
git push origin vX.Y.Z
```

Both pushes matter, and they fail differently:

- **The tag push** is what fires the workflow. Without it, nothing happens.
- **The branch push** is what makes the tagged commit reachable from `master`.
  Pushing a tag does upload its commit objects, so CI will build fine either
  way — but if you skip the branch push, GitHub shows a release built from
  commits that appear nowhere in the branch history, and the next person to
  clone won't find them. Check `git status -sb` for "ahead" before you finish.

Confirm with the user before pushing. Pushing a tag is effectively publishing —
the workflow starts immediately and a GitHub Release appears.

## Step 6 — Monitor the build

Pushing a `v*` tag triggers `.github/workflows/release.yml`, which runs three
jobs in sequence:

1. **create-release** — reads the version out of `package.json` *at the tagged
   commit* and opens a **draft** release named `Oasis Write vX.Y.Z` with
   `tag_name: v<that version>`.
2. **build-tauri** — a 3-way matrix on Node 20: macOS (universal, Intel + Apple
   Silicon), Ubuntu 22.04, and Windows. `npm ci`, then `tauri-action` builds and
   uploads bundles to the draft.
3. **publish-release** — flips the draft to published once *every* matrix job
   succeeds. `fail-fast` is off, so one platform failing still lets the others
   finish, but the release stays a draft.

This is why the tag name and `package.json` version must match: job 1 derives
`tag_name` from `package.json`, not from the tag you pushed. Push tag `v0.9.0`
at a commit that says `0.8.2` and GitHub creates a release pointing at a
`v0.8.2` tag that may not exist — a confusing mess to clean up.

Point the user at **GitHub → Actions → Release**. Expect 15–20 minutes. `gh` is
not installed on this machine, so don't try to poll the run from the shell
unless the user has since installed it — just give them the link and say plainly
that you couldn't verify the run started.

Expected artifacts on the release:

| Platform | Artifacts |
|---|---|
| macOS | `.dmg`, `.app.tar.gz` (universal) |
| Windows | `.msi`, `.exe` (NSIS) |
| Linux | `.AppImage`, `.deb`, `.rpm` |

## Step 7 — Wrap up

The workflow publishes the release automatically; there's no manual publish
step. Once it's green:

- The body says "See CHANGELOG.md for details." — offer to paste the actual
  CHANGELOG entry into the release notes, which reads far better on the
  releases page.
- Suggest downloading one installer and spot-checking it.

## When something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| No workflow run appeared | Tag not pushed, or doesn't match `v*` | `git push origin vX.Y.Z` |
| Release points at a tag that doesn't exist | `package.json` version ≠ tag name | Delete the draft release, fix the version, cut a new tag |
| Release stuck as a draft | One matrix job failed | Read the failing job's log; re-run it from the Actions UI |
| `master` behind on GitHub | Branch push skipped | `git push origin master` |
| Installers show an older version | Tagged before bumping | The tag must point at the *bumped* commit; cut a new patch version |

## Local builds

For a sanity check before releasing — never as a substitute for CI, which is the
only thing that produces the shipped artifacts:

| Target | Command |
|---|---|
| Current platform | `npm run tauri build` |
| macOS universal | `npm run tauri build -- --target universal-apple-darwin` |
| Windows / Linux from macOS | Not supported — use GitHub Actions |

Output lands in `src-tauri/target/release/bundle/`.
