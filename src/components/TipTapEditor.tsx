import { FC, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
import { common, createLowlight } from 'lowlight';
import { InputRule } from '@tiptap/core';

import './TipTapEditor.css';

const lowlight = createLowlight(common);

// Custom Link extension with markdown input rule
const CustomLink = Link.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /\[([^\]]+)\]\(([^)]+)\)$/,
        handler: ({ range, match, commands }) => {
          const linkText = match[1];
          const linkUrl = match[2];

          if (!linkText || !linkUrl) return null;

          commands.deleteRange(range);
          commands.insertContent({
            type: 'text',
            text: linkText,
            marks: [
              {
                type: this.name,
                attrs: { href: linkUrl },
              },
            ],
          });
        },
      }),
    ];
  },
});

// Helper to clean up markdown - removes extra blank lines between list items
function cleanupMarkdown(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    // Check if current line is empty and next line is a list item
    const isEmpty = currentLine.trim() === '';
    const isListItem = (line: string) => {
      if (!line) return false;
      const trimmed = line.trim();
      // Match task list items: - [ ] or - [x]
      // Match regular list items: -, *, +, or numbered
      return /^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed);
    };

    // If this is a blank line between two list items, skip it
    if (isEmpty && nextLine && isListItem(nextLine)) {
      const prevLine = i > 0 ? lines[i - 1] : '';
      if (isListItem(prevLine)) {
        continue; // Skip this blank line
      }
    }

    result.push(currentLine);
  }

  // Always ensure trailing newline (POSIX standard for text files)
  let cleaned = result.join('\n');
  if (!cleaned.endsWith('\n')) {
    cleaned += '\n';
  }

  return cleaned;
}

// Helper to get markdown content from editor
function getMarkdownFromEditor(editor: Editor): string {
  // @ts-ignore - tiptap-markdown adds this to storage
  const rawMarkdown = editor.storage.markdown?.getMarkdown() || '';
  return cleanupMarkdown(rawMarkdown);
}

interface TipTapEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  fontSize?: number;
}

const TipTapEditor: FC<TipTapEditorProps> = ({ initialContent, onChange, fontSize = 16 }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      CustomLink.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const markdown = getMarkdownFromEditor(editor);
        onChange(markdown);
      }
    },
  });

  // Update content when initialContent changes (file switch)
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentContent = getMarkdownFromEditor(editor);
      if (currentContent !== initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-container" style={{ fontSize: `${fontSize}px` }}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
