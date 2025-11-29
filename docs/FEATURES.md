# Oasis-write Feature Set

This document outlines the core features planned for Oasis-write, guided by our mission to create a serene, focused, and powerful markdown writing experience.

## Core Experience

- **Instant Markdown Formatting:** Experience "live" rendering as you type. Markdown syntax like `#` or `*emphasis*` is formatted beautifully and instantly, without needing to change lines or switch modes.
- **Distraction-Free Zen Mode:** Inspired by apps like Highland, a single keypress will fade away all UI elements (like the file explorer and status bars), leaving you with nothing but your text on a clean canvas.
- **Lightweight & Native Performance:** A small application that launches instantly and runs smoothly. By leveraging Tauri and Rust, we keep memory usage low and performance high on macOS, Windows, and Linux.

## File & Project Management

- **Simple File Tree Explorer:** Open any local folder to see its files and sub-directories in a clean, intuitive tree view.
- **Live File Watching:** If an open file is modified by an external application (like a code editor or a script), Oasis-write will detect the change and update the editor view instantly and automatically.
- **File Operations:** Create new files and folders, and rename or delete them, all from within the file explorer.

## Editor & Customization

- **Customizable Typography:** Personalize your writing environment. Choose from a curated list of beautiful serif and sans-serif font families and adjust the font size to your liking.
- **Theming:** A clean and easy-on-the-eyes interface is key. We will provide first-class support for both a bright, clean Light theme and a focused Dark theme.
- **Common Markdown Shortcuts:** Standard keyboard shortcuts for bold, italics, links, and other markdown elements to speed up your writing workflow.
- **Export Options:** Easily export your finished work to other formats, starting with HTML and PDF.

## Rich Content & Markdown Extensions

- **Advanced Tables:** Full support for GitHub Flavored Markdown (GFM) tables, making it easy to organize data.
- **Diagrams as Code:** Create and render UML, flowchart, sequence, and other diagrams directly in your notes using **Mermaid.js** syntax.
- **Code Snippet Highlighting:** Beautiful, language-aware syntax highlighting for dozens of programming languages inside fenced code blocks.
- **Image Handling:** Full support for inline images from local or remote paths.

## Future Goals (Post v1.0)

- **Global Search:** A powerful search function to find text across all files within your opened folder.
- **Cloud Sync Integration:** An optional feature to connect a cloud storage provider (like iCloud, Google Drive, or Dropbox) for seamless file synchronization across your devices.
- **Clipboard Image Pasting:** Paste images directly from your clipboard into the editor, automatically saving the file and inserting the link.
- **Tabbed Editing & Theming:** Potential future support for tabs and user-created themes will be considered based on user feedback to keep the core experience clean.
