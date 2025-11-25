# Oasis Write

A serene and focused markdown writing environment.

## About

Oasis Write is a lightweight, beautiful, and fast markdown editor built with Tauri, React, and TypeScript. It provides a distraction-free writing experience with instant markdown formatting and elegant design.

## Key Features

- **Instant Markdown Formatting**: Live rendering as you type
- **Distraction-Free Zen Mode**: Focus on your words
- **Lightweight & Fast**: Native performance with small footprint
- **Simple File Management**: Intuitive file tree navigation
- **Cross-Platform**: Runs on macOS, Windows, and Linux

For detailed features and roadmap, see [docs/FEATURES.md](docs/FEATURES.md).

## Mission

To provide a serene and focused writing environment for markdown enthusiasts, blending seamless, real-time rendering with minimalist design and essential file management.

Read more in [docs/MISSION.md](docs/MISSION.md).

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
- **Backend**: Rust + Tauri 2
- **Styling**: CSS (will add styling solution as needed)

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
