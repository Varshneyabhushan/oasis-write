# Markdown Syntax Test Document

This document contains examples of all supported markdown syntax in Oasis Write. Use this to test the live rendering capabilities of the editor.

## Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Text Formatting

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***.

You can also use underscores: **bold** and *italic*.

~~Strikethrough text~~ is also supported.

Inline `code snippets` look like this.

## Lists

### Unordered Lists

- First item
- Second item
- Third item
- Nested item 1
- Nested item 2
  - Deeply nested item
- Fourth item
- Alternative bullet style
- Another item
- Nested with asterisk

### Ordered Lists

1. First item
2. Second item
3. Third item
4. Nested numbered item
5. Another nested item
6. Fourth item

## Links

[This is a link to Anthropic](https://www.anthropic.com)

[Link with title](https://www.anthropic.com)

## Blockquotes

> This is a blockquote. It can span multiple lines.

> Blockquotes can also be nested.
>
> > > Like this.
> > >
> > > > And even deeper.

> **Note**: You can use other markdown inside blockquotes.
>
> - Like lists
>
> - And *formatting*

## Code Blocks

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to Oasis Write`;
}

greet('World');
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 Fibonacci numbers
for i in range(10):
    print(fibonacci(i))
```

```rust
fn main() {
    let message = "Hello from Rust!";
    println!("{}", message);

    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
```

```json
{
  "name": "Oasis Write",
  "version": "0.1.0",
  "description": "A serene markdown editor",
  "features": [
    "Live rendering",
    "File management",
    "Zen mode"
  ]
}
```

## Horizontal Rules

You can create horizontal rules with three or more hyphens, asterisks, or underscores:

---

\*\*\*

\__\_

## Mixed Content Example

Here's a real-world example combining multiple elements:

### Project Setup Instructions

1. **Install Dependencies**

   First, make sure you have Node.js installed. Then run:

```bash
   npm install
```

1. **Configuration**

   > **Important**: Make sure to configure your environment variables before starting.

   Create a `.env` file with the following:

```
   API_KEY=your_api_key_here
   PORT=3000
```

1. **Run the Application**
- Development mode: `npm run dev`
- Production build: `npm run build`
- Start server: `npm start`

---

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No console errors
- [ ] Performance is acceptable

## Special Characters and Escaping

You can escape special characters with backslash:

\*Not italic\*

\*\*Not bold\*\*

\\# Not a heading

## Emphasis Combinations

*Italic* and **bold** can be combined: ***both italic and bold***

Nested emphasis: *italic with* ***bold*** *inside*

## Inline HTML (if supported)

Some markdown parsers support inline HTML, but Oasis Write focuses on pure markdown.

## Tables (GitHub Flavored Markdown)

| Feature | Status | Priority |
| --- | --- | --- |
| Live Rendering | ✅ Done | High |
| File Tree | ✅ Done | High |
| Zen Mode | ✅ Done | Medium |
| Themes | 🚧 Planned | Medium |
| Search | 📋 Backlog | Low |

| Left Aligned | Center Aligned | Right Aligned |
| --- | --- | --- |
| Left | Center | Right |
| A | B | C |

## Task Lists

- [x] Implement markdown editor
- [x] Add file system support
- [x] Create welcome screen
- [ ] Add file watcher
- [ ] Implement search
- [ ] Add custom themes

## Long Paragraph Example

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

This is a new paragraph. Paragraphs are separated by blank lines. Multiple consecutive blank lines are treated as a single blank line.

## Nested Lists with Mixed Content

1. **First major point**
- Sub-point with *emphasis*
- Another sub-point

```javascript
     // Code in a nested list
     const example = true;
```

- Back to sub-points
1. **Second major point**

   > A blockquote within a list
   >
   > With multiple lines

   And some regular text in the list item.

2. **Third major point**
- Nested unordered list
  1. Which contains ordered items
  2. Like this
- Back to unordered

## Links and References

### Direct Links

- <https://www.example.com> (automatic link)
- [Named link](https://www.example.com)
- [Link with title](https://www.example.com)

### Reference-Style Links

[Reference link](https://www.anthropic.com)

[Another reference](https://tauri.app)

## Edge Cases

### Empty Elements

Empty blockquote:

> &lt;br /&gt;

Empty code block:

```
```

### Multiple Formatting

This text has **bold and** ***italic*** **nested** together.

This has `inline code with **bold** inside` (behavior varies).

### Special List Cases

- Item with **bold**
- Item with *italic*
- Item with `code`
- Item with [link](https://example.com)
- Item with &gt; a quote character

## Mathematical Expressions (if supported)

Inline math: `E = mc^2`

Block math:

```
∫₀^∞ e^(-x²) dx = √π/2
```

## Conclusion

This document tests all major markdown features supported by Oasis Write. Use it to verify that live rendering works correctly for all syntax elements.

---

**Last Updated**: November 2025 **Purpose**: Testing & Documentation **Status**: Complete

```
{"testing":"haha"}
```
