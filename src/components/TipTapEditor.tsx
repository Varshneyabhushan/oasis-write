import { FC, useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import type { ImageOptions } from '@tiptap/extension-image';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import java from 'highlight.js/lib/languages/java';
import { InputRule } from '@tiptap/core';
import { CollapsibleHeading } from '../extensions/CollapsibleHeading';
import type { OutlineHeading } from '../types';
import { resolveImageSrc, type ResolvedImageSrc } from '../services/ImageResolver';
import { resolveMarkdownLink } from '../services/MarkdownLinkResolver';
import { scrollToHeadingBySlug, extractHeadingSlugs, isLinkValid } from '../utils/editorHelpers';

import './TipTapEditor.css';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('python', python);
lowlight.register('bash', bash);
lowlight.register('java', java);

// Custom Link extension with markdown input rule
const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-link-type': {
        default: null,
        parseHTML: element => element.getAttribute('data-link-type'),
        renderHTML: attributes => {
          if (!attributes['data-link-type']) {
            return {};
          }
          return { 'data-link-type': attributes['data-link-type'] };
        },
      },
      'data-link-valid': {
        default: null,
        parseHTML: element => element.getAttribute('data-link-valid'),
        renderHTML: attributes => {
          if (!attributes['data-link-valid']) {
            return {};
          }
          return { 'data-link-valid': attributes['data-link-valid'] };
        },
      },
    };
  },
  addInputRules() {
    return [
      new InputRule({
        find: /\[([^\]]+)\]\(([^)]+)\)$/,
        handler: ({ range, match, commands, state }) => {
          const linkText = match[1];
          const linkUrl = match[2];

          // If the pattern is preceded by '!' it's an image, so skip link handling
          if (state && range.from > 0) {
            const precedingChar = state.doc.textBetween(
              Math.max(0, range.from - 1),
              range.from,
              '\0',
              '\0'
            );
            if (precedingChar === '!') {
              return null;
            }
          }

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

const extractHeadingsFromDoc = (editor: Editor): OutlineHeading[] => {
  const headings: OutlineHeading[] = [];
  let index = 0;

  editor.state.doc.descendants((node) => {
    if (node.type.name !== 'heading') return;

    const text = node.textContent?.trim();
    if (!text) return;

    const level = node.attrs.level || 1;
    const slug = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const id = `${slug || 'heading'}-${index++}`;

    headings.push({ level, text, id });
  });

  return headings;
};

const headingsEqual = (a: OutlineHeading[], b: OutlineHeading[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].level !== b[i].level || a[i].text !== b[i].text) {
      return false;
    }
  }
  return true;
};

const emitHeadingsIfChanged = (
  editor: Editor,
  onHeadingsChange: ((headings: OutlineHeading[]) => void) | undefined,
  lastHeadingsRef: { current: OutlineHeading[] | null }
) => {
  if (!onHeadingsChange) return;
  const next = extractHeadingsFromDoc(editor);
  const prev = lastHeadingsRef.current;
  if (prev && headingsEqual(prev, next)) {
    return;
  }
  lastHeadingsRef.current = next;
  onHeadingsChange(next);
};

interface TipTapEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  fontSize?: number;
  onEditorReady?: (editor: Editor) => void;
  onHeadingsChange?: (headings: OutlineHeading[]) => void;
  filePath?: string;
  onNavigateToFile?: (path: string, anchor?: string) => void;
  files?: import('./FileTree').FileEntry[];
  currentFilePath?: string;
}

type ImageWithResolveOptions = ImageOptions & { resolveSrc?: (src: string) => ResolvedImageSrc };

const ImageWithResolvedSrc = Image.extend<ImageWithResolveOptions>({
  addOptions() {
    const parent = this.parent?.();
    return {
      inline: parent?.inline ?? false,
      allowBase64: parent?.allowBase64 ?? false,
      HTMLAttributes: parent?.HTMLAttributes ?? {},
      resize: parent?.resize ?? false,
      resolveSrc: (src: string) => ({ primary: src }),
    };
  },
  renderHTML({ HTMLAttributes }) {
    const resolved: ResolvedImageSrc = this.options.resolveSrc?.(HTMLAttributes.src) ?? { primary: HTMLAttributes.src as string };
    const primary = resolved.primary;
    const fallback = resolved.fallback;
    const attrs: Record<string, any> = { ...this.options.HTMLAttributes, ...HTMLAttributes, src: primary };
    if (fallback && fallback !== primary) {
      attrs['data-fallback-src'] = fallback;
    }
    return ['img', attrs];
  },
});

