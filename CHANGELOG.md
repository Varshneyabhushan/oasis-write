# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
