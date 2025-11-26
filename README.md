# Oasis Write

A serene and focused markdown writing environment.

## About

Oasis Write is a lightweight, beautiful, and fast markdown editor built with Tauri, React, and TypeScript. It provides a distraction-free writing experience with instant markdown formatting and elegant design.

## Key Features

### Core Editor
- **Instant Markdown Formatting**: Live rendering as you type with TipTap editor
- **Auto-Save**: Automatic saving after 2 seconds of inactivity
- **Font Size Control**: Adjust editor font size with Cmd/Ctrl +/- shortcuts
- **Save Status Indicator**: Visual feedback for saved/saving/unsaved states

### File Management
- **Intuitive File Tree**: Browse and navigate markdown files in a clean tree structure
- **File Operations**: Create, rename, and delete files and folders with context menus
- **Quick File Access**: Keyboard shortcuts for rapid navigation

### Document Navigation
- **Document Outline**: Hierarchical view of all headings in your document
- **Dual-View Sidebar**: Toggle between file tree (Cmd+1) and outline view (Cmd+2)
- **Smart Sidebar Toggle**: Press the same shortcut again to enter distraction-free mode

### Cross-Platform
- **Native Performance**: Built with Tauri and Rust for small footprint and fast startup
- **Works Everywhere**: Runs on macOS, Windows, and Linux

For detailed features and roadmap, see [docs/FEATURES.md](docs/FEATURES.md).

## Mission

To provide a serene and focused writing environment for markdown enthusiasts, blending seamless, real-time rendering with minimalist design and essential file management.

Read more in [docs/MISSION.md](docs/MISSION.md).

## Recent Developments

The following features have been recently implemented:

- **Document Outline Component** - Hierarchical tree view of document headings with visual connectors
- **Sidebar View Switching** - Toggle between file explorer and outline views
- **Auto-Save System** - Intelligent debounced saving with visual status indicators
- **Context Menu System** - Right-click context menus for file and folder operations
- **Inline Editing** - Create and rename files/folders directly in the file tree
- **Delete Confirmation** - Safety dialogs before removing files or folders
- **Font Size Adjustment** - Dynamic editor font sizing with keyboard shortcuts
- **Enhanced Keyboard Shortcuts** - Improved shortcut system with zen mode toggle
- **Save Status Tracking** - Real-time feedback on document save state

## Roadmap

### Next Up
- [ ] **Live File Watching** - Detect and reload files modified by external applications
- [ ] **Syntax Highlighting** - Code block highlighting for multiple programming languages
- [ ] **Table Support** - Full GitHub Flavored Markdown table editing and rendering

### Core Features
Essential features from our mission that require implementation:

- [ ] **Theme System** - Light and dark theme support with theme switching
- [ ] **Typography Customization** - Choose from curated serif and sans-serif font families
- [ ] **Image Handling** - Display inline images from local and remote sources

### Advanced Features
Features that will enhance the writing experience:

- [ ] **Export to HTML** - Convert markdown documents to standalone HTML files
- [ ] **Export to PDF** - Generate PDF documents from markdown
- [ ] **Mermaid Diagram Support** - Render flowcharts, sequence diagrams, and other diagrams
- [ ] **Global Search** - Search across all files in the opened folder

### Future Considerations (Post v1.0)
Features planned for later releases:

- [ ] **Clipboard Image Pasting** - Paste images from clipboard with automatic file handling
- [ ] **Cloud Sync Integration** - Optional integration with iCloud, Dropbox, or Google Drive
- [ ] **Custom Keyboard Shortcuts** - User-configurable key bindings
- [ ] **Plugin System** - Extensibility through a simple plugin architecture
- [ ] **Multi-Tab Support** - Open and work with multiple files simultaneously
- [ ] **Version History** - Local file history and change tracking
- [ ] **Collaborative Editing** - Real-time collaboration features (long-term goal)

## Development

### Prerequisites

- Node.js (v20.19.0+ or v22.12.0+)
- Rust (latest stable)
- Platform-specific dependencies: https://tauri.app/start/prerequisites/

### Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Editor**: TipTap (with markdown extensions, tables, task lists, typography)
- **Backend**: Rust + Tauri 2
- **Styling**: CSS Modules
- **Build Tools**: Vite 7, TypeScript 5.8

## Project Structure

```
oasis-write/
├── docs/              # Documentation
├── src/               # React frontend source
├── src-tauri/         # Rust backend source
├── public/            # Static assets
└── reference/         # Design references
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

TBD

## Contributing

This project is in early development. Contributions welcome once we reach initial stable release.