const TipTapEditor: FC<TipTapEditorProps> = ({
  initialContent,
  onChange,
  fontSize = 16,
  onEditorReady,
  onHeadingsChange,
  filePath,
  onNavigateToFile,
  files,
  currentFilePath,
}) => {
  const lastHeadingsRef = useRef<OutlineHeading[] | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Capture whether file was empty when first loaded (for this editor session)
  const wasInitiallyEmpty = useRef(!initialContent || initialContent.trim() === '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        heading: false, // We'll use CollapsibleHeading instead
      }),
      CollapsibleHeading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      CustomLink.configure({
        openOnClick: false,
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
      Placeholder.configure({
        placeholder: 'Start writing... Markdown formatting is supported (headings, bold, italic, lists, and more)',
      }),
      ImageWithResolvedSrc.configure({
        allowBase64: true,
        inline: false,
        resolveSrc: (src: string) => resolveImageSrc(src, filePath),
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
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const markdown = getMarkdownFromEditor(editor);
        onChange(markdown);
      }
      emitHeadingsIfChanged(editor, onHeadingsChange, lastHeadingsRef);
    },
  });

  // Notify parent when editor is ready and send initial headings
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
    if (editor) {
      emitHeadingsIfChanged(editor, onHeadingsChange, lastHeadingsRef);
    }
  }, [editor, onEditorReady, onHeadingsChange]);

  // Update content when initialContent changes (file switch)
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentContent = getMarkdownFromEditor(editor);
      if (currentContent !== initialContent) {
        editor.commands.setContent(initialContent);
      }
      emitHeadingsIfChanged(editor, onHeadingsChange, lastHeadingsRef);
    }
  }, [initialContent, editor, onHeadingsChange]);

  // Validate links and update their attributes
  useEffect(() => {
    if (!editor || !files || !currentFilePath) return;

    const { state, view } = editor;
    const { tr } = state;
    let modified = false;

    // Extract heading slugs from current document for anchor validation
    const headingSlugs = extractHeadingSlugs(editor);

    state.doc.descendants((node, pos) => {
      if (node.isText && node.marks.length > 0) {
        const linkMark = node.marks.find(mark => mark.type.name === 'link');
        if (linkMark && linkMark.attrs.href) {
          const href = linkMark.attrs.href;
          const resolved = resolveMarkdownLink(href, currentFilePath, files);

          const currentType = linkMark.attrs['data-link-type'];
          const currentValid = linkMark.attrs['data-link-valid'];
          const newType = resolved.type;
          const newValid = isLinkValid(resolved, headingSlugs) ? 'true' : 'false';

          // Only update if attributes changed
          if (currentType !== newType || currentValid !== newValid) {
            const newAttrs = {
              ...linkMark.attrs,
              'data-link-type': newType,
              'data-link-valid': newValid,
            };

            const newMark = state.schema.marks.link.create(newAttrs);

            tr.removeMark(pos, pos + node.nodeSize, linkMark.type);
            tr.addMark(pos, pos + node.nodeSize, newMark);
            modified = true;
          }
        }
      }
    });

    if (modified) {
      view.dispatch(tr);
    }
  }, [editor, files, currentFilePath]);

  // Handle link clicks directly via DOM event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !editor) return;

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if clicked element is a link or inside a link
      let link: HTMLAnchorElement | null = null;
      if (target.tagName === 'A') {
        link = target as HTMLAnchorElement;
      } else {
        link = target.closest('a');
      }

      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Resolve the link
      const resolved = resolveMarkdownLink(href, currentFilePath, files);

      // Handle based on link type
      if (resolved.type === 'external') {
        // Let browser handle external links
        return;
      } else if (resolved.type === 'anchor' && resolved.anchor) {
        // Same-file anchor navigation
        event.preventDefault();
        event.stopPropagation();
        scrollToHeadingBySlug(editor, resolved.anchor);
      } else if (resolved.type === 'markdown') {
        // Inter-file navigation
        event.preventDefault();
        event.stopPropagation();

        if (onNavigateToFile && resolved.targetPath) {
          onNavigateToFile(resolved.targetPath, resolved.anchor);
        }
      }
    };

    container.addEventListener('click', handleLinkClick);
    return () => container.removeEventListener('click', handleLinkClick);
  }, [editor, currentFilePath, files, onNavigateToFile]);

  // Swap to file:// fallback if asset:// load fails (some platforms block asset protocol)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleError = (event: Event) => {
      const target = event.target as HTMLImageElement;
      if (!target || target.tagName !== 'IMG') return;
      const fallback = target.getAttribute('data-fallback-src');
      if (fallback && target.src !== fallback) {
        target.src = fallback;
      }
    };

    container.addEventListener('error', handleError, true);
    return () => container.removeEventListener('error', handleError, true);
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`tiptap-container ${wasInitiallyEmpty.current ? 'empty-file' : ''}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
