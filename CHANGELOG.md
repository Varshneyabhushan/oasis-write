# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.1] - 2025-12-15

### Added
- Spell check settings in the Settings dialog (Editor section)
- Spell check preference is now persisted to localStorage

### Changed
- Spell check is disabled by default to avoid unwanted underlines on macOS/Windows

## [0.7.0] - 2025-12-14

### Added
- **Markdown link navigation**: Full support for internal and cross-file markdown links
  - Same-file anchor links (`[text](#heading)`) smoothly scroll to headings within the current document
  - Inter-file links (`[text](file.md)`) open other markdown files in the editor
  - Cross-file anchor links (`[text](file.md#heading)`) navigate to a file and scroll to a specific section
  - Visual validation: broken links (non-existent files or headings) are displayed with strikethrough styling
  - All heading levels (h1-h6) are supported for anchor navigation
  - Relative path resolution (e.g., `./file.md`, `../file.md`) follows the same pattern as image paths
- Image preview in file explorer: thumbnails now appear next to image files in the sidebar file tree
- Syntax highlighting for Java, Python, JavaScript, and Bash code blocks using highlight.js
- Inline image rendering in markdown documents with support for relative paths

### Changed
- Refactored editor utilities into reusable helper functions for improved code maintainability
- Link click handling now uses DOM event listeners for better performance and reliability

## [0.6.0] - 2025-12-07

### Added
- Real-time folder and file watching powered by the Tauri FS plugin (watch feature enabled) with debounce and recursive support.

### Changed
- Hash-based save loop protection and external-change handling now live in dedicated hooks/services for clearer ownership and resilience against self-triggered events.
- Auto-reload of the open file avoids clobbering unsaved edits and ignores no-op saves, reducing redundant disk writes.

## [0.5.3] - 2025-12-07

### Changed
- Headings now progressively lighten by level (h1 → h6) so deeper levels recede toward body text color for clearer hierarchy.

## [0.5.2] - 2025-12-07

### Added
- Offline font bundles for Ubuntu Mono, Varela Round, and Caveat, with new font options in Settings.

### Changed
- Sidebar width now caps at 25% of the viewport to avoid overgrowing when zoomed.
- File tree entries use normal weight for easier scanning; rename inputs match.
- Settings dropdown text sizing increased for readability.

## [0.5.1] - 2025-12-07

### Added
- New “Crimson Noir” theme with red-forward headings and dark background pairing.

### Changed
- Theme selection in Settings now uses a dropdown with background + heading color previews for each option.

## [0.5.0] - 2025-12-07

### Added
- Settings dialog (Cmd/Ctrl + ,) with theme previews plus persisted theme and font-family choices.
- Expanded theme options (Nightfall, Monokai, Dracula, Atom One Light) and refreshed Solarized palette.
- App-wide font zoom controls (Cmd/Ctrl +/−) that resize both the sidebar and editor typography.

### Changed
- Refined welcome screen styling for a cleaner entry experience.

## [0.4.3] - 2025-12-07

### Added
- Placeholder text with markdown formatting hints for newly created empty files
- Top padding (25% from top) for newly created files that persists while typing
- Empty state UI when no file is selected with helpful instructions

### Fixed
- Keyboard event handling to prevent suppressing keydowns in the editor

## [0.4.2] - 2025-12-06

### Fixed
- Restored Cmd/Ctrl+N to open a new window by routing the shortcut through a Tauri command and shared window creation helper.

## [0.2.0] - 2025-11-30

### Added
- Drag and drop functionality for files and folders in the sidebar
- File tree reorganization with drag and drop support

### Changed
- Updated application theme with improved color scheme
- Enhanced theme system with ThemeContext for better theme management
- Updated landing page styling and layout

### Fixed
- Prevent moving files when source and destination are the same

## [0.1.0] - Initial Release

### Added
- Markdown editor with TipTap
- File tree navigation
- Auto-save functionality
- Sidebar toggling (files/outline)
- Keyboard shortcuts for common actions
- Font size adjustment (Cmd/Ctrl + +/-)
- Code syntax highlighting
- Task lists with checkboxes
- Table support
- Link handling
- Image rendering
- Typography extensions
