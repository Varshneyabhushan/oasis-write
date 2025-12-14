# Link Navigation Test

This file tests inter-markdown file navigation.

## Same-Folder File Links

Click these links to navigate to other markdown files:

- Open [MARKDOWN_TEST.md](MARKDOWN_TEST.md) (relative link)
- Open [MARKDOWN_TEST.md](./MARKDOWN_TEST.md) (explicit relative link)

## Cross-File Anchor Links

Navigate to specific sections in other files:

- Go to [Headings section in MARKDOWN_TEST](MARKDOWN_TEST.md#headings)
- Go to [Code Blocks in MARKDOWN_TEST](MARKDOWN_TEST.md#code-blocks)
- Go to [Tables in MARKDOWN_TEST](MARKDOWN_TEST.md#tables-github-flavored-markdown)
- Go to [Task Lists in MARKDOWN_TEST](MARKDOWN_TEST.md#task-lists)

## External Links (Should Open in Browser)

These should still work as external links:

- [Anthropic](https://www.anthropic.com)
- [GitHub](https://github.com)
- [Tauri Documentation](https://tauri.app)

## Broken Link Tests

These should show as invalid (red/dashed):

- [Non-existent file](nonexistent.md)
- [Non-existent file with anchor](missing.md#section)
- [Valid file but broken anchor](MARKDOWN_TEST.md#this-section-does-not-exist)

## Back Navigation

Return to [Anchor Link Tests in MARKDOWN_TEST](MARKDOWN_TEST.md#anchor-link-tests)

---

## Test Instructions

1. Click on same-folder links - should open in editor
2. Click on cross-file anchor links - should open file AND scroll to section
3. Click on external links - should open in default browser
4. Broken links should display with red color and dashed underline
