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

  // Show empty state when no file is selected
  if (!filePath) {
    return (
      <div className="editor-container">
        <main className="editor-main">
          <div className="empty-state">
            <div className="empty-state-content">
              <h2>No file selected</h2>
              <p>Open a file to start editing</p>
              <p className="empty-state-hint">Or create a new file with right-click → New File</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          filePath={filePath}
        />
      </main>
    </div>
  );
};

export default Editor;
