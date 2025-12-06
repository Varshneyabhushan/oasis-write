import { FC } from 'react';
import TipTapEditor from './TipTapEditor';
import { Editor as TipTapEditorType } from '@tiptap/react';
import type { OutlineHeading } from '../types';

interface EditorProps {
  filePath?: string;
  fileContent?: string;
  onContentChange?: (content: string) => void;
  fontSize?: number;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  onEditorReady?: (editor: TipTapEditorType) => void;
  onHeadingsChange?: (headings: OutlineHeading[]) => void;
}

const Editor: FC<EditorProps> = ({
  filePath,
  fileContent,
  onContentChange,
  fontSize = 16,
  onEditorReady,
  onHeadingsChange,
  // saveStatus = 'saved'
}) => {
  // TODO: Add visual status bar to show save status (saved/saving/unsaved)
  // Status bar should display at the top of the editor with color-coded indicators

  return (
    <div className="editor-container">
      <main className="editor-main">
        <TipTapEditor
          key={filePath || 'empty'}
          initialContent={fileContent}
          onChange={onContentChange}
          fontSize={fontSize}
          onEditorReady={onEditorReady}
          onHeadingsChange={onHeadingsChange}
        />
      </main>
    </div>
  );
};

export default Editor;
