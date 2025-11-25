import { FC, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
import { common, createLowlight } from 'lowlight';

import './TipTapEditor.css';

const lowlight = createLowlight(common);

// Helper to get markdown content from editor
function getMarkdownFromEditor(editor: Editor): string {
  // @ts-ignore - tiptap-markdown adds this to storage
  return editor.storage.markdown?.getMarkdown() || '';
}

interface TipTapEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

const TipTapEditor: FC<TipTapEditorProps> = ({ initialContent, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
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
    <div className="tiptap-container">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
